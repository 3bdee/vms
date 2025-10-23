import express from "express";
import db from "../db.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📅 Monthly Stats
router.get("/monthly/:schoolId", authenticate, async (req, res) => {
  const { schoolId } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT 
        DATE_FORMAT(violation_time, '%Y-%m') AS month,
        COUNT(*) AS total
      FROM violation_records
      WHERE school_id = ?
      GROUP BY month
      ORDER BY month ASC;
    `,
      [schoolId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching monthly stats:", err);
    res.status(500).json({ error: "Failed to fetch monthly stats" });
  }
});

// 👨‍🎓 Top 10 Students
router.get("/top-students/:schoolId", authenticate, async (req, res) => {
  const { schoolId } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT 
        CONCAT(s.first_name, ' ', s.last_name) AS full_name,
        COUNT(vr.id) AS total_violations
      FROM violation_records vr
      JOIN students s ON vr.student_id = s.id
      WHERE vr.school_id = ?
      GROUP BY s.id
      ORDER BY total_violations DESC
      LIMIT 10;
    `,
      [schoolId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching top students:", err);
    res.status(500).json({ error: "Failed to fetch top students" });
  }
});

// 👩‍🏫 Top 10 Teachers
router.get("/top-teachers/:schoolId", authenticate, async (req, res) => {
  const { schoolId } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT 
        t.full_name,
        COUNT(vr.id) AS total_assigned
      FROM violation_records vr
      JOIN teachers t ON vr.teacher_id = t.id
      WHERE vr.school_id = ?
      GROUP BY t.id
      ORDER BY total_assigned DESC
      LIMIT 10;
    `,
      [schoolId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching top teachers:", err);
    res.status(500).json({ error: "Failed to fetch top teachers" });
  }
});

// 📊 Level Stats (for PieChart)
router.get("/level/:schoolId", authenticate, async (req, res) => {
  const { schoolId } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT 
        s.level,
        COUNT(vr.id) AS total_violations
      FROM violation_records vr
      JOIN students s ON vr.student_id = s.id
      WHERE vr.school_id = ?
      GROUP BY s.level;
    `,
      [schoolId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching level stats:", err);
    res.status(500).json({ error: "Failed to fetch level stats" });
  }
});

router.get("/totals/:schoolId", authenticate, async (req, res) => {
  const { schoolId } = req.params;
  try {
    const [result] = await db.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM violation_records WHERE school_id = ?) AS total_violations,
        (SELECT COUNT(DISTINCT student_id) FROM violation_records WHERE school_id = ?) AS total_students,
        (SELECT COUNT(DISTINCT teacher_id) FROM violation_records WHERE school_id = ?) AS total_teachers;
      `,
      [schoolId, schoolId, schoolId]
    );

    res.json(result[0]);
  } catch (err) {
    console.error("Error fetching totals:", err);
    res.status(500).json({ error: "Failed to fetch totals" });
  }
});

export default router;
