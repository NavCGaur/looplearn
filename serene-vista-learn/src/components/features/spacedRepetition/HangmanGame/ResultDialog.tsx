import { AlertCircle } from "lucide-react";
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
}

const ResultDialog = ({
  showDialog,
  setShowDialog,
  gameStatus,
  word,
  onReset,
  actionText
}: ResultDialogProps) => {
  // Prevent dialog from showing if we're still playing
  if (gameStatus === 'playing') {
    return null;
  }

  const handleAction = () => {
    onReset();
    setShowDialog(false);
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
            onClick={handleAction}
            className={`w-full sm:w-auto ${
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