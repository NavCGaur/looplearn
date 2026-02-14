'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    Menu, X, ChevronDown, User, LogOut, LayoutDashboard,
    BookOpen, BrainCircuit, GraduationCap, Trophy,
    BarChart, Sparkles, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { LoopLearnXIcon } from "@/components/ui/brand-icons";
import { signOut } from "@/app/actions/auth";

interface NavbarProps {
    user: any;
    profile: any;
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    href={href}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";

export function Navbar({ user, profile }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Check scroll for sticky effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Hide Navbar on dashboard and teacher routes (but NOT leaderboard)
    if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/teacher')) {
        return null;
    }

    const handleSignOut = async () => {
        await signOut();
        router.refresh();
    };

    const role = profile?.role || 'guest';

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "backdrop-blur-md shadow-sm border-b border-gray-100 py-2"
                    : "bg-transparent py-4"
            )}
            style={isScrolled ? { backgroundColor: 'hsl(var(--background))' } : undefined}
        >
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group mr-8">
                    <span className="text-2xl md:text-3xl font-bold font-fredoka flex items-center">
                        <span className="bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 bg-clip-text text-transparent">LoopLearn</span>

                        <LoopLearnXIcon className="w-8 h-8" />
                    </span>
                    <motion.span
                        className="text-2xl"
                        animate={{
                            rotate: [0, 15, -15, 0],
                            y: [0, -5, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        🚀
                    </motion.span>
                </Link>

                {/* Desktop Navigation - Centered */}
                <div className="hidden md:flex flex-1 justify-center">
                    <nav className="flex items-center gap-8">
                        {/* <Link href="/" className="text-base font-fredoka text-gray-700 hover:text-gray-900 transition-all hover:-translate-y-0.5">
                            Explore
                        </Link> */}
                        <Link href="#features" className="text-base font-fredoka text-gray-700 hover:text-gray-900 transition-all hover:-translate-y-0.5">
                            Features
                        </Link>
                        <Link href="#leaderboard" className="text-base font-fredoka text-gray-700 hover:text-gray-900 transition-all hover:-translate-y-0.5">
                            Leaderboard
                        </Link>
                    </nav>
                </div>

                {/* Auth Buttons / Profile */}
                <div className="hidden md:flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">
                                {profile?.full_name || user.email}
                            </span>
                            <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-full">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                            {/* Contextual Dashboard Link based on Role */}
                            <Link href={role === 'teacher' ? "/teacher/dashboard" : "/dashboard"}>
                                <Button variant="default" size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Dashboard
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link href="/auth/login">
                                <Button
                                    variant="outline"
                                    className="rounded-full px-6 bg-card hover:bg-accent text-foreground border-2 border-input hover:border-primary/50 shadow-sm hover:shadow-md font-fredoka font-semibold transition-all cursor-pointer"
                                >
                                    Login
                                </Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white font-fredoka font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-gray-700 p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 backdrop-blur-md border-b border-blue-100 p-6 shadow-xl animate-in slide-in-from-top-4">
                    <nav className="flex flex-col gap-3">
                        <Link
                            href="/"
                            className="flex items-center gap-3 p-3 hover:bg-white/80 rounded-xl transition-all font-fredoka font-medium text-gray-700 hover:text-blue-600 hover:shadow-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Home className="w-5 h-5 text-blue-500" />
                            <span>Home</span>
                        </Link>

                        {role === 'guest' && (
                            <Link
                                href="/quiz"
                                className="flex items-center gap-3 p-3 hover:bg-white/80 rounded-xl transition-all font-fredoka font-medium text-gray-700 hover:text-purple-600 hover:shadow-md"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <BrainCircuit className="w-5 h-5 text-purple-500" />
                                <span>Practice Quiz</span>
                            </Link>
                        )}

                        {role === 'student' && (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 p-3 hover:bg-white/80 rounded-xl transition-all font-fredoka font-medium text-gray-700 hover:text-blue-600 hover:shadow-md"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <LayoutDashboard className="w-5 h-5 text-blue-500" />
                                <span>Dashboard</span>
                            </Link>
                        )}

                        {role === 'teacher' && (
                            <Link
                                href="/teacher/dashboard"
                                className="flex items-center gap-3 p-3 hover:bg-white/80 rounded-xl transition-all font-fredoka font-medium text-gray-700 hover:text-blue-600 hover:shadow-md"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <LayoutDashboard className="w-5 h-5 text-blue-500" />
                                <span>Dashboard</span>
                            </Link>
                        )}

                        <div className="border-t border-blue-100 pt-4 mt-2">
                            {user ? (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start font-fredoka font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-center bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-2 border-gray-200 hover:border-blue-300 font-fredoka font-bold rounded-xl shadow-sm hover:shadow-md transition-all"
                                        >
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-fredoka font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
