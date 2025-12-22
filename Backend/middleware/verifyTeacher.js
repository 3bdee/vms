import jwt from "jsonwebtoken";
import db from "../db.js";

export async function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token provided" });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretkey"
    );
    // ensure token belongs to an actual teacher
    const [rows] = await db.query("SELECT id FROM teachers WHERE id = ?", [
      decoded.id,
    ]);
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid teacher token" });
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ code: "TOKEN_EXPIRED", error: "Please log in again" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}
