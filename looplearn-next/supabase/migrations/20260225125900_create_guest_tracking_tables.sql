-- Create Guest Tracking Tables

CREATE TABLE IF NOT EXISTS public.guest_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    class_standard INTEGER NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT,
    converted_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Turn on RLS
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to insert
CREATE POLICY "Allow anonymous inserts into guest_sessions" ON public.guest_sessions
    FOR INSERT WITH CHECK (true);

-- Allow admins or authenticated users (eventually converted) to read (optional, tailored later)
CREATE POLICY "Allow reading own converted sessions" ON public.guest_sessions
    FOR SELECT USING (auth.uid() = converted_to_user_id);


CREATE TABLE IF NOT EXISTS public.guest_quiz_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.guest_sessions(session_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    given_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER,
    error_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.guest_quiz_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into guest_quiz_logs
CREATE POLICY "Allow anonymous inserts into guest_quiz_logs" ON public.guest_quiz_logs
    FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_guest_sessions_converted ON public.guest_sessions(converted_to_user_id);
CREATE INDEX IF NOT EXISTS idx_guest_quiz_logs_session ON public.guest_quiz_logs(session_id);
