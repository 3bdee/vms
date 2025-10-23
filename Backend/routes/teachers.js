import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/school", authenticate, async (req, res) => {
  const schoolId = req.user.school_id;
  const [rows] = await db.query("SELECT * FROM teachers WHERE school_id = ?", [
    schoolId,
  ]);
  res.json(rows);
});

export default router;
