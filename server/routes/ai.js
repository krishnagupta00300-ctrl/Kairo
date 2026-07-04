const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');

const SECRET = process.env.JWT_SECRET || 'kairo_secret_key';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

function getTimeContext() {
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
  });
  const currentDate = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata'
  });
  const currentHour = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(now);
  const currentMinute = new Intl.DateTimeFormat('en-US', { minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(now);
  return { currentTime, currentDate, currentHour, currentMinute };
}

router.post('/plan-day', auth, async (req, res) => {
  try {
    const tasks = db.prepare(
      "SELECT * FROM tasks WHERE user_id = ? AND status='pending' ORDER BY deadline ASC"
    ).all(req.user.id);

    if (tasks.length === 0)
      return res.json({ plan: [], summary: 'No pending tasks! Enjoy your day.', urgent_warning: null });

    const { currentTime, currentDate } = getTimeContext();

    const prompt = `You are Kairo, a proactive AI productivity companion.
Current date: ${currentDate}
Current time RIGHT NOW: ${currentTime}
User's name: ${req.user.name}
Pending tasks: ${JSON.stringify(tasks, null, 2)}

IMPORTANT: It is currently ${currentTime}. Only schedule tasks from this time onwards.

Create a daily action plan. Respond with ONLY valid JSON, no other text:
{
  "plan": [{ "task_id": 1, "order": 1, "time_block": "12:10 PM - 1:00 PM", "reason": "...", "at_risk": false }],
  "summary": "short motivational summary addressing the user by name",
  "urgent_warning": null
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'Could not parse AI response' });
    res.json(JSON.parse(match[0]));
  } catch (err) {
    console.error('plan-day error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/breakdown/:id', auth, async (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const prompt = `Break down this task into 3-5 subtasks with time estimates.
Task: "${task.title}" | Deadline: ${task.deadline}
Respond ONLY in JSON: { "subtasks": [{ "title": "...", "estimated_minutes": 20 }] }`;

    const result = await model.generateContent(prompt);
    const clean = result.response.text().replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/chat-plan', auth, async (req, res) => {
  try {
    const { message, history, existingTasks } = req.body;
    const { currentTime, currentDate, currentHour, currentMinute } = getTimeContext();

    const conversationHistory = (history || []).map(m =>
      `${m.role === 'user' ? 'User' : 'Kairo'}: ${m.text}`
    ).join('\n');

    const prompt = `You are Kairo, a friendly, proactive AI productivity companion.

===== TIME CONTEXT =====
Current date: ${currentDate}
Current time: ${currentTime} (${currentHour}:${currentMinute} 24h)
ALL time blocks must start at or after ${currentTime}. Never suggest past times.
========================

User's name: ${req.user.name}
Existing pending tasks: ${JSON.stringify(existingTasks || [])}

Conversation so far:
${conversationHistory}
User: ${message}

Instructions:
- Always reply. Never leave the reply empty.
- Be warm, specific, and action-oriented
- If user mentions tasks, extract them and make a plan from ${currentTime} onwards
- If user is just chatting or asking questions, reply helpfully without a plan

Your response format — ALWAYS include a reply, optionally include PLAN_JSON:

Write your conversational reply here. Make it specific and helpful. Always address the user by name.

PLAN_JSON:
{
  "plan": [{"title": "task name", "time_block": "12:30 PM - 1:30 PM", "reason": "why this order", "at_risk": false}],
  "newTasks": [{"title": "task name", "deadline": "2026-06-25T14:00:00"}]
}

Only add PLAN_JSON section if user mentioned specific tasks or asked for planning.
The reply before PLAN_JSON must never be empty.`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    console.log('Gemini raw:', rawText.substring(0, 200));

    // Split on PLAN_JSON marker
    const planMarkerIndex = rawText.indexOf('PLAN_JSON:');
    let reply = '';
    let plan = null;
    let newTasks = [];

    if (planMarkerIndex !== -1) {
      reply = rawText.substring(0, planMarkerIndex).trim();
      const jsonPart = rawText.substring(planMarkerIndex + 'PLAN_JSON:'.length).trim();
      try {
        const clean = jsonPart.replace(/```json|```/g, '').trim();
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          plan = parsed.plan || null;
          newTasks = parsed.newTasks || [];
        }
      } catch (e) {
        console.log('JSON parse error:', e.message);
      }
    } else {
      reply = rawText;
    }

    // Safety net — never send empty reply
    if (!reply || reply.length < 3) {
      reply = `Got it, ${req.user.name}! Let me help you with that. Could you share more details about what you need to get done today?`;
    }

    res.json({ reply, plan, newTasks });
  } catch (err) {
    console.error('chat-plan error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Voice transcription endpoint
router.post('/voice-transcribe', auth, async (req, res) => {
  try {
    const { audioText } = req.body;
    if (!audioText) return res.status(400).json({ error: 'No audio text provided' });

    const { currentTime, currentDate } = getTimeContext();

    const prompt = `You are Kairo AI. The user has spoken the following voice message:
"${audioText}"

Current time: ${currentTime}, Date: ${currentDate}
User: ${req.user.name}

Clean up any speech-to-text errors, then respond helpfully as Kairo would.
If they mentioned tasks, extract them.

Reply format:
Your helpful response here.

PLAN_JSON:
{
  "plan": [{"title": "...", "time_block": "...", "reason": "...", "at_risk": false}],
  "newTasks": [{"title": "...", "deadline": "..."}]
}

Only include PLAN_JSON if tasks were mentioned.`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    const planMarkerIndex = rawText.indexOf('PLAN_JSON:');
    let reply = planMarkerIndex !== -1 ? rawText.substring(0, planMarkerIndex).trim() : rawText;
    let plan = null;
    let newTasks = [];

    if (planMarkerIndex !== -1) {
      try {
        const jsonPart = rawText.substring(planMarkerIndex + 10).replace(/```json|```/g, '').trim();
        const jsonMatch = jsonPart.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          plan = parsed.plan || null;
          newTasks = parsed.newTasks || [];
        }
      } catch (e) { console.log('voice JSON parse error:', e.message); }
    }

    if (!reply) reply = `Thanks for that! Let me help you plan your day, ${req.user.name}.`;

    res.json({ reply, plan, newTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/upcoming-deadlines', auth, (req, res) => {
  try {
    const now = new Date();
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const tasks = db.prepare(
      `SELECT * FROM tasks WHERE user_id = ? AND status = 'pending' AND deadline IS NOT NULL AND deadline <= ? AND deadline >= ?`
    ).all(req.user.id, in2Hours.toISOString(), now.toISOString());
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/recommendations', auth, async (req, res) => {
  try {
    const { tasks, weeklyStats, streak } = req.body;
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });

    const prompt = `You are Kairo AI. Analyze this user's productivity data and give 5 personalized recommendations.

User: ${req.user.name}
Current time: ${now}
Tasks: ${JSON.stringify(tasks)}
Weekly stats (last 7 days): ${JSON.stringify(weeklyStats)}
Current streak: ${streak} days

Give 5 specific, actionable recommendations based on their actual data patterns.
Respond ONLY in JSON, no other text:
{
  "recommendations": [
    {
      "icon": "💡",
      "title": "Short title",
      "description": "2-3 sentence specific recommendation based on their data",
      "action": "One specific action they can take right now",
      "priority": "high",
      "category": "Time Management"
    }
  ]
}

Priority must be: high, medium, or low. Categories: Time Management, Focus, Habits, Planning, Workload`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'Parse error' });
    res.json(JSON.parse(match[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auto-plan', auth, async (req, res) => {
  try {
    const { goal, tasks } = req.body;
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });

    const prompt = `You are Kairo AI autonomous planner. Break down this goal into executable steps.

User: ${req.user.name}
Goal: "${goal}"
Current time: ${now}, Date: ${today}
Existing tasks: ${JSON.stringify(tasks?.map(t => t.title))}

Create 4-7 concrete executable steps to achieve this goal.
Respond ONLY in JSON, no other text:
{
  "steps": [
    {
      "title": "Step title",
      "task_title": "Exact task name to create",
      "description": "What to do in this step",
      "estimated_time": "30 mins",
      "priority": "high",
      "deadline": "2026-06-28T15:00:00",
      "action": "create_task"
    }
  ]
}

Make deadlines realistic starting from today. Priority: high, medium, or low.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'Parse error' });
    res.json(JSON.parse(match[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;