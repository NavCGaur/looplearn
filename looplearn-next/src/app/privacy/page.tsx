import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy | LoopLearnX',
    description: 'Privacy Policy for LoopLearnX educational learning and practice platform.',
    alternates: {
        canonical: '/privacy',
    },
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200">
                <div className="border-b border-slate-100 pb-6 mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        Legal & Compliance
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 font-fredoka">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Last Updated: October 2026 · Effective Date: October 2026
                    </p>
                </div>

                <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-700">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
                        <p>
                            Welcome to <strong>LoopLearnX</strong> (<a href="https://looplearnx.com" className="text-indigo-600 hover:underline">looplearnx.com</a>). We provide interactive tools, quizzes, flashcards, and automated homework assessment designed to help school students reinforce concepts through joyful learning and spaced repetition.
                        </p>
                        <p className="mt-2">
                            We respect your privacy and are committed to protecting any personal information collected through our platform. This Privacy Policy details how we collect, use, and safeguard your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>
                                <strong>Account Information:</strong> When signing in via Google authentication or email, we collect your display name, email address, and chosen role (student or teacher) and class standard (Grades 1–12).
                            </li>
                            <li>
                                <strong>Assessment Submissions:</strong> When students submit homework or dictation answer sheets via <Link href="/submit" className="text-indigo-600 hover:underline">looplearnx.com/submit</Link>, we process the uploaded images and calculate evaluation scores, weak vocabulary words, and leaderboard rankings.
                            </li>
                            <li>
                                <strong>Technical & Log Data:</strong> Like most web applications, our servers automatically record information including your IP address, browser type, device information, and pages visited.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. Cookies & Third-Party Advertising (Google AdSense)</h2>
                        <p>
                            LoopLearnX uses cookies to enhance user experience, remember sessions, and support platform maintenance through third-party advertising partners.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 my-4">
                            <h3 className="font-bold text-amber-900 mb-1">Google AdSense & DoubleClick Cookie Disclosure:</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-amber-950">
                                <li>
                                    Google, as a third-party vendor, uses cookies to serve ads on LoopLearnX.
                                </li>
                                <li>
                                    Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to LoopLearnX and/or other sites on the Internet.
                                </li>
                                <li>
                                    Users may opt out of personalized advertising by visiting{' '}
                                    <a
                                        href="https://www.google.com/settings/ads"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-700 underline font-semibold"
                                    >
                                        Google Ads Settings
                                    </a>{' '}
                                    or by visiting{' '}
                                    <a
                                        href="https://www.aboutads.info/choices/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-700 underline font-semibold"
                                    >
                                        www.aboutads.info
                                    </a>.
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. Protection of Student Data & COPPA</h2>
                        <p>
                            We take student data privacy seriously:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>We do <strong>not</strong> sell student personal data to third parties.</li>
                            <li>Uploaded homework sheets are used solely for grading, spelling error detection, and study tracking.</li>
                            <li>Leaderboard displays show student names, class grades, and scores only to encourage healthy academic competition.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Retention & Security</h2>
                        <p>
                            We implement industry-standard encryption, Row Level Security (RLS), and secure cloud infrastructure through Supabase and Vercel to protect data against unauthorized access or disclosure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">6. Your Rights</h2>
                        <p>
                            You have the right to request access to the data we hold about you, request corrections, or request deletion of your account and submitted data. To exercise any of these rights, contact us at the details below.
                        </p>
                    </section>

                    <section className="border-t border-slate-200 pt-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-3">7. Contact Information</h2>
                        <p>
                            If you have questions regarding this Privacy Policy or data protection practices, please contact:
                        </p>
                        <div className="mt-3 bg-slate-50 p-4 rounded-xl text-sm border border-slate-200">
                            <p><strong>LoopLearnX Support</strong></p>
                            <p>Email: <a href="mailto:hello@naveengaur.com" className="text-indigo-600 hover:underline">hello@naveengaur.com</a></p>
                            <p>Website: <a href="https://looplearnx.com" className="text-indigo-600 hover:underline">https://looplearnx.com</a></p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
