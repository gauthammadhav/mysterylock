-- ==============================================================================
-- Migration: 0008_change_submission_score_to_numeric.sql
-- Description: Convert submissions.score to NUMERIC(5, 2) to support floating-point scores
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

ALTER TABLE public.submissions 
ALTER COLUMN score TYPE NUMERIC(5, 2);

NOTIFY pgrst, 'reload schema';
