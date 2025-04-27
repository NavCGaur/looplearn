
import React from "react";

const WaveformGraph: React.FC = () => {
  return (
    <div className="relative w-full h-48 bg-gray-50 rounded-lg p-4 overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-100/50 to-transparent z-10"></div>
      
      {/* Main waveform */}
      <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
        <path
          className="waveform-line"
          d="M0,75 C20,60 40,40 60,60 C80,80 100,90 120,75 C140,60 160,30 180,45 C200,60 220,90 240,75 C260,60 280,30 300,45 C320,60 340,90 360,75 C380,60 400,45 400,60"
        />
        
        {/* Shadow waveform */}
        <path
          className="fill-none stroke-langlearn-orange/30 stroke-2 translate-y-4"
          d="M0,75 C20,60 40,40 60,60 C80,80 100,90 120,75 C140,60 160,30 180,45 C200,60 220,90 240,75 C260,60 280,30 300,45 C320,60 340,90 360,75 C380,60 400,45 400,60"
        />
      </svg>
      
      {/* Praat graph overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50/80 rounded-t-lg border-t border-gray-200">
        <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
          <path
            className="praat-graph-line"
            d="M0,30 C20,20 40,40 60,30 C80,20 100,10 120,20 C140,30 160,40 180,30 C200,20 220,10 240,20 C260,30 280,40 300,30 C320,20 340,10 360,20 C380,30 400,20 400,30"
          />
        </svg>
      </div>
    </div>
  );
};

export default WaveformGraph;
