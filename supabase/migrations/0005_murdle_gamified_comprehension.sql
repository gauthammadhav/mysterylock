-- ==============================================================================
-- Migration: 0005_murdle_gamified_comprehension.sql
-- Description: Gamified comprehension mysteries with tab-switch flags & detailed student logs
-- ==============================================================================

-- 1. Add tab switch integrity flags & student unique id to submissions
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS student_id_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS tab_switch_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS tab_switch_logs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS time_spent_seconds INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS photo_upload_url TEXT,
ADD COLUMN IF NOT EXISTS ai_evaluations JSONB DEFAULT '[]'::jsonb;

-- 2. Add question configuration to assignments table
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS question_config JSONB DEFAULT '{"mcq": 2, "descriptive": 1, "puzzle": 1, "photo": false}'::jsonb,
ADD COLUMN IF NOT EXISTS rag_summary TEXT,
ADD COLUMN IF NOT EXISTS story_plans JSONB DEFAULT '[]'::jsonb;
