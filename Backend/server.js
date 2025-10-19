import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import schoolsRoutes from "./routes/schools.js";
import levelsRoutes from "./routes/levels.js";
import studentsRoutes from "./routes/students.js";
import teachersRoutes from "./routes/teachers.js";
import violationsRoutes from "./routes/violations.js";
import punishmentsRoutes from "./routes/punishments.js";
import violationRecordsRoutes from "./routes/violationRecords.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/schools", schoolsRoutes);
app.use("/api/levels", levelsRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/violations", violationsRoutes);
app.use("/api/punishments", punishmentsRoutes);
app.use("/api/violation-records", violationRecordsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
