import React, { useState, useEffect } from "react";
import { UseDispatch, useSelector } from "react-redux";
import { useGetQuizQuestionsQuery } from "@/state/api/userApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockQuizQuestions, QuizQuestion } from "./mockQuizData";
import MCQQuestion from "./MCQQuestion";
import FillBlankQuestion from "./FillBlankQuestion";
import QuizProgress from "./QuizProgress";
import QuizResult from "./QuizResult";
import { useToast } from "@/hooks/use-toast";
import { Star, Trophy } from "lucide-react";
import confetti from 'canvas-confetti';
import { AlertCircle } from "lucide-react";
import Fuse from 'fuse.js';

// Shared flexible answer matching function
const isAnswerCorrect = (userAnswer: string, correctAnswer: string) => {
  // First try exact match (case insensitive)
  if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
    return true;
  }
  
  // Then try fuzzy matching with Fuse.js
  const fuse = new Fuse([correctAnswer], {
    threshold: 0.2, // Allow up to 20% difference
    includeScore: true,
    ignoreLocation: true,
    findAllMatches: true
  });
  
  const result = fuse.search(userAnswer.trim());
  return result.length > 0 && result[0].score <= 0.2;
};

const WordQuiz: React.FC = () => {
  //@ts-ignore
  const userId = useSelector((state) => state.auth?.user?.uid);
  

  const { data: quizQuestions = [], isLoading, isError } = useGetQuizQuestionsQuery(userId || '');

  console.log("Quiz Questions:", quizQuestions);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (quizQuestions.length > 0) {
      // Shuffle questions and take 5
      const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 5));
      setStartTime(new Date());
    }
  }, [quizQuestions]);

  const currentQuestion = questions[currentQuestionIndex];
  
  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswered(true);
    
    // Use the same flexible matching logic as FillBlankQuestion
    if (isAnswerCorrect(answer, currentQuestion?.correctAnswer || '')) {
      setScore(prevScore => prevScore + 1);
      toast({
        title: "Correct! 🎉",
        description: `Great job! "${currentQuestion.word}" -- you got it right!"`,
        variant: "default",
      });
      
      // Small confetti for correct answer
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      toast({
        title: "Not quite right",
        description: `The correct answer was "${currentQuestion.correctAnswer}". Keep trying!`,
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
      setEndTime(new Date());
      setQuizFinished(true);
      
      // Big confetti for quiz completion
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
    setAnswered(false);
    setSelectedAnswer(null);
    const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));
    setStartTime(new Date());
    setEndTime(null);
  };

  if (questions.length === 0) {
    return (
      <Card className="max-w-3xl mx-auto mt-8 p-4 text-center animate-bounce">
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10">
            <Star className="w-12 h-12 text-yellow-400 animate-pulse" />
            <p className="text-lg mt-4">Loading your awesome word quiz...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="max-w-3xl mx-auto mt-8 p-4 text-center animate-bounce">
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10">
            <Star className="w-12 h-12 text-yellow-400 animate-pulse" />
            <p className="text-lg mt-4">Loading your awesome word quiz...</p>
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
        totalQuestions={questions.length} 
        onRestart={restartQuiz}
        timeTaken={startTime && endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0}
      />
    );
  }

  return (
    <div className="width-full py-4 sm:py-0 flex items-center justify-center">
      <Card className="max-w-3xl border-4 border-blue-500 border-opacity-10 rounded-xl shadow-lg animate-fade-in">
        <CardContent className="p-6">
          <QuizProgress 
            currentQuestion={currentQuestionIndex + 1} 
            totalQuestions={questions.length} 
            score={score} 
          />
          
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
          
          <div className="flex justify-center mt-6">
            {answered ? (
              <Button 
                onClick={nextQuestion}
                className="px-8 py-2 bg-langlearn-orange hover:bg-langlearn-orange/90 text-white font-bold rounded-full transition-all transform hover:scale-105"
              >
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
                <Trophy className="ml-2 h-5 w-5" />
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WordQuiz;