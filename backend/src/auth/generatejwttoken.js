import dotenv from 'dotenv'
import jwt from "jsonwebtoken";

dotenv.config();

const generateJwtToken = (user) => {
    return jwt.sign(
        { userid: user.userid, role: user.role },
        process.env.JWT_SECRET || "secret_key",
        { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );
}

export default generateJwtToken;