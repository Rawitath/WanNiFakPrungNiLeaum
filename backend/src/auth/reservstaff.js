import express from 'express';

// In‑memory staff reservations data.
let staffReservations = [];
let nextId = 1;

/** GET /staff/reservation */
function getReservations(req, res) {
  const { id } = req.query;
  if (id) {
    const reservation = staffReservations.find(r => r.id === Number(id));
    if (!reservation) return res.status(404).json({ error: 'Not found' });
    return res.json(reservation);
  }
  res.json(staffReservations);
}

/** POST /staff/reservation */
function createReservation(req, res) {
  const { customer, animal, detail } = req.body;
  if (!customer || !animal || !detail) {
    return res.status(400).json({ error: 'customer, animal and detail are required' });
  }
  const reservation = { id: nextId++, customer, animal, detail, status: 'pending' };
  staffReservations.push(reservation);
  res.status(201).json(reservation);
}

/** PUT /staff/reservation */
function updateReservation(req, res) {
  const { reservationId, customer, animal, detail } = req.body;
  if (!reservationId) return res.status(400).json({ error: 'reservationId required' });
  const reservation = staffReservations.find(r => r.id === Number(reservationId));
  if (!reservation) return res.status(404).json({ error: 'Not found' });
  if (customer) reservation.customer = customer;
  if (animal) reservation.animal = animal;
  if (detail) reservation.detail = detail;
  res.json(reservation);
}

/** PUT /staff/reservation/:reservationId/confirm */
function confirmReservation(req, res) {
  const { id, accept } = req.body;
  if (typeof accept === 'undefined') return res.status(400).json({ error: 'accept required' });
  const reservation = staffReservations.find(r => r.id === Number(id));
  if (!reservation) return res.status(404).json({ error: 'Not found' });
  reservation.status = accept === 'true' ? 'accepted' : 'rejected';
  res.json({ success: true, status: reservation.status });
}

/** GET /staff/reservation/:reservationId/callcustomer */
function callCustomer(req, res) {
  const { reservationId } = req.params;
  const reservation = staffReservations.find(r => r.id === Number(reservationId));
  if (!reservation) return res.status(404).json({ error: 'Not found' });
  // Assuming reservation.customer has phone property.
  const phone = reservation.customer?.phone || '';
  res.json({ phone });
}

const router = express.Router();
router.get('/staff/reservation', getReservations);
router.post('/staff/reservation', createReservation);
router.put('/staff/reservation', updateReservation);
router.put('/staff/reservation/:reservationId/confirm', confirmReservation);
router.get('/staff/reservation/:reservationId/callcustomer', callCustomer);

export default router;
