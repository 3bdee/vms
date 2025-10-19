import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/school/:schoolId", authenticate, async (req, res) => {
  const { schoolId } = req.params;
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

export default router;
