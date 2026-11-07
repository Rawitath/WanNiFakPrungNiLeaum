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

/**
 * @swagger
 * /api/staff/pets/detail:
 *   get:
 *     summary: Get detailed info for all pets (Staff/Admin)
 *     tags: [Staff Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed info for pets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 pets:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/staff/pets/detail', getPetsDetail);

/**
 * @swagger
 * /api/staff/pets/detail:
 *   post:
 *     summary: Add or update pet detail (Staff/Admin)
 *     tags: [Staff Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - animal
 *               - detail
 *             properties:
 *               animal:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: Dog
 *                   name:
 *                     type: string
 *                     example: Buddy
 *               detail:
 *                 type: object
 *                 properties:
 *                   age:
 *                     type: number
 *                     example: 4
 *                   weight:
 *                     type: number
 *                     example: 12
 *                   health:
 *                     type: string
 *                     example: good
 *     responses:
 *       200:
 *         description: Successfully updated or created
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
 *                   example: Created
 *                 pet:
 *                   type: object
 *       400:
 *         description: Missing animal or detail in body
 *       401:
 *         description: Unauthorized
 */
router.post('/staff/pets/detail', upsertPetDetail);

export default router;

