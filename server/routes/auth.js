const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');

const SECRET = process.env.JWT_SECRET || 'kairo_secret_key';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    ).run(name, email, hashed);

    const token = jwt.sign({ id: result.lastInsertRowid, name, email }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: result.lastInsertRowid, name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.patch('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const jwt = require('jsonwebtoken');
    const SECRET = process.env.JWT_SECRET || 'kairo_secret_key';
    const decoded = jwt.verify(token, SECRET);
    const { name, email, password } = req.body;
    const updates = [];
    const values = [];
    if (name) { updates.push('name = ?'); values.push(name); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?'); values.push(hashed);
    }
    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    values.push(decoded.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    const updated = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(decoded.id);
    const newToken = jwt.sign({ id: updated.id, name: updated.name, email: updated.email }, SECRET, { expiresIn: '7d' });
    res.json({ user: updated, token: newToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/profile-stats', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const jwt = require('jsonwebtoken');
    const SECRET = process.env.JWT_SECRET || 'kairo_secret_key';
    const decoded = jwt.verify(token, SECRET);
    const { db } = require('../db/database');
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?').get(decoded.id);
    const completedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'completed'").get(decoded.id);
    const memberSince = db.prepare('SELECT created_at FROM users WHERE id = ?').get(decoded.id);
    res.json({
      totalTasks: totalTasks.count,
      completedTasks: completedTasks.count,
      memberSince: memberSince?.created_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;