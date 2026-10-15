-- ==============================================================================
-- Migration: 0003_mysteries_and_checkpoints.sql
-- Description: Grounded mystery blueprints, sequential checkpoints, and student variants
-- ==============================================================================

-- 1. Mysteries table (The overarching investigative case study)
CREATE TABLE IF NOT EXISTS public.mysteries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    narrative_premise TEXT NOT NULL,
    setting_context TEXT,
    canonical_solution TEXT NOT NULL,
    rubric_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_stages INT NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mysteries_assignment_id ON public.mysteries(assignment_id);

-- 2. Checkpoints table (Staged investigative challenges tied 1:1 with learning objectives)
CREATE TABLE IF NOT EXISTS public.checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mystery_id UUID NOT NULL REFERENCES public.mysteries(id) ON DELETE CASCADE,
    stage_index INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    puzzle_type VARCHAR(50) NOT NULL CHECK (puzzle_type IN ('constructed_response', 'evidence_selection', 'data_interpretation', 'sequence')),
    target_learning_objective TEXT NOT NULL,
    narrative_stage TEXT NOT NULL,
    clues JSONB NOT NULL DEFAULT '[]'::jsonb,
    prompt_question TEXT NOT NULL,
    rubric_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    hint_ladder JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_checkpoints_mystery_id ON public.checkpoints(mystery_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_stage_index ON public.checkpoints(mystery_id, stage_index);

-- 3. Student Variants table (Parametrically equivalent variations per student)
CREATE TABLE IF NOT EXISTS public.student_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mystery_id UUID NOT NULL REFERENCES public.mysteries(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    seed VARCHAR(64) NOT NULL,
    variant_index INT NOT NULL DEFAULT 1,
    narrative_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
    checkpoint_variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_student_variants_mystery_id ON public.student_variants(mystery_id);
CREATE INDEX IF NOT EXISTS idx_student_variants_student_id ON public.student_variants(student_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.mysteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_variants ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Mysteries
CREATE POLICY "Teachers can manage mysteries for their assignments"
ON public.mysteries
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.assignments
        WHERE assignments.id = mysteries.assignment_id
        AND assignments.teacher_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.assignments
        WHERE assignments.id = mysteries.assignment_id
        AND assignments.teacher_id = auth.uid()
    )
);

CREATE POLICY "Students can view mysteries of published assignments"
ON public.mysteries
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.assignments
        WHERE assignments.id = mysteries.assignment_id
        AND assignments.status = 'published'
    )
);

-- 6. RLS Policies for Checkpoints
CREATE POLICY "Teachers can manage checkpoints for their mysteries"
ON public.checkpoints
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.mysteries
        JOIN public.assignments ON assignments.id = mysteries.assignment_id
        WHERE mysteries.id = checkpoints.mystery_id
        AND assignments.teacher_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.mysteries
        JOIN public.assignments ON assignments.id = mysteries.assignment_id
        WHERE mysteries.id = checkpoints.mystery_id
        AND assignments.teacher_id = auth.uid()
    )
);

CREATE POLICY "Students can view checkpoints of published mysteries"
ON public.checkpoints
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.mysteries
        JOIN public.assignments ON assignments.id = mysteries.assignment_id
        WHERE mysteries.id = checkpoints.mystery_id
        AND assignments.status = 'published'
    )
);

-- 7. RLS Policies for Student Variants
CREATE POLICY "Teachers can view all student variants for their mysteries"
ON public.student_variants
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.mysteries
        JOIN public.assignments ON assignments.id = mysteries.assignment_id
        WHERE mysteries.id = student_variants.mystery_id
        AND assignments.teacher_id = auth.uid()
    )
);

CREATE POLICY "Students can view their assigned variants"
ON public.student_variants
FOR SELECT
TO authenticated
USING (student_id = auth.uid());
