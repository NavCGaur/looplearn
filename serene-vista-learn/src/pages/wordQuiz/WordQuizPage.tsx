import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import WordQuiz from "../../components/features/spacedRepetition/wordQuiz/WordQuiz.tsx";
import { pageview, event as gaEvent } from "@/lib/ga";

const WordQuizPage: React.FC = () => {
  React.useEffect(() => {
    try {
      pageview('/spaced/word-quiz');
      gaEvent('quiz_landing', { quizType: 'word' });
    } catch (e) {}
  }, []);
  return (
    <div className="container mx-auto px-0 py-8">
      <Card className="bg-white shadow-lg border-none">
        <CardContent className="p-0">
          <WordQuiz />
        </CardContent>
      </Card>
    </div>
  );
};

export default WordQuizPage;