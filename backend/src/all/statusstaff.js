import express from 'express';
import { updateStatus } from './pets.js';

const router = express.Router();

const staffOnly = (req, res, next) => {
  if (req.user && req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

router.post('/staff/pets/status', staffOnly, updateStatus);
/**
 * @swagger
 * /api/staff/status:
 *   post:
 *     summary: Update pet status (Staff/Admin alias endpoint)
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
 *               - id
 *               - status
 *             properties:
 *               id:
 *                 type: string
 *                 example: "1"
 *               status:
 *                 type: string
 *                 enum: ['สบายดี', 'ไม่สบาย']
 *                 example: 'สบายดี'
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Missing fields or invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Staff/Admin only)
 */
router.post('/staff/status', staffOnly, updateStatus);

export default router;
