# LoopLearn (looplearn)

An education-focused MERN-ish application combining a React + Vite frontend with an Express/MongoDB backend providing quiz generation, question management, vocabulary practice, speech analysis, and user/points management.

This repository contains two main parts:
- `serene-vista-learn/` — the Vite + React (TypeScript) frontend UI
- `server/` — the Node (ESM) + Express backend with MongoDB models and API routes

## Project overview

LoopLearn is designed to help teachers and learners generate, assign, and manage practice questions across subjects (science, math, grammar, vocabulary) and to provide speech analysis features. The server contains utilities for generating quizzes, bulk uploading question sets, assigning questions/words to users or classes, and tracking points/leaderboards.

## Tech stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS (shadcn UI pieces), MUI, React Router, React Query
- Backend: Node.js (ESM), Express, Mongoose (MongoDB)
- Auth: Firebase token verification (server integrates with Firebase admin)
- Other services: Stripe integration for payments, Microsoft/Azure speech SDKs, Google Translate (partial)

## Repository layout

- `/serene-vista-learn` — Frontend app (Vite)
- `/server` — Express backend
  - `controllers/` — Express route handlers
  - `routes/` — API route definitions (mounted under `/api`)
  - `models/` — Mongoose schemas
  - `services/` — business logic used by controllers
  - `utility/` — helpers (quiz generation, upload helpers)
  - `scripts/` — helper/test scripts (bulk upload simulators, migrations)

## Installation

Prerequisites:
- Node.js >= 18 recommended
- MongoDB instance (local or hosted) and connection URI
- Firebase project (for authentication) if you want to use token verification
- (Optional) Stripe account for payments and webhooks

Steps:

1. Clone the repository:

   git clone https://github.com/NavCGaur/looplearn.git
   cd looplearn

2. Install server dependencies and configure environment variables:

   cd server
   npm install

3. Install frontend dependencies:

   cd ..\serene-vista-learn
   npm install

4. Start services locally (run server and frontend in separate terminals):

   # start server (from /server)
   npm run dev  # or `node server.js` after setting NODE_ENV and env vars

   # start frontend (from /serene-vista-learn)
   npm run dev

Note: The server's package.json in `server/` doesn't include a `start` script by default — you can run `node server.js` or add scripts as needed.

## Environment variables

Create a `.env` file in the `server/` directory (copy from any example if available) and set at minimum:

- MONGO_URL: MongoDB connection string
- PORT: (optional) port to run the server (default 5000)
- NODE_ENV: development | production
- FIREBASE_* or path to Firebase admin key if using Firebase token verification — this project includes `server/lingualearnkey.json` as an example key file (do not commit your own keys)
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET: if using Stripe endpoints
- AZURE_TTS_KEY, AZURE_TTS_REGION or MICROSOFT_SPEECH_KEY etc. for speech features

Example `.env` (do not commit):

MONGO_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/looplearn?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
AZURE_TTS_KEY=...
AZURE_TTS_REGION=...

## API endpoints

All backend API routes are mounted under `/api/*` in `server/server.js`.

Below is a summary of available endpoints by feature area and their main behaviors (read controller code for full details):

- Auth (`/api/auth`)
  - POST `/verify-token` — verify Firebase token and return user info
  - POST `/register` — register a new user (Firebase-backed)

