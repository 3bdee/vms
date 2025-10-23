import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/school", authenticate, async (req, res) => {
  const schoolId = req.user.school_id;
  const [rows] = await db.query("SELECT * FROM students WHERE school_id = ?", [
    schoolId,
  ]);
  res.json(rows);
});

router.post("/", authenticate, async (req, res) => {
  const { school_id, first_name, last_name, level } = req.body;
  const id = uuidv4();
  await db.query(
    "INSERT INTO students (id, school_id, first_name, last_name, level) VALUES (?, ?, ?, ?, ?)",
    [id, school_id, first_name, last_name, level]
  );
  res.json({ id });
});

router.get("/check", authenticate, async (req, res) => {
  const { first_name, last_name, level, school_id } = req.query;
  const [rows] = await db.query(
    "SELECT id FROM students WHERE first_name = ? AND last_name = ? AND level = ? AND school_id = ? LIMIT 1",
    [first_name, last_name, level, school_id]
  );

  if (rows.length > 0) res.json({ id: rows[0].id });
  else res.json({});
});

router.get("/count/:studentId", authenticate, async (req, res) => {
  const { studentId } = req.params;
  const [rows] = await db.query(
    "SELECT COUNT(*) AS count FROM violation_records WHERE student_id = ?",
    [studentId]
  );
  res.json({ count: rows[0].count });
});

export default router;
