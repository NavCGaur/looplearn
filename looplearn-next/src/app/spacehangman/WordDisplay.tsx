import { motion, AnimatePresence } from "framer-motion";

interface WordDisplayProps {
  word: string;
  guessedLetters: string[];
}

const WordDisplay = ({ word, guessedLetters }: WordDisplayProps) => (
  <div className="flex justify-center gap-2 sm:gap-3 flex-wrap px-2">
    {word.split("").map((letter, i) => {
      const revealed = guessedLetters.includes(letter);
      return (
        <motion.div
          key={i}
          className="relative w-11 h-14 sm:w-14 sm:h-16 flex items-center justify-center"
          animate={revealed ? { 
            scale: [1, 1.25, 1],
          } : {}}
          transition={{ 
            type: "spring", 
            stiffness: 600,
            damping: 15,
            duration: 0.4
          }}
        >
          {/* Multi-layer glow when revealed */}
          {revealed && (
            <>
              <motion.div
                className="absolute inset-0 bg-green-400/30 rounded-xl blur-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.6, 0.3], scale: [0.8, 1.3, 1] }}
                transition={{ duration: 0.6 }}
              />
              <motion.div
                className="absolute inset-0 bg-green-300/20 rounded-xl blur-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0.2] }}
                transition={{ duration: 0.4 }}
              />
            </>
          )}

          {/* Letter box */}
          <div className={`relative w-full h-full rounded-xl border-2 transition-all duration-300 ${
            revealed 
              ? "border-green-400/60 bg-gradient-to-br from-green-500/20 via-green-400/15 to-emerald-500/20 shadow-[0_0_20px_rgba(74,222,128,0.3)]" 
              : "border-white/25 bg-gradient-to-br from-white/15 via-white/10 to-white/5"
          } backdrop-blur-md shadow-xl overflow-hidden`}>
            {/* Inner depth shadows */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5 pointer-events-none" />

            {/* Letter content */}
            <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                {revealed ? (
                  <motion.span
                    key={`revealed-${i}`}
                    initial={{ opacity: 0, rotateY: 90, scale: 0.5 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                      duration: 0.5
                    }}
                    className="text-2xl sm:text-3xl font-bold font-fredoka text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]"
                    style={{
                      textShadow: "0 0 10px rgba(74,222,128,0.5), 0 2px 4px rgba(0,0,0,0.3)"
                    }}
                  >
                    {letter}
                  </motion.span>
                ) : (
                  <motion.div
                    key={`hidden-${i}`}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="text-2xl sm:text-3xl font-bold font-fredoka text-white/20">
                      _
                    </span>
                    {/* Subtle pulse for unrevealed */}
                    <motion.div
                      className="w-6 h-0.5 bg-white/20 rounded-full"
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Highlight overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
              }}
            />

            {/* Success shimmer */}
            {revealed && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}
          </div>
        </motion.div>
      );
    })}
  </div>
);

export default WordDisplay;
