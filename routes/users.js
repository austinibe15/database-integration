// routes/users.js
const express = require('express');
const router = express.Router();
const { createUser, getUserByEmail } = require('../dal');

router.post('/users', async (req, res) => {
  try {
    const id = await createUser(req.body);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;