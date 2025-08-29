import React from 'react';
import MathQuiz from '@/components/features/mathQuiz/MathQuiz';
import { Card, CardContent } from '@/components/ui/card';

// For now we'll use a small mocked set. Replace with real API hook when backend exists.
const mockQuestions = [
  {
    id: 'm1',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
  correctAnswer: '4',
  difficulty: 'easy' as const
  },
  {
    id: 'm2',
    question: 'Evaluate: 3 * (2 + 1)',
    options: ['6', '9', '12', '3'],
  correctAnswer: '9',
  difficulty: 'medium' as const
  }
];

const MathQuizPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl mt-8">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Math Quiz</h2>
          <MathQuiz questions={mockQuestions} />
        </CardContent>
      </Card>
    </div>
  );
};

export default MathQuizPage;
