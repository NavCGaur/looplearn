import './config/firebase';

import { Provider } from 'react-redux';

import store from './state/store/index.ts';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";        
import { SidebarProvider } from "@/components/ui/sidebar";
import SpacedRepetitionLayout from './components/dashboard/guestDashboard/SpacedRepetitionLayout.jsx';

import Dashboard from "./pages/Dashboard";
import GuestDashboard from "./pages/guest/GuestDashboard.tsx";
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import StudentVocabManager from './pages/admin/studentManagement/StudentVocabManager.tsx';
import NotFound from "./pages/NotFound";

import StatsOverview from './components/stats/StatsOverview';
import VocabQuiz from './components/features/vocabQuiz/index';
import GrammarQuiz from './components/features/grammerQuiz/index';
import SpacedRepetition from './components/features/spacedRepetition/spacedRepetition/SpacedRepetition.jsx';
import Login from './components/auth/login';
import MyWordList from './components/features/spacedRepetition/MyWordList.tsx';
import HangmanGame from './components/features/spacedRepetition/HangmanGame/HangmanGame.tsx';
import LeaderBoardPage from './pages/leaderBoard/LeaderBoardPage.tsx';
import WordQuizPage from './pages/wordQuiz/WordQuizPage.tsx';


const App = () => (
  <Provider store={store}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Guest Dashboard Routes */}
            <Route path="/guest/dashboard" element={<GuestDashboard />}>
              <Route index element={<StatsOverview />} />
              <Route path="vocab" element={<VocabQuiz />} />
              <Route path="grammar" element={<GrammarQuiz />} />
              <Route path="stats" element={<StatsOverview />} />
              
              {/* Spaced Repetition with nested routes */}
              <Route path="spaced" element={<SpacedRepetitionLayout />}>
                <Route index element={<Navigate to="practice" replace />} />
                <Route path="practice" element={<SpacedRepetition />} />
                <Route path="my-word-list" element={<MyWordList />} />
                <Route path="hangman-game" element={<HangmanGame />} />
                <Route path="leaderboard" element={<LeaderBoardPage />} />
                <Route path="word-quiz" element={<WordQuizPage />} />

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
            </Route>
            
            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </Provider>
);

export default App;
