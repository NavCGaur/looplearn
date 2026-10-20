const fs = require('fs');
const path = require('path');

const verbsPath = path.join(__dirname, '../src/lib/challenge/data/verbs.json');
const verbs = JSON.parse(fs.readFileSync(verbsPath, 'utf8'));

let sql = `-- ==========================================
-- Six-Day English Verb Challenge Migration
-- Created: 2026-10-20
-- ==========================================

-- 1. Table: verb_challenge_words
CREATE TABLE IF NOT EXISTS public.verb_challenge_words (
  id            INTEGER PRIMARY KEY,
  day           INTEGER NOT NULL CHECK (day BETWEEN 1 AND 6),
  v1_base_form  TEXT NOT NULL,
  v2_past_form  TEXT NOT NULL,
  hindi_meaning TEXT NOT NULL,
  verb_type     TEXT NOT NULL CHECK (verb_type IN ('regular', 'irregular'))
);

CREATE INDEX IF NOT EXISTS idx_verb_challenge_words_day ON public.verb_challenge_words(day);

ALTER TABLE public.verb_challenge_words ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read verbs" ON public.verb_challenge_words;
CREATE POLICY "Public read verbs" ON public.verb_challenge_words FOR SELECT USING (true);

-- 2. Table: verb_challenge_attempts
CREATE TABLE IF NOT EXISTS public.verb_challenge_attempts (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name     TEXT NOT NULL,
  class_standard   INTEGER NOT NULL,
  challenge_day    INTEGER NOT NULL CHECK (challenge_day BETWEEN 1 AND 6),
  score            INTEGER NOT NULL,
  max_score        INTEGER NOT NULL DEFAULT 40,
  word_card_score  INTEGER DEFAULT 0,
  fillblank_score  INTEGER DEFAULT 0,
  hangman_score    INTEGER DEFAULT 0,
  grammar_score    INTEGER DEFAULT 0,
  sentence_score   INTEGER DEFAULT 0,
  missed_verb_ids  INTEGER[] DEFAULT '{}',
  answers_json     JSONB,
  submitted_at     TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_verb_challenge_student_day UNIQUE(student_name, class_standard, challenge_day)
);

CREATE INDEX IF NOT EXISTS idx_verb_challenge_attempts_day ON public.verb_challenge_attempts(challenge_day);
CREATE INDEX IF NOT EXISTS idx_verb_challenge_attempts_student ON public.verb_challenge_attempts(student_name, class_standard);

ALTER TABLE public.verb_challenge_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert attempts" ON public.verb_challenge_attempts;
CREATE POLICY "Public insert attempts" ON public.verb_challenge_attempts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public read attempts" ON public.verb_challenge_attempts;
CREATE POLICY "Public read attempts" ON public.verb_challenge_attempts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public update attempts" ON public.verb_challenge_attempts;
CREATE POLICY "Public update attempts" ON public.verb_challenge_attempts FOR UPDATE USING (true);

-- 3. Seed 200 Verbs
INSERT INTO public.verb_challenge_words (id, day, v1_base_form, v2_past_form, hindi_meaning, verb_type) VALUES
`;

const values = verbs.map(v => {
  const hindi = v.hindi_meaning.replace(/'/g, "''");
  const v1 = v.v1_base_form.replace(/'/g, "''");
  const v2 = v.v2_past_form.replace(/'/g, "''");
  return `(${v.id}, ${v.day}, '${v1}', '${v2}', '${hindi}', '${v.verb_type}')`;
});

sql += values.join(',\n') + `
ON CONFLICT (id) DO UPDATE SET
  day = EXCLUDED.day,
  v1_base_form = EXCLUDED.v1_base_form,
  v2_past_form = EXCLUDED.v2_past_form,
  hindi_meaning = EXCLUDED.hindi_meaning,
  verb_type = EXCLUDED.verb_type;
`;

const targetPath = path.join(__dirname, '../supabase/migrations/20261020_verb_challenge.sql');
fs.writeFileSync(targetPath, sql, 'utf8');
console.log('Migration generated successfully. Path:', targetPath, 'Size:', sql.length);
