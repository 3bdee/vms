// routes/levels.js
import express from "express";
import db from "../db.js";
import { authenticate } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/school", authenticate, async (req, res) => {
  const schoolId = req.user.school_id;
  try {
    const [rows] = await db.query("SELECT * FROM levels WHERE school_id = ?;", [
      schoolId,
    ]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching levels:", err);
    res.status(500).json({ error: "Failed to fetch levels" });
  }
});

export default router;
