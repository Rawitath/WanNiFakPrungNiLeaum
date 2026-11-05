import express from 'express';

// Simple in‑memory status store for pets handled by staff.
let petStatuses = [];
/**
 * POST /staff/status
 * Update the status of a pet (e.g., "deposit", "return").
 * Expected body: { petId: number, status: string }
 */
function updateStatus(req, res) {
  const { petId, status } = req.body;
  if (typeof petId === 'undefined' || !status) {
    return res
      .status(400)
      .json({ success: false, message: 'petId and status are required' });
  }
  const entry = petStatuses.find((p) => p.petId === Number(petId));
  if (entry) {
    entry.status = status;
  } else {
    petStatuses.push({ petId: Number(petId), status });
  }
  res.json({ success: true, petId, status });
}

const router = express.Router();
router.post('/staff/status', updateStatus);

export default router;

