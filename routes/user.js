const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {db} = require('../firebase');
const router = express.Router();

// Get all appointments for the authenticated user
router.get('/appointments', authenticate, authorize(['pengguna']), async (req, res) => {
  try {
    const appointmentsSnapshot = await db.collection('appointments')
      .where('userId', '==', req.user.userId)
      .get();
    const appointments = appointmentsSnapshot.docs.map(doc => doc.data());
    res.send(appointments);
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving appointments', error: error.message });
  }
});

// Start a consultation for an appointment
router.post('/appointments/:id/start', authenticate, authorize(['pengguna']), async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointmentSnapshot = await db.collection('appointments').doc(appointmentId).get();
    if (!appointmentSnapshot.exists) {
      return res.status(404).send({ message: 'Appointment not found' });
    }
    const appointment = appointmentSnapshot.data();
    if (appointment.status !== 'paid') {
      return res.status(400).send({ message: 'Appointment not paid' });
    }
    res.send({ message: 'Consultation started', appointment });
  } catch (error) {
    res.status(500).send({ message: 'Error starting consultation', error: error.message });
  }
});

module.exports = router;
