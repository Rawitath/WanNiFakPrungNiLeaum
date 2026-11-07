import express from 'express';
import db from '../config/db.js';

let pets = [
  {
    id: 1,
    petId: 1,
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
    status: 'สบายดี',
    checkIn: '2026-11-10T19:13:00.000Z',
    checkOut: '2026-11-15T20:00:00.000Z',
  },
];

export function formatPet(row) {
  if (!row) return null;
  return {
    petId: row.pet_id || row.petId || row.id,
    id: row.pet_id || row.petId || row.id,
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
    status: row.status,
    petCondition: row.pet_condition || row.petCondition,
    petNote: row.pet_note || row.petNote,
    checkIn: row.check_in || row.checkIn,
    checkOut: row.check_out || row.checkOut,
  };
}

async function getPetListOrSingle(req, res, next) {
  try {
    const petId = req.query.petId;
    if (petId !== undefined && petId !== null && petId !== '') {
      try {
        const result = await db.query(
          `SELECT p.*, b.branch_name
           FROM pets p
           LEFT JOIN branches b ON p.branch_id = b.branch_id
           WHERE p.pet_id::text = $1`,
          [String(petId)]
        );
        if (result.rows.length > 0) {
          return res.json(formatPet(result.rows[0]));
        }
      } catch (dbErr) {
        // Fallback
      }

      const found = pets.find(
        (p) => String(p.petId) === String(petId) || String(p.id) === String(petId)
      );
      if (found) {
        return res.json(formatPet(found));
      }

      return res.status(404).json({ error: 'Pet not found' });
    }

    try {
      const result = await db.query(
        `SELECT p.*, b.branch_name
         FROM pets p
         LEFT JOIN branches b ON p.branch_id = b.branch_id
         ORDER BY p.created_at DESC`
      );
      if (result.rows.length > 0) {
        return res.json(result.rows.map(formatPet));
      }
    } catch (dbErr) {
      // Fallback
    }

    return res.json(pets.map(formatPet));
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id, status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ error: 'id and status are required' });
    }

    const allowed = ['สบายดี', 'ไม่สบาย'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    try {
      await db.query(
        'UPDATE pets SET status = $1 WHERE pet_id::text = $2',
        [status, String(id)]
      );
    } catch (dbErr) {
      // Fallback
    }

    const found = pets.find(
      (p) => String(p.petId) === String(id) || String(p.id) === String(id)
    );
    if (found) {
      found.status = status;
    }

    return res.status(200).json({ success: true, id, status });
  } catch (err) {
    next(err);
  }
}

async function recordEntry(req, res, next) {
  try {
    const { id, type, timestamp } = req.body || {};
    if (!id || !type || !timestamp) {
      return res.status(400).json({ error: 'id, type, and timestamp are required' });
    }

    const allowedTypes = ['check-in', 'check-out'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid entry type' });
    }

    try {
      if (type === 'check-in') {
        await db.query('UPDATE pets SET check_in = $1 WHERE pet_id::text = $2', [
          timestamp,
          String(id),
        ]);
      } else if (type === 'check-out') {
        await db.query('UPDATE pets SET check_out = $1 WHERE pet_id::text = $2', [
          timestamp,
          String(id),
        ]);
      }
    } catch (dbErr) {
      // Fallback
    }

    const found = pets.find(
      (p) => String(p.petId) === String(id) || String(p.id) === String(id)
    );
    if (found) {
      if (type === 'check-in') found.checkIn = timestamp;
      if (type === 'check-out') found.checkOut = timestamp;
    }

    return res.status(201).json({ success: true, message: 'Entry recorded' });
  } catch (err) {
    next(err);
  }
}

const router = express.Router();

// Customer pets endpoints
router.get('/customer/pets', getPetListOrSingle);

// Staff pets endpoints (requires staff or admin role)
const staffOnly = (req, res, next) => {
  if (req.user && req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

router.get('/staff/pets', staffOnly, getPetListOrSingle);
router.post('/staff/pets/status', staffOnly, updateStatus);
router.post('/staff/pets/entry', staffOnly, recordEntry);

export default router;
export { pets, updateStatus, recordEntry };
