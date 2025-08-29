import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  title?: string;
}

const QuizProgress: React.FC<QuizProgressProps> = ({ 
  currentQuestion, 
  totalQuestions, 
  score 
  , title = 'Quiz'
}) => {

  const progressPercentage = Math.round((currentQuestion / totalQuestions) * 100);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-langlearn-blue">{title}</h2>
        <div className="flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-1" />
          <span className="font-bold">{score}</span>
          <span className="text-gray-500 ml-1">points</span>
        </div>
      </div>
      
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="secondary" className="bg-langlearn-orange text-white">
            Question {currentQuestion} of {totalQuestions}
          </Badge>
          <span className="text-sm text-gray-500">{progressPercentage}% complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </div>
  );
};

export default QuizProgress;