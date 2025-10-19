import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/school/:schoolId", authenticate, async (req, res) => {
  const { schoolId } = req.params;
  const [rows] = await db.query("SELECT * FROM teachers WHERE school_id = ?", [
    schoolId,
  ]);
  res.json(rows);
});

router.post("/", authenticate, async (req, res) => {
  const { school_id, full_name } = req.body;
  const id = uuidv4();
  await db.query(
    "INSERT INTO teachers (id, school_id, full_name) VALUES (?, ?, ?)",
    [id, school_id, full_name]
  );
  res.json({ id });
});

export default router;
