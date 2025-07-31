import React, { useState } from "react";
import Fuse from 'fuse.js';
import { QuizQuestion } from "./mockQuizData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HelpCircle, Check, X } from "lucide-react";

interface FillBlankQuestionProps {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
  isAnswered: boolean;
  userAnswer: string | null;
}

const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({ 
  question, 
  onAnswer, 
  isAnswered,
  userAnswer 
}) => {
  const [inputValue, setInputValue] = useState("");
  
  // Flexible answer matching function
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isAnswered) {
      onAnswer(inputValue);
    }
  };
  
  const parts = question.question.split('________').map(part => part.replace(/_/g, ''));
  
  // Calculate this once and reuse 
  const isCorrect = userAnswer ? isAnswerCorrect(userAnswer, question.correctAnswer) : false;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <HelpCircle className="h-6 w-6 text-langlearn-blue flex-shrink-0 mt-1" />
        <h3 className="text-xl font-bold text-langlearn-dark-blue">Fill in the blank</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-white rounded-lg shadow-sm mt-4">
          <div className="mb-4 text-lg leading-relaxed">
            <span>{parts[0]}</span>
            <span className="inline-block mx-1 min-w-[120px] relative">
              {isAnswered ? (
                <span 
                  className={cn(
                    "px-3 py-1 rounded font-bold",
                    isCorrect 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  )}
                >
                  {userAnswer}
                </span>
              ) : (
                <span 
                  className="inline-block min-w-[120px]" 
                  style={{
                    borderBottom: '2px dashed #60a5fa', 
                    paddingBottom: '2px'
                  }}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              )}
            </span>
            {parts[1] && <span>{parts[1]}</span>}
          </div>
          
          {!isAnswered ? (
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type your answer..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="border-2 border-langlearn-blue focus:border-langlearn-dark-blue rounded-lg"
                disabled={isAnswered}
              />
              <Button
                type="submit"
                className="bg-langlearn-blue hover:bg-langlearn-dark-blue"
                disabled={!inputValue.trim() || isAnswered}
              >
                Check
              </Button>
            </div>
          ) : (
            <div className="flex items-center mt-4">
              {isCorrect ? (
                <div className="flex items-center text-green-600 bg-green-50 p-2 rounded-lg">
                  <Check className="mr-2 h-5 w-5" />
                  <span className="font-medium">Correct!</span>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-red-600 bg-red-50 p-2 rounded-lg">
                    <X className="mr-2 h-5 w-5" />
                    <span className="font-medium">Not quite right</span>
                  </div>
                  <div className="text-green-700">
                    <span className="font-medium">Correct answer: </span>
                    {question.correctAnswer}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
          
      {/*isAnswered && (
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="font-medium">{question.word}<span className="text-gray-700">{question.definition}</span></p>
        </div>
      )*/}
    </div>
  );
};

export default FillBlankQuestion;