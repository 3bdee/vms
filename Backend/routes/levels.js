import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/school/:schoolId", authenticate, async (req, res) => {
  const { schoolId } = req.params;
  const [rows] = await db.query("SELECT * FROM levels WHERE school_id = ?", [
    schoolId,
  ]);
  res.json(rows);
});

router.post("/", authenticate, async (req, res) => {
  const { school_id, level_name } = req.body;
  const id = uuidv4();
  await db.query(
    "INSERT INTO levels (id, school_id, level_name) VALUES (?, ?, ?)",
    [id, school_id, level_name]
  );
  res.json({ id });
});

export default router;
