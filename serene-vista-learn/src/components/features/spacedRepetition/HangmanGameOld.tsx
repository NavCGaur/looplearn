import React, { useState, useEffect } from "react";import { Check, X, RotateCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const HangmanGame = () => {
  // Default word for demonstration
  const initialWord = "elephant";
  const [word, setWord] = useState(initialWord);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing");
  const [showDialog, setShowDialog] = useState(false);
  const [showingAnimation, setShowingAnimation] = useState(false);
  
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const maxWrongGuesses = 6;
  
  useEffect(() => {
    // Check if player has won
    if (word.split("").every(letter => guessedLetters.includes(letter))) {
      setGameStatus("won");
      setShowDialog(true);
    }
  }, [guessedLetters, word]);
    
  // Separate effect for loss condition to avoid conflicts
  useEffect(() => {
    // Check if player has lost
    if (wrongGuesses >= maxWrongGuesses && gameStatus === "playing") {
      console.log("Game over - triggering lost state");
      setGameStatus("lost");
      setShowingAnimation(true);
      
      // Add delay before showing game over dialog
      setTimeout(() => {
        console.log("Animation complete - showing dialog");
        setShowDialog(true);
        setShowingAnimation(false);
      }, 3000); // 3 second delay for falling animation
    }
  }, [wrongGuesses, maxWrongGuesses, gameStatus]);
  
  const handleGuess = (letter) => {
    if (gameStatus !== "playing" || guessedLetters.includes(letter)) return;
    
    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    
    if (!word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      // Immediately check if game is lost after updating wrong guesses
      if (newWrongGuesses >= maxWrongGuesses) {
        console.log("Max wrong guesses reached:", newWrongGuesses);
      }
    }
  };
  
  const resetGame = () => {
    console.log("Resetting game");
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus("playing");
    setShowDialog(false);
    setShowingAnimation(false);
  };
  
  // Display word with correctly guessed letters and blanks for others
  const displayWord = word
    .split("")
    .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");
    
  // Create the facial expression based on wrong guesses
  const getFacialExpression = () => {
    if (wrongGuesses < 2) {
      // Happy face
      return (
        <>
          {/* Eyes - happy */}
          <circle cx="45" cy="28" r="1.5" className="fill-langlearn-dark-blue" />
          <circle cx="55" cy="28" r="1.5" className="fill-langlearn-dark-blue" />
          {/* Smile */}
          <path 
            d="M43 33 Q50 38 57 33" 
            fill="none" 
            className="stroke-langlearn-dark-blue stroke-1.5" 
            strokeLinecap="round" 
          />
        </>
      );
    } else {
      // Sad face
      return (
        <>
          {/* Eyes - sad */}
          <circle cx="45" cy="28" r="1.5" className="fill-langlearn-dark-blue" />
          <circle cx="55" cy="28" r="1.5" className="fill-langlearn-dark-blue" />
          {/* Frown */}
          <path 
            d="M43 36 Q50 31 57 36" 
            fill="none" 
            className="stroke-langlearn-dark-blue stroke-1.5" 
            strokeLinecap="round" 
          />
        </>
      );
    }
  };
  
  // Define CSS animation styles
  const hangmanFallingStyle = gameStatus === "lost" && showingAnimation ? {
    animation: "hangmanFalling 3s ease-in forwards",
  } : {};
  
  const hangmanFigureParts = [
    // Head with face
    <g key="head">
      <circle cx="50" cy="30" r="10" className="stroke-langlearn-orange fill-white stroke-2" />
      {getFacialExpression()}
    </g>,
    // Body
    <line key="body" x1="50" y1="40" x2="50" y2="70" className="stroke-langlearn-orange stroke-2" />,
    // Left arm
    <line key="left-arm" x1="50" y1="50" x2="30" y2="60" className="stroke-langlearn-orange stroke-2" />,
    // Right arm
    <line key="right-arm" x1="50" y1="50" x2="70" y2="60" className="stroke-langlearn-orange stroke-2" />,
    // Left leg
    <line key="left-leg" x1="50" y1="70" x2="30" y2="90" className="stroke-langlearn-orange stroke-2" />,
    // Right leg
    <line key="right-leg" x1="50" y1="70" x2="70" y2="90" className="stroke-langlearn-orange stroke-2" />
  ];
  
  return (
    <Card className="mx-auto max-w-lg md:max-w-4xl overflow-hidden bg-white shadow-lg border-4 border-langlearn-light-blue relative">
      {/* CSS Keyframes for falling animation */}
      <style>{`
        @keyframes hangmanFalling {
          0% { transform: translateY(0) rotate(0deg); }
          20% { transform: translateY(20px) rotate(15deg); }
          40% { transform: translateY(40px) rotate(-15deg); }
          50% { transform: translateY(50px) rotate(10deg); }
          60% { transform: translateY(60px) rotate(-10deg); }
          70% { transform: translateY(70px) rotate(5deg); }
          80% { transform: translateY(80px) rotate(-5deg); }
          100% { transform: translateY(100px) rotate(0deg); }
        }
        
        @keyframes bounceLetter {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .bounce-letter {
          animation: bounceLetter 0.5s ease;
        }

        .button-hover:hover button {
          transform: scale(1.05);
          transition: transform 0.2s ease;
        }
        
        .button-hover:active button {
          transform: scale(0.95);
          transition: transform 0.1s ease;
        }
      `}</style>

      {/* Retake button */}
      <Button 
        onClick={resetGame} 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 z-10 bg-langlearn-light-blue text-white hover:bg-langlearn-blue"
        title="Reset Game"
      >
        <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      
      <CardHeader className="bg-gradient-to-r from-langlearn-light-blue to-langlearn-blue text-white p-4">
        <CardTitle className="text-center text-xl sm:text-2xl md:text-3xl font-bold">Hangman Game</CardTitle>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 md:p-6 bg-[#F2FCE2]">
        {/* Game display area - Stacked on mobile, side-by-side on larger screens */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Hangman figure - Full width on mobile, 1/3 on larger screens */}
          <div className="w-full md:w-1/3 bg-white rounded-xl p-3 sm:p-4 shadow-md">
            <div className="aspect-square relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Gallows */}
                <line x1="10" y1="95" x2="90" y2="95" className="stroke-langlearn-dark-blue stroke-2" />
                <line x1="30" y1="95" x2="30" y2="10" className="stroke-langlearn-dark-blue stroke-2" />
                <line x1="30" y1="10" x2="50" y2="10" className="stroke-langlearn-dark-blue stroke-2" />
                <line x1="50" y1="10" x2="50" y2="20" className="stroke-langlearn-dark-blue stroke-2" />
                
                {/* Additional style for the falling hangman figure */}
                <style>
                {`
                  .hangman-figure {
                    transform-origin: 50px 20px;
                    transform-box: fill-box;
                  }
                `}
                </style>
                
                {/* Hangman figure - either normal or falling animation */}
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
          
          {/* Word display and alphabet - Full width on mobile, 2/3 on larger screens */}
          <div className="w-full md:w-2/3 flex flex-col gap-4 md:gap-6">
            {/* Current word */}
            <div className="flex justify-center items-center mb-2 md:mb-4 min-h-[60px] sm:min-h-[80px] bg-[#FFDEE2] rounded-xl p-3 sm:p-4 shadow-md">
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
            
            {/* Alphabet buttons - Responsive grid */}
            <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-9 gap-1 sm:gap-2 bg-[#D3E4FD] rounded-xl p-3 sm:p-4 shadow-md">
              {alphabet.map((letter) => (
                <div
                  key={letter}
                  className="button-hover"
                >
                  <Button
                    onClick={() => handleGuess(letter)}
                    disabled={guessedLetters.includes(letter) || gameStatus !== "playing"}
                    variant={
                      !guessedLetters.includes(letter) 
                        ? "default" 
                        : word.includes(letter) 
                          ? "outline"
                          : "secondary"
                    }
                    className={`w-full h-8 sm:h-10 px-1 sm:px-2 text-sm sm:text-base md:text-lg font-bold uppercase ${
                      guessedLetters.includes(letter) && word.includes(letter)
                        ? "bg-green-100 text-green-700 border-green-300"
                        : guessedLetters.includes(letter)
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-langlearn-blue hover:bg-langlearn-dark-blue"
                    }`}
                  >
                    {letter}
                    {guessedLetters.includes(letter) && word.includes(letter) && (
                      <Check className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    {guessedLetters.includes(letter) && !word.includes(letter) && (
                      <X className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Result dialog */}
        <Dialog 
          open={showDialog} 
          onOpenChange={(open) => {
            console.log("Dialog open state changed:", open);
            setShowDialog(open);
          }}
        >
          <DialogContent className={`sm:max-w-md ${
            gameStatus === "won" 
              ? "bg-gradient-to-br from-green-50 to-blue-50 border-4 border-green-200" 
              : "bg-gradient-to-br from-orange-50 to-red-50 border-4 border-red-200"
          }`}>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
                {gameStatus === "won" ? "You Won! 🎉" : "Game Over 😢"}
              </DialogTitle>
              <DialogDescription className="text-center text-base sm:text-lg">
                {gameStatus === "won" 
                  ? `Congratulations! You correctly guessed "${word}"!` 
                  : `Oh no! The word was "${word}". Better luck next time!`}
              </DialogDescription>
            </DialogHeader>
            {gameStatus === "lost" && (
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500" />
              </div>
            )}
            <DialogFooter className="flex justify-center sm:justify-center">
              <Button
                onClick={resetGame}
                className={`w-full sm:w-auto ${
                  gameStatus === "won" 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {gameStatus === "won" ? "Play Again" : "Try Again"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default HangmanGame;