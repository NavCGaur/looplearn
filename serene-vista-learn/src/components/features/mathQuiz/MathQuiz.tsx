import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import MCQQuestion from '@/components/features/science/wordQuiz/MCQQuestion';
import QuizProgress from '@/components/features/science/wordQuiz/QuizProgress';
import QuizResult from '@/components/features/science/wordQuiz/QuizResult';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { loadKaTeX } from '../../utils/katexLoader';
import { useAddPointsMutation } from '@/state/api/scienceApi'; // reuse points endpoint

interface QuizQuestionSimple {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  word?: string;
  definition?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: string;
}

const MathQuiz: React.FC<{ questions: QuizQuestionSimple[] }> = ({ questions: initialQuestions }) => {
  const [questions, setQuestions] = useState<QuizQuestionSimple[]>(initialQuestions || []);
  const [quizFinished, setQuizFinished] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsAwarded, setPointsAwarded] = useState<Set<string>>(new Set());
  const [isKatexReady, setIsKatexReady] = useState(false);
  const { toast } = useToast();
  //@ts-ignore
  const userId = useSelector(state => state.auth?.user?.uid);
  const [addPoints] = useAddPointsMutation();

  useEffect(() => {
    async function init() {
      await loadKaTeX();
      setIsKatexReady(true);
    }
    init();
  }, []);

  useEffect(() => {
    // filter out invalid entries (no question text or no options or no correctAnswer)
    if (initialQuestions && initialQuestions.length) {
      const valid = initialQuestions.filter(q => q && q.question && Array.isArray(q.options) && q.options.length > 0 && q.correctAnswer);
      const shuffled = [...valid].sort(() => 0.5 - Math.random()).slice(0, 10);
      setQuestions(shuffled);
      setStartTime(new Date());
      setQuizFinished(false);
      setEndTime(null);
      setCurrentIndex(0);
      setScore(0);
      setTotalPoints(0);
      setPointsAwarded(new Set());
    }
  }, [initialQuestions]);

  const current = questions[currentIndex];

  const calculatePoints = (isCorrect: boolean) => {
    if (!isCorrect) return 0;
    let pts = 10;
    if (current?.difficulty === 'hard') pts += 5;
    else if (current?.difficulty === 'medium') pts += 2;
    return pts;
  };

  const handleAnswer = (ans: string) => {
    if (!current) return;
    setSelectedAnswer(ans);
    setAnswered(true);
    const isCorrect = ans.trim().toLowerCase() === current.correctAnswer.trim().toLowerCase();
    if (isCorrect) {
      setScore(s => s + 1);
      const earned = calculatePoints(true);
      setTotalPoints(p => p + earned);
      const key = `math-q-${currentIndex}`;
      if (userId && !pointsAwarded.has(key)) {
        addPoints({ userId, points: earned, reason: 'mathQuestionCorrect' }).catch(() => {});
        setPointsAwarded(prev => new Set(prev).add(key));
      }
      toast({ title: 'Correct!', description: `+${calculatePoints(true)} pts`, variant: 'default' });
      confetti({ particleCount: 60, spread: 90, origin: { y: 0.6 } });
    } else {
      toast({ title: 'Not quite', description: `Answer: ${current.correctAnswer}`, variant: 'destructive' });
    }
    // If this was the last question, finish the quiz after marking answered
    if (currentIndex >= questions.length - 1) {
      setQuizFinished(true);
      setEndTime(new Date());
    }
  };

  const next = () => {
    setAnswered(false);
    setSelectedAnswer(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      // finish quiz
      setQuizFinished(true);
      setEndTime(new Date());
    }
  };

  const restartQuiz = () => {
    setQuizFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setTotalPoints(0);
    setPointsAwarded(new Set());
    setAnswered(false);
    setSelectedAnswer(null);
    setStartTime(new Date());
    setEndTime(null);
    // reshuffle current question set
    setQuestions(prev => [...prev].sort(() => 0.5 - Math.random()).slice(0, 10));
  };

  if (!isKatexReady) return <div>Loading math...</div>;
  if (quizFinished) {
    return (
      <QuizResult
        score={score}
        totalQuestions={questions.length}
        onRestart={restartQuiz}
        timeTaken={startTime && endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0}
      />
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <QuizProgress currentQuestion={currentIndex + 1} totalQuestions={questions.length} score={score} />
          <div className="font-bold">{totalPoints} pts</div>
        </div>

        {current ? (
          <MCQQuestion
            question={current as any}
            onAnswer={handleAnswer}
            isAnswered={answered}
            selectedAnswer={selectedAnswer}
          />
        ) : (
          <div>No questions</div>
        )}

        {answered && (
          <div className="mt-4 flex justify-end">
            <button className="btn" onClick={next}>Next</button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MathQuiz;
