
import React from "react";
import { Button } from "@/components/ui/button";
import WaveformGraph from "./WaveformGraph";

const HeroSection: React.FC = () => {
  return (
    <section className="pt-28 pb-20 px-6 bg-blue-gradient overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-block px-3 py-1 bg-blue-100 rounded-full">
            <p className="text-sm text-langlearn-blue font-medium">
              Revolutionary Language Learning
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Master Any Language with <span className="text-langlearn-blue">Speech Shadow</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-lg">
            Learn faster and more effectively with our innovative speech analysis tools, interactive quizzes, and personalized learning paths
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button className="bg-langlearn-blue hover:bg-langlearn-dark-blue text-white px-8 py-6 text-lg">
              Start Learning Now
            </Button>
            <Button variant="outline" className="px-8 py-6 text-lg">
              Take a Tour
            </Button>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={`w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br ${
                    i % 2 === 0 ? 'from-blue-400 to-blue-600' : 'from-orange-400 to-orange-600'
                  } flex items-center justify-center`}
                >
                  <span className="text-white text-xs font-bold">{i}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-600">
              <span className="font-bold">5,000+</span> active learners
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-radial from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
          <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Speech Shadow Tool</h3>
              <div className="bg-blue-100 text-langlearn-blue text-xs px-3 py-1 rounded-full">
                Pro Feature
              </div>
            </div>
            <WaveformGraph />
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Accuracy Score</p>
                <p className="text-2xl font-bold text-langlearn-blue">93%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Fluency Level</p>
                <p className="text-2xl font-bold text-langlearn-orange">Advanced</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
