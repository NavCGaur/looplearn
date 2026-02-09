
import { Heart, Twitter } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-8">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">

                {/* Left Side: Made with love text */}
                <div className="flex items-center gap-2 text-sm md:text-xl font-fredoka">
                    <span>Made with</span>
                    <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                    <span>for my students</span>
                </div>

                {/* Right Side: Naveen Gaur & Social Link */}
                <div className="flex items-center gap-6">
                    <span className="font-semibold text-gray-400 text-xl">Naveen Gaur</span>

                    <Link
                        href="https://x.com/NAVEENCGaur"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 hover:text-blue-400 transition-colors"
                    >
                        <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                            {/* X Icon (Simple textual representation or Lucide Twitter as fallback) */}
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                        </div>
                    </Link>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
