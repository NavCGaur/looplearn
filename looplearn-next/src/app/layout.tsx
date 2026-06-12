import type { Metadata } from "next";
import { Inter, Roboto_Mono, Fredoka } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import Footer from "@/components/Footer";
import { getUser } from "@/lib/supabase/server";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  variable: "--font-geist-sans", // Keeping variable name to avoid breaking css
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono", // Keeping variable name
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://looplearnx.com"),
  title: "LoopLearnX – Fun Learning for Kids",
  description: "Word cards, quizzes, hangman, and spaced repetition for joyful learning.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LoopLearnX – Fun Learning for Kids",
    description: "Word cards, quizzes, hangman, and spaced repetition for joyful learning.",
    url: "https://looplearnx.com/",
    siteName: "LoopLearnX",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "LoopLearnX - Mastery Through Repetition",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LoopLearnX – Fun Learning for Kids",
    description: "Word cards, quizzes, hangman, and spaced repetition for joyful learning.",
    images: ["/social-preview.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} ${fredoka.variable} antialiased`}
      >
        {/* PWA Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) { console.log('[SW] Registered:', reg.scope); })
                    .catch(function(err) { console.log('[SW] Registration failed:', err); });
                });
              }
            `,
          }}
        />
        <OfflineBanner />
        <Navbar user={user?.user || null} profile={user?.profile || null} />
        {children}
        <Footer />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || ''} />
      </body>
    </html>
  );
}
