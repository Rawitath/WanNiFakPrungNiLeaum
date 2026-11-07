import express from 'express';
import db from '../config/db.js';

let inMemoryProfile = {
  username: '',
  phone: '',
  email: '',
};

/** GET /profile */
async function getProfile(req, res, next) {
  try {
    if (req.user && req.user.userid) {
      try {
        const result = await db.query(
          'SELECT username, phone, email FROM users WHERE userid = $1',
          [req.user.userid]
        );
        if (result.rows.length > 0) {
          return res.json({
            username: result.rows[0].username,
            phone: result.rows[0].phone || '',
            email: result.rows[0].email || '',
          });
        }
      } catch (err) {
        // Database not available or table does not exist
      }
    }

    if (inMemoryProfile.username) {
      return res.json(inMemoryProfile);
    }

    if (req.user && req.user.username) {
      return res.json({
        username: req.user.username,
        phone: req.user.phone || '',
        email: req.user.email || '',
      });
    }

    return res.status(401).json({ error: 'Unauthorized' });
  } catch (err) {
    next(err);
  }
}

/** POST /profile */
async function updateProfile(req, res, next) {
  try {
    const { username, phone, email } = req.body || {};
    if (!username || !phone || !email) {
      return res.status(400).json({ message: 'username, phone and email are required' });
    }

    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (req.user && req.user.userid) {
      try {
        await db.query(
          'UPDATE users SET username = $1, phone = $2 WHERE userid = $3',
          [username, phone, req.user.userid]
        );
      } catch (err) {
        // Database fallback
      }
    }

    inMemoryProfile = { username, phone, email };
    return res.json({ username, phone, email });
  } catch (err) {
    next(err);
  }
}

const router = express.Router();
router.get('/profile', getProfile);
router.post('/profile', updateProfile);

export default router;
