import dotenv from 'dotenv'

dotenv.config();

const generateJwtToken = (user) => {
    const accessToken = jwt.sign(
        { userid: user.userid, role: user.role },
        process.env.JWT_SECRET || "secret_key",
        { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );
    return accessToken;
}

export default generateJwtToken;