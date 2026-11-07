import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';

let reservations = [
  {
    id: 1,
    reservationId: 1,
    branch: 'ลาดกระบัง',
    customerName: 'John Doe',
    customerPhone: '0890123456',
    customerEmail: 'test@example.com',
    petName: 'สุทธิชัย',
    petType: 'Dog',
    petBreed: 'Golden Retriever',
    petSex: 'Male',
    petWeight: 25,
    petBirth: '2020-05-15',
    petCondition: 'หอบหืด',
    petNote: 'อย่าให้คึกเยอะ',
    reservationDate: new Date().toISOString(),
    checkIn: '2026-11-10T19:13:00.000Z',
    checkOut: '2026-11-15T20:00:00.000Z',
    status: 'pending',
  },
];

export function formatReservation(row) {
  if (!row) return null;
  return {
    reservationId: row.reservation_id || row.reservationId || row.id,
    id: row.reservation_id || row.reservationId || row.id,
    branch: row.branch_name || row.branch || '',
    branchId: row.branch_id || row.branchId,
    customerName: row.customer_name || row.customerName,
    customerPhone: row.customer_phone || row.customerPhone,
    customerEmail: row.customer_email || row.customerEmail,
    petName: row.pet_name || row.petName,
    petType: row.pet_type || row.petType,
    petBreed: row.pet_breed || row.petBreed,
    petSex: row.pet_sex || row.petSex,
    petWeight: row.pet_weight !== undefined && row.pet_weight !== null ? Number(row.pet_weight) : row.petWeight,
    petBirth: row.pet_birth ? (row.pet_birth instanceof Date ? row.pet_birth.toISOString().split('T')[0] : String(row.pet_birth).split('T')[0]) : row.petBirth,
    petCondition: row.pet_condition || row.petCondition,
    petNote: row.pet_note || row.petNote,
    reservationDate: row.reservation_date || row.reservationDate,
    checkIn: row.check_in || row.checkIn,
    checkOut: row.check_out || row.checkOut,
    status: row.status,
  };
}

/** GET /customer/reservation */
async function getReservations(req, res, next) {
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
        // Fallback to in-memory
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
}

/** POST /customer/reservation */
async function createReservation(req, res, next) {
  try {
    const {
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
      branch,
    } = req.body || {};

    const required = [
      'customerName',
      'customerPhone',
      'customerEmail',
      'petName',
      'petType',
      'petBreed',
      'petSex',
      'petWeight',
      'petBirth',
      'petCondition',
      'petNote',
      'checkIn',
      'checkOut',
      'branch',
    ];
    for (const f of required) {
      if (!req.body || req.body[f] === undefined || req.body[f] === null || String(req.body[f]).trim() === '') {
        return res.status(400).json({ error: `${f} is required` });
      }
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      return res.status(400).json({ error: 'checkOut must be after checkIn' });
    }

    const reservationId = uuidv4();
    const reservationDate = new Date().toISOString();

    try {
      let branchId = null;
      const bRes = await db.query(
        'SELECT branch_id FROM branches WHERE branch_name = $1 OR branch_id::text = $1',
        [branch]
      );
      if (bRes.rows.length > 0) {
        branchId = bRes.rows[0].branch_id;
      }

      let userId = req.user?.userid;
      if (!userId) {
        const uRes = await db.query('SELECT userid FROM users WHERE email = $1', [customerEmail]);
        if (uRes.rows.length > 0) {
          userId = uRes.rows[0].userid;
        }
      }

      await db.query(
        `INSERT INTO reservations (
           reservation_id, userid, branch_id, customer_name, customer_phone, customer_email,
           reservation_date, check_in, check_out, pet_name, pet_type, pet_breed,
           pet_sex, pet_weight, pet_birth, pet_condition, pet_note
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          reservationId,
          userId,
          branchId,
          customerName,
          customerPhone,
          customerEmail,
          new Date(),
          checkIn,
          checkOut,
          petName,
          petType,
          petBreed,
          petSex,
          petWeight,
          petBirth,
          petCondition,
          petNote,
        ]
      );
    } catch (dbErr) {
      // In-memory fallback if DB fails
    }

    const newRes = {
      id: reservationId,
      reservationId,
      branch,
      customerName,
      customerPhone,
      customerEmail,
      petName,
      petType,
      petBreed,
      petSex,
      petWeight: Number(petWeight),
      petBirth,
      petCondition,
      petNote,
      checkIn,
      checkOut,
      reservationDate,
      status: 'pending',
    };
    reservations.push(newRes);

    return res.status(201).json({ reservationId, reservationDate });
  } catch (err) {
    next(err);
  }
}

const router = express.Router();
router.get('/customer/reservation', getReservations);
router.post('/customer/reservation', createReservation);

export default router;
export { reservations };
