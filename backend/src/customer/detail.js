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
router.get('/customer/detail', getDetail);

export default router;

