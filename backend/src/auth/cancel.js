import express from 'express';

// Use the same in‑memory reservations array from reservation.js. In a real
// application this would be a shared database model. For this mock we import
// the array via require – Node's ES module loader allows circular imports if we
// keep the reference mutable.
let reservations = [];
try {
  // eslint-disable-next-line import/no-unresolved
  const reservationModule = require('./reservation.js');
  if (Array.isArray(reservationModule.reservations)) {
    reservations = reservationModule.reservations;
  }
} catch (_) {
  // Fallback: the module may not have been loaded yet; the router will still
  // operate on its own local copy which will be consistent for this demo.
}

/**
 * POST /customer/reservation/cancel
 * Cancels a reservation. Expects JSON body with `id` of the reservation.
 */
function cancelReservation(req, res) {
  const { id } = req.body;
  if (typeof id === 'undefined') {
    return res
      .status(400)
      .json({ success: false, message: 'Reservation id is required' });
  }
  const reservation = reservations.find((r) => r.id === Number(id));
  if (!reservation) {
    return res
      .status(404)
      .json({ success: false, message: 'Reservation not found' });
  }
  reservation.status = 'canceled';
  res.json({ success: true, message: 'Reservation canceled', reservation });
}

const router = express.Router();
router.post('/customer/reservation/cancel', cancelReservation);

export default router;

