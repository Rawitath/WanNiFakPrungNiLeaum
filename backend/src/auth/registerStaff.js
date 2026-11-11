import { makePassword } from "../utils/password_endec.js";
import { v4 as uuidv4 } from "uuid";
import db from "../config/db.js";

function checkMissingFields(obj) {
  const requiredKeys = ['username', 'password', 'email', 'phone'];
  const missingFields = [];

  requiredKeys.forEach(key => {
    if (!obj || obj[key] === undefined || obj[key] === null || String(obj[key]).trim() === "") {
      missingFields.push(key);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields
  };
}

const adminCheck = async (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
    return res.status(401).json({ error: "This action can be done only by admin" });
  }
  next();
};

const registerStaff = async (req, res, next) => {
  let client;
  try {
    const checkValid = checkMissingFields(req.body);
    if (!checkValid.isValid) {
      return res.status(400).json({ message: `Missing field: ${checkValid.missingFields}` });
    }

    client = await db.connect();
    await client.query("BEGIN");

    const { username, password, email, phone, branch_id } = req.body;

    const userExist = await client.query(
      "SELECT username, email FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (userExist.rows.length > 0) {
      await client.query("ROLLBACK");
      const existing = userExist.rows[0];
      if (existing.username === username) {
        return res.status(409).json({ message: "Username already exists" });
      }
      if (existing.email === email) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }

    const hashedPassword = await makePassword(password, username);
    const userid = uuidv4();

    await client.query(
      "INSERT INTO users (userid, username, password, email, phone, role) VALUES ($1, $2, $3, $4, $5, $6)",
      [userid, username, hashedPassword, email, phone, "staff"]
    );

    let staffBranchId = branch_id || null;
    if (!staffBranchId) {
      // If no branch provided, default to manager's branch if exists or first available branch
      const branchRes = await client.query("SELECT branch_id FROM branches LIMIT 1");
      if (branchRes.rows.length > 0) {
        staffBranchId = branchRes.rows[0].branch_id;
      }
    }

    const staffId = uuidv4();
    await client.query(
      "INSERT INTO staffs (staff_id, userid, branch_id) VALUES ($1, $2, $3)",
      [staffId, userid, staffBranchId]
    );

    await client.query("COMMIT");
    return res.status(201).json({ message: "Staff registered successfully" });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    next(error);
  } finally {
    if (client) {
      client.release();
    }
  }
};

const updateStaff = async (req, res, next) => {
  try {
    const { userid } = req.params;
    const { username, phone, email, branch_id, branch } = req.body || {};

    const userRes = await db.query(
      "SELECT * FROM users WHERE userid = $1",
      [userid]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    // Check if new username or email conflicts with another user
    if (username || email) {
      const conflictCheck = await db.query(
        "SELECT userid FROM users WHERE (username = $1 OR email = $2) AND userid != $3",
        [username || null, email || null, userid]
      );
      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({ message: "Username or email already exists" });
      }
    }

    // Update users table fields
    const updates = [];
    const values = [];
    let idx = 1;

    if (username !== undefined) {
      updates.push(`username = $${idx++}`);
      values.push(username);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${idx++}`);
      values.push(phone);
    }
    if (email !== undefined) {
      updates.push(`email = $${idx++}`);
      values.push(email);
    }

    if (updates.length > 0) {
      values.push(userid);
      await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE userid = $${idx}`,
        values
      );
    }

    // Update branch in staffs table if branch_id or branch is provided
    let targetBranchId = branch_id;
    if (!targetBranchId && branch) {
      const branchRes = await db.query(
        "SELECT branch_id FROM branches WHERE branch_name = $1 OR branch_id::text = $1",
        [branch]
      );
      if (branchRes.rows.length > 0) {
        targetBranchId = branchRes.rows[0].branch_id;
      }
    }

    if (targetBranchId) {
      const staffRes = await db.query(
        "SELECT * FROM staffs WHERE userid = $1",
        [userid]
      );
      if (staffRes.rows.length > 0) {
        await db.query(
          "UPDATE staffs SET branch_id = $1 WHERE userid = $2",
          [targetBranchId, userid]
        );
      } else {
        const staffId = uuidv4();
        await db.query(
          "INSERT INTO staffs (staff_id, userid, branch_id) VALUES ($1, $2, $3)",
          [staffId, userid, targetBranchId]
        );
      }
    }

    return res.status(200).json({ message: "Staff updated successfully" });
  } catch (error) {
    next(error);
  }
};

export { adminCheck, registerStaff, updateStaff };
