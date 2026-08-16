import { motion, Variants } from "framer-motion";
import type { GameStatus } from "@/hooks/useSpaceHangman";

interface RocketProps {
  gameStatus: GameStatus;
  fuelLevel: number;
}

// Stable variant definitions for floating to prevent keyframe re-diffing
const floatVariants: Variants = {
  playing: {
    y: [0, -8, 0],
    rotate: [0, 0.5, -0.5, 0],
    transition: {
      type: "tween", // Explicitly use tween for multi-keyframe animations
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  idle: {
    y: 0,
    rotate: 0,
    transition: { type: "tween", duration: 0.4 }
  }
};

const Rocket = ({ gameStatus, fuelLevel }: RocketProps) => {
  const showFlame = gameStatus === "won" || (gameStatus === "playing" && fuelLevel > 30);
  const rocketIdleImg = "/rocket-idle.png";
  const rocketFlameImg = "/rocket-flame.png";

  const rocketVariants: Variants = {
    playing: {
      y: 0,
      rotate: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    won: {
      y: -400,
      rotate: [0, -5, 5, 0],
      scale: [1, 1.1, 0.9],
      transition: {
        type: "tween", // Explicitly use tween for multi-keyframe animations
        duration: 2.5,
        ease: "easeInOut",
        delay: 0.5
      }
    },
    lost: {
      y: [0, -50, -20, 0],
      rotate: [0, -8, 8, -4, 0],
      transition: {
        type: "tween", // Explicitly use tween for multi-keyframe animations
        duration: 2,
        ease: "easeInOut",
        repeat: 1
      }
    },
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Launch pad ground glow - multi-layered */}
      <motion.div
        className="absolute -bottom-4 w-20 sm:w-28 h-8 rounded-full blur-2xl z-0"
        animate={
          gameStatus === "won"
            ? {
                background: [
                  "radial-gradient(ellipse, rgba(251,146,60,0.4) 0%, rgba(249,115,22,0.2) 50%, transparent 100%)",
                  "radial-gradient(ellipse, rgba(251,146,60,0.7) 0%, rgba(249,115,22,0.4) 50%, transparent 100%)",
                  "radial-gradient(ellipse, rgba(251,146,60,0) 0%, rgba(249,115,22,0) 50%, transparent 100%)"
                ],
                scale: [1, 2, 3]
              }
            : gameStatus === "playing" && showFlame
              ? {
                  background: "radial-gradient(ellipse, rgba(251,146,60,0.35) 0%, rgba(249,115,22,0.15) 50%, transparent 100%)",
                  scale: [1, 1.3, 1]
                }
              : {
                  background: "radial-gradient(ellipse, rgba(100,150,255,0.15) 0%, transparent 70%)",
                  scale: 1
                }
        }
        transition={{
          type: "tween", // Explicitly use tween for multi-keyframe animations
          duration: gameStatus === "won" ? 2.5 : 2,
          repeat: gameStatus === "playing" ? Infinity : 0,
          ease: "easeInOut"
        }}
      />

      {/* Secondary glow layer */}
      <motion.div
        className="absolute -bottom-2 w-16 sm:w-20 h-6 rounded-full blur-xl z-0"
        animate={
          showFlame
            ? {
                background: [
                  "radial-gradient(ellipse, rgba(251,191,36,0.4) 0%, transparent 70%)",
                  "radial-gradient(ellipse, rgba(251,146,60,0.5) 0%, transparent 70%)",
                ],
                scale: [1, 1.2, 1]
              }
            : { background: "rgba(100,150,255,0.1)" }
        }
        transition={{ type: "tween", duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ground line */}
      <div className="absolute -bottom-1 w-[70%] h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />

      <motion.div
        variants={rocketVariants}
        animate={gameStatus}
        className="relative z-10"
      >
        {/* Float variants compared stably by Framer Motion reference */}
        <motion.div
          variants={floatVariants}
          animate={gameStatus === "playing" ? "playing" : "idle"}
          className="relative w-36 h-48 sm:w-48 sm:h-64"
        >
          <img
            src={showFlame ? rocketFlameImg : rocketIdleImg}
            alt="Rocket"
            className="absolute inset-0 w-full h-full object-contain z-10"
            onError={(e) => {
              // Fail-safe fallback if swapping assets breaks/404s
              (e.target as HTMLImageElement).src = rocketIdleImg;
            }}
          />

          {/* Flame glow enhancement */}
          {showFlame && (
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-32 sm:w-32 sm:h-40 rounded-full blur-2xl pointer-events-none z-0"
              style={{
                background: "radial-gradient(ellipse, rgba(251,191,36,0.6) 0%, rgba(251,146,60,0.4) 30%, rgba(249,115,22,0.2) 60%, transparent 100%)",
              }}
              animate={{
                scaleY: [1, 1.3, 1],
                scaleX: [1, 0.9, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{ type: "tween", duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Exhaust particles for won state */}
      {gameStatus === "won" && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0 w-2 h-2 rounded-full bg-orange-400/80 blur-sm"
              initial={{
                x: -10 + i * 2.5,
                y: 0,
                opacity: 0.8,
                scale: 1
              }}
              animate={{
                y: [0, 60 + i * 10],
                x: [-10 + i * 2.5, -20 + i * 5],
                opacity: [0.8, 0],
                scale: [1, 0.3],
              }}
              transition={{
                type: "tween",
                duration: 0.8 + i * 0.1,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.05,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Rocket;