import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

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

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    if (verified) {
      req.user = verified;
      next();
    } else {
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default defaultAuthMiddleware;
