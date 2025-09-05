// index.js

// 1) Load environment variables as early as possible
require('dotenv').config();

// 2) Basic imports
const express = require('express');
const app = express();

// 3) Database module (MySQL2 pool wrapper)
// If you don't have db.js yet, we can adjust. It should export an object with a `query` method:
//   const pool = require('./db'); // pool.query(sql, params)
const db = require('./db');

// 4) Middleware
app.use(express.json());

// 5) Simple input validation helper
function isValidUserInput({ name, email }) {
  if (!name || typeof name !== 'string' || !name.trim()) return false;
  if (!email || typeof email !== 'string') return false;
  // Lightweight email check
  const emailOk = /\S+@\S+\.\S+/.test(email);
  return emailOk;
}

// 6) Routes

// Create a user
app.post('/users', async (req, res) => {
  const { name, email, age } = req.body;

  // Basic validation
  if (!isValidUserInput({ name, email })) {
    return res.status(400).json({ error: 'Invalid input: name and valid email required' });
  }

  try {
    // Insert and then fetch the inserted row
    const [insertResult] = await db.query(
      'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
      [name, email, age]
    );

    const insertId = insertResult?.insertId;
    if (!insertId) {
      // Fallback: try to fetch by some unique constraint if available
      return res.status(500).json({ error: 'Failed to insert user' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('DB INSERT ERROR:', err);
    // You can customize error messages based on error codes
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error('DB SELECT ALL ERROR:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get user by id
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('DB SELECT BY ID ERROR:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update a user
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;

  // Basic validation (optional: make this more strict)
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  if (email !== undefined && (typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email))) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    await db.query(
      'UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?',
      [name, email, age, id]
    );

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json(rows[0]);
  } catch (err) {
    console.error('DB UPDATE ERROR:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a user
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    // result.affectedRows indicates how many rows were deleted
    if (result?.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('DB DELETE ERROR:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 7) Server startup
const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;