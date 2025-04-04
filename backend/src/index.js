require('dotenv').config();
const express = require('express');
const cors = require('cors');

const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const allowedOrigins = [
  'https://remedial-task.vercel.app',
  'https://remedial-task-git-main-paosalrs-projects.vercel.app',
  'https://remedial-task-qub9najok-paosalrs-projects.vercel.app',
  'http://localhost:3000' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
