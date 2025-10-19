import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Get all schools
router.get("/", (req, res) => {
  db.query("SELECT * FROM schools", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Add new school
router.post("/", (req, res) => {
  const { school_name } = req.body;
  const id = uuidv4();
  const sql = "INSERT INTO schools (id, school_name) VALUES (?, ?)";
  db.query(sql, [id, school_name], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ id, message: "School added" });
  });
});

export default router;
