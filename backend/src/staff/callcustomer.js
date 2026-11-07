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
router.get('/staff/callcustomer', getCustomerPhones);

export default router;

