import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM schools ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/", authenticate, async (req, res) => {
  const { school_name } = req.body;
  const id = uuidv4();
  try {
    await db.query("INSERT INTO schools (id, school_name) VALUES (?, ?)", [
      id,
      school_name,
    ]);
    res.json({ id });
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
