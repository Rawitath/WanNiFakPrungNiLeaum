import express from 'express';

// Mock in‑memory list of animals. In a real system this would be a DB query.
// Each animal has a `type` field (e.g., 'cat', 'dog', 'bird').
const animals = [
  { type: 'cat' },
  { type: 'dog' },
  { type: 'cat' },
  { type: 'bird' },
  { type: 'dog' },
];

/**
 * GET /manager/status
 * Returns admin status overview:
 *   - total: total number of animals
 *   - byType: object mapping each animal type to its count
 *   - status: a static string indicating system health (placeholder)
 */
function getStatus(req, res) {
  const total = animals.length;
  const byType = animals.reduce((acc, animal) => {
    acc[animal.type] = (acc[animal.type] || 0) + 1;
    return acc;
  }, {});
  const status = 'ok'; // placeholder – could be health‑check result
  res.json({ success: true, total, byType, status });
}

const router = express.Router();
router.get('/manager/status', getStatus);

export default router;

