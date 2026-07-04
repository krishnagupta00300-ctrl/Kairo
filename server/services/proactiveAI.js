const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../db/database');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function runProactiveCheck() {
  const tasks = db.prepare(
    "SELECT * FROM tasks WHERE status='pending' AND deadline IS NOT NULL"
  ).all();

  for (const task of tasks) {
    const hoursLeft = (new Date(task.deadline) - new Date()) / 36e5;
    if (hoursLeft > 0 && hoursLeft <= 6) {
      const existing = db.prepare(
        `SELECT id FROM ai_suggestions WHERE task_id=? AND dismissed=0
         AND datetime(created_at) > datetime('now','-2 hours')`
      ).get(task.id);

      if (!existing) {
        const prompt = `Task "${task.title}" is due in ${Math.round(hoursLeft)} hours. Write a 1-sentence calm but urgent nudge.`;
        const result = await model.generateContent(prompt);
        db.prepare('INSERT INTO ai_suggestions (task_id, suggestion, type) VALUES (?,?,?)').run(
          task.id, result.response.text(), 'deadline_warning'
        );
        console.log(`✓ Suggestion saved for: ${task.title}`);
      }
    }
  }
}

module.exports = { runProactiveCheck };