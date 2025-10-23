import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

// POST /api/auth/teacher-login
router.post("/teacher-login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM teachers WHERE email = ? LIMIT 1",
      [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: "Teacher not found" });
    const teacher = rows[0];
    const match = await bcrypt.compare(password, teacher.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: teacher.id,
        email: teacher.email,
        teacher: true,
        school_id: teacher.school_id,
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        id: teacher.id,
        email: teacher.email,
        full_name: teacher.full_name,
        school_id: teacher.school_id,
      },
    });
  } catch (err) {
    console.error("Teacher login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
