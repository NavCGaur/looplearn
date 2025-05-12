import React from "react";

const HangmanFigure = ({ wrongGuesses, gameStatus, showingAnimation, maxWrongGuesses }) => {
  // Add tears when 4 or more wrong guesses (appears same time as right arm)
  const showTears = wrongGuesses >= 4 && gameStatus === "playing";

  const getFacialExpression = () => {
    if (wrongGuesses < 2) {
      return (
        <>
          <circle cx="45" cy="28" r="1.5" className="fill-langlearn-dark-blue" />
          <circle cx="55" cy="28" r="1.5" className="fill-langlearn-dark-blue" />
          <path 
            d="M43 33 Q50 38 57 33" 
            fill="none" 
            className="stroke-langlearn-dark-blue stroke-1.5" 
            strokeLinecap="round" 
          />
          {/* Tears will appear here when showTears is true */}
          {showTears && (
            <>
              {/* Left tear */}
              <path
                d="M45 30 Q43 34 41 39"
                fill="none"
                className="stroke-blue-400 stroke-1.5 animate-drip"
              />
              <circle
                cx="41"
                cy="39"
                r="1"
                className="fill-blue-400 animate-drip-drop"
              />
              
              {/* Right tear */}
              <path
                d="M55 30 Q57 34 59 39"
                fill="none"
                className="stroke-blue-400 stroke-1.5 animate-drip"
                style={{ animationDelay: "0.5s" }}
              />
              <circle
                cx="59"
                cy="39"
                r="1"
                className="fill-blue-400 animate-drip-drop"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          )}
        </>
      );
    } else {
      return (
        <>
          <circle cx="45" cy="28" r="1.5" className="fill-langlearn-dark-blue" />
          <circle cx="55" cy="28" r="1.5" className="fill-langlearn-dark-blue" />
          <path 
            d="M43 36 Q50 31 57 36" 
            fill="none" 
            className="stroke-langlearn-dark-blue stroke-1.5" 
            strokeLinecap="round" 
          />
          {/* Tears will appear here when showTears is true */}
          {showTears && (
            <>
              {/* Left tear */}
              <path
                d="M45 30 Q43 34 41 39"
                fill="none"
                className="stroke-blue-400 stroke-1.5 animate-drip"
              />
              <circle
                cx="41"
                cy="39"
                r="1"
                className="fill-blue-400 animate-drip-drop"
              />
              
              {/* Right tear */}
              <path
                d="M55 30 Q57 34 59 39"
                fill="none"
                className="stroke-blue-400 stroke-1.5 animate-drip"
                style={{ animationDelay: "0.5s" }}
              />
              <circle
                cx="59"
                cy="39"
                r="1"
                className="fill-blue-400 animate-drip-drop"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          )}
        </>
      );
    }
  };
  
  const hangmanFallingStyle = gameStatus === "lost" && showingAnimation ? {
    animation: "hangmanFalling 3s ease-in forwards",
  } : {};
  
  const hangmanFigureParts = [
    <g key="head">
      <circle cx="50" cy="30" r="10" className="stroke-langlearn-orange fill-white stroke-2" />
      {getFacialExpression()}
    </g>,
    <line key="body" x1="50" y1="40" x2="50" y2="70" className="stroke-langlearn-orange stroke-2" />,
    <line key="left-arm" x1="50" y1="50" x2="30" y2="60" className="stroke-langlearn-orange stroke-2" />,
    <line key="right-arm" x1="50" y1="50" x2="70" y2="60" className="stroke-langlearn-orange stroke-2" />,
    <line key="left-leg" x1="50" y1="70" x2="30" y2="90" className="stroke-langlearn-orange stroke-2" />,
    <line key="right-leg" x1="50" y1="70" x2="70" y2="90" className="stroke-langlearn-orange stroke-2" />
  ];
  
  return (
    <div className="w-full md:w-1/3 bg-white rounded-xl p-3 sm:p-4 shadow-md">
      <div className="aspect-square relative">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <line x1="10" y1="95" x2="90" y2="95" className="stroke-langlearn-dark-blue stroke-2" />
          <line x1="30" y1="95" x2="30" y2="10" className="stroke-langlearn-dark-blue stroke-2" />
          <line x1="30" y1="10" x2="50" y2="10" className="stroke-langlearn-dark-blue stroke-2" />
          <line x1="50" y1="10" x2="50" y2="20" className="stroke-langlearn-dark-blue stroke-2" />
          
          <style>
          {`
            .hangman-figure {
              transform-origin: 50px 20px;
              transform-box: fill-box;
            }
            
            @keyframes drip {
              0% {
                opacity: 0;
                transform: translateY(0);
              }
              50% {
                opacity: 1;
              }
              100% {
                opacity: 0;
                transform: translateY(2px);
              }
            }
            
            @keyframes drip-drop {
              0% {
                opacity: 0;
                transform: translateY(-5px);
              }
              50% {
                opacity: 1;
              }
              100% {
                opacity: 0;
                transform: translateY(5px);
              }
            }
            
            .animate-drip {
              animation: drip 2s infinite;
            }
            
            .animate-drip-drop {
              animation: drip-drop 2s infinite;
            }
          `}
          </style>
          
          {gameStatus === "lost" && showingAnimation ? (
            <g style={hangmanFallingStyle} className="hangman-figure">
              {hangmanFigureParts}
            </g>
          ) : (
            <>{hangmanFigureParts.slice(0, wrongGuesses)}</>
          )}
        </svg>
      </div>
      <div className="text-center mt-2">
        <span className="inline-block bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs sm:text-sm font-semibold">
          Wrong Guesses: {wrongGuesses} / {maxWrongGuesses}
        </span>
      </div>
    </div>
  );
};

export default HangmanFigure;