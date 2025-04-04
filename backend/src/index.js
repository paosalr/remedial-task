require('dotenv').config();
const express = require('express');
const cors = require('cors');

const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({origin: [
    'https://remedial-task.vercel.app',
    'https://remedial-task-git-main-paosalrs-projects.vercel.app',
    'https://remedial-task-qub9najok-paosalrs-projects.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
