--------import { motion } from "framer-motion";
import { Flame, Trophy, Medal, Crown, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const leaderboardData = [
  { rank: 1, name: "Emma S.", xp: 12450, streak: 45, avatar: "ES" },
  { rank: 2, name: "Liam K.", xp: 11200, streak: 38, avatar: "LK" },
  { rank: 3, name: "Sophia M.", xp: 10890, streak: 32, avatar: "SM" },
  { rank: 4, name: "Noah T.", xp: 9750, streak: 28, avatar: "NT" },
  { rank: 5, name: "Olivia R.", xp: 9200, streak: 25, avatar: "OR" },
  { rank: 6, name: "Aiden P.", xp: 8650, streak: 21, avatar: "AP" },
  { rank: 7, name: "Mia J.", xp: 8100, streak: 18, avatar: "MJ" },
  { rank: 8, name: "Lucas W.", xp: 7550, streak: 15, avatar: "LW" },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-loop-yellow fill-loop-yellow" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400 fill-gray-300" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600 fill-amber-500" />;
    default:
      return (
        <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-muted-foreground">
          {rank}
        </span>
      );
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-loop-yellow/20 via-loop-yellow/10 to-transparent border-loop-yellow/40 shadow-glow-yellow";
    case 2:
      return "bg-gradient-to-r from-gray-200/30 via-gray-100/20 to-transparent border-gray-300/40";
    case 3:
      return "bg-gradient-to-r from-amber-200/30 via-amber-100/20 to-transparent border-amber-300/40";
    default:
      return "bg-card/50 border-border/50 hover:bg-card/80";
  }
};

const getAvatarGradient = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-br from-loop-yellow to-amber-500";
    case 2:
      return "bg-gradient-to-br from-gray-300 to-gray-500";
    case 3:
      return "bg-gradient-to-br from-amber-400 to-amber-600";
    default:
      return "bg-gradient-to-br from-primary to-loop-blue";
  }
};

