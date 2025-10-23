import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "vms_alhikma",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db.promise();
