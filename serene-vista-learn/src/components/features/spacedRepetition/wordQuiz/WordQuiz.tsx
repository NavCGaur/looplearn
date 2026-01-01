import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useGetQuizQuestionsQuery } from "@/state/api/userApi";
import { useAddPointsMutation } from "@/state/api/vocabApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "./mockQuizData";
import MCQQuestion from "./MCQQuestion";
import FillBlankQuestion from "./FillBlankQuestion";
import QuizProgress from "./QuizProgress";
import QuizResult from "./QuizResult";
import { useToast } from "@/hooks/use-toast";
import { Star, Trophy, Award } from "lucide-react";
import confetti from 'canvas-confetti';
import { AlertCircle } from "lucide-react";
import Fuse from 'fuse.js';

const isAnswerCorrect = (userAnswer: string, correctAnswer: string) => {
  if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
    return true;
  }
  
  const fuse = new Fuse([correctAnswer], {
    threshold: 0.2,
    includeScore: true,
    ignoreLocation: true
  });
  
  const result = fuse.search(userAnswer.trim());
  return result.length > 0 && result[0].score <= 0.2;
};

type WordQuizProps = {
  className?: string;
  fullWidth?: boolean; // when true the card will expand to the parent's width
};

const WordQuiz: React.FC<WordQuizProps> = ({ className = '', fullWidth = false }) => {
  const userId = useSelector((state: any) => state.auth?.user?.uid);
  const { data: quizQuestions = [], isLoading, isError } = useGetQuizQuestionsQuery(userId || '');
  const [addPoints] = useAddPointsMutation();
  const { toast } = useToast();

  // ref to the root wrapper so we can observe parent size
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [parentSize, setParentSize] = useState<{ width: number; height: number } | null>(null);

  // Game state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  
  // Points system
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsAwarded, setPointsAwarded] = useState<Set<string>>(new Set());
  const [currentQuestionPoints, setCurrentQuestionPoints] = useState(0);

  useEffect(() => {
    if (quizQuestions.length > 0) {
      const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 5));
      setStartTime(new Date());
    }
  }, [quizQuestions]);

  // Observe parent element size so this component can occupy full parent area
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const parent = wrapper.parentElement;
    if (!parent) return;

    const measure = () => {
      setParentSize({ width: parent.clientWidth, height: parent.clientHeight });
    };

    // initial measure
    measure();

    // use ResizeObserver to track parent size changes
    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(parent);

    // also listen for window resize as a fallback
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  const calculateQuestionPoints = (isCorrect: boolean, question?: QuizQuestion) => {
    if (!isCorrect) return 0;
    
    let points = 10; // Base points
    
    // Add difficulty bonus if available
    if (question?.difficulty === 'hard') points += 5;
    else if (question?.difficulty === 'medium') points += 2;
    
    return points;
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswered(true);
    
    const isCorrect = isAnswerCorrect(answer, currentQuestion?.correctAnswer || '');
    const pointsEarned = calculateQuestionPoints(isCorrect, currentQuestion);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setTotalPoints(prev => prev + pointsEarned);
      setCurrentQuestionPoints(pointsEarned);

      // Award points via API
      const pointKey = `quiz-q-${currentQuestionIndex}`;
      if (userId && !pointsAwarded.has(pointKey)) {
        addPoints({
          userId,
          points: pointsEarned,
          reason: "quizQuestionCorrect"
        }).catch(error => {
          console.error("Failed to award points:", error);
          toast({
            title: "Points Error",
            description: "Couldn't award points for this question",
            variant: "destructive"
          });
        });
        
        setPointsAwarded(prev => new Set(prev).add(pointKey));
      }

      toast({
        title: "Correct! 🎉",
        description: `+${pointsEarned} points! "${currentQuestion.word}" - ${currentQuestion.correctAnswer}`,
        variant: "default",
      });
      
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setCurrentQuestionPoints(0);
      toast({
        title: "Not quite right",
        description: `The correct answer was "${currentQuestion.correctAnswer}". Try the next one!`,
        variant: "destructive",
      });
    }
  };

  const nextQuestion = () => {
    setAnswered(false);
    setSelectedAnswer(null);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Quiz completion bonus
      const completionBonus = 20;
      setTotalPoints(prev => prev + completionBonus);
      setEndTime(new Date());
      
      if (userId && !pointsAwarded.has('completion')) {
        addPoints({
          userId,
          points: completionBonus,
          reason: "quizCompleted"
        }).catch(error => {
          console.error("Failed to award completion bonus:", error);
          toast({
            title: "Bonus Error",
            description: "Couldn't award completion bonus",
            variant: "destructive"
          });
        });
        
        setPointsAwarded(prev => new Set(prev).add('completion'));
      }

      setQuizFinished(true);
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 }
      });
    }
  };

  const restartQuiz = () => {
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTotalPoints(0);
    setCurrentQuestionPoints(0);
    setPointsAwarded(new Set());
    setAnswered(false);
    setSelectedAnswer(null);
    const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));
    setStartTime(new Date());
    setEndTime(null);
  };

  if (isLoading || questions.length === 0) {
    return (
      <Card className={`w-full ${fullWidth ? '' : 'max-w-md mx-auto'} mt-4 p-4 text-center ${className}`}>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Star className="w-10 h-10 text-yellow-400 animate-pulse" />
            <p className="text-base mt-3">Loading your word quiz...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={`w-full ${fullWidth ? '' : 'max-w-md mx-auto'} mt-4 p-4 text-center ${className}`}>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-base mt-3">Failed to load quiz questions. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizFinished) {
    return (
      <QuizResult 
        score={score}
        points={totalPoints}
        totalQuestions={questions.length}
        onRestart={restartQuiz}
        timeTaken={startTime && endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0}
      />
    );
  }

  const containerStyle: React.CSSProperties = parentSize ? { width: parentSize.width, height: parentSize.height } : {};

  return (
    <div ref={wrapperRef} className={`w-full px-4 py-4 flex justify-center ${className}`} style={containerStyle}>
      <Card className={`w-full h-full ${fullWidth ? '' : 'max-w-xl mx-auto'} border border-blue-200 rounded-lg shadow-sm`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
            <div className="flex-1">
              <QuizProgress 
                currentQuestion={currentQuestionIndex + 1} 
                totalQuestions={questions.length} 
                score={score}
              />
            </div>
            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full self-start sm:self-auto">
              <Award className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-700 text-sm">{totalPoints} pts</span>
            </div>
          </div>
          
          <div className="my-2 p-3 bg-blue-50 rounded-md">
            {currentQuestion.type === 'mcq' ? (
              <MCQQuestion 
                question={currentQuestion} 
                onAnswer={handleAnswer}
                isAnswered={answered}
                selectedAnswer={selectedAnswer}
              />
            ) : (
              <FillBlankQuestion 
                question={currentQuestion} 
                onAnswer={handleAnswer}
                isAnswered={answered}
                userAnswer={selectedAnswer}
              />
            )}
          </div>
          
          {answered && (
            <div className="mt-3 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="text-sm text-gray-600">
                {currentQuestionPoints > 0 ? (
                  <span className="text-green-600 font-medium">
                    +{currentQuestionPoints} points earned
                  </span>
                ) : (
                  <span>No points for this question</span>
                )}
              </div>
              <Button 
                onClick={nextQuestion}
                className="w-full sm:w-auto px-4 py-2 bg-langlearn-orange hover:bg-langlearn-orange/90 text-white font-bold rounded-full flex items-center justify-center"
              >
                <span>
                  {currentQuestionIndex < questions.length - 1 ? "Next" : "Finish"}
                </span>
                <Trophy className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WordQuiz;