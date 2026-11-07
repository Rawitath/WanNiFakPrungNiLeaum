import express from 'express';

// Mock customer detail data. In a real app this would be fetched per‑customer.
const customerDetail = {
  id: 1,
  name: 'John Doe',
  petType: 'Dog',
  age: 4, // years
  weight: 12, // kg
  status: 'active', // could be healthy, etc.
};

/**
 * GET /customer/detail
 * Returns the customer's pet detail.
 */
function getDetail(req, res) {
  // In a real implementation you would look up the user from req.user.
  res.json({ success: true, detail: customerDetail });
}

const router = express.Router();

/**
 * @swagger
 * /api/customer/detail:
 *   get:
 *     summary: Get customer pet detail
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer pet details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 detail:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     petType:
 *                       type: string
 *                       example: Dog
 *                     age:
 *                       type: integer
 *                       example: 4
 *                     weight:
 *                       type: number
 *                       example: 12
 *                     status:
 *                       type: string
 *                       example: active
 *       401:
 *         description: Unauthorized
 */
router.get('/customer/detail', getDetail);

export default router;

