import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM punishments");
  res.json(rows);
});

router.post("/", authenticate, async (req, res) => {
  const { punishment_name } = req.body;
  const id = uuidv4();
  await db.query(
    "INSERT INTO punishments (id, punishment_name) VALUES (?, ?)",
    [id, punishment_name]
  );
  res.json({ id });
});

export default router;
