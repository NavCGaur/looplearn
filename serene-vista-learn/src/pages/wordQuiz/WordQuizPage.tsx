import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import WordQuiz from "../../components/features/spacedRepetition/wordQuiz/WordQuiz.tsx";

const WordQuizPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-white shadow-lg border-none">
        <CardContent className="p-6">
          <WordQuiz />
        </CardContent>
      </Card>
    </div>
  );
};

export default WordQuizPage;