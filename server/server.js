import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

//import uploadWords from './utility/uploadwords.js'
//import uploadQuizQuestion from './utility/uploadQuizQuestion.js'

import dotenv from 'dotenv';
dotenv.config();


import authRoutes from './routes/authRoutes.js';
import vocabRoutes from './routes/vocabRoutes.js';
import userRoutes from './routes/userRoutes.js';





const app = express();

const PORT = process.env.PORT || 5000;





// Middleware
//app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// CORS Configuration - Allow all origins & handle preflight requests
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


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client/build', 'index.html'));
  });
}


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//insert words into MongoDb
//uploadWords();
//uploadQuizQuestion();


export default app;