- Users (`/api/users`)
  - GET `/` — list all users
  - GET `/:userId` — get a specific user by id
  - POST `/:userId/words` — assign a word to a user (body: { word })
  - POST `/bulk-assign-word` — assign a word to many users (body: { userIds: [], wordData: { word, ... } })
  - DELETE `/:userId/words/:wordId` — remove an assigned word
  - DELETE `/delete/:id` — delete a single user
  - DELETE `/bulk-delete` — delete multiple users (body: { userIds: [] })
  - POST `/addPoints` — add points to a user (body: { userId, points, reason })
  - GET `/points/:userId` — get points for a specific user
  - GET `/points` — get leaderboard (all users' points)
  - GET `/questions/:uid` — get quiz questions for a user
  - GET `/class/:classStandard` — get all users in a class
  - POST `/class/:classStandard/assign-word` — assign a word to all users in a class
  - PUT `/:userId/class` — update a user's class standard
  - PUT `/update-profile` — (protected) update profile for onboarding (requires auth middleware)

- Vocabulary (`/api/vocab`)
  - GET `/practice` — retrieve vocabulary practice words
  - POST `/submitratings` — submit user ratings for vocabulary items

- Vocabulary Questions (`/api/vocab-questions`)
  - GET `/` — get vocabulary questions
  - POST `/submit` — submit answers

- Grammar Questions (`/api/grammer-questions`)
  - GET `/` — get grammar questions
  - POST `/submit` — submit answers

- Math (`/api/math`)
  - POST `/generateQuestions` — generate math questions
  - POST `/save-selected` — save selected generated questions
  - POST `/bulk-upload` — bulk upload questions (uses validation middleware)
  - GET `/get-math-questions/:classStandard` — get assigned math questions for a class
  - GET `/get-all-questions` — get all math questions
  - GET `/filter-questions` — filter questions with query params
  - POST `/assign-math-questions` — assign math questions to class
  - GET `/assigned-questions/:classStandard` — get assigned math questions
  - DELETE `/unassign-questions/:classStandard` — unassign questions
  - GET `/available-questions/:classStandard` — get available questions for assignment
  - POST `/assign-questions/:classStandard` — assign new questions to class

- Science (`/api/science`)
  - GET `/practice` — practice words (science)
  - POST `/submitratings` — submit ratings
  - POST `/generateQuestions` — generate science questions
  - POST `/save-selected` — save selected science questions
  - GET `/get-science-questions/:classStandard` — get assigned science questions
  - GET `/get-all-questions` — get all science questions
  - GET `/filter-questions` — filter science questions
  - GET `/science-question/stats` — get question stats
  - PUT `/update-question/:id` — update a question
  - DELETE `/delete-question/:id` — delete a question
  - POST `/assign-science-questions` — assign science questions to class
  - GET `/assigned-questions/:classStandard` — get assigned science questions
  - DELETE `/unassign-questions/:classStandard` — unassign assigned questions
  - GET `/available-questions/:classStandard` — get available questions for assignment
  - POST `/assign-questions/:classStandard` — assign new questions to class
  - POST `/bulk-upload` — bulk upload science questions

- Question Manager (`/api/question-manager`)
  - POST `/assign` — assign question ids to class/subject/chapter
  - POST `/deassign` — remove assignment
  - POST `/generate` — generate unified questions (requires subject, classStandard, chapter, numberOfQuestions, questionType)
  - POST `/bulk-upload` — bulk upload questions
  - GET `/assigned` — list assigned questions (query: subject, classStandard, chapter, page, limit)
  - GET `/subjects` — list available subjects
  - GET `/classes` — list class standards
  - GET `/chapters` — list chapters (query: subject, classStandard)
  - GET `/debug` — debug ping

- Speech & Speech-Shadow (`/api/speech` & `/api/speech-shadow`)
  - `/api/speech`:
    - POST `/transcribe` — transcribe speech audio
    - POST `/analyze` — analyze pronunciation
    - GET `/history` — get user analysis history
    - GET `/details/:id` — get a single analysis details
  - `/api/speech-shadow`:
    - POST `/synthesize` — generate speech from text (TTS)
    - POST `/analyze` — (multipart form) analyze a user recording against reference text (upload `audio` field)
    - GET `/analysis` — get analysis results

- Stripe (`/api/stripe`)
  - POST `/create-checkout-session` — create Stripe checkout (protected)
  - POST `/create-billing-portal` — create billing portal session (protected)
  - POST `/webhook` — Stripe webhook (raw body expected)

- Stats (`/api/stats`)
  - GET `/vocabulary` — get vocabulary statistics

Note: Some endpoints require authentication via Firebase token. Check `server/middleware/auth.js` for details.

## Detailed features

- Quiz & question generation
  - Generate questions programmatically (question manager + generator service) and persist them to MongoDB
  - Save selected generated questions for later assignment
  - Bulk upload question sets via admin endpoints

- Assignment & classroom management
  - Assign questions to class standards/subjects/chapters
  - Assign vocabulary words to users or entire classes
  - Bulk-assign and bulk-delete user operations

- User management & gamification
  - Track user points, leaderboard, and award points programmatically
  - User onboarding and profile updates (class standard, display name)

- Speech analysis
  - Transcription and pronunciation analysis (uses Microsoft/Azure speech SDK)
  - Generate TTS audio for shadowing exercises
  - Upload and analyze user recordings (with file size limits)

- Payments
  - Stripe checkout and billing portal support, with webhook handling for events

## Contribution guidelines

We welcome contributions. To contribute:

1. Fork the repo and create a feature branch:

   git checkout -b feat/your-feature

2. Run tests and linters (if any) and make sure your changes build.

3. Open a Pull Request with a clear description of the change and why it is needed.

Guidelines:
- Keep changes small and focused.
- Document new environment variables and config changes in the README.
- Ensure no credentials or secret keys are committed.

If you plan to add new API endpoints, update this README's API section and add minimal tests and controller/service updates.

## License

This project includes a `server/package.json` with "license": "ISC". If you want the repository to use a specific license, add a top-level `LICENSE` file. For now assume ISC for the server. Update as needed.

## Notes & next steps

- The server's `server.js` mounts the main routes and expects `MONGO_URL` to connect. If you need a `start` script, add one to `server/package.json` (e.g., `"start": "node server.js"`).
- There are helper scripts in `server/scripts/` for simulating bulk uploads and other tasks — check them when populating the database.

If you'd like, I can also:
- Add a sample `.env.example` in `server/` with the expected env variables
- Add `start` and `dev` scripts to `server/package.json`
- Generate a top-level `LICENSE` file

---
Generated by an automated repository scan. Review and adjust wording, license, and examples to match your deployment practices.
