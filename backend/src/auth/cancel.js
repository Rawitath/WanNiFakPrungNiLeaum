import express from 'express';
import db from '../config/db.js';
import { reservations } from './reservation.js';

async function cancelReservation(req, res, next) {
  try {
    const { id } = req.body || {};
    if (typeof id === 'undefined' || id === null || id === '') {
      return res.status(400).json({ success: false, message: 'Reservation id is required' });
    }

    try {
      await db.query('DELETE FROM reservations WHERE reservation_id::text = $1', [String(id)]);
    } catch (dbErr) {
      // In-memory fallback
    }

    const idx = reservations.findIndex(
      (r) => String(r.reservationId) === String(id) || String(r.id) === String(id)
    );
    if (idx !== -1) {
      reservations[idx].status = 'cancelled';
    }

    return res.status(200).json({ success: true, message: 'Reservation canceled' });
  } catch (err) {
    next(err);
  }
}

const router = express.Router();
router.post('/customer/reservation/cancel', cancelReservation);

export default router;
