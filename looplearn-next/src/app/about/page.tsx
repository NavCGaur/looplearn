import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Brain, Award, Users, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
    title: 'About Us | LoopLearnX',
    description: 'Learn about LoopLearnX, an educational platform combining joyful spaced repetition and intelligent assessment for school students.',
    alternates: {
        canonical: '/about',
    },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200">
                <div className="text-center pb-8 border-b border-slate-100">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full">
                        <Sparkles className="w-3.5 h-3.5" /> Our Mission
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 font-fredoka">
                        About LoopLearnX
                    </h1>
                    <p className="text-base text-slate-600 mt-2 max-w-2xl mx-auto">
                        Empowering students across Classes 1 to 12 through joyful learning, spaced repetition, and instant intelligent evaluation.
                    </p>
                </div>

                <div className="space-y-10 my-8 text-slate-700 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 font-fredoka mb-3">Why LoopLearnX Exists</h2>
                        <p>
                            Traditional homework grading is slow, giving students feedback days after they wrote their tests. LoopLearnX was created to close that loop: students practice, submit their handwritten work, and receive constructive, instant evaluations highlighting spelling corrections, grammar insights, and conceptual strengths.
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                            <div className="p-3 bg-indigo-600 text-white rounded-xl w-fit mb-3">
                                <Brain className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">Spaced Repetition</h3>
                            <p className="text-xs text-slate-600 leading-normal">
                                Science-backed memory reinforcement schedules so students retain difficult English vocabulary and concepts permanently.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100">
                            <div className="p-3 bg-amber-600 text-white rounded-xl w-fit mb-3">
                                <Award className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">Motivating Leaderboards</h3>
                            <p className="text-xs text-slate-600 leading-normal">
                                Class-wide live leaderboards encourage friendly academic motivation and reward consistent practice.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100">
                            <div className="p-3 bg-purple-600 text-white rounded-xl w-fit mb-3">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">Teacher Hub</h3>
                            <p className="text-xs text-slate-600 leading-normal">
                                Automated tracking of students&apos; common weak vocabulary words and weekly curriculum planning for educators.
                            </p>
                        </div>
                    </div>

                    <section className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 font-fredoka mb-2">Our Founder</h2>
                        <p className="text-sm text-slate-600">
                            LoopLearnX was developed by <strong>Naveen Gaur</strong>, dedicated to building lightweight, high-performance educational tools that make learning joyful for students while saving teachers hours of manual correction work.
                        </p>
                    </section>

                    <div className="text-center pt-4">
                        <Link
                            href="/submit"
                            className="inline-block px-8 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            Try the Practice Portal →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
