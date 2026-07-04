require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { initDB } = require('./db/database');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');
const { runProactiveCheck } = require('./services/proactiveAI');

const app = express();
app.use(cors());
app.use(express.json());

initDB();

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

cron.schedule('*/30 * * * *', runProactiveCheck);

app.listen(5000, () => console.log('✓ Kairo server running on https://kairo-sever.onrender.com'));