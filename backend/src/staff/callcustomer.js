import express from 'express';

// Mock data linking pets to customer phone numbers.
const customerContacts = [
  { petId: 1, customerName: 'John Doe', phone: '0801234567' },
  { petId: 2, customerName: 'Jane Smith', phone: '0809876543' },
];

/**
 * GET /staff/callcustomer
 * Returns a list of customer phone numbers (could be filtered later).
 */
function getCustomerPhones(req, res) {
  const phones = customerContacts.map((c) => ({
    petId: c.petId,
    customerName: c.customerName,
    phone: c.phone,
  }));
  res.json({ success: true, phones });
}

const router = express.Router();

/**
 * @swagger
 * /api/staff/callcustomer:
 *   get:
 *     summary: Get customer contact phone list (Staff/Admin)
 *     tags: [Staff Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer phone numbers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 phones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       petId:
 *                         type: integer
 *                         example: 1
 *                       customerName:
 *                         type: string
 *                         example: John Doe
 *                       phone:
 *                         type: string
 *                         example: "0801234567"
 *       401:
 *         description: Unauthorized
 */
router.get('/staff/callcustomer', getCustomerPhones);

export default router;

