import React from "react";
import { QuizQuestion } from "./mockQuizData";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Trophy, HelpCircle } from "lucide-react";

interface MCQQuestionProps {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
  isAnswered: boolean;
  selectedAnswer: string | null;
}

const MCQQuestion: React.FC<MCQQuestionProps> = ({ 
  question, 
  onAnswer, 
  isAnswered,
  selectedAnswer 
}) => {
  const handleOptionClick = (option: string) => {
    if (!isAnswered) {
      onAnswer(option);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-6 w-6 text-langlearn-blue flex-shrink-0" />
        <h3 className="text-xl font-bold text-langlearn-dark-blue">{question.question}</h3>
      </div>
      
      {/*  {question.imageUrl && (
        <div className="flex justify-center my-4">
          <img 
            src={question.imageUrl} 
            alt="Quiz visual aid" 
            className="h-32 object-contain rounded-lg" 
          />
        </div>
      )} */}
    
      
      <RadioGroup 
        className="space-y-3 mt-4" 
        disabled={isAnswered}
      >
        {question.options?.map((option, index) => (
          <div 
            key={index}
            className={cn(
              "flex items-center space-x-2 border-2 p-3 rounded-lg transition-all",
              isAnswered && option === question.correctAnswer 
                ? "border-green-500 bg-green-50" 
                : isAnswered && option === selectedAnswer 
                  ? "border-red-500 bg-red-50" 
                  : "border-langlearn-blue hover:bg-blue-50 cursor-pointer",
              "transform hover:scale-[1.01] hover:shadow-md"
            )}
            onClick={() => handleOptionClick(option)}
          >
            <RadioGroupItem 
              value={option} 
              id={`option-${index}`} 
              disabled={isAnswered}
              checked={selectedAnswer === option}
              className={cn(
                isAnswered && option === question.correctAnswer ? "text-green-500" : "",
                isAnswered && option === selectedAnswer && option !== question.correctAnswer ? "text-red-500" : ""
              )}
            />
            <Label 
              htmlFor={`option-${index}`}
              className={cn(
                "text-lg cursor-pointer flex-1",
                isAnswered && option === question.correctAnswer ? "font-bold text-green-700" : "",
                isAnswered && option === selectedAnswer && option !== question.correctAnswer ? "text-red-700" : ""
              )}
            >
              {option}
            </Label>
            
            {isAnswered && option === question.correctAnswer && (
              <Trophy className="h-5 w-5 text-green-600 animate-bounce" />
            )}
          </div>
        ))}
      </RadioGroup>
      
      {isAnswered && (
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="font-medium">{question.word}: <span className="text-gray-700">{question.definition}</span></p>
        </div>
      )}
    </div>
  );
};

export default MCQQuestion;