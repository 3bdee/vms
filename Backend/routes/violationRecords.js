import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/school/:schoolId", authenticate, async (req, res) => {
  const { schoolId } = req.params;
  const sql = `
SELECT vr.*, s.first_name, s.last_name, t.full_name AS teacher_name, v.violation_name, p.punishment_name
FROM violation_records vr
JOIN students s ON vr.student_id = s.id
LEFT JOIN teachers t ON vr.teacher_id = t.id
LEFT JOIN violations v ON vr.violation_id = v.id
LEFT JOIN punishments p ON vr.punishment_id = p.id
WHERE vr.school_id = ?
ORDER BY vr.violation_time DESC
`;
  const [rows] = await db.query(sql, [schoolId]);
  res.json(rows);
});

router.post("/", authenticate, async (req, res) => {
  const {
    student_id,
    teacher_id,
    violation_id,
    punishment_id,
    violation_time,
    school_id,
  } = req.body;
  const id = uuidv4();
  const sql = `INSERT INTO violation_records (id, student_id, teacher_id, violation_id, punishment_id, violation_time, school_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await db.query(sql, [
    id,
    student_id,
    teacher_id,
    violation_id,
    punishment_id,
    violation_time,
    school_id,
  ]);
  res.json({ id });
});

export default router;
