import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import MCQQuestion from '@/components/features/science/wordQuiz/MCQQuestion';
import FillBlankQuestion from '@/components/features/science/wordQuiz/FillBlankQuestion';
import QuizProgress from '@/components/features/science/wordQuiz/QuizProgress';
import QuizResult from '@/components/features/science/wordQuiz/QuizResult';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { loadKaTeX } from '../../utils/katexLoader';
import { useAddPointsMutation } from '@/state/api/scienceApi'; // reuse points endpoint
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [currentQuestionPoints, setCurrentQuestionPoints] = useState(0);
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
    // filter out invalid entries (must have question text and at least either options or a correctAnswer)
    if (initialQuestions && initialQuestions.length) {
  console.debug('MathQuiz received initialQuestions count:', initialQuestions.length);
      const valid = initialQuestions.filter(q => {
        if (!q || !q.question) return false;
        return true; // include any question that has text; options/answers may be missing
      });
      const withOptions = valid.filter(q => Array.isArray(q.options) && q.options.length > 0).length;
      const withoutOptions = valid.length - withOptions;
      console.debug('MathQuiz valid counts - withOptions:', withOptions, 'withoutOptions:', withoutOptions);
  console.debug('MathQuiz valid questions after filter:', valid.length);
      const shuffled = [...valid].sort(() => 0.5 - Math.random()).slice(0, 20);
  console.debug('MathQuiz questions after shuffle+slice:', shuffled.length);
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
  setCurrentQuestionPoints(earned);
      setTotalPoints(p => p + earned);
      const key = `math-q-${currentIndex}`;
      if (userId && !pointsAwarded.has(key)) {
        addPoints({ userId, points: earned, reason: 'mathQuestionCorrect' }).catch(() => {});
        setPointsAwarded(prev => new Set(prev).add(key));
      }
      toast({ title: 'Correct!', description: `+${calculatePoints(true)} pts`, variant: 'default' });
      confetti({ particleCount: 60, spread: 90, origin: { y: 0.6 } });
    } else {
  setCurrentQuestionPoints(0);
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
  setCurrentQuestionPoints(0);
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
  const newSet = prev => [...prev].sort(() => 0.5 - Math.random()).slice(0, 20);
  console.debug('MathQuiz restarting, previous count:', questions.length);
  setQuestions(newSet);
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
        <div className="flex justify-between items-center mb-4 mt-4">
          <QuizProgress title="Math Quiz" currentQuestion={currentIndex + 1} totalQuestions={questions.length} score={score} />
          <div className="font-bold">{totalPoints} pts</div>
        </div>

        {current ? (
          // Render MCQ if options present, otherwise render FillBlank
          (Array.isArray(current.options) && current.options.length > 0) ? (
            <MCQQuestion
              question={current as any}
              onAnswer={handleAnswer}
              isAnswered={answered}
              selectedAnswer={selectedAnswer}
            />
          ) : (
            <FillBlankQuestion
              question={current as any}
              onAnswer={handleAnswer}
              isAnswered={answered}
              userAnswer={selectedAnswer}
            />
          )
        ) : (
          <div>No questions</div>
        )}

        {answered && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {currentQuestionPoints > 0 ? (
                <span className="text-green-600 font-medium">+{currentQuestionPoints} points earned</span>
              ) : (
                <span>No points for this question</span>
              )}
            </div>
            <div>
              <Button
                onClick={next}
                className="px-8 py-2 bg-langlearn-orange hover:bg-langlearn-orange/90 text-white font-bold rounded-full transition-all transform hover:scale-105"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <Trophy className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MathQuiz;
