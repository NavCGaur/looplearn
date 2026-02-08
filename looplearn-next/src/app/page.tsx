import Link from 'next/link'
import Image from 'next/image'
import { getUser } from './actions/auth'
import HeroSection from '@/components/HeroSection'
import GuestAccessSection from '@/components/GuestAccessSection'
import FeaturesSection from '@/components/FeaturesSection'
import LeaderboardSection from '@/components/LeaderboardSection'

export default async function Home() {
  const user = await getUser()

  if (user) {
    // If user is logged in, show a different hero/dashboard redirect view or keep basic
    // For now, we keep the original logged-in view logic but can enhance later
    return (
      <div className="min-h-screen bg-gradient-to-br from-cloud-gray via-white to-primary-blue/10">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-8">Welcome Back, {user.profile?.full_name || 'Student'}!</h1>
          <div className="flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/quiz"
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Resume Practice
            </Link>
          </div>
          <div className="mt-16 text-left">
            <LeaderboardSection />
          </div>
        </div>
      </div>
    )
  }

  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <LeaderboardSection />
      <GuestAccessSection />
    </main>
  )
}
