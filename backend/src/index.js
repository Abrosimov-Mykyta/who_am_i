const express = require('express');
const cors = require('cors');
const config = require('./config/default');
const quizRoutes = require('./routes/quiz');

const app = express();

// В dev режимі дозволяємо всі origins, в prod — тільки свій домен
const corsOptions = process.env.NODE_ENV === 'production'
  ? {
      origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim()),
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    }
  : { origin: true }; // dev — дозволяємо все

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight для всіх роутів

app.use(express.json());
app.use('/api/quiz', quizRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Щось пішло не так' : err.message,
  });
});

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});