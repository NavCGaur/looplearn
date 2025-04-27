import './config/firebase';

import { Provider } from 'react-redux';

import store from './state/store/index.ts';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";        
import { SidebarProvider } from "@/components/ui/sidebar";

import Dashboard from "./pages/Dashboard";
import GuestDashboard from "./pages/guest/GuestDashboard.tsx";
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import StudentVocabManager from './pages/admin/studentManagement/StudentVocabManager.tsx';
import NotFound from "./pages/NotFound";

import StatsOverview from './components/stats/StatsOverview';
import VocabQuiz from './components/features/vocabQuiz/index';
import GrammarQuiz from './components/features/grammerQuiz/index';
import SpacedRepetition from './components/features/spacedRepetition/index';
import Login from './components/auth/login';



const App = () => (
  <Provider store={store}>

    <TooltipProvider>
    <SidebarProvider>

        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            <Route path="/guest/dashboard" element={<GuestDashboard />}>
              <Route index element={<StatsOverview />} />
              <Route path="vocab" element={<VocabQuiz />} />
              <Route path="grammar" element={<GrammarQuiz />} />
              <Route path="spaced" element={<SpacedRepetition />} />
              <Route path="stats" element={<StatsOverview />} />
            </Route>   

            <Route path="/admin/dashboard" element={<AdminDashboard />}>
              <Route index element={<StatsOverview />} />
              <Route path="vocab" element={<VocabQuiz />} />
              <Route path="grammar" element={<GrammarQuiz />} />
              <Route path="spaced" element={<SpacedRepetition />} />
              <Route path="stats" element={<StatsOverview />} /> 
              <Route path="students" element={<StudentVocabManager />} />

            </Route>     
            <Route path="/login" element={<Login />} />
         </Routes>
        </BrowserRouter>
        </SidebarProvider>

    </TooltipProvider>
  </Provider >
);

export default App;
