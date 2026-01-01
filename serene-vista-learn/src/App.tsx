import './config/firebase';
import React from 'react';

import { Provider } from 'react-redux';

import store from './state/store/index.ts';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";        
import { SidebarProvider } from "@/components/ui/sidebar";
import SpacedRepetitionLayout from './components/dashboard/guestDashboard/SpacedRepetitionLayout.jsx';

import Dashboard from "./pages/Dashboard";
import GuestDashboard from "./pages/guest/GuestDashboard.tsx";
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import StudentVocabManager from './pages/admin/studentManagement/StudentVocabManager.enhanced.tsx';
import NotFound from "./pages/NotFound";

import StatsOverview from './components/stats/StatsOverview';
import VocabQuiz from './components/features/vocabQuiz/index';
import GrammarQuiz from './components/features/grammerQuiz/index';
import SpacedRepetition from './components/features/spacedRepetition/spacedRepetition/SpacedRepetition.jsx';
import Login from './components/auth/login';
import Onboarding from './components/auth/onboarding';
import MyWordList from './components/features/spacedRepetition/MyWordList.tsx';
import HangmanGame from './components/features/spacedRepetition/HangmanGame/HangmanGame.tsx';
import LeaderBoardPage from './pages/leaderBoard/LeaderBoardPage.tsx';
import WordQuizPage from './pages/wordQuiz/WordQuizPage.tsx';
import LeaderBoard from './components/leaderBoard/LeaderBoard.tsx';

import ScienceQuestionGenerator from './pages/scienceQuestion/ScienceQuestionGenerator.tsx';
import ScienceQuizPage from './pages/scienceQuiz/ScienceQuizPage.tsx';
import MathQuizPage from './pages/mathQuiz/MathQuizPage.tsx';
import MathQuestionGenerator from './pages/mathQuestion/MathQuestionGenerator.tsx';
import MathBulkUpload from './pages/mathQuestion/MathBulkUpload.tsx';
import QuestionManager from './pages/scienceQuestion/QuestionManager.tsx';
import QuestionAssigner from './pages/scienceQuestion/QuestionAssigner.tsx';
import MathQuestionManager from './pages/mathQuestion/QuestionManager.tsx';
import MathQuestionAssigner from './pages/mathQuestion/QuestionAssigner.tsx';
import Main from './pages/scienceQuestion/Main.tsx';
import BulkUpload from './pages/scienceQuestion/BulkUpload.tsx';
import UnifiedQuestionManagerPage from './pages/admin/QuestionManagerPage.tsx';
import UnifiedQuestionGenerator from './pages/unifiedQuestion/UnifiedQuestionGenerator';

import 'katex/dist/katex.min.css';




const RouterWithAnalytics: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  // We import pageview lazily to avoid SSR issues
  const location = useLocation();
  React.useEffect(() => {
    import("./lib/ga").then((m) => {
      if (m && m.pageview) m.pageview(location.pathname + location.search);
    }).catch(() => {});
  }, [location.pathname, location.search]);

  return <>{children}</>;
};

const App = () => (
  <Provider store={store}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouterWithAnalytics>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Guest Dashboard Routes */}
            <Route path="/guest/dashboard" element={<GuestDashboard />}>
              <Route index element={<StatsOverview />} />
              <Route path="vocab" element={<VocabQuiz />} />
              <Route path="grammar" element={<GrammarQuiz />} />
              <Route path="stats" element={<StatsOverview />} />
              <Route path="leaderboard" element={<LeaderBoard />} />
              
              {/* Spaced Repetition with nested routes */}
              <Route path="spaced" element={<SpacedRepetitionLayout />}>
                <Route index element={<Navigate to="practice" replace />} />
                <Route path="practice" element={<SpacedRepetition />} />
                <Route path="my-word-list" element={<MyWordList />} />
                <Route path="hangman-game" element={<HangmanGame />} />
                <Route path="leaderboard" element={<LeaderBoardPage />} />
                <Route path="word-quiz" element={<WordQuizPage />} />
                <Route path="science-quiz" element={<ScienceQuizPage />} />
                <Route path="math-quiz" element={<MathQuizPage />} />
              </Route>


            </Route>
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />}>
              <Route index element={<StatsOverview />} />
              <Route path="vocab" element={<VocabQuiz />} />
              <Route path="grammar" element={<GrammarQuiz />} />
              <Route path="spaced" element={<SpacedRepetition />} />
              <Route path="stats" element={<StatsOverview />} />
              <Route path="students" element={<StudentVocabManager />} />  
              <Route path="students-enhanced" element={<StudentVocabManager />} />
              {/* Science guest dashboard routes here */}
              <Route path="science-questions" element={<Main />} />
              <Route path="science-question-generator" element={<ScienceQuestionGenerator   />} />
              <Route path="bulk-upload" element={<BulkUpload />} />
              <Route path="unified-question-generator" element={<UnifiedQuestionGenerator />} />
              <Route path="math-question-generator" element={<MathQuestionGenerator />} />
              <Route path="math-bulk-upload" element={<MathBulkUpload />} />
              <Route path="math-question-manager" element={<MathQuestionManager />} />
              <Route path="math-question-assigner" element={<MathQuestionAssigner />} />
              <Route path="question-manager" element={<QuestionManager />} />
              <Route path="question-assigner" element={<QuestionAssigner />} />
              <Route path="questions" element={<UnifiedQuestionManagerPage />} />

            </Route>
            
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </RouterWithAnalytics>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </Provider>
);

export default App;
