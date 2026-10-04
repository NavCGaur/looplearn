-- Migration: Allow class standard from 1 to 12
-- Drop existing check constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_class_standard_check;
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_class_standard_check;
ALTER TABLE subjective_tests DROP CONSTRAINT IF EXISTS subjective_tests_class_standard_check;
ALTER TABLE homework_plans DROP CONSTRAINT IF EXISTS homework_plans_class_standard_check;

-- Re-create constraints with Class 1 to 12
ALTER TABLE profiles ADD CONSTRAINT profiles_class_standard_check CHECK (class_standard BETWEEN 1 AND 12);
ALTER TABLE questions ADD CONSTRAINT questions_class_standard_check CHECK (class_standard BETWEEN 1 AND 12);
ALTER TABLE subjective_tests ADD CONSTRAINT subjective_tests_class_standard_check CHECK (class_standard BETWEEN 1 AND 12);
ALTER TABLE homework_plans ADD CONSTRAINT homework_plans_class_standard_check CHECK (class_standard BETWEEN 1 AND 12);
