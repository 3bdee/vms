import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/school", authenticate, async (req, res) => {
  const schoolId = req.user.school_id;
  const sql = `
SELECT vr.*, s.first_name, s.last_name, s.level, t.full_name AS teacher_name, v.violation_name, p.punishment_name
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
    first_name,
    last_name,
    level,
    violation_id,
    punishment_id,
    violation_time,
    teacher_id,
    school_id,
  } = req.body;

  if (
    !first_name ||
    !last_name ||
    !level ||
    !violation_id ||
    !punishment_id ||
    !teacher_id ||
    !school_id
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1️⃣ Find or create student
    let student_id;
    const [existingStudents] = await db.query(
      `SELECT id FROM students 
       WHERE first_name = ? AND last_name = ? AND level = ? AND school_id = ?`,
      [first_name, last_name, level, school_id]
    );

    if (existingStudents.length > 0) {
      student_id = existingStudents[0].id;
    } else {
      student_id = uuidv4();
      await db.query(
        `INSERT INTO students (id, first_name, last_name, level, school_id)
         VALUES (?, ?, ?, ?, ?)`,
        [student_id, first_name, last_name, level, school_id]
      );
    }

    // 2️⃣ Insert violation record
    const record_id = uuidv4();
    await db.query(
      `INSERT INTO violation_records 
       (id, student_id, teacher_id, violation_id, punishment_id, violation_time, school_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        record_id,
        student_id,
        teacher_id,
        violation_id,
        punishment_id,
        violation_time,
        school_id,
      ]
    );

    // 3️⃣ Count total violations for that student
    const [countRows] = await db.query(
      "SELECT COUNT(*) AS count FROM violation_records WHERE student_id = ?",
      [student_id]
    );
    const newViolationCount = countRows[0].count;

    // 4️⃣ Respond to frontend
    res.json({ id: record_id, student_id, newViolationCount });
  } catch (err) {
    console.error("Error creating violation record:", err);
    res.status(500).json({ error: "Failed to create violation record" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the record exists
    const [record] = await db.query(
      "SELECT id FROM violation_records WHERE id = ?",
      [id]
    );

    if (record.length === 0) {
      return res.status(404).json({ error: "Violation record not found" });
    }

    // Delete the record
    await db.query("DELETE FROM violation_records WHERE id = ?", [id]);

    res.json({ message: "Violation deleted successfully" });
  } catch (err) {
    console.error("Error deleting violation:", err);
    res.status(500).json({ error: "Failed to delete violation" });
  }
});

export default router;
