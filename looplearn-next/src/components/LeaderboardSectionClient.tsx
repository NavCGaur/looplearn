"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Medal, Crown, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface LeaderboardPlayer {
    id: string
    display_name: string
    points: number
    rank: number
}

interface LeaderboardClientProps {
    topFive: LeaderboardPlayer[]
    totalCount: number
}

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

const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
}

const getStreak = (points: number) => {
    return Math.floor(points / 100)
}

export function LeaderboardClient({ topFive, totalCount }: LeaderboardClientProps) {
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
                        <div className="col-span-3 text-center">Points</div>
                        <div className="col-span-3 md:col-span-2 text-center">Streak</div>
                    </div>

                    {/* Leaderboard Rows */}
                    <div className="space-y-3">
                        {topFive.length > 0 ? (
                            topFive.map((player, index) => (
                                <motion.div
                                    key={player.id}
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
                                                {getInitials(player.display_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-semibold font-fredoka text-foreground truncate">
                                            {player.display_name}
                                            {player.rank === 1 && (
                                                <Sparkles className="inline w-4 h-4 ml-1 text-loop-yellow" />
                                            )}
                                        </span>
                                    </div>

                                    {/* Points */}
                                    <div className="col-span-3 text-center">
                                        <span className="font-bold font-fredoka text-primary">
                                            {player.points.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-1">pts</span>
                                    </div>

                                    {/* Streak */}
                                    <div className="col-span-3 md:col-span-2 flex items-center justify-center gap-1">
                                        <Flame className={`w-5 h-5 ${getStreak(player.points) >= 30 ? "text-orange-500 fill-orange-400" : getStreak(player.points) >= 15 ? "text-orange-400 fill-orange-300" : "text-orange-300 fill-orange-200"}`} />
                                        <span className="font-bold font-fredoka text-foreground">{getStreak(player.points)}</span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-card/50 rounded-2xl border-2 border-border/50">
                                <p className="text-4xl mb-3">🏆</p>
                                <p className="text-muted-foreground">No rankings yet. Be the first!</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    className="text-center mt-12 max-w-3xl mx-auto w-full px-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-gradient-to-r from-loop-purple/10 via-primary/10 to-loop-green/10 border border-primary/20 w-full">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🎮</span>
                            <p className="text-lg font-fredoka text-foreground font-medium">
                                Ready to climb the ranks?
                            </p>
                            <span className="text-2xl">🚀</span>
                        </div>
                        <Link href="/auth/signup">
                            <Button
                                variant="default"
                                size="lg"
                                className="group bg-green-500 hover:bg-green-600 text-white rounded-full text-xl px-8 py-6 h-auto cursor-pointer"
                            >
                                <span>Sign Up to Compete</span>
                                <motion.span
                                    className="text-xl ml-2"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    🏆
                                </motion.span>
                            </Button>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Join <span className="font-bold text-primary">{totalCount}</span> learners already on the leaderboard!
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
