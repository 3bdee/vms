import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";

const router = express.Router();

// 🧠 LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email et mot de passe requis" });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0)
      return res.status(401).json({ error: "Utilisateur non trouvé" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, email: user.email, school_id: user.school_id },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: { id: user.id, email: user.email, school_id: user.school_id },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🧠 REGISTER (optional, to create admin)
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email et mot de passe requis" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await db.query("INSERT INTO users (id, email, password) VALUES (?, ?, ?)", [
      id,
      email,
      hashed,
    ]);

    res.json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
