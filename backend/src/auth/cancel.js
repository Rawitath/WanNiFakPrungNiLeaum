import express from 'express';
import { reservations } from './reservation.js';

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

