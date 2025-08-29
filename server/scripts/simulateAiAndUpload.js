import axios from 'axios';

const samplePayload = {
  questions: [
    {
      questionText: 'What is 8 × 7?',
      options: ['54','56','58','60'],
      correctOptionIndex: 1,
      classStandard: 'class-6',
      subject: 'mathematics',
      chapter: 'Multiplication',
      topic: 'Times Tables',
      questionType: 'multiple-choice',
      difficulty: 'easy'
    }
  ]
};

const run = async () => {
  try {
    const base = process.env.BASE_URL || 'http://localhost:5000';
    const resp = await axios.post(`${base}/api/math/bulk-upload`, samplePayload, { headers: { 'Content-Type': 'application/json' } });
    console.log('Upload response:', resp.data);
  } catch (err) {
    console.error('Upload failed:', err.response ? err.response.data : err.message);
  }
};

run();
