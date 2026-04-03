const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config/default');
const quizRoutes = require('./routes/quiz');

const app = express();
const publicDir = path.join(__dirname, '../public');

// In dev allow all origins, in prod allow only configured domains
const corsOptions = process.env.NODE_ENV === 'production'
  ? {
      origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim()),
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    }
  : { origin: true }; // dev: allow all

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight for all routes

app.use(express.json());
app.use('/quiz-images', express.static(path.join(publicDir, 'quiz-images')));
app.use('/api/quiz', quizRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});