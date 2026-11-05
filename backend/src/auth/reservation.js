import express from 'express';

// In‑memory mock reservations. In a real app this would be persisted per user.
let reservations = [
  { id: 1, animal: 'Dog', date: '2023-09-01', status: 'confirmed' },
];

/**
 * GET /customer/reservation
 * Returns the list of reservations for the logged‑in customer.
 */
function getReservations(req, res) {
  // In a real implementation you would filter by req.user.id.
  res.json({ success: true, reservations });
}

/**
 * POST /customer/reservation
 * Creates a new reservation. Expects JSON body with `animal` and `date`.
 */
function createReservation(req, res) {
  const { animal, date } = req.body;
  if (!animal || !date) {
    return res
      .status(400)
      .json({ success: false, message: 'animal and date are required' });
  }
  const newRes = {
    id: reservations.length + 1,
    animal,
    date,
    status: 'pending',
  };
  reservations.push(newRes);
  res.json({ success: true, reservation: newRes });
}

const router = express.Router();
router.get('/customer/reservation', getReservations);
router.post('/customer/reservation', createReservation);

export default router;

