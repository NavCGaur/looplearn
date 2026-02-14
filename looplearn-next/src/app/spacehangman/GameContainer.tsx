"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Lightbulb, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSpaceHangman } from "@/hooks/useSpaceHangman";
import Mascot from "./Mascot";
import Rocket from "./Rocket";
import FuelGauge from "./FuelGauge";
import WordDisplay from "./WordDisplay";
import KeyboardGrid from "./KeyboardGrid";
import ResultOverlay from "./ResultOverlay";

const GameContainer = () => {
  const router = useRouter();

  const {
    word, category, hint, guessedLetters, fuelLevel, wrongAttempts,
    maxWrongAttempts, gameStatus, mascotMood, score,
    guessLetter, resetGame, nextMission,
  } = useSpaceHangman();

  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [shakeGauge, setShakeGauge] = useState(false);

  useEffect(() => {
    if (wrongAttempts > 0) {
      setShakeGauge(true);
      const t = setTimeout(() => setShakeGauge(false), 500);
      return () => clearTimeout(t);
    }
  }, [wrongAttempts]);

  const useHint = () => {
    if (hintUsed) return;
    setHintUsed(true);
    setShowHint(true);
  };

  const handleReset = () => {
    resetGame();
    setShowHint(false);
    setHintUsed(false);
  };

  const handleNext = () => {
    nextMission();
    setShowHint(false);
    setHintUsed(false);
  };

  const livesLeft = maxWrongAttempts - wrongAttempts;

  return (
    <div
      className="min-h-screen bg-slate-950 bg-cover bg-center bg-no-repeat flex flex-col relative overflow-hidden"
      style={{ backgroundImage: "url('/earth-background.png')" }}
    >
      {/* Enhanced atmospheric overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-blue-950/20 to-transparent z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/10 via-transparent to-blue-950/10 z-0" />

      {/* Animated starfield effect */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full bg-white blur-[0.5px]"
          style={{
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating particles with varied motion */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full bg-white/25 blur-[1.5px]"
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40 - Math.random() * 60, 0],
            x: [0, (Math.random() - 0.5) * 30, 0],
            opacity: [0.1, 0.6, 0.1],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Atmospheric glow layers */}
      <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] z-0" />
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[300px] bg-purple-600/8 rounded-full blur-[80px] z-0" />
      <div className="absolute top-[30%] right-[15%] w-[350px] h-[250px] bg-indigo-600/8 rounded-full blur-[90px] z-0" />

      {/* Top Bar with glassmorphism */}
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/15 px-4 py-3 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="p-2 -ml-2 rounded-xl hover:bg-white/15 active:bg-white/20 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-white drop-shadow-lg" />
          </button>
          <div className="flex items-center gap-3">
            <motion.div
              className="flex items-center gap-1.5 bg-gradient-to-r from-loop-yellow/25 to-amber-500/25 backdrop-blur-sm px-4 py-1.5 rounded-full border border-loop-yellow/30 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star className="w-4 h-4 text-loop-yellow fill-loop-yellow drop-shadow-lg" />
              <span className="text-sm font-bold font-fredoka text-white drop-shadow-md">{score} XP</span>
            </motion.div>
            <div className="bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
              <span className="text-xs font-bold font-fredoka text-white/90 drop-shadow-md">{category}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxWrongAttempts }).map((_, i) => (
              <motion.div
                key={i}
                animate={i < livesLeft ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <Heart className={`w-5 h-5 ${i < livesLeft ? "text-red-400 fill-red-400 drop-shadow-[0_2px_8px_rgba(248,113,113,0.6)]" : "text-white/20"}`} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 pb-6 pt-6 gap-6">
        {/* Enhanced Scene with integrated lighting */}
        <div className="relative flex items-end justify-center gap-3 sm:gap-8 py-6">
          {/* Launch pad foundation with layered lighting */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-12 bg-gradient-to-t from-orange-500/20 via-orange-400/10 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] h-8 bg-gradient-to-t from-blue-400/15 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[65%] h-1 bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-full shadow-lg" />

          {/* Ground platform with depth */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[3px] bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[2px] bg-gradient-to-r from-transparent via-blue-300/20 to-transparent rounded-full blur-sm" />

          {/* Scene characters with proper z-indexing */}
          <div className="relative z-20 mb-2">
            <Mascot mood={mascotMood} />
          </div>

          <div className="relative z-20 flex items-end gap-3">
            <Rocket gameStatus={gameStatus} fuelLevel={fuelLevel} />
            <FuelGauge fuelLevel={fuelLevel} shake={shakeGauge} />
          </div>
        </div>

        {/* Word Display with enhanced styling */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-xl" />
          <WordDisplay word={word} guessedLetters={guessedLetters} />
        </div>

        {/* Hint with premium styling */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.9 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "backOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-loop-yellow/20 via-amber-400/15 to-loop-yellow/20 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-loop-yellow/20 via-loop-yellow/15 to-amber-500/20 backdrop-blur-md border border-loop-yellow/40 rounded-2xl px-5 py-3 text-center shadow-xl">
              <p className="text-sm sm:text-base font-fredoka text-white drop-shadow-md">
                💡 <span className="font-bold">Hint:</span> {hint}
              </p>
              <div
                className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)",
                }}
              />
            </div>
          </motion.div>
        )}

        <div className="flex-1 min-h-4" />

        {/* Action Buttons with enhanced styling */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={useHint}
            disabled={hintUsed || gameStatus !== "playing"}
            className="gap-2 rounded-xl border-white/40 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/50 active:bg-white/25 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lightbulb className="w-4 h-4" />
            {hintUsed ? "Hint used" : "Use Hint"}
          </Button>
        </div>

        {/* Keyboard with enhanced visual */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent rounded-2xl blur-xl" />
          <KeyboardGrid
            guessedLetters={guessedLetters}
            word={word}
            disabled={gameStatus !== "playing"}
            onGuess={guessLetter}
          />
        </div>

        {/* Result Overlay */}
        <ResultOverlay
          gameStatus={gameStatus}
          word={word}
          score={score}
          onRetry={handleReset}
          onNext={handleNext}
        />
      </div>
    </div>
  );
};

export default GameContainer;
