# Technical Implementation Reference — Mystery Learning Platform
*(Extracted from the Master Technical Implementation Design Session)*

---

## 1. System Overview & Core Philosophy
The **Mystery Learning Platform** is an educational web application that converts traditional assignments into interactive, investigative mysteries. Instead of assessing memorized answers or AI-generated essays, it evaluates student reasoning across staged checkpoints.

### Key Tenets:
1. **Curriculum-Grounded**: Mysteries are not arbitrary games; every clue, question, and checkpoint is tied directly to learning objectives extracted from teacher-uploaded course materials.
2. **Parametric Equivalence**: Each student gets a uniquely personalized case (different names, settings, evidence values, clue sequences) that covers the exact same difficulty and curriculum objectives, making direct answer-copying useless.
3. **Reasoning-Driven Assessment**: Progression requires students to select evidence, explain cause-and-effect, and justify hypotheses.
4. **100-Point Rubric**: Quantitative evaluation (90 Core + 10 Extension) with misconception diagnosis and teacher override capabilities.

---

## 2. Overall Technical Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (Next.js 16)                │
│  - Teacher Portal (Upload, Review, Blueprint, Analytics)│
│  - Student Case Solver (Dossier, Clues, Staged Solving)│
│  - Dynamic Visuals (Tailwind CSS, Lucide, Framer)     │
└───────────────────────┬────────────────────────────────┘
                        │ HTTPS / REST / Server Actions
┌───────────────────────▼────────────────────────────────┐
│               Backend & AI Processing Layer            │
│  - Server Actions & Next.js API Route Handlers          │
│  - Document Parsing Engine (PDF, DOCX, TXT)            │
│  - Semantic Chunker & Vector Store Controller          │
│  - LLM RAG Pipeline (Gemini / OpenAI structured output)│
│  - 4 MVP Puzzle Engines & Equivalence Generator        │
│  - 100-Point Rubric Evaluator & Misconception Matrix   │
└───────────────────────┬────────────────────────────────┘
                        │
┌───────────────────────▼────────────────────────────────┐
│          Database & Storage Layer (Supabase)           │
│  - PostgreSQL 16 + pgvector                            │
│  - Supabase Auth + RLS (Role-based access control)     │
│  - Tables: profiles, assignments, materials, chunks,   │
│            mysteries, checkpoints, submissions, grades │
│  - Private Storage (Uploads, Evidence Assets)          │
└────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Data Models & Schemas

### A. `profiles`
- `id` (UUID, PK referencing `auth.users(id)`)
- `email` (TEXT)
- `full_name` (TEXT)
- `institution` (TEXT)
- `role` ('teacher' | 'student' | 'admin')
- `created_at`, `updated_at` (TIMESTAMPTZ)

### B. `assignments`
- `id` (UUID, PK)
- `teacher_id` (UUID referencing `profiles(id)`)
- `title` (VARCHAR 160)
- `subject` (VARCHAR 120)
- `course_name` (VARCHAR 120)
- `description` (TEXT)
- `learning_objectives` (JSONB - Array of LO objects)
- `difficulty` ('easy' | 'medium' | 'hard')
- `due_at` (TIMESTAMPTZ)
- `status` ('draft' | 'published')
- `created_at`, `updated_at`, `published_at`

### C. `materials` & `document_chunks`
- `id` (UUID, PK)
- `assignment_id` (UUID referencing `assignments(id)`)
- `file_name` (TEXT), `file_path` (TEXT), `file_type` (TEXT)
- `extracted_text` (TEXT)
- `document_chunks`:
  - `id` (UUID, PK)
  - `material_id` (UUID)
  - `chunk_index` (INT)
  - `content` (TEXT)
  - `embedding` (VECTOR 384 or 1536)
  - `metadata` (JSONB)

