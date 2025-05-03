import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import vocabRoutes from './routes/vocabRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express(); // ✅ Declare app before using it

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true,
}));
app.options('*', cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vocab', vocabRoutes);
app.use('/api/users', userRoutes);

// 🔥 Uptime Robot test route to keep server hot
app.get('/uptime-ping', (req, res) => {
  res.status(200).send('Server is awake! ✅');
});

// Static file handling for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client/build', 'index.html'));
  });
}

// MongoDB connection and server startup
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
