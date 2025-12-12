// routes/absences.js
import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js"; // your mysql2/promise pool
import { authenticate } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * POST /api/absences
 * Body: { student_id, teacher_id, school_id, absence_date, justification, level_id? }
 * Creates a single absence record (id returned).
 */
router.post("/", authenticate, async (req, res) => {
  try {
    const {
      student_id,
      teacher_id,
      school_id,
      absence_date,
      justification,
      level_id,
    } = req.body;
    if (!student_id || !teacher_id || !school_id || !absence_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO absences (id, student_id, teacher_id, level_id, school_id, absence_date, justification)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        student_id,
        teacher_id,
        level_id || null,
        school_id,
        absence_date,
        justification || null,
      ]
    );

    res.json({ id });
  } catch (err) {
    console.error("Insert absence error:", err);
    res.status(500).json({ error: "Failed to add absence" });
  }
});

/**
 * POST /api/absences/bulk
 * Body: { student_ids: [...], teacher_id, school_id, absence_date, justification?, level_id? }
 * Inserts many absence rows in one request (used by AddAbsence page submit)
 */
router.post("/bulk", authenticate, async (req, res) => {
  try {
    const {
      student_ids,
      teacher_id,
      school_id,
      absence_date,
      justification,
      level_id,
    } = req.body;
    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: "student_ids array required" });
    }
    const values = [];
    const ids = [];
    for (const sid of student_ids) {
      const id = uuidv4();
      ids.push(id);
      values.push([
        id,
        sid,
        teacher_id,
        level_id || null,
        school_id,
        absence_date,
        justification || null,
      ]);
    }
    // bulk insert using multiple rows
    const placeholders = values.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");
    const flat = values.flat();
    await db.query(
      `INSERT INTO absences (id, student_id, teacher_id, level_id, school_id, absence_date, justification) VALUES ${placeholders}`,
      flat
    );
    res.json({ ids });
  } catch (err) {
    console.error("Bulk insert error:", err);
    res.status(500).json({ error: "Failed to add absences" });
  }
});

/**
 * GET /api/absences/today/:schoolId
 * Returns absences for current day for a school
 */
router.get("/today/:schoolId", authenticate, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const [rows] = await db.query(
      `SELECT a.id, a.student_id, a.teacher_id, a.level_id, a.absence_date, a.justification,
              s.first_name, s.last_name, s.level as student_level
       FROM absences a
       JOIN students s ON s.id = a.student_id
       WHERE a.school_id = ? AND a.absence_date = CURDATE()
       ORDER BY a.created_at DESC`,
      [schoolId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch today absences:", err);
    res.status(500).json({ error: "Failed to fetch today's absences" });
  }
});

/**
 * GET /api/absences/level/:levelId/:schoolId
 * Returns students in a level (to show list and allow marking absences)
 */
router.get("/level/:levelId/:schoolId", authenticate, async (req, res) => {
  try {
    const { levelId, schoolId } = req.params;
    // prefer joining levels if students reference level_id or level text
    const [rows] = await db.query(
      `SELECT s.id, s.first_name, s.last_name, s.level, s.school_id
       FROM students s
       WHERE (s.level = (SELECT level_name FROM levels WHERE id = ? LIMIT 1) OR s.level = ?) 
         AND s.school_id = ?`,
      [levelId, levelId, schoolId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch students by level:", err);
    res.status(500).json({ error: "Failed to fetch students for level" });
  }
});

/**
 * DELETE /api/absences/:id
 */
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM absences WHERE id = ?", [id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete absence:", err);
    res.status(500).json({ error: "Failed to delete absence" });
  }
});

/**
 * Statistics
 * GET /api/absences/stats/top-students/:schoolId?startDate=&endDate=
 */
router.get("/stats/top-students/:schoolId", authenticate, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { startDate, endDate } = req.query;
    let filter = "";
    const params = [schoolId];
    if (startDate && endDate) {
      filter = " AND a.absence_date BETWEEN ? AND ? ";
      params.push(startDate, endDate);
    }
    const [rows] = await db.query(
      `SELECT s.id, s.first_name, s.last_name, COUNT(a.id) AS total_absences
       FROM absences a
       JOIN students s ON s.id = a.student_id
       WHERE a.school_id = ? ${filter}
       GROUP BY s.id
       ORDER BY total_absences DESC
       LIMIT 10`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("Top students stats:", err);
    res.status(500).json({ error: "Failed to fetch top students" });
  }
});

/**
 * GET /api/absences/stats/top-levels/:schoolId?startDate=&endDate=
 */
router.get("/stats/top-levels/:schoolId", authenticate, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { startDate, endDate } = req.query;
    let filter = "";
    const params = [schoolId];
    if (startDate && endDate) {
      filter = " AND a.absence_date BETWEEN ? AND ? ";
      params.push(startDate, endDate);
    }
    const [rows] = await db.query(
      `SELECT COALESCE(s.level, l.level_name) AS level, COUNT(a.id) AS total_absences
       FROM absences a
       LEFT JOIN students s ON s.id = a.student_id
       LEFT JOIN levels l ON l.id = a.level_id
       WHERE a.school_id = ? ${filter}
       GROUP BY level
       ORDER BY total_absences DESC
       LIMIT 10`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("Top levels stats:", err);
    res.status(500).json({ error: "Failed to fetch top levels" });
  }
});

export default router;
