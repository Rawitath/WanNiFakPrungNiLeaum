import db from "./src/config/db.js";
import { makePassword } from "./src/utils/password_endec.js";
import { v4 as uuidv4 } from "uuid";

export async function initadmin(username="admin", email="admin@test.com", password="admin1234", phone="0899999999") {
    try {
        const userExist = await db.query(
            "SELECT username, email FROM users WHERE username = $1 OR email = $2",
            [username, email]
        );

        if (userExist.rows.length > 0) {
            const existing = userExist.rows[0];
            if (existing.username === username) {
                return;
            }
            if (existing.email === email) {
                return;
            }
        }

        const hashedPassword = await makePassword(password, username);
        const userid = uuidv4();

        await db.query(
            "INSERT INTO users (userid, username, password, email, phone, role) VALUES ($1, $2, $3, $4, $5, $6)",
            [userid, username, hashedPassword, email, phone, "admin"]
        );
        const managerid = uuidv4();
        await db.query(
            "INSERT INTO managers (manager_id, userid) VALUES ($1, $2)",
            [managerid, userid]
        );

        return;
    } catch (error) {
        throw new Error(error);
    }
};