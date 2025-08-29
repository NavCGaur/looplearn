import React from 'react';
import MathQuiz from '@/components/features/mathQuiz/MathQuiz';
import { Card, CardContent } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { useGetAssignedMathQuestionsQuery } from '@/state/api/mathApi';

const MathQuizPage: React.FC = () => {
  //@ts-ignore
  const user = useSelector((state) => state.auth?.user);
  const classStandard = user?.classStandard || '';

  const { data: assigned = [], isLoading, isError } = useGetAssignedMathQuestionsQuery(classStandard, { skip: !classStandard });

  // map backend question shape to MathQuiz expected shape
  const mapped = (assigned || []).map((q: any) => ({
    id: q._id || q.id,
    // try multiple possible fields that might contain the question text
  question: q.questionText || q.question || q.text || q.prompt || q.question_text || (Array.isArray(q.options) && q.options.length ? `Math question (${q._id || q.id})` : ''),
    options: q.options || q.choices || q.opts || [],
    // derive correct answer from multiple possible shapes
    correctAnswer:
      (q.answer && String(q.answer).trim()) ||
      (typeof q.correctAnswer === 'string' && q.correctAnswer.trim()) ||
      (Array.isArray(q.options) && Number.isFinite(q.correctOptionIndex) ? q.options[q.correctOptionIndex] : undefined) ||
      (Array.isArray(q.choices) && Number.isFinite(q.correctOptionIndex) ? q.choices[q.correctOptionIndex] : undefined) ||
      (q.correctOption && (Array.isArray(q.options) ? q.options[q.correctOption] : q.correctOption)) ||
      '',
    difficulty: q.difficulty || q.level || 'easy'
  }));

  // Post-process mapped data: ensure question text exists and warn if correctAnswer missing
  const finalMapped = mapped.map((m) => {
    if (!m.question || m.question.trim() === '') {
      console.warn('Math question missing text for id:', m.id, 'original:', assigned.find((x: any) => x._id === m.id || x.id === m.id));
      m.question = `Question text unavailable (id: ${m.id})`;
    }
    if (!m.correctAnswer || String(m.correctAnswer).trim() === '') {
      // try to derive from options using common fallback fields
      const original = assigned.find((x: any) => x._id === m.id || x.id === m.id) || {};
      const idx = typeof original.correctOptionIndex === 'number' ? original.correctOptionIndex : (typeof original.correctOption === 'number' ? original.correctOption : undefined);
      if (Array.isArray(m.options) && typeof idx === 'number' && m.options[idx]) {
        m.correctAnswer = m.options[idx];
      } else if (Array.isArray(m.options) && m.options.length === 1) {
        m.correctAnswer = m.options[0];
      } else {
        console.warn('Math question has no correct answer available for id:', m.id);
      }
    }
    return m;
  });

  console.debug('Assigned math questions from backend:', assigned);
  console.debug('Mapped math questions used by MathQuiz:', finalMapped);

  return (
    <div className="mx-auto max-w-3xl mt-8">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Math Quiz</h2>
          {isLoading ? (
            <div>Loading math questions...</div>
          ) : isError ? (
            <div>Failed to load Math questions.</div>
          ) : (
            <MathQuiz questions={finalMapped} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MathQuizPage;
