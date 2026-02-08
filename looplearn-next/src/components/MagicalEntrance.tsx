"use client";

import Image from "next/image";
import { useState } from "react";

type UserType = "student" | "parent" | null;

export default function MagicalEntrance() {
    const [userType, setUserType] = useState<UserType>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleUserTypeSelect = (type: UserType) => {
        setIsAnimating(true);
        setUserType(type);
        setTimeout(() => setIsAnimating(false), 600);
    };

    return (
        <div className="min-h-screen bg-cloud-gray flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Mascot Greeting */}
                <div className="text-center mb-8">
                    <div className="relative inline-block">
                        <Image
                            src="/loopie-main.png"
                            alt="Loopie the Tiger"
                            width={200}
                            height={200}
                            priority
                        />
                    </div>
                    <h1 className="text-4xl font-fredoka font-bold text-foreground mt-4">
                        Welcome to LoopLearn!
                    </h1>
                    <p className="text-lg text-foreground/70 mt-2 font-fredoka">
                        Let&apos;s start your learning adventure! 🚀
                    </p>
                </div>

                {/* User Type Selection */}
                <div className="bg-white rounded-3xl shadow-lg p-8 space-y-4">
                    <h2 className="text-2xl font-fredoka font-semibold text-center mb-6">
                        I am a...
                    </h2>

                    <button
                        onClick={() => handleUserTypeSelect("student")}
                        className={`w-full py-6 px-8 rounded-2xl font-fredoka font-semibold text-xl transition-all duration-300 ${userType === "student"
                            ? "bg-primary-blue text-white scale-105 shadow-xl"
                            : "bg-cloud-gray text-foreground hover:bg-primary-blue/10 hover:scale-102"
                            } ${isAnimating && userType === "student" ? "animate-celebrate" : ""}`}
                        style={{ minHeight: "var(--touch-target-min)" }}
                    >
                        🎓 Student
                    </button>

                    <button
                        onClick={() => handleUserTypeSelect("parent")}
                        className={`w-full py-6 px-8 rounded-2xl font-fredoka font-semibold text-xl transition-all duration-300 ${userType === "parent"
                            ? "bg-grassy-green text-white scale-105 shadow-xl"
                            : "bg-cloud-gray text-foreground hover:bg-grassy-green/10 hover:scale-102"
                            } ${isAnimating && userType === "parent" ? "animate-celebrate" : ""}`}
                        style={{ minHeight: "var(--touch-target-min)" }}
                    >
                        👨‍👩‍👧 Parent
                    </button>

                    {/* Login Form (appears after selection) */}
                    {userType && (
                        <div className="mt-8 space-y-4 animate-in fade-in duration-500">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-6 py-4 rounded-xl border-2 border-cloud-gray focus:border-primary-blue outline-none text-lg font-fredoka"
                                style={{ minHeight: "var(--touch-target-min)" }}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full px-6 py-4 rounded-xl border-2 border-cloud-gray focus:border-primary-blue outline-none text-lg font-fredoka"
                                style={{ minHeight: "var(--touch-target-min)" }}
                            />
                            <button
                                className="w-full py-4 px-8 rounded-xl bg-sunshine-yellow text-foreground font-fredoka font-bold text-xl hover:bg-sunshine-yellow/90 transition-all hover:scale-105 shadow-lg"
                                style={{ minHeight: "var(--touch-target-min)" }}
                            >
                                Let&apos;s Go! 🎉
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-foreground/50 mt-6 font-fredoka text-sm">
                    New here?{" "}
                    <a href="#" className="text-primary-blue hover:underline font-semibold">
                        Create an account
                    </a>
                </p>
            </div>
        </div>
    );
}
