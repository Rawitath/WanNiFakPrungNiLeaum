import { makePassword } from "../utils/password_endec.js";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js"; // สมมติว่าคุณเชื่อมต่อ DB ไว้ที่นี่

function checkMissingFields(obj) {
  const requiredKeys = ['username', 'password', 'email', 'phone'];
  const missingFields = [];

  requiredKeys.forEach(key => {
    // ถ้าไม่มีคีย์ หรือคีย์นั้นมีค่าเป็นค่าว่าง (falsy หรือ string ว่าง)
    if (!obj || obj[key] === undefined || obj[key] === null || String(obj[key]).trim() === "") {
      missingFields.push(key);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields
  };
}

const register = async (req, res, next) => {
    try {
        const checkValid = checkMissingFields(req.body);
        if(!checkValid.isValid){
            return res.status(400).json({ message: `Missing field: ${checkValid.missingFields}` })
        }
        const { username, password, email, phone } = req.body;

        const userExist = await db.query(
            "SELECT username, email FROM users WHERE username = $1 OR email = $2",
            [username, email]
        );

        if (userExist.rows.length > 0) {
            const existing = userExist.rows[0];
            if (existing.username === username) {
                return res.status(409).json({ message: "Username already exists" });
            }
            if (existing.email === email) {
                return res.status(409).json({ message: "Email already exists" });
            }
        }

        const hashedPassword = await makePassword(password, salt);
        const userid = uuidv4();

        await db.query(
            "INSERT INTO users (userid, username, password, email, phone, role) VALUES ($1, $2, $3, $4, $5, $6)",
            [userid, username, hashedPassword, email, phone, "customer"]
        );

        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        next(error);
    }
};

export default register;