'use client'

import { motion } from 'framer-motion'
import { Sparkles, Star, Trophy, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { GoogleSignInButton } from '@/components/auth/google-signin-button'

const FloatingShape = ({
    className,
    delay = 0,
    children
}: {
    className: string
    delay?: number
    children: React.ReactNode
}) => (
    <motion.div
        className={`absolute ${className}`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.5, type: 'spring' }}
    >
        <motion.div
            animate={{
                y: [0, -8, 0],
                rotate: [0, 5, -5, 0],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
            }}
        >
            {children}
        </motion.div>
    </motion.div>
)

export default function LoginPage() {
    return (
        <section className="min-h-screen py-20 lg:py-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(210 40% 98%) 0%, hsl(217 91% 97%) 50%, hsl(142 71% 97%) 100%)' }}>
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
                    <span className="badge-pill mb-4 font-fredoka">
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
                                ease: 'easeInOut',
                            }}
                        >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-loop-yellow/30 via-loop-green/20 to-loop-blue/30 blur-3xl scale-110" />
                            <Image
                                src="/loopie-main.png"
                                alt="Loopie the learning mascot"
                                width={320}
                                height={320}
                                className="relative w-64 h-64 sm:w-80 sm:h-80 object-contain drop-shadow-2xl"
                                priority
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
                            <GoogleSignInButton />

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
                                    { icon: '🏆', text: 'Compete on the Leaderboard' },
                                    { icon: '⚡', text: 'Earn XP & Level Up' },
                                    { icon: '📊', text: 'Track Your Progress' },
                                    { icon: '🎯', text: 'Personalized Learning Path' },
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
                                By signing in, you agree to our{' '}
                                <a href="#" className="text-primary hover:underline">
                                    Terms
                                </a>{' '}
                                &{' '}
                                <a href="#" className="text-primary hover:underline">
                                    Privacy Policy
                                </a>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
