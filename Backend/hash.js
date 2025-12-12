import bcrypt from "bcryptjs";
const password = "alhikma2025";
const hashed = await bcrypt.hash(password, 10);
console.log(hashed);
