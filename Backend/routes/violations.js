import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM violations");
  res.json(rows);
});

router.post("/", authenticate, async (req, res) => {
  const { violation_name } = req.body;
  const id = uuidv4();
  await db.query("INSERT INTO violations (id, violation_name) VALUES (?, ?)", [
    id,
    violation_name,
  ]);
  res.json({ id });
});

export default router;
