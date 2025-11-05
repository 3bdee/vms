import bcrypt from "bcryptjs";
const hashed = await bcrypt.hash("alhikma2025", 10);
console.log(hashed);
