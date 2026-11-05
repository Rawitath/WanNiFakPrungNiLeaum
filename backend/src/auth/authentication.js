import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config();

const defaultAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const verified = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
  if (verified) {
    next();
  } else {
    // Access Denied
    return res.status(401).send({ error: "InvalidToken!" });
  }
};

export default defaultAuthMiddleware;
