import express from 'express';

let reservations = [];
let nextId = 1;

/** GET /customer/reservation */
function getReservations(req, res) {
  const id = req.query.id;
  if (id) {
    const reservation = reservations.find(r => r.id === Number(id));
    if (!reservation) return res.status(404).json({ error: 'Not found' });
    return res.json(reservation);
  }
  res.json(reservations);
}

/** POST /customer/reservation */
function createReservation(req, res) {
  const {
    customerName,
    customerPhone,
    customerEmail,
    petName,
    petType,
    petBreed,
    petSex,
    petWeight,
    petBirth,
    petCondition,
    petNote,
    checkIn,
    checkOut,
    branch,
  } = req.body;

  const required = [
    'customerName',
    'customerPhone',
    'customerEmail',
    'petName',
    'petType',
    'petBreed',
    'petSex',
    'petWeight',
    'petBirth',
    'petCondition',
    'petNote',
    'checkIn',
    'checkOut',
    'branch',
  ];
  for (const f of required) {
    if (!req.body[f]) {
      return res.status(400).json({ error: `${f} is required` });
    }
  }

  if (new Date(checkOut) <= new Date(checkIn)) {
    return res.status(400).json({ error: 'checkOut must be after checkIn' });
  }

  const reservation = {
    id: nextId++,
    reservationDate: new Date().toISOString(),
    customerName,
    customerPhone,
    customerEmail,
    petName,
    petType,
    petBreed,
    petSex,
    petWeight,
    petBirth,
    petCondition,
    petNote,
    checkIn,
    checkOut,
    branch,
    status: 'pending',
  };
  reservations.push(reservation);
  res.status(201).json({ reservationId: reservation.id, reservationDate: reservation.reservationDate });
}

const router = express.Router();
router.get('/customer/reservation', getReservations);
router.post('/customer/reservation', createReservation);

export default router;
export { reservations, nextId };