### D. `mysteries` & `checkpoints`
- `id` (UUID, PK)
- `assignment_id` (UUID)
- `title` (TEXT)
- `narrative_premise` (TEXT)
- `canonical_solution` (TEXT)
- `rubric_definition` (JSONB - 100-point breakdown)
- `checkpoints` (Ordered stages):
  - `id` (UUID, PK)
  - `mystery_id` (UUID)
  - `stage_index` (INT)
  - `puzzle_type` ('constructed_response' | 'evidence_selection' | 'data_interpretation' | 'sequence')
  - `target_learning_objective` (TEXT)
  - `clues_provided` (JSONB)
  - `prompt_question` (TEXT)
  - `rubric_criteria` (JSONB)
  - `hint_ladder` (JSONB - 3 tiers)

### E. `submissions` & `evaluations`
- `student_id` (UUID)
- `checkpoint_id` (UUID)
- `student_response` (TEXT / JSONB)
- `hints_used_count` (INT)
- `time_spent_seconds` (INT)
- `score` (NUMERIC 0-100)
- `evaluation_feedback` (JSONB: evidence citations, strengths, misconceptions, teacher override note)

---

## 4. Phase-by-Phase Technical Implementation

### Phase D: Curriculum Ingestion & Learning Objective RAG
1. **File Upload Interface**: Support PDF, DOCX, TXT.
2. **Text Parsing Engine**: Extract raw clean text from multi-page documents.
3. **Semantic Chunking**: Split text into ~500-token chunks with overlap.
4. **Learning Objective (LO) Extraction**:
   - Send chunked summaries to the LLM.
   - Return structured JSON with Bloom's Taxonomy category (Recall, Comprehension, Application, Analysis, Evaluation).
5. **Teacher Approval Matrix**:
   - Teacher selects/edits candidate LOs before generation.

### Phase E: Grounded Mystery Generation & Personalisation Engine
1. **Blueprint Synthesis**:
   - LLM receives approved LOs + grounding text passages.
   - Generates a compelling narrative frame (investigation, case study, forensic scenario).
2. **Checkpoint Generation**:
   - Generates 3–5 sequential stages.
   - For each stage, sets:
     - Narrative context & new clue unlocked.
     - Puzzle type (Constructed Response, Evidence Selection, Data Interpretation, Sequence).
     - 3-tier Hint Ladder.
3. **Student Variant Engine (Safe Variation vs Invariant Core)**:
   - *Invariants*: Learning objectives, cognitive demand band, point weights, criteria.
   - *Variants*: Names, locations, numerical values, distractor clues, narrative skin.

### Phase F: Student Interactive Investigation Environment
1. **Dossier UI**:
   - Detective case file with Evidence Locker, Clue Notebook, and progressive checkpoint unlock.
2. **Interactive Answer Inputs**:
   - Drag-and-drop evidence card selector.
   - Structured constructed response box with live reasoning prompts.
   - Data visualizer / timeline sequencer.
3. **Adaptive Hint Ladder**:
   - Level 1: Conceptual Nudge.
   - Level 2: Guiding Question.
   - Level 3: Direct Clue Reference.
   - Transparently logs telemetry without arbitrary marks deduction.

### Phase G: 100-Point Rubric AI Evaluation & Teacher Diagnostics
1. **Rubric Evaluator**:
   - Scores responses against specific learning objective criteria (Core 90 + Extension 10).
   - Generates explicit citations from student answers.
   - Flags cognitive misconceptions from a diagnostic library.
2. **Teacher Grading & Analytics View**:
   - Class-wide mastery heatmap across learning objectives.
   - One-click teacher grade override with audit trail.
   - Exportable gradebook (CSV / JSON).

---

## 5. College Project & Viva Defense Justification
When explaining this project to evaluators:
- **Why not just multiple-choice?** Multiple-choice allows lucky guessing and is easily solved by LLMs without student thought.
- **Why not standard essays?** Students paste AI outputs into essays. Mystery checkpoints force students to synthesize staged clues that differ per student.
- **Why not quantum algorithms in MVP?** We explain that classical integer programming and graph algorithms efficiently solve puzzle variation constraints without unnecessary quantum simulation overhead.
