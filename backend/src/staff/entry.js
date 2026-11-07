import express from 'express';
import { recordEntry } from '../all/pets.js';

const router = express.Router();

const staffOnly = (req, res, next) => {
  if (req.user && req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

router.post('/staff/pets/entry', staffOnly, recordEntry);

export default router;
