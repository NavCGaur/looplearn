-- Add error_type column to quiz_logs table
ALTER TABLE public.quiz_logs 
ADD COLUMN IF NOT EXISTS error_type text;

-- Create index for analytics on error types
CREATE INDEX IF NOT EXISTS idx_quiz_logs_error_type ON public.quiz_logs(error_type);
