export default function validateBulkUpload(req, res, next) {
  const { questions } = req.body;
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ success: false, message: 'questions array is required and cannot be empty' });
  }

  const validClassStandards = ['class-6','class-7','class-8','class-9','class-10','class-11','class-12'];
  for (const q of questions) {
    if (!q.questionText || typeof q.questionText !== 'string') return res.status(400).json({ success: false, message: 'Each question must have questionText string' });
    if (!q.classStandard || !validClassStandards.includes(q.classStandard)) return res.status(400).json({ success: false, message: 'Invalid or missing classStandard' });
    if (!q.subject || typeof q.subject !== 'string') return res.status(400).json({ success: false, message: 'Missing subject' });
    if (!q.chapter || typeof q.chapter !== 'string') return res.status(400).json({ success: false, message: 'Missing chapter' });
    if (!q.topic || typeof q.topic !== 'string') return res.status(400).json({ success: false, message: 'Missing topic' });

    // For MCQ specific checks
    if (q.questionType === 'multiple-choice' || (!q.questionType && q.options)) {
      if (!Array.isArray(q.options) || q.options.length < 2) return res.status(400).json({ success: false, message: 'MCQ must have options array with at least 2 items' });
      if (typeof q.correctOptionIndex !== 'number' || q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) return res.status(400).json({ success: false, message: 'Invalid correctOptionIndex' });
    }
  }

  next();
}
