import React, { useState } from "react";
import { HelpCircle, Eye, EyeOff } from "lucide-react";

const WordDisplay = ({ word, guessedLetters, wordDefinition, partOfSpeech }) => {
  const [showHint, setShowHint] = useState(false);
    
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 mb-2 md:mb-4">
      {/* Word Display */}
      <div className="flex justify-center items-center min-h-[60px] sm:min-h-[80px] bg-[#FFDEE2] rounded-xl p-3 sm:p-4 shadow-md w-full">
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
          {word.split("").map((letter, index) => (
            <div
              key={index}
              className={`w-6 sm:w-8 h-8 sm:h-10 flex items-center justify-center ${
                guessedLetters.includes(letter) ? "bounce-letter" : ""
              }`}
            >
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-langlearn-dark-blue">
                {guessedLetters.includes(letter) ? letter : "_"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hint Section */}
      {wordDefinition && (
        <div className="w-full max-w-2xl">
          {/* Hint Toggle Button */}
          <div className="flex justify-center mb-2">
            <button
              onClick={toggleHint}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <HelpCircle size={16} />
              <span className="text-sm font-medium">
                {showHint ? "Hide Hint" : "Show Hint"}
              </span>
              {showHint ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {/* Hint Content */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showHint ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
          }`}>
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">💡</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-amber-800">Hint:</span>
                    {partOfSpeech && (
                      <span className="px-2 py-1 bg-amber-200 text-amber-800 text-xs font-medium rounded-full">
                        {partOfSpeech}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {wordDefinition}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordDisplay;