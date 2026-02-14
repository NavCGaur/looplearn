# LoopLearnX

> **Master Your Subjects with Adaptive, Loop-Based Learning.**

LoopLearnX is an intelligent educational platform designed to reinforce learning through spaced repetition, interactive quizzes, and personalized feedback. Built for students and educators alike, it transforms traditional rote memorization into an engaging, efficient loop of continuous improvement.

---

## 📖 Overview

LoopLearnX tackles the problem of forgetting curve by implementing a robust **Spaced Repetition System (SRS)**. Whether you are a guest user looking for a quick quiz or a registered student tracking long-term mastery, the app adapts to your performance.

-   **For Students:** Personalized study sessions, progress tracking, and gamified learning.
-   **For Educators:** Insightful analytics to monitor student performance and identify knowledge gaps.
-   **For Everyone:** A seamless, responsive experience across devices.

## ✨ Features

-   **🧠 Spaced Repetition Logic**: Algorithmic scheduling of questions to maximize retention.
-   **🔄 Non-Repetition for Guests**: Smart session handling ensures guests don't see the same question twice in a session, with progress persisted locally.
-   **📝 Diverse Question Formats**:
    -   Multiple Choice Questions (MCQ)
    -   Fill-in-the-Blank (with intelligent input handling)
    -   Word Cards & Hangman (Coming Soon)
-   **📊 Smart Analytics**: Detailed breakdowns of mastered vs. struggling topics.
-   **🎨 Premium UI/UX**: Built with a "Lovable" design philosophy, featuring smooth transitions, dark mode support, and responsive layouts.
-   **🤖 AI Integration**: Leveraging Google Generative AI for dynamic content explanation and hints.

## 🧠 Spaced Repetition System (SRS)

LoopLearnX implements a modified SM-2 algorithm to optimize your learning:

-   **Daily Reviews**: New questions learned today (Day 0) are due for review tomorrow (Day 1).
-   **No Expiration**: Missed reviews accumulate daily until completed.
-   **Smart Intervals**: 
    -   **Correct Logic**: Intervals increase (1 day → 6 days → Exponential growth).
    -   **Incorrect Logic**: Intervals reset to 1 day for immediate re-learning.
-   **Goal**: The "Due Today" counter on your dashboard tracks your progress. Aim for zero!

## 🏗️ Architecture

LoopLearnX is built on a modern, scalable tech stack:

-   **Frontend**: [Next.js 16](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with `tailwind-merge` & `clsx`
-   **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives & [Lucide React](https://lucide.dev/) icons
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
-   **Math Rendering**: [KaTeX](https://katex.org/)
-   **AI**: Google Generative AI SDK

**High-Level Flow:**
1.  **Client**: Next.js renders server and client components. State is managed via React hooks relative to the user's session.
2.  **Edge**: Middleware handles authentication and routing protection.
3.  **Database**: Supabase stores user profiles, quiz data, spaced repetition logs, and content.

## 🚀 Installation & Setup

Follow these steps to get LoopLearnX running locally.

### Prerequisites
-   Node.js 18+
-   npm or yarn

### Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/looplearn-next.git
    cd looplearn-next
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory and add your credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

5.  **Open in Browser**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the app.

## 📖 Usage Guide

### Getting Started
1.  **Guest Mode**: Click "Start Quiz" on the home page to jump straight into learning. Your progress is saved to your browser unless you clear your cache.
2.  **Sign Up/Login**: Create an account to sync progress across devices and access detailed analytics.

### Taking a Quiz
-   Select a subject or chapter.
-   Answer questions. Immediate feedback is provided.
-   Use "Explain" (if available) to get AI-driven insights into the answer.

## ⚙️ Configuration Options

The app can be customized via environment variables:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL for your Supabase project instance. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key for Supabase. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | API key for Google Gemini (for AI features). |
| `NEXT_PUBLIC_SITE_URL` | Base URL for auth redirects (e.g., in production). |

## 📈 Data & Progress Tracking

-   **Authenticated Users**: All quiz results, mastery levels, and SRS schedules are stored securely in Supabase (PostgreSQL).
-   **Guest Users**: Progress is stored in `localStorage` to provide continuity. If a guest signs up, we plan to migrate this data to their new account (Roadmap item).

## 🗺️ Roadmap

-   [ ] **Guest Improvements**: Better data migration from guest to registered user.
-   [ ] **B2B Layer**: Features tailored for schools and institutions.
-   [ ] **New Game Modes**: Hangman and Word Card matching.
-   [ ] **Advanced AI**: Personalized study plan generation.

## 🤝 Contributing

We welcome contributions from developers and educators!

1.  **Fork the repo** on GitHub.
2.  **Clone the project** to your own machine.
3.  **Commit changes** to your own branch.
4.  **Push** your work back up to your fork.
5.  Submit a **Pull Request** so we can review your changes.

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

## 🙏 Acknowledgments

-   **Design Inspiration**: "Lovable" design principles.
-   **Tech**: The incredible open-source communities behind Next.js, React, and Supabase.

## 📞 Contact & Support

For support, feedback, or collaboration opportunities:

-   📧 **Email**: [naveencg070@gmail.com](mailto:naveencg070@gmail.com)
-   ✖️ **X (Twitter)**: [@NAVEENCGaur](https://x.com/NAVEENCGaur)
