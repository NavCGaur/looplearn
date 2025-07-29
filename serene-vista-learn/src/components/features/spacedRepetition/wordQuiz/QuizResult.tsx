import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Clock, BookOpen, Award } from "lucide-react";
import confetti from 'canvas-confetti';

interface QuizResultProps {
  score: number;
  points: number;
  totalQuestions: number;
  onRestart: () => void;
  timeTaken: number;
}

const QuizResult: React.FC<QuizResultProps> = ({ 
  score, 
  points,
  totalQuestions, 
  onRestart,
  timeTaken
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const perfectScore = score === totalQuestions;
  
  useEffect(() => {
    // Enhanced celebration effects based on performance
    const duration = perfectScore ? 5000 : percentage > 70 ? 3000 : 1000;
    const particleCount = perfectScore ? 200 : percentage > 70 ? 100 : 50;
    
    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (perfectScore) {
      const end = Date.now() + duration;
      const colors = ['#ff0000', '#00ff00', '#0000ff'];
      
      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [percentage, perfectScore]);

  const getFeedback = () => {
    if (perfectScore) {
      return {
        title: "Perfect Score!",
        message: "Flawless victory! You've mastered these words!",
        emoji: "🏆",
        className: "bg-gradient-to-r from-yellow-400 to-yellow-600",
        pointsMessage: `You earned ${points} points!`
      };
    } else if (percentage >= 80) {
      return {
        title: "Outstanding!",
        message: "You're a word wizard! Amazing job!",
        emoji: "🌟",
        className: "bg-gradient-to-r from-purple-400 to-purple-600",
        pointsMessage: `You earned ${points} points!`
      };
    } else if (percentage >= 60) {
      return {
        title: "Great job!",
        message: "You have a good vocabulary! Keep learning!",
        emoji: "😄",
        className: "bg-gradient-to-r from-green-400 to-green-600",
        pointsMessage: `${points} points earned!`
      };
    } else {
      return {
        title: "Good try!",
        message: "Practice makes perfect! Let's try again.",
        emoji: "🌱",
        className: "bg-gradient-to-r from-blue-400 to-blue-600",
        pointsMessage: `You earned ${points} points`
      };
    }
  };
  
  const feedback = getFeedback();
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-xl mx-auto border-4 border-langlearn-blue rounded-xl shadow-lg overflow-hidden animate-fade-in">
        <div className={`text-center p-6 text-white ${feedback.className}`}>
          <h2 className="text-4xl font-bold mb-2">{feedback.title} {feedback.emoji}</h2>
          <p className="text-xl">{feedback.message}</p>
          {perfectScore && (
            <div className="mt-4 animate-bounce">
              <Trophy className="h-12 w-12 mx-auto text-yellow-300" />
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-4 text-langlearn-blue">
              {score} / {totalQuestions}
            </div>
            <div className="mb-4">
              <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full flex items-center justify-center text-xs font-semibold text-white ${
                    perfectScore 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                      : percentage >= 80
                        ? 'bg-gradient-to-r from-purple-400 to-purple-600'
                        : 'bg-langlearn-blue'
                  }`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
              <div className="bg-langlearn-blue p-2 rounded-full text-white mr-3">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Correct Answers</div>
                <div className="font-bold">{score} correct</div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
              <div className="bg-langlearn-blue p-2 rounded-full text-white mr-3">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Points</div>
                <div className="font-bold text-yellow-600">{points} pts</div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
              <div className="bg-langlearn-blue p-2 rounded-full text-white mr-3">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Time taken</div>
                <div className="font-bold">{timeString}</div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
              <div className="bg-langlearn-blue p-2 rounded-full text-white mr-3">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Performance</div>
                <div className="font-bold">{percentage}%</div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="mb-6 text-lg font-medium text-gray-800">
              {feedback.pointsMessage}
            </p>
            {perfectScore && (
              <p className="mb-4 text-yellow-600 font-bold">
                Bonus points for perfect score!
              </p>
            )}
            <Button 
              onClick={onRestart}
              className="px-8 py-6 bg-langlearn-orange hover:bg-langlearn-orange/90 text-white font-bold rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
            >
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResult;