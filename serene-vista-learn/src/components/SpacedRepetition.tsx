import React from "react";
import { Button } from "@/components/ui/button";
import SpacedrepetitionImage from "../assets/spacedrepetitionhome.jpg"; // Placeholder for Spaced Repetition Illustration

const SpacedRepetition: React.FC = () => {
    return (
      <section className="pt-28 pb-20 px-6 bg-blue-gradient overflow-hidden" style={{height: '100vh'}}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 bg-blue-100 rounded-full">
              <p className="text-sm text-langlearn-blue font-medium">
                Smarter Memory, Smarter You
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Boost <br /> Retention with <span className="text-langlearn-blue">Spaced Repetition</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-lg">
              At <strong>LoopLearnerX</strong>, we help you learn more in less time by spacing your reviews in scientifically optimized intervals — making your knowledge stick for good.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button className="bg-langlearn-blue hover:bg-langlearn-dark-blue text-white px-8 py-6 text-lg">
                Try Spaced Repetition
              </Button>
              <Button variant="outline" className="px-8 py-6 text-lg">
                Learn How It Works
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
                <span className="font-bold">3,200+</span> successful revisions completed
              </p>
            </div>
          </div>
  
          <div className="relative order-1 md:order-2 mb-8 md:mb-0">
          <div className="absolute inset-0 bg-gradient-radial from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
          <div className="relative bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="font-semibold text-base md:text-lg">Spaced Repetition Cycle</h3>
              <div className="bg-blue-100 text-langlearn-blue text-xs px-2 md:px-3 py-1 rounded-full">
                Core Feature
              </div>
            </div>
            
            {/* Mobile-responsive image container */}
            <div className="relative w-full h-40 sm:h-48 bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={SpacedrepetitionImage}
                alt="Spaced Repetition Illustration"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-t from-gray-100/50 to-transparent z-10"></div>
            </div>


  
            <div className="mt-4 md:mt-6 grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Retention Rate</p>
                  <p className="text-2xl font-bold text-langlearn-blue">98%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Review Time Saved</p>
                  <p className="text-2xl font-bold text-langlearn-orange">+40%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default SpacedRepetition;