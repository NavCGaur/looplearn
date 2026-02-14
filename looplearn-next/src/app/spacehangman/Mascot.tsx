import { motion } from "framer-motion";
import type { MascotMood } from "@/hooks/useSpaceHangman";

const moodImages: Record<MascotMood, string> = {
  neutral: "/tiger-neutral.png",
  happy: "/tiger-happy.png",
  worried: "/tiger-thoughtful.png",
  excited: "/tiger-excited.png",
  thoughtful: "/tiger-thoughtful.png",
};

const moodAnimations: Record<MascotMood, object> = {
  neutral: {
    y: [0, -6, 0],
    rotate: [0, 1, -1, 0]
  },
  happy: {
    y: [0, -12, -4, 0],
    rotate: [0, 5, -5, 3, 0],
    scale: [1, 1.05, 1.02, 1]
  },
  worried: {
    x: [0, -6, 6, -4, 4, 0],
    rotate: [0, -3, 3, 0]
  },
  excited: {
    y: [0, -24, -8, -16, 0],
    scale: [1, 1.1, 1.05, 1.08, 1],
    rotate: [0, -8, 8, -4, 0]
  },
  thoughtful: {
    y: [0, 3, 0],
    rotate: [0, -4, 4, -2, 2, 0],
    x: [0, -2, 2, 0]
  },
};

const moodMessages: Record<MascotMood, string> = {
  happy: "🎉 Great guess!",
  worried: "😬 Oops!",
  excited: "🚀 Liftoff!",
  thoughtful: "🤔 Next time!",
  neutral: "🐯 Pick a letter!",
};

interface MascotProps {
  mood: MascotMood;
}

const Mascot = ({ mood }: MascotProps) => (
  <motion.div className="flex flex-col items-center relative z-20">
    {/* Multi-layer ambient glow under mascot for depth */}
    <div className="absolute -bottom-3 w-24 h-6 bg-gradient-to-t from-orange-500/20 via-orange-400/10 to-transparent rounded-full blur-xl" />
    <div className="absolute -bottom-2 w-20 h-5 bg-orange-400/25 rounded-full blur-lg" />
    <div className="absolute -bottom-1 w-16 h-3 bg-orange-300/30 rounded-full blur-md" />

    {/* Mascot container with depth */}
    <div className="relative">
      {/* Soft outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(255,165,0,0.3) 0%, transparent 70%)",
        }}
        animate={{
          scale: mood === "excited" ? [1, 1.3, 1] : [1, 1.15, 1],
          opacity: mood === "excited" ? [0.4, 0.6, 0.4] : [0.3, 0.5, 0.3],
        }}
        transition={{ duration: mood === "excited" ? 0.8 : 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        key={mood}
        className="relative"
        initial={{ scale: 0.7, opacity: 0, filter: "brightness(0.8)" }}
        animate={{
          scale: 1,
          opacity: 1,
          filter: "brightness(1.15) contrast(1.1) saturate(1.1)",
          ...moodAnimations[mood]
        }}
        transition={{
          scale: { duration: 0.4, ease: "backOut" },
          opacity: { duration: 0.3 },
          filter: { duration: 0.5 },
          y: { duration: mood === "excited" ? 1 : 2.5, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: mood === "excited" ? 1 : 2.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <img
          src={moodImages[mood]}
          alt={`Tiger ${mood}`}
          className="w-24 h-24 sm:w-32 sm:h-32 object-contain relative z-10"
        />

      </motion.div>
    </div>

    {/* Message bubble with glassmorphism */}
    <motion.div
      key={`msg-${mood}`}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "backOut" }}
      className="mt-2 relative"
    >
      {/* Bubble glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-md" />

      <p className="relative text-xs sm:text-sm font-fredoka font-bold text-white bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/25 shadow-lg">
        {moodMessages[mood]}
      </p>

      {/* Bubble shine */}
      <div
        className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
        }}
      />
    </motion.div>
  </motion.div>
);

export default Mascot;