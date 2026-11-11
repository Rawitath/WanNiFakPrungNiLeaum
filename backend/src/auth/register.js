import { makePassword } from "../utils/password_endec.js";
import { v4 as uuidv4 } from "uuid";
import db from "../config/db.js";

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

const registerCustomer = async (req, res, next) => {
    let client;
    try {
        const checkValid = checkMissingFields(req.body);
        if(!checkValid.isValid){
            return res.status(400).json({ message: `Missing field: ${checkValid.missingFields}` })
        }

        const { username, password, email, phone } = req.body;

        client = await db.connect();
        await client.query("BEGIN");

        const userExist = await client.query(
            "SELECT username, email FROM users WHERE username = $1 OR email = $2",
            [username, email]
        );

        if (userExist.rows.length > 0) {
            await client.query("ROLLBACK"); // ปิด transaction ก่อน return เสมอ
            const existing = userExist.rows[0];
            if (existing.username === username) {
                return res.status(409).json({ message: "Username already exists" });
            }
            if (existing.email === email) {
                return res.status(409).json({ message: "Email already exists" });
            }
        }

        const hashedPassword = await makePassword(password);
        const userid = uuidv4();

        await client.query(
            "INSERT INTO users (userid, username, password, email, phone, role) VALUES ($1, $2, $3, $4, $5, $6)",
            [userid, username, hashedPassword, email, phone, "customer"]
        );
        const customerid = uuidv4();
        await client.query(
            "INSERT INTO customers (customer_id, userid) VALUES ($1, $2)",
            [customerid, userid]
        );

        await client.query("COMMIT");
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        if (client) await client.query("ROLLBACK");
        next(error);
    } finally {
        if (client) client.release();
    }
};

export default registerCustomer;