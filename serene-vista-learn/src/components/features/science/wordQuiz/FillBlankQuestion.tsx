import React, { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { TextWithMath } from '@/components/ui/TextWithMath';  
import { loadKaTeX } from '../../../utils/katexLoader';
import { cn } from "@/lib/utils";


interface FillBlankQuestionProps {
  question: {
    id: string;
    word: string;
    correctAnswer: string;
    type: string;
    definition?: string;
  };
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
  const [inputValue, setInputValue] = useState('');
  const [isKatexReady, setIsKatexReady] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Force re-render key

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

  useEffect(() => {
    async function initKaTeX() {
      try {
        await loadKaTeX();
        setIsKatexReady(true);
        // Force re-render of TextWithMath components
        setRenderKey(prev => prev + 1);
      } catch (error) {
        console.error("Failed to load KaTeX:", error);
        setIsKatexReady(true); // Set to true to show fallback text
      }
    }

    initKaTeX();
  }, []);

  // Force re-render when question changes
  useEffect(() => {
    if (isKatexReady) {
      setRenderKey(prev => prev + 1);
    }
  }, [question.id, isKatexReady]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isAnswered) {
      onAnswer(inputValue);
    }
  };

  const parts = question.word.split('____');

  const isCorrect = userAnswer ? isAnswerCorrect(userAnswer, question.correctAnswer) : false;

  if (!isKatexReady) {
    return (
      <div className="space-y-4">
        <div className="text-xl font-bold text-langlearn-dark-blue">Fill in the blank</div>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="animate-pulse">Loading formulas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xl font-bold text-langlearn-dark-blue">Fill in the blank</div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-white rounded-lg shadow-sm mt-4">
          <div className="mb-4 text-lg flex flex-wrap items-center gap-1">
            <TextWithMath key={`part1-${renderKey}`}>{parts[0]}</TextWithMath>

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
              <span className="border-b-2 border-dashed border-langlearn-blue inline-block min-w-[80px]">
                &nbsp;
              </span>
            )}

            {parts[1] && <TextWithMath key={`part2-${renderKey}`}>{parts[1]}</TextWithMath>}
            {parts[2] && <TextWithMath key={`part3-${renderKey}`}>{parts[2]}</TextWithMath>}

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
                    <TextWithMath key={`answer-${renderKey}`}>{question.correctAnswer}</TextWithMath>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default FillBlankQuestion;