import React, { useState, useEffect } from "react";
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

const WordQuiz: React.FC = () => {
  const userId = useSelector((state: any) => state.auth?.user?.uid);
  const { data: quizQuestions = [], isLoading, isError } = useGetQuizQuestionsQuery(userId || '');
  const [addPoints] = useAddPointsMutation();
  const { toast } = useToast();

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
      <Card className="max-w-3xl mx-auto mt-8 p-4 text-center">
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10">
            <Star className="w-12 h-12 text-yellow-400 animate-pulse" />
            <p className="text-lg mt-4">Loading your word quiz...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="max-w-3xl mx-auto mt-8 p-4 text-center">
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-lg mt-4">Failed to load quiz questions. Please try again.</p>
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

  return (
    <div className="w-full py-4 sm:py-0 flex items-center justify-center">
      <Card className="max-w-3xl border-4 border-blue-500 border-opacity-10 rounded-xl shadow-lg w-full">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <QuizProgress 
              currentQuestion={currentQuestionIndex + 1} 
              totalQuestions={questions.length} 
              score={score}
            />
            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
              <Award className="h-5 w-5 text-yellow-600" />
              <span className="font-bold text-yellow-700">{totalPoints} pts</span>
            </div>
          </div>
          
          <div className="my-6 p-4 bg-blue-50 rounded-lg">
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
            <div className="mt-4 flex justify-between items-center">
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
                className="px-8 py-2 bg-langlearn-orange hover:bg-langlearn-orange/90 text-white font-bold rounded-full"
              >
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
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