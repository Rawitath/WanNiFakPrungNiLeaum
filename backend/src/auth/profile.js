import express from 'express';

// In‑memory storage for the user profile. In a real application this would be a
// database lookup tied to the authenticated user (e.g. req.user.id).
let profile = {
  name: '',
  phone: '',
  email: '',
};

/**
 * GET /api/profile
 * Returns the current profile information.
 */
function getProfile(req, res) {
  // If authentication middleware populates req.user, you could fetch the
  // profile from a DB here. For now we simply return the in‑memory object.
  res.json({ success: true, profile });
}

/**
 * POST /api/profile
 * Updates the profile. Expects JSON body with `name`, `phone`, and `email`.
 */
function updateProfile(req, res) {
  const { name, phone, email } = req.body;
  if (!name || !phone || !email) {
    return res
      .status(400)
      .json({ success: false, message: 'name, phone and email are required' });
  }
  profile = { name, phone, email };
  res.json({ success: true, message: 'Profile updated', profile });
}

// Create a router so it can be mounted under /api in the main app.
const router = express.Router();
router.get('/profile', getProfile);
router.post('/profile', updateProfile);

export default router;

