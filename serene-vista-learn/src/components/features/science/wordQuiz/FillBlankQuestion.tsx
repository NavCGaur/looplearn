import React, { useEffect, useState, useMemo, useCallback } from 'react';
import writtenNumber from 'written-number';
import pluralize from 'pluralize';
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
    correctAnswer?: string;
    answer?: string; // Allow both field names for backward compatibility
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
        <div key={`fragment-${index}-${renderKey}`} className="contents">
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
        </div>
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
  console.log('Full question object received:', JSON.stringify(question, null, 2));

  // Helper to get the correct answer field (support both answer and correctAnswer)
  const getCorrectAnswer = useCallback(() => {
    return question.correctAnswer || question.answer || '';
  }, [question.correctAnswer, question.answer]);

  // Memoize the answer checking function
  const isAnswerCorrect = useCallback((userAnswer: string, correctAnswer: string) => {
    // Normalizer: lowercase, remove smart quotes, replace non-alphanum (except hyphen) with space, collapse spaces
    // Make normalizer resilient to undefined/null inputs (coerce to empty string)
    const normalize = (s?: string) =>
      (s || '')
        .toLowerCase()
        .trim()
        .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Try to convert English number-words to a digit string using words-to-numbers
  const tryConvertToDigits = (s?: string): string | null => {
  const raw = (s || '').trim();

  // If it's already numeric (allow commas), normalize and return
  if (/^[\d,]+$/.test(raw)) {
    return raw.replace(/,/g, '').replace(/^0+(?!$)/, '');
  }

  // Try converting number-words using written-number (browser-friendly)
  if (/[a-z]/i.test(raw)) {
    try {
      // writtenNumber returns a string representation like '123' for 'one hundred twenty three'
      // Some locales return words; ensure digits-only
      const maybe = writtenNumber(raw);
      const digits = String(maybe).replace(/[^0-9]/g, '');
      if (digits.length > 0) {
        return digits.replace(/^0+(?!$)/, '');
      }
    } catch (e) {
      // conversion failed; fall through to null
    }
  }

  return null;
};

    const a = normalize(userAnswer);
    const b = normalize(correctAnswer);

    // Numeric path: if both sides convert to digits, require exact equality of normalized digits
    const aDigits = tryConvertToDigits(a);
    const bDigits = tryConvertToDigits(b);
    if (aDigits !== null && bDigits !== null) {
      return aDigits === bDigits;
    }

    // For non-numeric answers: allow exact match or singular/plural token-wise equivalence.
    if (a === b) return true;

    const singularizeTokens = (s: string) =>
      s.split(' ').map(tok => pluralize.singular(tok)).join(' ');

    if (singularizeTokens(a) === singularizeTokens(b)) return true;

    // No fuzzy spelling tolerance for non-numeric answers as per requirement
    return false;
  }, []);

  // Memoize expensive computations
  const parts = useMemo(() => {
    console.log('Computing parts'); // Should only log when question changes
    console.log('Raw question.word received:', JSON.stringify(question.word));
    
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
    return [getCorrectAnswer()];
  }, [getCorrectAnswer]);
  
  const isCorrect = useMemo(() => {
    const correctAnswer = getCorrectAnswer();
    return userAnswer ? isAnswerCorrect(userAnswer, correctAnswer) : false;
  }, [userAnswer, getCorrectAnswer, isAnswerCorrect]);

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
  // Do NOT mark KaTeX as ready on failure. Keep false and fallback to plain text rendering.
  setIsKatexReady(false);
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
            correctAnswer={getCorrectAnswer()}
            renderKey={renderKey}
          />
        )}
      </div>
    </div>
  );
};

export default FillBlankQuestion;