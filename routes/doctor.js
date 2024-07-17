const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {db} = require('../firebase');
const router = express.Router();

router.get('/', authenticate, authorize(['pengguna']), async (req, res) => {
  const { category, location, specialization, rating } = req.query;
  let doctorsRef = db.collection('doctors');
  if (category) doctorsRef = doctorsRef.where('category', '==', category);
  if (location) doctorsRef = doctorsRef.where('location', '==', location);
  if (specialization) doctorsRef = doctorsRef.where('specialization', '==', specialization);
  if (rating) doctorsRef = doctorsRef.where('rating', '>=', Number(rating));

  const doctorsSnapshot = await doctorsRef.get();
  const doctors = doctorsSnapshot.docs.map(doc => doc.data());
  res.send(doctors);
});

router.get('/:id', authenticate, authorize(['pengguna']), async (req, res) => {
  const doctorId = req.params.id;
  const doctorSnapshot = await db.collection('doctors').doc(doctorId).get();
  if (!doctorSnapshot.exists) {
    return res.status(404).send({ message: 'Doctor not found' });
  }
  res.send(doctorSnapshot.data());
});

module.exports = router;
