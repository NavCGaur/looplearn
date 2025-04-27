
import React from "react";
import { Button } from "@/components/ui/button";

const LearningPathsSection: React.FC = () => {
  return (
    <section id="learning-paths" className="py-20 px-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Custom Learning Paths</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our adaptive learning system creates personalized paths that evolve with your progress
          </p>
        </div>
        
        <div className="relative">
          {/* Path illustration */}
          <div className="hidden md:block absolute inset-0 z-0">
            <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <path
                className="path-line fill-none"
                d="M100,150 C200,50 300,250 400,150 C500,50 600,250 700,150 C800,50 900,150 1000,150"
              />
              {/* Path nodes */}
              <circle className="path-node" cx="100" cy="150" r="15" />
              <circle className="path-node" cx="400" cy="150" r="15" />
              <circle className="path-node" cx="700" cy="150" r="15" />
              <circle className="path-node" cx="1000" cy="150" r="15" />
            </svg>
          </div>
          
          {/* Path cards */}
          <div className="grid md:grid-cols-4 gap-6 relative z-10">
            {["Beginner", "Intermediate", "Advanced", "Fluent"].map((level, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-4 ${
                  index % 2 === 0 ? 'bg-langlearn-blue' : 'bg-langlearn-orange'
                }`}>
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{level}</h3>
                <p className="text-gray-600 mb-4">
                  {index === 0 && "Build a solid foundation with essential vocabulary and basic grammar."}
                  {index === 1 && "Expand your skills with more complex sentence structures and expressions."}
                  {index === 2 && "Master nuanced conversations and cultural contexts for natural fluency."}
                  {index === 3 && "Fine-tune your skills to achieve near-native proficiency in all aspects."}
                </p>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${
                    index === 0 ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {index === 0 ? 'Current Level' : 'Locked'}
                  </span>
                  <Button 
                    variant={index === 0 ? "default" : "outline"} 
                    className={index === 0 ? "bg-langlearn-blue hover:bg-langlearn-dark-blue" : ""}
                  >
                    {index === 0 ? 'Continue' : 'Preview'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningPathsSection;
