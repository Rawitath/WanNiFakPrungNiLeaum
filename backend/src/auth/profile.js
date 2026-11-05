import express from 'express';

// In‑memory profile storage for test purposes.
let profile = {
  username: '',
  phone: '',
  email: '',
};

/** GET /api/profile */
function getProfile(req, res) {
  // If the mock auth middleware set req.user, use it as default profile.
  if (req.user && req.user.username) {
    profile = {
      username: req.user.username,
      phone: req.user.phone || '',
      email: req.user.email || '',
    };
  }
  res.json(profile);
}

/** POST /api/profile */
function updateProfile(req, res) {
  const { username, phone, email } = req.body;
  if (!username || !phone || !email) {
    return res
      .status(400)
      .json({ message: 'username, phone and email are required' });
  }
  // Simple email format validation.
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  profile = { username, phone, email };
  res.json(profile);
}

const router = express.Router();
router.get('/profile', getProfile);
router.post('/profile', updateProfile);

export default router;

