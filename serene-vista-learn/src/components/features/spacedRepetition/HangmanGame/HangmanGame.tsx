import React, { useState, useEffect } from "react";
import { RotateCw } from "lucide-react";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import HangmanFigure from "./HangmanFigure.tsx";
import WordDisplay from "./WordDisplay.tsx";
import Keyboard from "./Keyboard.tsx";
import ResultDialog from "./ResultDialog.tsx";
import GameHeader from "./GameHeader.tsx";
import "./animations.css";

type GameStatus = 'playing' | 'won' | 'lost';

const HangmanGame = () => {
  //@ts-ignore
  const vocabularyItems = useSelector((state) => state.auth?.user?.vocabulary || []) as VocabularyItem[];
  
  const [gameWords, setGameWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [showDialog, setShowDialog] = useState(false);
  const [showingAnimation, setShowingAnimation] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Add initialization flag
  
  const maxWrongGuesses = 6;
  const currentWord = gameWords[currentWordIndex] || '';

  // Initialize game words when vocabulary items are available
  useEffect(() => {
    if (vocabularyItems.length > 0 && !isInitialized) {
      const words = getRandomWords();
      setGameWords(words);
      setIsInitialized(true);
    }
  }, [vocabularyItems, isInitialized]);

  // Check for win condition
  useEffect(() => {
    if (!currentWord || gameStatus !== "playing") return;
    
    const uniqueLettersInWord = new Set(currentWord.split(""));
    const hasGuessedAllLetters = Array.from(uniqueLettersInWord).every(letter => 
      guessedLetters.includes(letter)
    );
    
    if (hasGuessedAllLetters && currentWord.length > 0) {
      setGameStatus("won");
      setShowDialog(true);
    }
  }, [guessedLetters, currentWord, gameStatus]);
    
  // Check for loss condition
  useEffect(() => {
    if (wrongGuesses >= maxWrongGuesses && gameStatus === "playing") {
      setGameStatus("lost");
      setShowingAnimation(true);
      
      setTimeout(() => {
        setShowDialog(true);
        setShowingAnimation(false);
      }, 3000);
    }
  }, [wrongGuesses, maxWrongGuesses, gameStatus]);

  const handleGuess = (letter: string) => {
    if (gameStatus !== "playing" || guessedLetters.includes(letter)) return;
    
    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    
    if (!currentWord.includes(letter)) {
      setWrongGuesses(wrongGuesses + 1);
    }
  };
  
  const resetGame = () => {
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus("playing");
    setShowDialog(false);
    setShowingAnimation(false);
  };

  // Get 5 random unique words from vocabulary
  const getRandomWords = () => {
    const shuffled = [...vocabularyItems]
      // Shuffle the array
      .sort(() => 0.5 - Math.random())
      // Take first 5 (or all if less than 5)
      .slice(0, Math.min(5, vocabularyItems.length))
      // Extract the word strings
      .map(item => item.wordId.word.toLowerCase());

    console.log("Shuffled Words:", shuffled);
    return shuffled;
  };

  const moveToNextWord = () => {
    const nextIndex = currentWordIndex + 1;
    setCurrentWordIndex(nextIndex);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus("playing");
    setShowDialog(false);
    setShowingAnimation(false);
  };

  const startNewGame = () => {
    const newWords = getRandomWords();
    setGameWords(newWords);
    setCurrentWordIndex(0);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus("playing");
    setShowDialog(false);
    setShowingAnimation(false);
  };

  return (
    <Card className="mx-auto max-w-lg md:max-w-4xl overflow-hidden bg-white shadow-lg border-4 border-langlearn-light-blue relative">
      <GameHeader onReset={resetGame} />
      
      <CardContent className="p-3 sm:p-4 md:p-6 bg-[#F2FCE2]">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <HangmanFigure 
            wrongGuesses={wrongGuesses} 
            gameStatus={gameStatus} 
            showingAnimation={showingAnimation} 
            maxWrongGuesses={maxWrongGuesses}
          />
          
          <div className="w-full md:w-2/3 flex flex-col gap-4 md:gap-6">
            <WordDisplay word={currentWord} guessedLetters={guessedLetters} />
            <Keyboard 
              guessedLetters={guessedLetters} 
              word={currentWord} 
              gameStatus={gameStatus} 
              onGuess={handleGuess} 
            />
          </div>
        </div>
        
        <ResultDialog 
          showDialog={showDialog} 
          setShowDialog={setShowDialog}
          gameStatus={gameStatus}
          word={currentWord}
          onReset={
            currentWordIndex < gameWords.length - 1 
              ? moveToNextWord 
              : startNewGame
          }
          actionText={
            currentWordIndex < gameWords.length - 1 
              ? "Next Word" 
              : "Play Again"
          }
        />
      </CardContent>
    </Card>
  );
};

export default HangmanGame;