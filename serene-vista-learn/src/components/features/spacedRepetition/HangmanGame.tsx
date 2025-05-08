import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCw } from "lucide-react";
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

const HangmanGame: React.FC = () => {
  // Default word for demonstration
  const initialWord = "elephant";
  const [word, setWord] = useState<string>(initialWord);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [showingAnimation, setShowingAnimation] = useState<boolean>(false);
  
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const maxWrongGuesses = 6;
  
  useEffect(() => {
    // Check if player has won
    if (word.split("").every(letter => guessedLetters.includes(letter))) {
      setGameStatus("won");
      setShowDialog(true);
    }
    
    // Check if player has lost with a delay to show the complete hangman
    if (wrongGuesses >= maxWrongGuesses && gameStatus === "playing") {
      setGameStatus("lost");
      setShowingAnimation(true);
      
      // Add delay before showing game over dialog
      setTimeout(() => {
        setShowDialog(true);
        setShowingAnimation(false);
      }, 5000); // 5 second delay for falling animation
    }
  }, [guessedLetters, wrongGuesses, word, gameStatus]);
  
  const handleGuess = (letter: string) => {
    if (gameStatus !== "playing" || guessedLetters.includes(letter)) return;
    
    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    
    if (!word.includes(letter)) {
      setWrongGuesses(prev => prev + 1);
    }
  };
  
  const resetGame = () => {
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
    <Card className="m-6 overflow-hidden bg-white shadow-lg border-4 border-langlearn-light-blue relative">
      {/* Retake button */}
      <Button 
        onClick={resetGame} 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 z-10 bg-langlearn-light-blue text-white hover:bg-langlearn-blue"
        title="Reset Game"
      >
        <RotateCw className="h-5 w-5" />
      </Button>
      
      <CardHeader className="bg-gradient-to-r from-langlearn-light-blue to-langlearn-blue text-white">
        <CardTitle className="text-center text-3xl font-bold">Hangman Game</CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-[#F2FCE2]">
        {/* Game display area */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Hangman figure */}
          <div className="w-full md:w-1/3 bg-white rounded-xl p-4 shadow-md">
            <div className="aspect-square relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Gallows */}
                <line x1="10" y1="95" x2="90" y2="95" className="stroke-langlearn-dark-blue stroke-2" />
                <line x1="30" y1="95" x2="30" y2="10" className="stroke-langlearn-dark-blue stroke-2" />
                <line x1="30" y1="10" x2="50" y2="10" className="stroke-langlearn-dark-blue stroke-2" />
                <line x1="50" y1="10" x2="50" y2="20" className="stroke-langlearn-dark-blue stroke-2" />
                
                {/* Hangman figure - either normal or falling animation */}
                {gameStatus === "lost" && showingAnimation ? (
                  <motion.g
                    initial={{ rotate: 0, y: 0 }}
                    animate={{ 
                      rotate: [0, 15, -15, 10, -10, 5, -5, 0],
                      y: [0, 100],
                    }}
                    transition={{ 
                      duration: 3,
                      times: [0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 1],
                      ease: "easeIn" 
                    }}
                    //@ts-ignore
                    transformOrigin="50 20"
                  >
                    {hangmanFigureParts}
                  </motion.g>
                ) : (
                  <>{hangmanFigureParts.slice(0, wrongGuesses)}</>
                )}
              </svg>
            </div>
            <div className="text-center mt-2">
              <span className="inline-block bg-red-100 text-red-800 rounded-full px-3 py-1 text-sm font-semibold">
                Wrong Guesses: {wrongGuesses} / {maxWrongGuesses}
              </span>
            </div>
          </div>
          
          {/* Word display and alphabet */}
          <div className="w-full md:w-2/3 flex flex-col gap-6">
            {/* Current word */}
            <div className="flex justify-center items-center mb-4 min-h-[80px] bg-[#FFDEE2] rounded-xl p-4 shadow-md">
              <div className="flex gap-2">
                {word.split("").map((letter, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ 
                      y: 0, 
                      opacity: 1,
                      scale: guessedLetters.includes(letter) ? [1, 1.2, 1] : 1
                    }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    className="w-8 h-10 flex items-center justify-center"
                  >
                    <span className="text-3xl font-bold text-langlearn-dark-blue">
                      {guessedLetters.includes(letter) ? letter : "_"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Alphabet buttons */}
            <div className="grid grid-cols-7 sm:grid-cols-9 gap-2 bg-[#D3E4FD] rounded-xl p-4 shadow-md">
              {alphabet.map((letter) => (
                <motion.div
                  key={letter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
                    className={`w-full text-lg font-bold uppercase ${
                      guessedLetters.includes(letter) && word.includes(letter)
                        ? "bg-green-100 text-green-700 border-green-300"
                        : guessedLetters.includes(letter)
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-langlearn-blue hover:bg-langlearn-dark-blue"
                    }`}
                  >
                    {letter}
                    {guessedLetters.includes(letter) && word.includes(letter) && (
                      <Check className="ml-1 h-4 w-4" />
                    )}
                    {guessedLetters.includes(letter) && !word.includes(letter) && (
                      <X className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Result dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className={`sm:max-w-md ${
            gameStatus === "won" 
              ? "bg-gradient-to-br from-green-50 to-blue-50 border-4 border-green-200" 
              : "bg-gradient-to-br from-orange-50 to-red-50 border-4 border-red-200"
          }`}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                {gameStatus === "won" ? "You Won! 🎉" : "Game Over 😢"}
              </DialogTitle>
              <DialogDescription className="text-center text-lg">
                {gameStatus === "won" 
                  ? `Congratulations! You correctly guessed "${word}"!` 
                  : `Oh no! The word was "${word}". Better luck next time!`}
              </DialogDescription>
            </DialogHeader>
            {gameStatus === "lost" && (
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
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