import { checkPassword } from "../utils/password_endec.js";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import dotenv from 'dotenv'
import generateJwtToken from "./generatejwttoken.js";

dotenv.config();

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const result = await db.query(
            "SELECT * FROM users WHERE username = $1 OR email = $1",
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];
        const isMatch = await checkPassword(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const accessToken = generateJwtToken(user);

        return res.status(200).json({ accessToken });
    } catch (error) {
        next(error);
    }
};

export default login;