'use client'

import React from 'react';
import { motion } from "framer-motion";
import { Play, LayoutDashboard, Calculator, FlaskConical, Atom, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

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
            <div className="flex -space-x-2">
                {avatars.map((avatar, i) => (
                    <motion.img
                        key={i}
                        src={avatar}
                        alt={`Student ${i + 1}`}
                        className="w-10 h-10 rounded-full border-2 border-white bg-white"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
                    />
                ))}
            </div>
            <motion.p
                className="text-sm text-gray-600 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
            >
                Trusted by <span className="text-gray-900 font-semibold">1000+</span> students
            </motion.p>
        </div>
    );
};

const HeroSection = () => {
    return (
        <section className="min-h-screen relative overflow-hidden pt-8" style={{ background: 'linear-gradient(135deg, hsl(210 40% 98%) 0%, hsl(217 91% 97%) 50%, hsl(142 71% 97%) 100%)' }}>
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-200/20 blur-3xl" />
                <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-green-200/20 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-yellow-200/10 blur-3xl" />
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
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <span className="badge-pill mb-4 font-fredoka text-gray-900">
                                <span className="text-lg">🚀</span>
                                <span >The #1 Fun Learning App</span>
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-foreground font-fredoka"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <span className="block">Mastery Through</span>
                            <span className="block">Repetition</span>
                            <span className="curly-underline text-[#4ADE80]">Loop It</span>!
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            className="text-lg sm:text-xl text-foreground/70 max-w-xl leading-relaxed font-medium"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            Reinforces concepts through cards, quizzes, and games until they stick. Repetition, because it works.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            className="flex flex-wrap gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                        >
                            <Link href="#guest-access">
                                <Button size="lg" className="group rounded-full text-base px-8 py-6 h-auto bg-[#4ADE80] hover:bg-[#22c55e] text-white shadow-lg shadow-green-200/50 font-bold cursor-pointer">
                                    <Play className="w-5 h-5 mr-2 fill-current transition-transform group-hover:scale-110" />
                                    Start Quiz Now
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="rounded-full text-base px-8 py-6 h-auto border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-semibold cursor-pointer">
                                <LayoutDashboard className="w-5 h-5 mr-2 text-gray-700" />
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
                            color="text-blue-500"
                        />
                        <FloatingIcon
                            icon={FlaskConical}
                            className="top-12 right-4 lg:top-16 lg:right-8"
                            delay={1.5}
                            color="text-purple-500"
                        />
                        <FloatingIcon
                            icon={Atom}
                            className="bottom-24 left-0 lg:bottom-32 lg:left-4"
                            delay={3}
                            color="text-pink-500"
                        />
                        <FloatingIcon
                            icon={Globe}
                            className="bottom-8 right-8 lg:bottom-12 lg:right-0"
                            delay={4.5}
                            color="text-green-500"
                        />

                        {/* Mascot Container - Glassmorphic Card */}
                        <motion.div
                            className="relative z-10 w-80 h-80 sm:w-96 sm:h-96 lg:w-[480px] lg:h-[480px] xl:w-[550px] xl:h-[550px]"
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
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-200/20 via-blue-200/10 to-yellow-200/20 blur-2xl" />

                            {/* Mascot placeholder - Glass Card */}
                            <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-2xl p-8">
                                <img
                                    src="/loopie-main.png"
                                    alt="Loopie Mascot"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </motion.div>

                        {/* XP Badge floating element */}
                        <motion.div
                            className="absolute top-1/4 -right-2 sm:-right-6 lg:right-0 z-20 hidden sm:flex bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-0 items-center gap-2 shadow-lg border border-white/50"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1, duration: 0.5 }}
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <span className="text-sm sm:text-lg font-bold text-yellow-600">⚡</span>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Daily XP</p>
                                <p className="text-sm sm:text-lg font-bold text-gray-900">+500 XP</p>
                            </div>
                        </motion.div>

                        {/* Achievement Badge */}
                        <motion.div
                            className="absolute bottom-1/4 -left-2 sm:-left-4 lg:left-0 z-20 hidden sm:flex bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 items-center gap-2 shadow-lg border border-white/50"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-sm sm:text-lg">🏆</span>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">New Badge</p>
                                <p className="text-xs sm:text-sm font-bold text-gray-900">Math Master</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div >
            </div >
        </section >
    );
};

export default HeroSection;
