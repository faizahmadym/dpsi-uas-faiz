const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {db} = require('../firebase');
const router = express.Router();

router.post('/', authenticate, authorize(['pengguna']), async (req, res) => {
  const { doctorId, date, time, paymentMethod } = req.body;
  const appointmentRef = db.collection('appointments').doc();
  const appointment = {
    doctorId,
    userId: req.user.userId,
    date,
    time,
    paymentMethod,
    status: 'pending'
  };
  await appointmentRef.set(appointment);
  res.send({ message: 'Appointment created', appointment });
});

router.post('/:id/pay', authenticate, authorize(['pengguna']), async (req, res) => {
  const appointmentId = req.params.id;
  const appointmentRef = db.collection('appointments').doc(appointmentId);
  const appointmentSnapshot = await appointmentRef.get();
  if (!appointmentSnapshot.exists) {
    return res.status(404).send({ message: 'Appointment not found' });
  }
  await appointmentRef.update({ status: 'paid' });
  res.send({ message: 'Payment completed' });
});

module.exports = router;
