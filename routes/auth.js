const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {db} = require('../firebase');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userRef = db.collection('users').doc();
  await userRef.set({
    email,
    password: hashedPassword,
    role
  });
  res.send({ message: 'User registered' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const userSnapshot = await db.collection('users').where('email', '==', email).get();
  if (userSnapshot.empty) {
    return res.status(400).send({ message: 'User not found' });
  }
  const user = userSnapshot.docs[0].data();
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).send({ message: 'Invalid password' });
  }
  const token = jwt.sign({ userId: userSnapshot.docs[0].id, role: user.role }, 'secretKey');
  res.send({ token });
});

module.exports = router;
