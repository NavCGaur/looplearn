import { Heart } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-10 border-t border-gray-800">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-gray-800">
                    {/* Brand & Made with Love */}
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <Link href="/" className="text-2xl font-bold font-fredoka text-white hover:text-indigo-400 transition-colors">
                            LoopLearn<span className="text-indigo-400">X</span>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-gray-400 font-fredoka mt-1">
                            <span>Made with</span>
                            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                            <span>for my students by Naveen Gaur</span>
                        </div>
                    </div>

                    {/* Navigation / Compliance Links */}
                    <nav className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-300">
                        <Link href="/about" className="hover:text-white transition-colors">
                            About Us
                        </Link>
                        <Link href="/contact" className="hover:text-white transition-colors">
                            Contact
                        </Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/leaderboard" className="hover:text-white transition-colors">
                            Leaderboard
                        </Link>
                        <Link href="/submit" className="hover:text-white transition-colors">
                            Submit Work
                        </Link>
                    </nav>

                    {/* Social Link */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="https://x.com/NAVEENCGaur"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-gray-800 rounded-full hover:bg-gray-700 hover:text-blue-400 transition-colors"
                            aria-label="Naveen Gaur on X"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                        </Link>
                    </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2">
                    <p>© {new Date().getFullYear()} LoopLearnX. All rights reserved.</p>
                    <p>Designed for joyful educational learning & practice.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
