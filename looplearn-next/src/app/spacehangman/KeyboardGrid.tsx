import { motion } from "framer-motion";

const ROWS = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  "ZXCVBNM".split(""),
];

interface KeyboardGridProps {
  guessedLetters: string[];
  word: string;
  disabled: boolean;
  onGuess: (letter: string) => void;
}

const KeyboardGrid = ({ guessedLetters, word, disabled, onGuess }: KeyboardGridProps) => (
  <div className="space-y-2.5">
    {ROWS.map((row, ri) => (
      <div key={ri} className="flex justify-center gap-1.5 sm:gap-2">
        {row.map((letter) => {
          const guessed = guessedLetters.includes(letter);
          const correct = guessed && word.includes(letter);
          const wrong = guessed && !word.includes(letter);

          return (
            <motion.button
              key={letter}
              onClick={() => onGuess(letter)}
              disabled={guessed || disabled}
              whileTap={!guessed && !disabled ? { scale: 0.85 } : {}}
              whileHover={!guessed && !disabled ? { scale: 1.1, y: -2 } : {}}
              className={`relative w-9 h-11 sm:w-11 sm:h-13 rounded-xl text-sm sm:text-base font-bold font-fredoka transition-all duration-200 ${
                correct
                  ? "bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white shadow-[0_4px_16px_rgba(34,197,94,0.4)] border-2 border-green-400/50"
                  : wrong
                  ? "bg-gradient-to-br from-red-500/40 via-red-600/40 to-red-700/40 text-white/50 opacity-40 border-2 border-red-500/20"
                  : "bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-md border-2 border-white/30 text-white shadow-lg hover:shadow-xl hover:border-white/40 active:border-white/50 hover:from-white/25 hover:via-white/20 hover:to-white/15"
              } disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:y-0`}
            >
              {/* Inner depth effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 rounded-xl pointer-events-none" />
              
              {/* Letter */}
              <span className="relative z-10 drop-shadow-md">{letter}</span>

              {/* Correct answer glow */}
              {correct && (
                <>
                  <motion.div
                    className="absolute inset-0 bg-green-400/30 rounded-xl blur-md -z-10"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div 
                    className="absolute inset-0 rounded-xl opacity-40 pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%)",
                    }}
                  />
                </>
              )}

              {/* Hover glow for available keys */}
              {!guessed && !disabled && (
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-xl -z-10 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}

              {/* Shine effect */}
              {!wrong && (
                <div 
                  className="absolute inset-0 rounded-xl pointer-events-none opacity-20"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 40%)",
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    ))}
  </div>
);

export default KeyboardGrid;
