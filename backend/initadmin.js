import db from "./src/config/db.js";
import { makePassword } from "./src/utils/password_endec.js";
import { v4 as uuidv4 } from "uuid";

export async function initadmin(username="admin", email="admin@test.com", password="admin1234", phone="0899999999") {
    // ดึง client ออกมาจาก pool เพื่อใช้ทำ Transaction
    let client;
    try {
        client = await db.connect();
        await client.query("BEGIN"); // เริ่ม Transaction

        const userExist = await client.query(
            "SELECT username, email FROM users WHERE username = $1 OR email = $2",
            [username, email]
        );

        if (userExist.rows.length > 0) {
            await client.query("COMMIT");
            return; // มีข้อมูลแล้ว ออกได้เลย
        }

        const hashedPassword = await makePassword(password); // ใช้ PASSWORD_ENDEC_SALT จาก env เหมือนกับทุกที่ในระบบ
        const userid = uuidv4();
        const managerid = uuidv4();

        await client.query(
            "INSERT INTO users (userid, username, password, email, phone, role) VALUES ($1, $2, $3, $4, $5, $6)",
            [userid, username, hashedPassword, email, phone, "admin"]
        );
        
        await client.query(
            "INSERT INTO managers (manager_id, userid) VALUES ($1, $2)",
            [managerid, userid]
        );

        await client.query(
            "INSERT INTO branches (branch_id, branch_name) VALUES ($1, $2)",
            [uuidv4(), "ลาดกระบัง"]
        );

        await client.query(
            "INSERT INTO branches (branch_id, branch_name) VALUES ($1, $2)",
            [uuidv4(), "ร่มเกล้า"]
        );

        await client.query(
            "INSERT INTO branches (branch_id, branch_name) VALUES ($1, $2)",
            [uuidv4(), "ปราจีนบุรี"]
        );

        await client.query(
            "INSERT INTO branches (branch_id, branch_name) VALUES ($1, $2)",
            [uuidv4(), "หาดใหญ่"]
        );

        await client.query("COMMIT"); // ยืนยันการบันทึกข้อมูลทั้ง 2 ตาราง
        return;
    } catch (error) {
        if (client) await client.query("ROLLBACK"); // หากพังกลางทาง ให้ย้อนกลับข้อมูลทั้งหมด
        throw new Error(error);
    } finally {
        if (client) client.release(); // คืน connection กลับเข้า pool
    }
};