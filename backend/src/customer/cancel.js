import express from 'express';
import db from '../config/db.js';
import { reservations } from '../all/reservation.js';

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

/**
 * @swagger
 * /api/customer/reservation/cancel:
 *   post:
 *     summary: Cancel a customer reservation
 *     tags: [Customer Reservation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Reservation ID to cancel
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Reservation canceled
 *       400:
 *         description: Missing reservation id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Reservation id is required
 *       401:
 *         description: Unauthorized
 */
router.post('/customer/reservation/cancel', cancelReservation);

export default router;
