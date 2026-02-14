import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Rocket } from "lucide-react";
import type { GameStatus } from "@/hooks/useSpaceHangman";

interface ResultOverlayProps {
  gameStatus: GameStatus;
  word: string;
  score: number;
  onRetry: () => void;
  onNext: () => void;
}

const ResultOverlay = ({ gameStatus, word, score, onRetry, onNext }: ResultOverlayProps) => (
  <AnimatePresence>
    {gameStatus !== "playing" && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl rounded-3xl"
      >
        {/* Ambient particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30 - Math.random() * 20, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        <motion.div
          initial={{ y: 40, scale: 0.9, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: -20, scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative text-center p-8 max-w-md"
        >
          {/* Glow behind content */}
          <div className={`absolute inset-0 ${
            gameStatus === "won" 
              ? "bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-teal-500/20" 
              : "bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-purple-500/20"
          } rounded-3xl blur-3xl`} />

          {/* Content card */}
          <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20 p-8 shadow-2xl">
            {/* Card shine */}
            <div 
              className="absolute inset-0 rounded-3xl opacity-30 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
              }}
            />

            {/* Emoji with animation */}
            <motion.div
              className="text-7xl mb-6 relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: [0, 1.3, 1],
                rotate: [180, -10, 10, 0],
              }}
              transition={{ 
                duration: 0.8,
                ease: "backOut",
                times: [0, 0.6, 1]
              }}
            >
              {gameStatus === "won" ? (
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🚀
                </motion.div>
              ) : (
                <motion.div
                  animate={{ 
                    rotate: [0, -3, 3, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🌍
                </motion.div>
              )}

              {/* Emoji glow */}
              <div className={`absolute inset-0 ${
                gameStatus === "won" ? "bg-green-400/30" : "bg-blue-400/30"
              } rounded-full blur-2xl -z-10`} />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl font-bold font-fredoka text-white mb-3 drop-shadow-lg"
            >
              {gameStatus === "won" ? "Mission Successful!" : "Mission Delayed"}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 font-fredoka text-base sm:text-lg mb-2"
            >
              {gameStatus === "won"
                ? `You earned ${score} XP!`
                : "Let's gather more knowledge."}
            </motion.p>

            {/* Lost word reveal */}
            {gameStatus === "lost" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 mt-4"
              >
                <p className="text-white/60 font-fredoka text-sm mb-2">
                  The word was:
                </p>
                <div className="inline-block bg-gradient-to-r from-loop-yellow/30 via-amber-400/30 to-loop-yellow/30 backdrop-blur-sm px-5 py-2 rounded-xl border-2 border-loop-yellow/40 shadow-lg">
                  <span className="text-2xl font-bold font-fredoka text-loop-yellow drop-shadow-lg">
                    {word}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4 justify-center mt-6"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={onRetry}
                className="gap-2 rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/50 active:bg-white/25 transition-all duration-200 shadow-lg font-fredoka font-bold"
              >
                <RotateCcw className="w-5 h-5" />
                Retry Mission
              </Button>
              {gameStatus === "won" && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={onNext}
                  className="gap-2 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white border-2 border-green-400/50 shadow-[0_0_24px_rgba(34,197,94,0.4)] hover:shadow-[0_0_32px_rgba(34,197,94,0.6)] transition-all duration-200 font-fredoka font-bold"
                >
                  <Rocket className="w-5 h-5" />
                  Next Mission
                </Button>
              )}
            </motion.div>

            {/* Confetti for win */}
            {gameStatus === "won" && (
              <>
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"][i % 4],
                      left: "50%",
                      top: "20%",
                    }}
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{
                      x: (Math.random() - 0.5) * 400,
                      y: Math.random() * 400 + 100,
                      opacity: 0,
                      scale: 0,
                      rotate: Math.random() * 720,
                    }}
                    transition={{
                      duration: 1.5 + Math.random(),
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ResultOverlay;
