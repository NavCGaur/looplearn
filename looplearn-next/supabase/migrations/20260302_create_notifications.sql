-- ============================================================
-- Notifications system — LoopLearn
-- ============================================================

CREATE TABLE notifications (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title       text NOT NULL,
    message     text NOT NULL,
    type        text NOT NULL CHECK (type IN ('teacher_note', 'submission', 'achievement', 'error', 'system')),
    is_read     boolean DEFAULT false NOT NULL,
    link        text,          -- e.g. '/student/quick-practice' — where to navigate on click
    metadata    jsonb,         -- extra data (submission_id, score, etc.)
    created_at  timestamptz DEFAULT now() NOT NULL
);

-- Index for fast per-user queries
CREATE INDEX idx_notifications_user_id     ON notifications (user_id);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read) WHERE is_read = false;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Server-side insert: teachers/admins + server actions insert on behalf of users
-- We allow insert from service role (server actions use anon key so we need authenticated inserts too)
CREATE POLICY "Authenticated users can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Enable Realtime on this table (run in Supabase dashboard if needed)
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
