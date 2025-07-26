import React, { useState, useEffect } from "react";
import { RotateCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import HangmanFigure from "./HangmanFigure.tsx";
import WordDisplay from "./WordDisplay.tsx";
import Keyboard from "./Keyboard.tsx";
import ResultDialog from "./ResultDialog.tsx";
import GameHeader from "./GameHeader.tsx";
import "./animations.css";

import { useAddPointsMutation } from "@/state/api/vocabApi";

type GameStatus = 'playing' | 'won' | 'lost';

interface VocabularyItem {
  wordId: {
    word: string;
    definition: string;
    partOfSpeech?: string;
    wordHindi?: string;
    definitionHindi?: string;
    exampleSentence?: string;
    exampleSentenceHindi?: string;
    difficulty?: number;
    pronunciationUrl?: string;
  };
  addedAt: string;
  lastReviewed: string;
  nextReviewDate: string;
  rating: number;
}

const HangmanGame = () => {
  //@ts-ignore
  const vocabularyItems = useSelector((state) => state.auth?.user?.vocabulary || []) as VocabularyItem[];
  
  const [gameWords, setGameWords] = useState<VocabularyItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [showDialog, setShowDialog] = useState(false);
  const [showingAnimation, setShowingAnimation] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [currentWordScore, setCurrentWordScore] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  
  // Track points awarded to prevent duplicates
  const [pointsAwarded, setPointsAwarded] = useState<Set<string>>(new Set());

  const [addPoints] = useAddPointsMutation();
  //@ts-ignore
  const userId = useSelector((state) => state.auth?.user?.uid);

  const maxWrongGuesses = 6;
  const currentWordItem = gameWords[currentWordIndex];
  const currentWord = currentWordItem?.wordId?.word?.toLowerCase() || '';

  // Initialize game words when vocabulary items are available
  useEffect(() => {
    if (vocabularyItems.length > 0 && !isInitialized) {
      const words = getRandomWords();
      setGameWords(words);
      setIsInitialized(true);
      setGameStartTime(Date.now());
    }
  }, [vocabularyItems, isInitialized]);

  // Check for win condition
  useEffect(() => {
    if (!currentWord || gameStatus !== "playing" || !currentWord.length) return;
    
    // Only check letters (ignore spaces, punctuation)
    const lettersInWord = currentWord.replace(/[^a-z]/g, '');
    const uniqueLettersInWord = new Set(lettersInWord.split(""));
    
    if (uniqueLettersInWord.size === 0) return;
    
    const hasGuessedAllLetters = Array.from(uniqueLettersInWord).every(letter => 
      guessedLetters.includes(letter)
    );
    
    if (hasGuessedAllLetters) {
      setGameStatus("won");
      
      // Award points for correct word (only once per word)
      const pointKey = `word-${currentWordIndex}`;
      if (!pointsAwarded.has(pointKey)) {
        const wordPoints = calculateWordPoints();
        setCurrentWordScore(wordPoints);
        setTotalScore(prev => prev + wordPoints);
        setPointsAwarded(prev => new Set(prev).add(pointKey));
        
        // Award points via API
        if (userId) {
          addPoints({
            userId,
            points: wordPoints,
            reason: "hangmanWordGuessed"
          }).catch(error => console.error("Error awarding word points:", error));
        }
      }
      
      // Small delay to show the completed word before dialog
      setTimeout(() => {
        setShowDialog(true);
      }, 500);
    }
  }, [guessedLetters, currentWord, gameStatus, currentWordIndex, pointsAwarded, userId, addPoints]);
    
  // Check for loss condition
  useEffect(() => {
    if (wrongGuesses >= maxWrongGuesses && gameStatus === "playing") {
      setGameStatus("lost");
      setCurrentWordScore(0);
      setShowingAnimation(true);
      
      setTimeout(() => {
        setShowDialog(true);
        setShowingAnimation(false);
      }, 3000);
    }
  }, [wrongGuesses, maxWrongGuesses, gameStatus]);

  // Calculate points for current word based on difficulty and performance
  const calculateWordPoints = () => {
    let points = 10; // Base points for each word
    
    // Bonus for fewer wrong guesses
    if (wrongGuesses === 0) points += 5; // Perfect guess bonus
    else if (wrongGuesses <= 2) points += 2; // Good performance bonus
    
    // Difficulty bonus (if available)
    const difficulty = currentWordItem?.wordId?.difficulty || 1;
    if (difficulty > 3) points += 3; // Hard word bonus
    else if (difficulty > 1) points += 1; // Medium word bonus
    
    return points;
  };

  const handleGuess = (letter: string) => {
    if (gameStatus !== "playing" || guessedLetters.includes(letter)) return;
    
    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    
    if (!currentWord.includes(letter)) {
      setWrongGuesses(prev => prev + 1);
    }
  };
  
  const resetCurrentWord = () => {
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus("playing");
    setShowDialog(false);
    setShowingAnimation(false);
    setCurrentWordScore(0);
  };

  // Get random words from vocabulary
  const getRandomWords = () => {
    const wordsToUse = Math.min(5, vocabularyItems.length);
    const shuffled = [...vocabularyItems]
      .sort(() => 0.5 - Math.random())
      .slice(0, wordsToUse);

    console.log("New game words:", shuffled);
    return shuffled;
  };

  const moveToNextWord = () => {
    const nextIndex = currentWordIndex + 1;
    setCorrectCount(prev => prev + (gameStatus === "won" ? 1 : 0));

    if (nextIndex >= gameWords.length) {
      // Game complete - award completion bonus
      const completionBonus = 10;
      setTotalScore(prev => prev + completionBonus);
      
      if (userId && !pointsAwarded.has("completion")) {
        addPoints({
          userId,
          points: completionBonus,
          reason: "hangmanGameComplete"
        }).catch(error => console.error("Error awarding completion bonus:", error));
        
        setPointsAwarded(prev => new Set(prev).add("completion"));
      }
      
      setIsGameComplete(true);
      setShowDialog(true);
      return;
    }

    // Move to next word
    setCurrentWordIndex(nextIndex);
    resetCurrentWord();
  };

  const startNewGame = () => {
    const newWords = getRandomWords();
    setGameWords(newWords);
    setCurrentWordIndex(0);
    setCorrectCount(0);
    setTotalScore(0);
    setPointsAwarded(new Set());
    setIsGameComplete(false);
    setGameStartTime(Date.now());
    resetCurrentWord();
  };

  // Loading state
  if (!isInitialized || gameWords.length === 0) {
    return (
      <Card className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl overflow-hidden bg-white shadow-lg border-4 border-langlearn-light-blue relative">
        <CardContent className="p-6 text-center bg-[#F2FCE2]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your vocabulary words...</p>
        </CardContent>
      </Card>
    );
  }

  // Game complete screen
  if (isGameComplete) {
    return (
      <Card className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl overflow-hidden bg-white shadow-lg border-4 border-langlearn-light-blue relative">
        <GameHeader onReset={startNewGame} />
        <CardContent className="p-6 text-center bg-[#F2FCE2]">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2 text-green-700">🎉 Congratulations!</h2>
            <p className="text-xl mb-4 text-gray-800">You've completed the hangman challenge!</p>
            
            <div className="bg-white rounded-lg p-4 mb-4 shadow-inner">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-600">Words Guessed Correctly:</p>
                  <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Words:</p>
                  <p className="text-2xl font-bold text-blue-600">{gameWords.length}</p>
                </div>
                <div className="col-span-2 border-t pt-2">
                  <p className="text-sm text-gray-600">Total Points Earned:</p>
                  <p className="text-3xl font-bold text-purple-600">+{totalScore}</p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <p>⭐ Word points: {totalScore - 10} pts</p>
              <p>🏆 Completion bonus: +10 pts</p>
            </div>
          </div>

          <button
            onClick={startNewGame}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Play Again
          </button>
        </CardContent>
      </Card>
    );
  }

  // Main game UI
  return (
    <Card className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl overflow-hidden bg-white shadow-lg border-4 border-langlearn-light-blue relative">
      <GameHeader onReset={startNewGame} />
      
      {/* Game Progress */}
      <div className="bg-blue-50 px-4 py-2 border-b">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Word {currentWordIndex + 1} of {gameWords.length}
          </span>
          <span className="text-blue-600 font-semibold">
            Score: {totalScore} pts
          </span>
          <span className="text-gray-600">
            Correct: {correctCount}
          </span>
        </div>
      </div>
      
      <CardContent className="p-3 sm:p-4 md:p-6 bg-[#F2FCE2]">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <HangmanFigure 
            wrongGuesses={wrongGuesses} 
            gameStatus={gameStatus} 
            showingAnimation={showingAnimation} 
            maxWrongGuesses={maxWrongGuesses}
          />
          
          <div className="w-full md:w-2/3 flex flex-col gap-4 md:gap-6">
            <WordDisplay 
              word={currentWord} 
              guessedLetters={guessedLetters}
              wordDefinition={currentWordItem?.wordId?.definition}
              partOfSpeech={currentWordItem?.wordId?.partOfSpeech}
            />
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
          onReset={moveToNextWord}
          actionText={currentWordIndex + 1 >= gameWords.length ? "Complete Game" : "Next Word"}
          correctCount={correctCount}
          totalWords={gameWords.length}
          isGameOver={isGameComplete}
          currentWordScore={currentWordScore}
          totalScore={totalScore}
        />
      </CardContent>
    </Card>
  );
};

export default HangmanGame;