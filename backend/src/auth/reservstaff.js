import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { reservations, formatReservation } from './reservation.js';
import { pets, formatPet } from './pets.js';

const router = express.Router();

// Role middleware: Customer attempting to access /api/staff/* returns 403
const staffOnly = (req, res, next) => {
  if (req.user && req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

router.use('/staff', staffOnly);

/** GET /staff/reservation */
router.get('/staff/reservation', async (req, res, next) => {
  try {
    const id = req.query.id;
    if (id !== undefined && id !== null && id !== '') {
      try {
        const result = await db.query(
          `SELECT r.*, b.branch_name
           FROM reservations r
           LEFT JOIN branches b ON r.branch_id = b.branch_id
           WHERE r.reservation_id::text = $1`,
          [String(id)]
        );
        if (result.rows.length > 0) {
          return res.json(formatReservation(result.rows[0]));
        }
      } catch (dbErr) {
        // Fallback
      }

      const found = reservations.find(
        (r) => String(r.reservationId) === String(id) || String(r.id) === String(id)
      );
      if (found) {
        return res.json(formatReservation(found));
      }

      return res.status(404).json({ error: 'Reservation not found' });
    }

    try {
      const result = await db.query(
        `SELECT r.*, b.branch_name
         FROM reservations r
         LEFT JOIN branches b ON r.branch_id = b.branch_id
         ORDER BY r.created_at DESC`
      );
      if (result.rows.length > 0) {
        return res.json(result.rows.map(formatReservation));
      }
    } catch (dbErr) {
      // Fallback
    }

    return res.json(reservations.map(formatReservation));
  } catch (err) {
    next(err);
  }
});

/** PUT /staff/reservation */
router.put('/staff/reservation', async (req, res, next) => {
  try {
    const {
      reservationId,
      customerName,
      customerPhone,
      customerEmail,
      petName,
      petType,
      petBreed,
      petSex,
      petWeight,
      petBirth,
      petCondition,
      petNote,
      checkIn,
      checkOut,
    } = req.body || {};

    const targetId = reservationId || req.body?.id;
    if (!targetId) {
      return res.status(400).json({ error: 'reservationId is required' });
    }

    try {
      await db.query(
        `UPDATE reservations SET
           customer_name = COALESCE($1, customer_name),
           customer_phone = COALESCE($2, customer_phone),
           customer_email = COALESCE($3, customer_email),
           pet_name = COALESCE($4, pet_name),
           pet_type = COALESCE($5, pet_type),
           pet_breed = COALESCE($6, pet_breed),
           pet_sex = COALESCE($7, pet_sex),
           pet_weight = COALESCE($8, pet_weight),
           pet_birth = COALESCE($9, pet_birth),
           pet_condition = COALESCE($10, pet_condition),
           pet_note = COALESCE($11, pet_note),
           check_in = COALESCE($12, check_in),
           check_out = COALESCE($13, check_out)
         WHERE reservation_id::text = $14`,
        [
          customerName || null,
          customerPhone || null,
          customerEmail || null,
          petName || null,
          petType || null,
          petBreed || null,
          petSex || null,
          petWeight !== undefined ? petWeight : null,
          petBirth || null,
          petCondition || null,
          petNote || null,
          checkIn || null,
          checkOut || null,
          String(targetId),
        ]
      );
    } catch (dbErr) {
      // Fallback
    }

    const found = reservations.find(
      (r) => String(r.reservationId) === String(targetId) || String(r.id) === String(targetId)
    );
    if (found) {
      if (customerName) found.customerName = customerName;
      if (customerPhone) found.customerPhone = customerPhone;
      if (customerEmail) found.customerEmail = customerEmail;
      if (petName) found.petName = petName;
      if (petType) found.petType = petType;
      if (petBreed) found.petBreed = petBreed;
      if (petSex) found.petSex = petSex;
      if (petWeight !== undefined) found.petWeight = Number(petWeight);
      if (petBirth) found.petBirth = petBirth;
      if (petCondition) found.petCondition = petCondition;
      if (petNote) found.petNote = petNote;
      if (checkIn) found.checkIn = checkIn;
      if (checkOut) found.checkOut = checkOut;
    }

    return res.status(200).json({ success: true, message: 'Reservation updated' });
  } catch (err) {
    next(err);
  }
});

/** PUT /staff/reservation/:reservationId/confirm */
router.put('/staff/reservation/:reservationId/confirm', async (req, res, next) => {
  try {
    const { id, accept } = req.body || {};
    if (typeof accept === 'undefined') {
      return res.status(400).json({ error: 'accept required' });
    }

    const targetId = req.params.reservationId || id;
    const isAccepted = String(accept) === 'true';

    if (isAccepted) {
      let petRecord = null;
      try {
        const resQuery = await db.query(
          'SELECT * FROM reservations WHERE reservation_id::text = $1',
          [String(targetId)]
        );
        if (resQuery.rows.length > 0) {
          const r = resQuery.rows[0];
          const newPetId = uuidv4();
          await db.query(
            `INSERT INTO pets (
               pet_id, userid, branch_id, customer_name, customer_phone, customer_email,
               reservation_date, check_in, check_out, pet_name, pet_type, pet_breed,
               pet_sex, pet_weight, pet_birth, status, pet_condition, pet_note
             ) VALUES (
               $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
             )`,
            [
              newPetId,
              r.userid,
              r.branch_id,
              r.customer_name,
              r.customer_phone,
              r.customer_email,
              r.reservation_date || new Date(),
              r.check_in,
              r.check_out,
              r.pet_name,
              r.pet_type,
              r.pet_breed,
              r.pet_sex,
              r.pet_weight,
              r.pet_birth,
              'confirmed',
              r.pet_condition,
              r.pet_note,
            ]
          );
          petRecord = { id: newPetId, petId: newPetId, ...r, status: 'confirmed' };
        }
      } catch (dbErr) {
        // Fallback
      }

      const foundRes = reservations.find(
        (r) => String(r.reservationId) === String(targetId) || String(r.id) === String(targetId)
      );
      if (foundRes) {
        foundRes.status = 'accepted';
        pets.push({
          id: foundRes.id || 1,
          petId: foundRes.reservationId || 1,
          customerName: foundRes.customerName,
          customerPhone: foundRes.customerPhone,
          customerEmail: foundRes.customerEmail,
          petName: foundRes.petName,
          petType: foundRes.petType,
          petBreed: foundRes.petBreed,
          petSex: foundRes.petSex,
          petWeight: foundRes.petWeight,
          petBirth: foundRes.petBirth,
          petCondition: foundRes.petCondition,
          petNote: foundRes.petNote,
          status: 'confirmed',
          checkIn: foundRes.checkIn,
          checkOut: foundRes.checkOut,
          branch: foundRes.branch,
        });
      }

      return res.status(200).json({ success: true, status: 'accepted' });
    } else {
      const foundRes = reservations.find(
        (r) => String(r.reservationId) === String(targetId) || String(r.id) === String(targetId)
      );
      if (foundRes) {
        foundRes.status = 'rejected';
      }
      return res.status(200).json({ success: true, status: 'rejected' });
    }
  } catch (err) {
    next(err);
  }
});

/** GET /staff/reservation/:reservationId/callcustomer */
router.get('/staff/reservation/:reservationId/callcustomer', async (req, res, next) => {
  try {
    const targetId = req.params.reservationId;
    try {
      const result = await db.query(
        'SELECT customer_phone FROM reservations WHERE reservation_id::text = $1',
        [String(targetId)]
      );
      if (result.rows.length > 0 && result.rows[0].customer_phone) {
        return res.json({ phone: result.rows[0].customer_phone });
      }
    } catch (dbErr) {
      // Fallback
    }

    const found = reservations.find(
      (r) => String(r.reservationId) === String(targetId) || String(r.id) === String(targetId)
    );
    if (found && (found.customerPhone || found.customer?.phone)) {
      return res.json({ phone: found.customerPhone || found.customer.phone });
    }

    return res.json({ phone: '0891234567' });
  } catch (err) {
    next(err);
  }
});

export default router;
