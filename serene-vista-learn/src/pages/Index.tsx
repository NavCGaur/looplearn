
import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LearningPathsSection from "@/components/LearningPathsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import CallToActionSection from "@/components/CallToActionSection";
import Footer from "@/components/Footer";
import Dashboard from "@/pages/Dashboard";
import SpacedRepetition from "@/components/SpacedRepetition";
import HeroCarousel from "@/components/HeroCarousel";
import SpeechShadowing from "@/components/shadowing/SpeechShadowing";
import Login from "../components/auth/login";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroCarousel />
      <FeaturesSection />
      <LearningPathsSection />
      <TestimonialsSection />
      <PricingSection />
      <CallToActionSection />
      <Footer />   
     
    </div>
  );
};

export default Index;
