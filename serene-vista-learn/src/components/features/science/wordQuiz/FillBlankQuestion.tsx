import React, { useEffect, useState, useMemo, useCallback } from 'react';
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

// Separate component for the input - this isolates re-renders to just this component
const AnswerInput = React.memo(({ 
  onSubmit, 
  isAnswered,
  questionId // Add questionId to reset input when question changes
}: {
  onSubmit: (answer: string) => void;
  isAnswered: boolean;
  questionId: string;
}) => {
  const [inputValue, setInputValue] = useState('');

  // Reset input when question changes
  useEffect(() => {
    setInputValue('');
  }, [questionId]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isAnswered) {
      onSubmit(inputValue.trim());
      setInputValue(''); // Clear input after submission
    }
  }, [inputValue, isAnswered, onSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        type="text"
        placeholder="Type your answer..."
        value={inputValue}
        onChange={handleChange}
        className="border-2 border-langlearn-blue focus:border-langlearn-dark-blue rounded-lg"
        disabled={isAnswered}
        autoFocus
      />
      <Button
        type="submit"
        className="bg-langlearn-blue hover:bg-langlearn-dark-blue"
        disabled={!inputValue.trim() || isAnswered}
      >
        Check
      </Button>
    </form>
  );
});

// Separate component for the question display - prevents re-renders when typing
const QuestionDisplay = React.memo(({ 
  parts, 
  isAnswered, 
  userAnswer, 
  isCorrect, 
  renderKey,
  originalQuestion
}: {
  parts: string[];
  isAnswered: boolean;
  userAnswer: string | null;
  isCorrect: boolean;
  renderKey: number;
  originalQuestion: string;
}) => {
  console.log('QuestionDisplay rendering'); // This should NOT log on every keystroke

  // The number of blanks should be parts.length - 1 (since split creates one more part than separators)
  // But let's also verify by counting distinct blank patterns
  const blankCount = parts.length - 1;
  
  console.log('Parts:', parts, 'Blank count:', blankCount); // Debug log

  return (
    <div className="mb-4 text-lg flex flex-wrap items-center gap-1">
      {parts.map((part, index) => (
        <React.Fragment key={`fragment-${index}-${renderKey}`}>
          {/* Render the text part */}
          {part && <TextWithMath key={`part-${index}-${renderKey}`}>{part}</TextWithMath>}
          
          {/* Only render blank if this isn't the last part */}
          {index < parts.length - 1 && (
            <>
              {isAnswered ? (
                <span 
                  className={cn(
                    "px-3 py-1 rounded font-bold mx-1",
                    isCorrect 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  )}
                >
                  {/* For single answer, show it in first blank, show placeholder for others */}
                  {index === 0 ? userAnswer : '____'}
                </span>
              ) : (
                <span className="border-b-2 border-dashed border-langlearn-blue inline-block min-w-[80px] mx-1">
                  &nbsp;
                </span>
              )}
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

// Separate component for feedback - prevents unnecessary re-renders
const AnswerFeedback = React.memo(({ 
  isCorrect, 
  correctAnswer, 
  renderKey 
}: {
  isCorrect: boolean;
  correctAnswer: string;
  renderKey: number;
}) => {
  console.log('AnswerFeedback rendering'); // Should only render when answer is submitted

  return (
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
            <TextWithMath key={`answer-${renderKey}`}>{correctAnswer}</TextWithMath>
          </div>
        </div>
      )}
    </div>
  );
});

const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({
  question,
  onAnswer,
  isAnswered,
  userAnswer
}) => {
  const [isKatexReady, setIsKatexReady] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  console.log('FillBlankQuestion rendering'); // This should NOT log on every keystroke now

  // Memoize the answer checking function
  const isAnswerCorrect = useCallback((userAnswer: string, correctAnswer: string) => {
    // First try exact match (case insensitive)
    if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
      return true;
    }
    
    // Then try fuzzy matching with Fuse.js
    const fuse = new Fuse([correctAnswer], {
      threshold: 0.2,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true
    });
    
    const result = fuse.search(userAnswer.trim());
    return result.length > 0 && result[0].score <= 0.2;
  }, []);

  // Memoize expensive computations
  const parts = useMemo(() => {
    console.log('Computing parts'); // Should only log when question changes
    
    // First, normalize all sequences of 4 or more underscores to a single placeholder
    // This handles cases where we have ________ (8) or ____________ (12) underscores
    const normalizedQuestion = question.word.replace(/_{4,}/g, '____');
    console.log('Normalized question:', normalizedQuestion);
    
    const splitParts = normalizedQuestion.split('____');
    console.log('Split parts:', splitParts);
    
    return splitParts;
  }, [question.word]);

  // For multiple blanks, we'd need to split the correctAnswer too
  const correctAnswers = useMemo(() => {
    // For now, assume single answer, but this could be extended for multiple answers
    // If you have multiple correct answers separated by some delimiter, split them here
    return [question.correctAnswer];
  }, [question.correctAnswer]);
  
  const isCorrect = useMemo(() => {
    return userAnswer ? isAnswerCorrect(userAnswer, question.correctAnswer) : false;
  }, [userAnswer, question.correctAnswer, isAnswerCorrect]);

  // Memoized submit handler
  const handleAnswer = useCallback((answer: string) => {
    onAnswer(answer);
  }, [onAnswer]);

  useEffect(() => {
    async function initKaTeX() {
      try {
        await loadKaTeX();
        setIsKatexReady(true);
        setRenderKey(prev => prev + 1);
      } catch (error) {
        console.error("Failed to load KaTeX:", error);
        setIsKatexReady(true);
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

      <div className="p-4 bg-white rounded-lg shadow-sm mt-4">
        <QuestionDisplay
          parts={parts}
          isAnswered={isAnswered}
          userAnswer={userAnswer}
          isCorrect={isCorrect}
          renderKey={renderKey}
          originalQuestion={question.word}
        />

        {!isAnswered ? (
          <AnswerInput
            onSubmit={handleAnswer}
            isAnswered={isAnswered}
            questionId={question.id}
          />
        ) : (
          <AnswerFeedback
            isCorrect={isCorrect}
            correctAnswer={question.correctAnswer}
            renderKey={renderKey}
          />
        )}
      </div>
    </div>
  );
};

export default FillBlankQuestion;