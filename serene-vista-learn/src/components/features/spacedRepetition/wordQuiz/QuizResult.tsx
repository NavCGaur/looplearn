import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Clock, BookOpen } from "lucide-react";
import confetti from 'canvas-confetti';

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  timeTaken: number;
}

const QuizResult: React.FC<QuizResultProps> = ({ 
  score, 
  totalQuestions, 
  onRestart,
  timeTaken
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  useEffect(() => {
    // Celebration effect
    if (percentage > 70) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;
      
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 }
        });
        
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 }
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [percentage]);
  
  const getFeedback = () => {
    if (percentage >= 80) {
      return {
        title: "Outstanding!",
        message: "You're a word wizard! Amazing job!",
        emoji: "🌟",
        className: "bg-gradient-to-r from-yellow-300 to-yellow-500"
      };
    } else if (percentage >= 60) {
      return {
        title: "Great job!",
        message: "You have a good vocabulary! Keep learning!",
        emoji: "😄",
        className: "bg-gradient-to-r from-green-300 to-green-500"
      };
    } else {
      return {
        title: "Good try!",
        message: "Practice makes perfect! Let's try again.",
        emoji: "🌱",
        className: "bg-gradient-to-r from-blue-300 to-blue-500"
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
        <div className={`text-center p-4 text-white ${feedback.className}`}>
          <h2 className="text-3xl font-bold mb-2">{feedback.title} {feedback.emoji}</h2>
        </div>
        
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-4 text-langlearn-blue">
              {score} / {totalQuestions}
            </div>
            <div className="mb-4">
              <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-langlearn-blue flex items-center justify-center text-xs font-semibold text-white"
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
                <div className="text-sm text-gray-500">Score</div>
                <div className="font-bold">{score} points</div>
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
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Questions</div>
                <div className="font-bold">{totalQuestions} words</div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="mb-6 text-gray-700">{feedback.message}</p>
            <Button 
              onClick={onRestart}
              className="px-8 py-6 bg-langlearn-orange hover:bg-langlearn-orange/90 text-white font-bold rounded-full text-lg transition-transform transform hover:scale-105"
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