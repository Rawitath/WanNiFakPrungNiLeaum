import express from 'express';

// In‑memory staff reservations data.
let staffReservations = [];

/**
 * GET /staff/reservation
 * Returns all reservations visible to staff (includes customer and animal info).
 */
function getStaffReservations(req, res) {
  res.json({ success: true, reservations: staffReservations });
}

/**
 * POST /staff/reservation
 * Create a reservation entry for staff view.
 * Expected body: { customer: { name, phone }, animal: { type, name }, detail: { checkIn, checkOut } }
 */
function createStaffReservation(req, res) {
  const { customer, animal, detail } = req.body;
  if (!customer || !animal || !detail) {
    return res
      .status(400)
      .json({ success: false, message: 'customer, animal and detail are required' });
  }
  const newRes = {
    id: staffReservations.length + 1,
    customer,
    animal,
    detail,
  };
  staffReservations.push(newRes);
  res.json({ success: true, reservation: newRes });
}

const router = express.Router();
router.get('/staff/reservation', getStaffReservations);
router.post('/staff/reservation', createStaffReservation);

export default router;

