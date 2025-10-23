import bcrypt from "bcryptjs";
const hashed = await bcrypt.hash("lahcen1995", 10);
console.log(hashed);
