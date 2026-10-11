import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms of Service | LoopLearnX',
    description: 'Terms of Service and conditions for using LoopLearnX educational learning tools.',
    alternates: {
        canonical: '/terms',
    },
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200">
                <div className="border-b border-slate-100 pb-6 mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        Terms of Service
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 font-fredoka">
                        Terms of Service
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Last Updated: October 2026
                    </p>
                </div>

                <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-700">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using <strong>LoopLearnX</strong> (<a href="https://looplearnx.com" className="text-indigo-600 hover:underline">looplearnx.com</a>), you agree to comply with and be bound by these Terms of Service and our <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>. If you do not agree to these terms, please do not use the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
                        <p>
                            LoopLearnX offers automated assessment of student homework, interactive quizzes, spaced-repetition vocabulary learning, and teacher management tools for students across Classes 1 through 12. We strive to provide accurate educational evaluations, but automated assessments are designed as supplementary learning aids and should be reviewed in conjunction with teacher guidance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. Acceptable Use</h2>
                        <p>When using LoopLearnX, you agree not to:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Upload inappropriate, abusive, illegal, or harmful images or text.</li>
                            <li>Attempt to disrupt, overload, or bypass rate limits or authentication security.</li>
                            <li>Use automated bots or scrapers to extract question banks or student scoreboards.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. Intellectual Property</h2>
                        <p>
                            All branding, software, proprietary algorithms, and original educational designs on LoopLearnX are owned by LoopLearnX and its founders. Students retain ownership of their personal written work submitted for assessment.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Disclaimer & Limitation of Liability</h2>
                        <p>
                            The platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind. LoopLearnX shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the platform.
                        </p>
                    </section>

                    <section className="border-t border-slate-200 pt-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-3">6. Contact & Support</h2>
                        <p>
                            For inquiries concerning these terms, please contact: <a href="mailto:hello@naveengaur.com" className="text-indigo-600 hover:underline">hello@naveengaur.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
