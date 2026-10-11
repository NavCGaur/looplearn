import type { Metadata } from 'next';
import { Mail, MapPin, Globe, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Contact Us | LoopLearnX',
    description: 'Get in touch with the LoopLearnX team for support, school partnerships, or feature suggestions.',
    alternates: {
        canonical: '/contact',
    },
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200">
                <div className="text-center pb-8 border-b border-slate-100">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full">
                        <Sparkles className="w-3.5 h-3.5" /> Support & Inquiries
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 font-fredoka">
                        Contact LoopLearnX
                    </h1>
                    <p className="text-base text-slate-500 mt-2 max-w-xl mx-auto">
                        Have questions about test evaluation, school teacher accounts, or need help with a student profile? We are here to assist!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex items-start gap-4">
                        <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-xs">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Direct Email</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Quick responses within 24 hours</p>
                            <a
                                href="mailto:hello@naveengaur.com"
                                className="text-indigo-600 font-semibold text-sm hover:underline mt-2 inline-block"
                            >
                                hello@naveengaur.com
                            </a>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex items-start gap-4">
                        <div className="p-3 bg-purple-600 text-white rounded-xl shadow-xs">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Website & Portal</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Official online platform</p>
                            <a
                                href="https://looplearnx.com"
                                className="text-indigo-600 font-semibold text-sm hover:underline mt-2 inline-block"
                            >
                                looplearnx.com
                            </a>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 sm:p-8 rounded-2xl text-center">
                    <h3 className="text-lg font-bold text-indigo-950 font-fredoka">
                        Teacher & School Inquiries
                    </h3>
                    <p className="text-sm text-indigo-800/80 mt-1 max-w-lg mx-auto">
                        Teachers looking to deploy automated paper evaluation, weekly curriculum planning, or custom class leaderboards can reach out directly via email with school details.
                    </p>
                    <a
                        href="mailto:hello@naveengaur.com?subject=Teacher%20Inquiry%20LoopLearnX"
                        className="inline-block mt-4 px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
                    >
                        Send an Email
                    </a>
                </div>
            </div>
        </div>
    );
}
