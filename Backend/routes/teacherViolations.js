import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { verifyToken } from "../middleware/verifyTeacher.js";

const router = express.Router();

// POST /api/teacher/violations -> create record assigned to logged-in teacher
router.post("/", verifyToken, async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const {
      student_id,
      violation_id,
      punishment_id,
      violation_time,
      school_id,
    } = req.body;
    const id = uuidv4();
    await db.query(
      "INSERT INTO violation_records (id, student_id, teacher_id, violation_id, punishment_id, violation_time, school_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        student_id,
        teacher_id,
        violation_id,
        punishment_id,
        violation_time,
        school_id,
      ]
    );
    res.json({ id });
  } catch (err) {
    console.error("Create violation error:", err);
    res.status(500).json({ error: "Failed to create violation" });
  }
});

// GET /api/teacher/violations?from=&to=&violation_id=&student_id=
router.get("/", verifyToken, async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const { from, to, violation_id, student_id } = req.query;

    let sql = `SELECT vr.*, s.first_name, s.last_name, v.violation_name, p.punishment_name
FROM violation_records vr
JOIN students s ON vr.student_id = s.id
LEFT JOIN violations v ON vr.violation_id = v.id
LEFT JOIN punishments p ON vr.punishment_id = p.id
WHERE vr.teacher_id = ?`;
    const params = [teacher_id];

    if (from) {
      sql += " AND vr.violation_time >= ?";
      params.push(from);
    }
    if (to) {
      sql += " AND vr.violation_time <= ?";
      params.push(to);
    }
    if (violation_id) {
      sql += " AND vr.violation_id = ?";
      params.push(violation_id);
    }
    if (student_id) {
      sql += " AND vr.student_id = ?";
      params.push(student_id);
    }

    sql += " ORDER BY vr.violation_time DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Fetch teacher violations error:", err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

export default router;
