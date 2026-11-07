import express from 'express';

// Mock data for staff pet details
let staffPetsDetails = [
  {
    id: 1,
    animal: { type: 'Dog', name: 'Buddy' },
    detail: { age: 4, weight: 12, health: 'good' },
  },
];

/**
 * GET /staff/pets/detail
 * Returns detailed info for all pets.
 */
function getPetsDetail(req, res) {
  res.json({ success: true, pets: staffPetsDetails });
}

/**
 * POST /staff/pets/detail
 * Add or update pet detail. Expects { animal, detail }.
 */
function upsertPetDetail(req, res) {
  const { animal, detail } = req.body;
  if (!animal || !detail) {
    return res
      .status(400)
      .json({ success: false, message: 'animal and detail are required' });
  }
  const existing = staffPetsDetails.find((p) => p.animal.name === animal.name);
  if (existing) {
    existing.animal = animal;
    existing.detail = detail;
    return res.json({ success: true, pet: existing, message: 'Updated' });
  }
  const newPet = { id: staffPetsDetails.length + 1, animal, detail };
  staffPetsDetails.push(newPet);
  res.json({ success: true, pet: newPet, message: 'Created' });
}

const router = express.Router();
router.get('/staff/pets/detail', getPetsDetail);
router.post('/staff/pets/detail', upsertPetDetail);

export default router;

