"use client";

import { motion } from "framer-motion";
import { Brain, Layers, Target, Gamepad2, Zap, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from 'next/link';

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
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${color.includes('blue') ? 'bg-loop-blue' :
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
        <section id="features" className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-background via-loop-purple/5 to-background">
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
                        <span className="text-foreground text-2xl">Our Approach</span>
                    </motion.span>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4">
                        The <span className="text-loop-blue">Loop</span>{" "}
                        <span className="text-loop-green">Learning</span>{" "}
                        <span className="text-loop-purple">Method</span>
                    </h2>

                    <p className="text-2xl mt-6 leading-relaxed">
                        One concept, many formats. Word cards, quizzes, and games reinforce knowledge until it sticks.
                    </p>


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
                    <p className="text-muted-foreground text-xl sm:text-3xl pt-10 mb-2">Ready to break the forgetting cycle?</p>
                    <div className="flex justify-center mt-8 px-4 sm:px-0">
                        <Link href="#guest-access">
                            <Button size="lg" className="group rounded-full text-lg sm:text-2xl px-6 py-4 sm:px-8 sm:py-6 h-auto bg-[#4ADE80] hover:bg-[#22c55e] text-white shadow-lg shadow-green-200/50 font-bold w-full sm:w-auto cursor-pointer">
                                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2 fill-current transition-transform group-hover:scale-110" />
                                Start Your Learning Loop!
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturesSection;
