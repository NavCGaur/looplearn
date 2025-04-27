
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md py-4 px-6 fixed top-0 left-0 right-0 z-50 shadow-sm" > 
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-langlearn-blue to-langlearn-light-blue flex items-center justify-center">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <span className="font-bold text-xl text-langlearn-dark-blue">LinguaLearn</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-600 hover:text-langlearn-blue transition-colors">Features</a>
          <a href="#learning-paths" className="text-gray-600 hover:text-langlearn-blue transition-colors">Learning Paths</a>
          <a href="#testimonials" className="text-gray-600 hover:text-langlearn-blue transition-colors">Testimonials</a>
          <a href="#pricing" className="text-gray-600 hover:text-langlearn-blue transition-colors">Pricing</a>
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" className="hidden sm:inline-flex">Login</Button>
          <Button className="bg-langlearn-blue hover:bg-langlearn-dark-blue">Get Started</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
