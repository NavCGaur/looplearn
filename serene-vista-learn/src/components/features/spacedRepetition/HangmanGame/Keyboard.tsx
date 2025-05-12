import React from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Keyboard = ({ guessedLetters, word, gameStatus, onGuess }) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  
  return (
    <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-9 gap-1 sm:gap-2 bg-[#D3E4FD] rounded-xl p-3 sm:p-4 shadow-md">
      {alphabet.map((letter) => (
        <div key={letter} className="button-hover">
          <Button
            onClick={() => onGuess(letter)}
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
  );
};

export default Keyboard;