const LeaderboardSection = () => {
  return (
    <section id="leaderboard" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-loop-yellow/5 to-background" />
      <div className="absolute top-20 left-10 text-4xl animate-float opacity-60">🏆</div>
      <div className="absolute top-40 right-16 text-3xl animate-float-delayed opacity-60">⭐</div>
      <div className="absolute bottom-32 left-20 text-3xl animate-float-delayed-2 opacity-60">🎯</div>
      <div className="absolute bottom-20 right-10 text-4xl animate-float-delayed-3 opacity-60">🔥</div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 badge-pill mb-4"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
          >
            <Trophy className="w-4 h-4 text-loop-yellow" />
            <span className="text-foreground/80">Top Learners</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold font-fredoka text-foreground mb-4">
            🏅 <span className="curly-underline">Leaderboard</span> Champions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the stars of LoopLearn! These amazing learners are crushing their goals.
          </p>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 mb-2 text-sm font-semibold text-muted-foreground font-fredoka">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5 md:col-span-6">Player</div>
            <div className="col-span-3 text-center">XP</div>
            <div className="col-span-3 md:col-span-2 text-center">Streak</div>
          </div>

          {/* Leaderboard Rows */}
          <div className="space-y-3">
            {leaderboardData.map((player, index) => (
              <motion.div
                key={player.rank}
                className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-2xl border-2 transition-all duration-300 ${getRankStyle(player.rank)}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                {/* Rank */}
                <div className="col-span-1 flex justify-center">
                  {getRankIcon(player.rank)}
                </div>

                {/* Avatar & Name */}
                <div className="col-span-5 md:col-span-6 flex items-center gap-3">
                  <Avatar className={`w-10 h-10 ${player.rank <= 3 ? "ring-2 ring-offset-2" : ""} ${player.rank === 1 ? "ring-loop-yellow" : player.rank === 2 ? "ring-gray-400" : player.rank === 3 ? "ring-amber-500" : ""}`}>
                    <AvatarImage src="" />
                    <AvatarFallback className={`${getAvatarGradient(player.rank)} text-white font-bold text-sm`}>
                      {player.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold font-fredoka text-foreground truncate">
                    {player.name}
                    {player.rank === 1 && (
                      <Sparkles className="inline w-4 h-4 ml-1 text-loop-yellow" />
                    )}
                  </span>
                </div>

                {/* XP */}
                <div className="col-span-3 text-center">
                  <span className="font-bold font-fredoka text-primary">
                    {player.xp.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">XP</span>
                </div>

                {/* Streak */}
                <div className="col-span-3 md:col-span-2 flex items-center justify-center gap-1">
                  <Flame className={`w-5 h-5 ${player.streak >= 30 ? "text-orange-500 fill-orange-400" : player.streak >= 15 ? "text-orange-400 fill-orange-300" : "text-orange-300 fill-orange-200"}`} />
                  <span className="font-bold font-fredoka text-foreground">{player.streak}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="inline-flex flex-col items-center gap-4 p-6 rounded-3xl bg-gradient-to-r from-loop-purple/10 via-primary/10 to-loop-green/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              <p className="text-lg font-fredoka text-foreground font-medium">
                Ready to climb the ranks?
              </p>
              <span className="text-2xl">🚀</span>
            </div>
            <Button
              variant="success"
              size="xl"
              className="group"
            >
              <span>Sign Up to Compete</span>
              <motion.span
                className="text-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🏆
              </motion.span>
            </Button>
            <p className="text-sm text-muted-foreground">
              Join <span className="font-bold text-primary">2,847</span> learners already on the leaderboard!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LeaderboardSection;


------------import { motion } from "framer-motion";
import { Brain, Layers, Target, Gamepad2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

const FeatureCard = ({
  icon: Icon,
  emoji,
  title,
  description,
  color,
  delay,
}: {
  icon: LucideIcon;
  emoji: string;
  title: string;
  description: string;
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="h-full"
  >
    <Card className={`h-full overflow-hidden border-2 ${color} bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="text-4xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
          >
            {emoji}
          </motion.div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
            color.includes('blue') ? 'bg-loop-blue' :
            color.includes('green') ? 'bg-loop-green' :
            color.includes('yellow') ? 'bg-loop-yellow' :
            color.includes('purple') ? 'bg-loop-purple' :
            'bg-loop-pink'
          }`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="font-bold text-xl text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      emoji: "🧠",
      title: "AI‑Powered Spaced Repetition",
      description: "Smart timing beats the forgetting curve. Concepts reappear right before you're about to forget them.",
      color: "border-loop-blue/30 hover:border-loop-blue/60",
    },
    {
      icon: Layers,
      emoji: "🎴",
      title: "Interactive Word Cards",
      description: "Swipe through bite‑sized cards to quickly grasp definitions and core facts.",
      color: "border-loop-green/30 hover:border-loop-green/60",
    },
    {
      icon: Target,
      emoji: "🎯",
      title: "The Quiz Arsenal",
      description: "Fill‑in‑the‑blanks, MCQs, True/False—variety forces deeper thinking.",
      color: "border-loop-yellow/30 hover:border-loop-yellow/60",
    },
    {
      icon: Gamepad2,
      emoji: "🎮",
      title: "Hangman Learning Game",
      description: "Play your way to mastery. Learn spellings of tough terms without even realizing you're studying.",
      color: "border-loop-purple/30 hover:border-loop-purple/60",
    },
    {
      icon: Zap,
      emoji: "⚡",
      title: "Gamified XP & Milestone Badges",
      description: "Turn effort into rewards. Earn XP, level up, and collect badges like 'Persistence Pro'.",
      color: "border-loop-pink/30 hover:border-loop-pink/60",
    },
  ];

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-background via-loop-purple/5 to-background">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-loop-blue/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-loop-green/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-loop-yellow/5 blur-3xl" />
        
        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-32 right-20 text-4xl"
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-16 text-3xl"
          animate={{ y: [0, -10, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          🌟
        </motion.div>
        <motion.div
          className="absolute top-1/2 right-12 text-3xl"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          💡
        </motion.div>
      </div>

      <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.span 
            className="badge-pill mb-4 inline-flex"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <span className="text-lg">🔄</span>
            <span className="text-foreground">Our Approach</span>
          </motion.span>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4">
            The <span className="text-loop-blue">Loop</span>{" "}
            <span className="text-loop-green">Learning</span>{" "}
            <span className="text-loop-purple">Method</span>
          </h2>
          
          <p className="text-lg text-muted-foreground mt-6 leading-relaxed">
            One concept, many formats. Word cards, quizzes, and games reinforce knowledge until it sticks.
          </p>
          
          {/* Animated infinity loop indicator */}
          <motion.div
            className="flex justify-center mt-8 gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            {["🎴", "→", "🎯", "→", "🎮", "→", "🏆"].map((item, i) => (
              <motion.span
                key={i}
                className={`text-2xl ${item === "→" ? "text-muted-foreground" : ""}`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                viewport={{ once: true }}
              >
                {item}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.slice(0, 3).map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={0.1 + index * 0.1}
            />
          ))}
        </div>
        
        {/* Bottom row - centered 2 cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8 max-w-4xl mx-auto">
          {features.slice(3).map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={0.4 + index * 0.1}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground mb-2">Ready to break the forgetting cycle?</p>
          <div className="flex justify-center gap-2">
            {["🚀", "Start", "Your", "Learning", "Loop!", "🔄"].map((word, i) => (
              <motion.span
                key={i}
                className={`text-xl font-bold ${
                  word === "🚀" || word === "🔄" ? "" : "text-foreground"
                }`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                viewport={{ once: true }}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
-----------------





import { motion } from "framer-motion";
import { Sparkles, Star, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import loopieMascot from "@/assets/loopie-main.png";

const FloatingShape = ({ 
  className, 
  delay = 0,
  children 
}: { 
  className: string; 
  delay?: number;
  children: React.ReactNode;
}) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: delay + 0.3, duration: 0.5, type: "spring" }}
  >
    <motion.div
      animate={{
        y: [0, -8, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  </motion.div>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const LoginSection = () => {
  return (
    <section id="login" className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-background via-loop-blue/5 to-background">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-72 h-72 rounded-full bg-loop-yellow/10 blur-3xl" />
        <div className="absolute bottom-10 left-20 w-64 h-64 rounded-full bg-loop-green/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-loop-purple/10 blur-3xl" />
      </div>

      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="badge-pill mb-4 inline-flex">
            <span className="text-lg">🎮</span>
            <span className="text-foreground">Join the Adventure</span>
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-fredoka">
            Ready to <span className="text-loop-green">Level Up</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Sign in with Google and start your learning journey today!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Mascot */}
          <motion.div
            className="relative flex items-center justify-center order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Floating decorative elements */}
            <FloatingShape className="top-0 left-10" delay={0}>
              <div className="w-12 h-12 rounded-2xl bg-loop-yellow/20 backdrop-blur-sm flex items-center justify-center border border-loop-yellow/30">
                <Star className="w-6 h-6 text-loop-yellow" fill="currentColor" />
              </div>
            </FloatingShape>
            
            <FloatingShape className="top-16 right-4" delay={1}>
              <div className="w-10 h-10 rounded-xl bg-loop-green/20 backdrop-blur-sm flex items-center justify-center border border-loop-green/30">
                <Zap className="w-5 h-5 text-loop-green" />
              </div>
            </FloatingShape>
            
            <FloatingShape className="bottom-20 left-4" delay={2}>
              <div className="w-14 h-14 rounded-2xl bg-loop-purple/20 backdrop-blur-sm flex items-center justify-center border border-loop-purple/30">
                <Trophy className="w-7 h-7 text-loop-purple" />
              </div>
            </FloatingShape>
            
            <FloatingShape className="bottom-8 right-16" delay={1.5}>
              <div className="w-10 h-10 rounded-xl bg-loop-pink/20 backdrop-blur-sm flex items-center justify-center border border-loop-pink/30">
                <Sparkles className="w-5 h-5 text-loop-pink" />
              </div>
            </FloatingShape>

            {/* Mascot with glow */}
            <motion.div
              className="relative z-10"
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-loop-yellow/30 via-loop-green/20 to-loop-blue/30 blur-3xl scale-110" />
              <img
                src={loopieMascot}
                alt="Loopie the learning mascot"
                className="relative w-64 h-64 sm:w-80 sm:h-80 object-contain drop-shadow-2xl"
              />
            </motion.div>

            {/* Speech bubble */}
            <motion.div
              className="absolute -top-4 right-0 lg:right-8 glass-card rounded-2xl px-4 py-3 shadow-lg max-w-[180px]"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <p className="text-sm font-medium text-foreground font-fredoka">
                "Let's learn together! 🎉"
              </p>
              <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white/80 dark:bg-card rotate-45 border-r border-b border-border/20" />
            </motion.div>
          </motion.div>

          {/* Right Column - Login Card */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border-2 border-white/20 max-w-md mx-auto lg:mx-0 lg:ml-auto">
              {/* Card Header */}
              <div className="text-center mb-8">
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-loop-green to-loop-blue mb-4 shadow-lg shadow-loop-green/25"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <span className="text-3xl">🚀</span>
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground font-fredoka mb-2">
                  Welcome to LoopLearn!
                </h3>
                <p className="text-muted-foreground text-sm">
                  One click to start your learning adventure
                </p>
              </div>

              {/* Google Sign In Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full bg-card hover:bg-accent text-foreground border-2 border-input hover:border-primary/50 shadow-md hover:shadow-lg font-fredoka"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </Button>
              </motion.div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">
                  Safe & Secure
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                {[
                  { icon: "🏆", text: "Compete on the Leaderboard" },
                  { icon: "⚡", text: "Earn XP & Level Up" },
                  { icon: "📊", text: "Track Your Progress" },
                  { icon: "🎯", text: "Personalized Learning Path" },
                ].map((benefit, idx) => (
                  <motion.div
                    key={benefit.text}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * idx, duration: 0.3 }}
                  >
                    <span className="text-xl">{benefit.icon}</span>
                    <span className="text-sm font-medium text-foreground font-fredoka">
                      {benefit.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Footer note */}
              <p className="text-xs text-muted-foreground text-center mt-6">
                By signing in, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms
                </a>{" "}
                &{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LoginSection;
-------------










import HeroSection from "@/components/HeroSection";
import GuestAccessSection from "@/components/GuestAccessSection";

const Index = () => {
  return (
    <main>
      <HeroSection />
      <GuestAccessSection />
    </main>
  );
};

export default Index;


import { motion } from "framer-motion";
import { Play, LayoutDashboard, Calculator, FlaskConical, Atom, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingIcon = ({
  icon: Icon,
  className,
  delay = 0,
  color,
}: {
  icon: React.ElementType;
  className: string;
  delay?: number;
  color: string;
}) => (
  <motion.div
    className={`float-icon absolute ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: delay + 0.5, duration: 0.5, type: "spring" }}
  >
    <motion.div
      animate={{
        y: [0, -10, -5, -15, 0],
        rotate: [0, 2, 0, -2, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <Icon className={`w-8 h-8 ${color}`} strokeWidth={2} />
    </motion.div>
  </motion.div>
);

const AvatarStack = () => {
  const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=ffd5dc",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=ffdfbf",
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="avatar-stack">
        {avatars.map((avatar, i) => (
          <motion.img
            key={i}
            src={avatar}
            alt={`Student ${i + 1}`}
            className="w-10 h-10 rounded-full bg-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
          />
        ))}
      </div>
      <motion.p
        className="text-sm text-muted-foreground font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        Trusted by <span className="text-foreground font-semibold">10,000+</span> students
      </motion.p>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="min-h-screen relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-loop-blue/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-loop-green/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-loop-yellow/5 blur-3xl" />
      </div>

      <div className="container max-w-[1400px] mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Column - Text Content */}
          <motion.div
            className="flex flex-col gap-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="badge-pill">
                <span className="text-lg">🚀</span>
                <span className="text-foreground">The #1 Fun Learning App</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Master Math & Science the{" "}
              <span className="curly-underline text-loop-green">Fun Way</span>!
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Join thousands of students topping the leaderboard. Play quizzes, earn XP, and unlock achievements.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Button variant="success" size="xl" className="group">
                <Play className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                Start Quiz Now
              </Button>
              <Button variant="outline" size="xl">
                <LayoutDashboard className="w-5 h-5 mr-2" />
                View Dashboard
              </Button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <AvatarStack />
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            className="relative flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Floating Icons */}
            <FloatingIcon
              icon={Calculator}
              className="top-4 left-4 lg:top-8 lg:left-0"
              delay={0}
              color="text-loop-blue"
            />
            <FloatingIcon
              icon={FlaskConical}
              className="top-12 right-4 lg:top-16 lg:right-8"
              delay={1.5}
              color="text-loop-purple"
            />
            <FloatingIcon
              icon={Atom}
              className="bottom-24 left-0 lg:bottom-32 lg:left-4"
              delay={3}
              color="text-loop-pink"
            />
            <FloatingIcon
              icon={Globe}
              className="bottom-8 right-8 lg:bottom-12 lg:right-0"
              delay={4.5}
              color="text-loop-green"
            />

            {/* Mascot Container */}
            <motion.div
              className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] xl:w-[500px] xl:h-[500px]"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Glow effect behind mascot */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-loop-green/20 via-loop-blue/10 to-loop-yellow/20 blur-2xl" />
              
              {/* Mascot placeholder */}
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-2xl">
                <div className="text-center p-8">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-loop-green/30 to-loop-blue/30 flex items-center justify-center border-2 border-dashed border-loop-blue/50">
                    <span className="text-4xl lg:text-5xl">🦊</span>
                  </div>
                  <p className="text-sm lg:text-base text-muted-foreground font-medium">
                    Place mascot image here
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    loopie-main.png
                  </p>
                </div>
              </div>
            </motion.div>

            {/* XP Badge floating element */}
            <motion.div
              className="absolute top-1/4 -right-4 lg:right-12 glass-card rounded-2xl px-4 py-3 flex items-center gap-2 shadow-glow-yellow"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="w-10 h-10 rounded-full bg-loop-yellow flex items-center justify-center">
                <span className="text-lg font-bold text-yellow-900">⚡</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Daily XP</p>
                <p className="text-lg font-bold text-foreground">+500 XP</p>
              </div>
            </motion.div>

            {/* Achievement Badge */}
            <motion.div
              className="absolute bottom-1/4 -left-4 lg:left-0 glass-card rounded-2xl px-4 py-3 flex items-center gap-2 shadow-glow-green"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="w-10 h-10 rounded-full bg-loop-green flex items-center justify-center">
                <span className="text-lg">🏆</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">New Badge</p>
                <p className="text-sm font-bold text-foreground">Math Master</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


import { motion } from "framer-motion";
import { Rocket, Infinity as InfinityIcon, MessageCircle, ChevronDown, Trophy, Bookmark, TrendingUp, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay,
  color,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="flex items-start gap-4"
  >
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shrink-0 shadow-lg`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h3 className="font-bold text-foreground text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  </motion.div>
);

const SelectButton = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-border rounded-xl text-left font-medium text-foreground hover:border-primary/50 transition-colors"
      >
        <span>{value || label}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border-2 border-border shadow-xl z-10 overflow-hidden"
        >
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors font-medium text-foreground"
            >
              {option}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const SignUpBenefit = ({
  icon: Icon,
  text,
  delay,
}: {
  icon: LucideIcon;
  text: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    viewport={{ once: true }}
    className="flex items-center gap-3"
  >
    <div className="w-8 h-8 rounded-full bg-loop-yellow/20 flex items-center justify-center">
      <Icon className="w-4 h-4 text-loop-yellow" />
    </div>
    <span className="text-foreground font-medium">{text}</span>
  </motion.div>
);

const GuestAccessSection = () => {
  const [grade, setGrade] = useState("Grade 8");
  const [subject, setSubject] = useState("Science");
  const [chapter, setChapter] = useState("All Chapters");

  const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];
  const subjects = ["Science", "Mathematics", "English", "Social Studies", "Computer Science"];
  const chapters = ["All Chapters", "Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5"];

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-loop-purple/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-loop-blue/10 blur-3xl" />
        <div className="absolute top-1/2 right-10 w-64 h-64 rounded-full bg-loop-yellow/10 blur-3xl" />
      </div>

      <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="badge-pill mb-4 inline-flex">
            <span className="text-lg">🎮</span>
            <span className="text-foreground">LoopLearn Guest Access</span>
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4">
            Start Practicing in{" "}
            <span className="text-loop-blue">Seconds</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Features & Quiz Selector */}
          <div className="space-y-10">
            {/* Feature Cards */}
            <div className="space-y-6">
              <FeatureCard
                icon={Rocket}
                title="No Sign-up Required"
                description="Jump straight into learning without creating an account."
                delay={0.1}
                color="bg-loop-blue"
              />
              <FeatureCard
                icon={InfinityIcon}
                title="Unlimited Practice"
                description="Access thousands of questions across all subjects."
                delay={0.2}
                color="bg-loop-green"
              />
              <FeatureCard
                icon={MessageCircle}
                title="Instant Feedback"
                description="Get detailed explanations for every answer."
                delay={0.3}
                color="bg-loop-purple"
              />
            </div>

            {/* Quiz Selector Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden border-2 border-border/50 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 lg:p-8 space-y-6">
                  {/* Loopie Avatar */}
                  <div className="flex items-center gap-4 pb-4 border-b border-border">
                    <motion.div
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-loop-green/30 to-loop-blue/30 flex items-center justify-center border-2 border-dashed border-loop-blue/50"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <span className="text-2xl">🦊</span>
                    </motion.div>
                    <div>
                      <p className="font-bold text-foreground">Loopie says:</p>
                      <p className="text-muted-foreground text-sm">"Let's start learning! 🚀"</p>
                    </div>
                  </div>

                  {/* Step 1: Grade */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-loop-blue text-white text-xs flex items-center justify-center">1</span>
                      Choose Class
                    </label>
                    <SelectButton
                      label="Select Grade"
                      options={grades}
                      value={grade}
                      onChange={setGrade}
                    />
                  </div>

                  {/* Step 2: Subject */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-loop-green text-white text-xs flex items-center justify-center">2</span>
                      Select Subject
                    </label>
                    <SelectButton
                      label="Select Subject"
                      options={subjects}
                      value={subject}
                      onChange={setSubject}
                    />
                  </div>

                  {/* Step 3: Chapter */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-loop-purple text-white text-xs flex items-center justify-center">3</span>
                      Choose Chapter (Optional)
                    </label>
                    <SelectButton
                      label="Select Chapter"
                      options={chapters}
                      value={chapter}
                      onChange={setChapter}
                    />
                  </div>

                  {/* Start Quiz Button */}
                  <Button variant="success" size="xl" className="w-full group mt-2">
                    <Rocket className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-1" />
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Why Sign Up */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-8"
          >
            <Card className="overflow-hidden border-2 border-loop-yellow/30 shadow-xl bg-gradient-to-br from-loop-yellow/10 via-white to-loop-green/10">
              <CardContent className="p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="text-center pb-4 border-b border-border">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-loop-yellow flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="text-3xl">🚀</span>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-foreground">Why Sign Up?</h3>
                  <p className="text-muted-foreground text-sm mt-1">Unlock the full LoopLearn experience!</p>
                </div>

                {/* Benefits */}
                <div className="space-y-4 py-4">
                  <SignUpBenefit
                    icon={TrendingUp}
                    text="Track your progress & earn points"
                    delay={0.1}
                  />
                  <SignUpBenefit
                    icon={Trophy}
                    text="Climb the global leaderboard"
                    delay={0.2}
                  />
                  <SignUpBenefit
                    icon={Bookmark}
                    text="Save your difficult questions"
                    delay={0.3}
                  />
                </div>

                {/* CTA */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="default" 
                    size="xl" 
                    className="w-full bg-gradient-to-r from-loop-blue to-loop-purple hover:from-loop-blue/90 hover:to-loop-purple/90 shadow-lg"
                  >
                    Create a Free Account
                  </Button>
                </motion.div>

                {/* Fun decoration */}
                <div className="flex justify-center gap-2 pt-2">
                  {["⭐", "🎯", "🏆", "🎮", "🚀"].map((emoji, i) => (
                    <motion.span
                      key={i}
                      className="text-xl"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                      viewport={{ once: true }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GuestAccessSection;
import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const MenubarMenu = MenubarPrimitive.Menu;

const MenubarGroup = MenubarPrimitive.Group;

const MenubarPortal = MenubarPrimitive.Portal;

const MenubarSub = MenubarPrimitive.Sub;

const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </MenubarPrimitive.Portal>
));
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
MenubarShortcut.displayname = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};


@tailwind base;
@tailwind components;
@tailwind utilities;

/* LoopLearn Design System - Gamified, Playful, Modern */

@layer base {
  :root {
    /* Base colors */
    --background: 210 40% 98%;
    --foreground: 222 47% 11%;

    /* Card surfaces */
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;

    /* Popover */
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* Primary Blue - #2563EB */
    --primary: 217 91% 53%;
    --primary-foreground: 0 0% 100%;

    /* Secondary - Light blue tint */
    --secondary: 217 91% 95%;
    --secondary-foreground: 217 91% 30%;

    /* Muted */
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;

    /* Accent - Sunshine Yellow #FACC15 */
    --accent: 48 96% 53%;
    --accent-foreground: 48 96% 20%;

    /* Destructive */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    /* Borders & Inputs */
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 217 91% 53%;

    --radius: 1rem;

    /* LoopLearn Custom Colors */
    --loop-blue: 217 91% 53%;
    --loop-green: 142 71% 58%;
    --loop-yellow: 48 96% 53%;
    --loop-purple: 270 91% 65%;
    --loop-pink: 330 81% 60%;
    
    /* Glassmorphism */
    --glass-bg: 0 0% 100% / 0.15;
    --glass-border: 0 0% 100% / 0.3;
    --glass-shadow: 217 91% 53% / 0.1;

    /* Gradients */
    --gradient-hero: linear-gradient(135deg, hsl(210 40% 98%) 0%, hsl(217 91% 97%) 50%, hsl(142 71% 97%) 100%);
    --gradient-primary: linear-gradient(135deg, hsl(217 91% 53%) 0%, hsl(217 91% 45%) 100%);
    --gradient-success: linear-gradient(135deg, hsl(142 71% 58%) 0%, hsl(142 71% 45%) 100%);

    /* Sidebar (keeping defaults) */
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217 91% 60%;
  }

  .dark {
    --background: 222 47% 6%;
    --foreground: 210 40% 98%;

    --card: 222 47% 8%;
    --card-foreground: 210 40% 98%;

    --popover: 222 47% 8%;
    --popover-foreground: 210 40% 98%;

    --primary: 217 91% 60%;
    --primary-foreground: 222 47% 11%;

    --secondary: 217 32% 17%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217 32% 17%;
    --muted-foreground: 215 20% 65%;

    --accent: 48 96% 53%;
    --accent-foreground: 48 96% 10%;

    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;

    --border: 217 32% 17%;
    --input: 217 32% 17%;
    --ring: 217 91% 60%;

    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224 76% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217 91% 60%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-fredoka antialiased;
  }
}

@layer components {
  /* Glassmorphism card */
  .glass-card {
    @apply bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl;
  }

  /* Floating icon container */
  .float-icon {
    @apply glass-card rounded-2xl p-3 shadow-lg;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
  }

  /* Curly underline effect */
  .curly-underline {
    position: relative;
    display: inline-block;
  }
  
  .curly-underline::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 100%;
    height: 12px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 12'%3E%3Cpath d='M0 8 Q 12.5 0, 25 8 T 50 8 T 75 8 T 100 8' stroke='%234ADE80' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  /* Badge pill */
  .badge-pill {
    @apply inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium;
    background: linear-gradient(135deg, hsl(var(--loop-yellow) / 0.2) 0%, hsl(var(--loop-green) / 0.2) 100%);
    border: 1px solid hsl(var(--loop-yellow) / 0.3);
  }

  /* Avatar stack */
  .avatar-stack {
    @apply flex -space-x-3;
  }

  .avatar-stack > * {
    @apply ring-2 ring-white rounded-full;
  }
}

@layer utilities {
  /* Bounce animation for mascot */
  .animate-bounce-slow {
    animation: bounce-slow 3s ease-in-out infinite;
  }

  @keyframes bounce-slow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  /* Float animation for icons */
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-float-delayed {
    animation: float 6s ease-in-out infinite;
    animation-delay: 1.5s;
  }

  .animate-float-delayed-2 {
    animation: float 6s ease-in-out infinite;
    animation-delay: 3s;
  }

  .animate-float-delayed-3 {
    animation: float 6s ease-in-out infinite;
    animation-delay: 4.5s;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    25% {
      transform: translateY(-10px) rotate(2deg);
    }
    50% {
      transform: translateY(-5px) rotate(0deg);
    }
    75% {
      transform: translateY(-15px) rotate(-2deg);
    }
  }
}
--------------
tailwind.config.ts-->

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        fredoka: ["Fredoka", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // LoopLearn custom colors
        loop: {
          blue: "hsl(var(--loop-blue))",
          green: "hsl(var(--loop-green))",
          yellow: "hsl(var(--loop-yellow))",
          purple: "hsl(var(--loop-purple))",
          pink: "hsl(var(--loop-pink))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        'glow-green': '0 0 40px hsl(142 71% 58% / 0.3)',
        'glow-blue': '0 0 40px hsl(217 91% 53% / 0.3)',
        'glow-yellow': '0 0 40px hsl(48 96% 53% / 0.3)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
--------------
index.css->

@tailwind base;
@tailwind components;
@tailwind utilities;

/* LoopLearn Design System - Gamified, Playful, Modern */

@layer base {
  :root {
    /* Base colors */
    --background: 210 40% 98%;
    --foreground: 222 47% 11%;

    /* Card surfaces */
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;

    /* Popover */
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* Primary Blue - #2563EB */
    --primary: 217 91% 53%;
    --primary-foreground: 0 0% 100%;

    /* Secondary - Light blue tint */
    --secondary: 217 91% 95%;
    --secondary-foreground: 217 91% 30%;

    /* Muted */
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;

    /* Accent - Sunshine Yellow #FACC15 */
    --accent: 48 96% 53%;
    --accent-foreground: 48 96% 20%;

    /* Destructive */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    /* Borders & Inputs */
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 217 91% 53%;

    --radius: 1rem;

    /* LoopLearn Custom Colors */
    --loop-blue: 217 91% 53%;
    --loop-green: 142 71% 58%;
    --loop-yellow: 48 96% 53%;
    --loop-purple: 270 91% 65%;
    --loop-pink: 330 81% 60%;
    
    /* Glassmorphism */
    --glass-bg: 0 0% 100% / 0.15;
    --glass-border: 0 0% 100% / 0.3;
    --glass-shadow: 217 91% 53% / 0.1;

    /* Gradients */
    --gradient-hero: linear-gradient(135deg, hsl(210 40% 98%) 0%, hsl(217 91% 97%) 50%, hsl(142 71% 97%) 100%);
    --gradient-primary: linear-gradient(135deg, hsl(217 91% 53%) 0%, hsl(217 91% 45%) 100%);
    --gradient-success: linear-gradient(135deg, hsl(142 71% 58%) 0%, hsl(142 71% 45%) 100%);

    /* Sidebar (keeping defaults) */
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217 91% 60%;
  }

  .dark {
    --background: 222 47% 6%;
    --foreground: 210 40% 98%;

    --card: 222 47% 8%;
    --card-foreground: 210 40% 98%;

    --popover: 222 47% 8%;
    --popover-foreground: 210 40% 98%;

    --primary: 217 91% 60%;
    --primary-foreground: 222 47% 11%;

    --secondary: 217 32% 17%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217 32% 17%;
    --muted-foreground: 215 20% 65%;

    --accent: 48 96% 53%;
    --accent-foreground: 48 96% 10%;

    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;

    --border: 217 32% 17%;
    --input: 217 32% 17%;
    --ring: 217 91% 60%;

    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224 76% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217 91% 60%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-fredoka antialiased;
  }
}

@layer components {
  /* Glassmorphism card */
  .glass-card {
    @apply bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl;
  }

  /* Floating icon container */
  .float-icon {
    @apply glass-card rounded-2xl p-3 shadow-lg;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
  }

  /* Curly underline effect */
  .curly-underline {
    position: relative;
    display: inline-block;
  }
  
  .curly-underline::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 100%;
    height: 12px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 12'%3E%3Cpath d='M0 8 Q 12.5 0, 25 8 T 50 8 T 75 8 T 100 8' stroke='%234ADE80' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  /* Badge pill */
  .badge-pill {
    @apply inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium;
    background: linear-gradient(135deg, hsl(var(--loop-yellow) / 0.2) 0%, hsl(var(--loop-green) / 0.2) 100%);
    border: 1px solid hsl(var(--loop-yellow) / 0.3);
  }

  /* Avatar stack */
  .avatar-stack {
    @apply flex -space-x-3;
  }

  .avatar-stack > * {
    @apply ring-2 ring-white rounded-full;
  }
}

@layer utilities {
  /* Bounce animation for mascot */
  .animate-bounce-slow {
    animation: bounce-slow 3s ease-in-out infinite;
  }

  @keyframes bounce-slow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  /* Float animation for icons */
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-float-delayed {
    animation: float 6s ease-in-out infinite;
    animation-delay: 1.5s;
  }

  .animate-float-delayed-2 {
    animation: float 6s ease-in-out infinite;
    animation-delay: 3s;
  }

  .animate-float-delayed-3 {
    animation: float 6s ease-in-out infinite;
    animation-delay: 4.5s;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    25% {
      transform: translateY(-10px) rotate(2deg);
    }
    50% {
      transform: translateY(-5px) rotate(0deg);
    }
    75% {
      transform: translateY(-15px) rotate(-2deg);
    }
  }
}
