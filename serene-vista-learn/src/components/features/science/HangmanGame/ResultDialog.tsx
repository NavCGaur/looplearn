import { AlertCircle, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type GameStatus = 'playing' | 'won' | 'lost';

interface ResultDialogProps {
  showDialog: boolean;
  setShowDialog: (open: boolean) => void;
  gameStatus: GameStatus;
  word: string;
  onReset: () => void;
  actionText: string;
  correctCount: number;
  totalWords: number;
  isGameOver: boolean;
  currentWordScore?: number;
  totalScore?: number;
}

const ResultDialog = ({
  showDialog,
  setShowDialog,
  gameStatus,
  word,
  onReset,
  actionText,
  correctCount,
  totalWords,
  isGameOver,
  currentWordScore = 0,
  totalScore = 0,
}: ResultDialogProps) => {
  // Don't render if game is still playing
  if (gameStatus === 'playing') {
    return null;
  }

  console.log("ResultDialog rendered:", {
    gameStatus,
    word,
    correctCount,
    totalWords,
    isGameOver,
    currentWordScore,
    totalScore
  });

  const handleAction = () => {
    onReset();
    setShowDialog(false);
  };

  const getEncouragementMessage = () => {
    if (gameStatus === 'won') {
      const encouragements = [
        "Excellent work! 🌟",
        "Outstanding! 🎯",
        "You're getting better! 💪",
        "Great job! 🏆",
        "Well done! ⭐",
        "Fantastic! 🎉"
      ];
      return encouragements[Math.floor(Math.random() * encouragements.length)];
    } else {
      const encouragements = [
        "Don't give up! 💪",
        "Try again! 🌟",
        "You've got this! 🎯",
        "Keep going! ⭐",
        "Practice makes perfect! 📚",
        "You're learning! 🧠"
      ];
      return encouragements[Math.floor(Math.random() * encouragements.length)];
    }
  };

  return (
    <Dialog
      open={showDialog}
      onOpenChange={(open) => {
        if (!open) {
          handleAction();
        } else {
          setShowDialog(open);
        }
      }}
    >
      <DialogContent className={`sm:max-w-md ${
        gameStatus === "won"
          ? "bg-gradient-to-br from-green-50 to-blue-50 border-4 border-green-200"
          : "bg-gradient-to-br from-orange-50 to-red-50 border-4 border-red-200"
      }`}>
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center flex items-center justify-center gap-2">
            {gameStatus === "won" ? (
              <>
                <Trophy className="h-6 w-6 text-yellow-500" />
                Great Job!
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-red-500" />
                Try Again!
              </>
            )}
          </DialogTitle>
          
          <DialogDescription className="text-center text-base sm:text-lg">
            <div className="mb-3">
              {gameStatus === "won" ? (
                <span className="text-green-700">
                  {getEncouragementMessage()} You correctly guessed{" "}
                  <span className="font-bold uppercase text-green-600">"{word}"</span>!
                </span>
              ) : (
                <span className="text-red-700">
                  {getEncouragementMessage()} The word was{" "}
                  <span className="font-bold uppercase text-red-600">"{word}"</span>.
                </span>
              )}
            </div>
            
            {/* Points for current word */}
            {gameStatus === "won" && currentWordScore > 0 && (
              <div className="bg-white rounded-lg p-3 mb-3 shadow-inner">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-lg font-bold text-green-600">
                    +{currentWordScore} points!
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Base points: +10</p>
                  {currentWordScore > 10 && (
                    <p>Performance bonus: +{currentWordScore - 10}</p>
                  )}
                </div>
              </div>
            )}
          </DialogDescription>

          {/* Game completion stats */}
          {isGameOver && (
            <div className="mt-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-inner">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  🎮 Game Complete!
                </h3>
                
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="text-center">
                    <p className="text-gray-600">Words Correct</p>
                    <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Total Words</p>
                    <p className="text-2xl font-bold text-blue-600">{totalWords}</p>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <p className="text-gray-600 text-sm">Total Points Earned</p>
                  <p className="text-3xl font-bold text-purple-600">
                    +{totalScore}
                  </p>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  <p>Word points: {totalScore - 10} • Completion bonus: +10</p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <DialogFooter className="flex justify-center sm:justify-center">
          <Button
            onClick={handleAction}
            className={`w-full sm:w-auto font-semibold ${
              gameStatus === "won"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResultDialog;