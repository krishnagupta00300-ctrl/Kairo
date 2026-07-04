const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');

const SECRET = process.env.JWT_SECRET || 'kairo_secret_key';

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/', auth, (req, res) => {
  const tasks = db.prepare(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY deadline ASC'
  ).all(req.user.id);
  res.json(tasks);
});

router.post('/', auth, (req, res) => {
  const { title, description, priority, deadline, estimated_minutes, category } = req.body;
  const result = db.prepare(
    `INSERT INTO tasks (user_id, title, description, priority, deadline, estimated_minutes, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(req.user.id, title, description, priority || 'medium', deadline, estimated_minutes, category);
  res.json({ id: result.lastInsertRowid, title, status: 'pending', deadline });
});

router.patch('/:id', auth, (req, res) => {
  const { status, priority, deadline } = req.body;
  const updates = [];
  const values = [];
  if (status)   { updates.push('status = ?');   values.push(status); }
  if (priority) { updates.push('priority = ?'); values.push(priority); }
  if (deadline) { updates.push('deadline = ?'); values.push(deadline); }
  if (status === 'completed') updates.push("completed_at = datetime('now')");
  values.push(req.params.id, req.user.id);
  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
  res.json({ success: true });
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

router.get('/weekly-stats', auth, (req, res) => {
  try {
    const stats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const completed = db.prepare(
        `SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'completed' AND date(completed_at) = ?`
      ).get(req.user.id, dateStr);
      const added = db.prepare(
        `SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND date(created_at) = ?`
      ).get(req.user.id, dateStr);
      stats.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completed.count,
        added: added.count
      });
    }
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;