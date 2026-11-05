import express from 'express';

// In‑memory list of pets for staff view. Each entry includes customer info and check‑in/out dates.
let staffPets = [
  {
    id: 1,
    customer: { id: 101, name: 'John Doe', phone: '0801234567' },
    animal: { type: 'Dog', name: 'Buddy' },
    checkIn: '2023-09-01',
    checkOut: null,
  },
];

/**
 * GET /staff/pets
 * Returns pets with associated customer data.
 */
function getStaffPets(req, res) {
  res.json({ success: true, pets: staffPets });
}

const router = express.Router();
router.get('/staff/pets', getStaffPets);

export default router;

