# MysteryLearn — Product Requirements Document (PRD)

> **Document Status**: Proposed for Discovery & MVP Planning  
> **Version**: 0.9 - Planning Draft  
> **Date**: 13 October 2026  
> **Primary Users**: Teachers, Students, School / Institution Administrators  
> **Initial Platform**: Responsive Web App (Desktop-first authoring, mobile-friendly solving)  
> **Core Product Rule**: **Make learning visible.** Reward subject understanding and defensible reasoning, not just fluent-looking final answers.

---

## 1. Executive Summary

MysteryLearn is a web-based assignment platform that transforms syllabus-aligned coursework into individual, story-driven investigations. 
Teachers upload course materials, select topics, and approve learning objectives. The platform generates a teacher-reviewable mystery blueprint, then derives equivalent yet individually varied student versions (different characters, settings, clues, numbers, and hint ladders) covering the identical learning outcomes, cognitive demand, and time budget.

### Key Tenets
- **Not an AI Detector**: Not positioned or marketed as an AI detection or surveillance tool. Instead, it is an authentic assessment-design platform making answer-copying ineffective by requiring staged, grounded reasoning.
- **Quantitative, Explainable Analytics**: Actual quantum algorithms are explicitly rejected for the MVP. The platform uses explainable quantitative metrics, rubric evidence mapping, and transparent scoring.
- **Teacher Approval & Control**: The teacher maintains final authority over assignment content, objectives, rubric weights, AI policies, and grade overrides.

---

## 2. Target Users & Permissions

| Role | Main Jobs | Permissions |
| :--- | :--- | :--- |
| **Teacher** | Ingest materials; approve assignment & rubric; track live progress; review staged answers; adjust scores; export results. | Owns classes/assignments; inspects student timelines, evidence citations, and learning reports; overrides grades with audit logging. |
| **Student** | Join class; solve mystery; explore evidence; submit structured reasoning; request hints; revise answers; view feedback. | Accesses only own assigned variant, submitted responses, hints, feedback, and permitted course references. |
| **School Admin** | Manage teacher accounts, institutional settings, retention policies, and aggregate usage. | Org-level management; access to student work only when explicitly authorized by policy. |
| **Platform Support** | Monitor health, resolve infrastructure issues. | Audited, time-limited access without routine access to educational content. |

---

## 3. Primary User Journeys

### 3.1 Teacher: Create & Publish
1. Create class & invite students (code/CSV).
2. Ingest syllabus/materials (PDF, DOCX, PPTX, TXT/MD, ZIP).
3. Configure assignment: grade level, subject, objectives, duration (target 30–40 min), difficulty, hint policy, and AI-use policy (Open / Limited / No External AI).
4. Review extracted candidate topics and approve learning objectives mapped to source passages.
5. Generate mystery blueprint, clue sequence, question variants, answer keys, hint ladders, and rubric.
6. Preview sample student variants, verify equivalence, edit/regenerate as needed, and approve.
7. Publish: generates reproducible student variants using stored seeds and maps.

### 3.2 Student: Solve Mystery
1. Open personal case file (briefing, narrative hook, expected duration, AI policy).
2. Explore interactive evidence cards and clues grounded in course concepts.
3. Answer structured questions with typed reasoning, calculations, or evidence citations.
4. Request staged hints if stuck (Level 1: Nudge $\rightarrow$ Level 2: Concept Reminder $\rightarrow$ Level 3: Explicit Scaffold).
5. Revise answers based on formative feedback; unlock subsequent checkpoints.
6. Complete short final synthesis/reflection and optional AI/source disclosure.
7. Receive transparent scoring report, rubric breakdown, identified strengths, and next steps.

### 3.3 Teacher: Monitor & Intervene
1. Real-time class dashboard: progress, completion, per-objective mastery, common misconceptions, hint usage.
2. Individual student timeline: inspect responses, revisions, hints accessed, and rubric rationale with cited evidence.
3. Accept or override suggested scores with logged reasons; flag responses for 1-on-1 discussion without automated misconduct accusations.
4. Export gradebook (CSV) and class gap reports for lesson planning.

---

## 4. Scoring Model: 100-Point Transparent Rubric

Split into **90 Core Points** (taught curriculum mastery) + **10 Extension Points** (transfer and conceptual depth beyond taught baseline).

| Area | Criterion | Points | Description / Evidence |
| :--- | :--- | :---: | :--- |
| **Core (90)** | **Conceptual Accuracy** | 30 | Correct concepts, definitions, calculations, and conclusions tied to lesson content. |
| **Core (90)** | **Reasoning / Working** | 25 | Valid logical steps, causal explanations, method selection, clue synthesis. |
| **Core (90)** | **Evidence Use** | 15 | Accurate references to supplied clues/data and clear explanation of relevance. |
| **Core (90)** | **Application** | 10 | Application of taught methods to the specific mystery scenario. |
| **Core (90)** | **Communication** | 10 | Clear, coherent explanation enabling evaluation of student reasoning. |
| **Extension (10)** | **Transfer Beyond Baseline** | 6 | Applies concepts to novel contexts, tests alternatives, links distinct ideas. |
| **Extension (10)** | **Original Synthesis / Depth** | 4 | Proposes justified insights, identifies limitations, or frames defensible next steps. |

---

## 5. Supported MVP Puzzle Types

1. **Short Constructed Response**: Explaining a phenomenon, justifying a hypothesis, or detailing a mechanism in student's own words.
2. **Evidence Selection + Explanation**: Selecting relevant evidence cards/clues from distractors and justifying why they support a claim.
3. **Numerical / Data Interpretation**: Analyzing charts, tables, measurements, or calculating values to deduce an event or outcome.
4. **Sequence / Cause-and-Effect Reasoning**: Ordering events, identifying causal chains, or diagnosing anomalies from chronological clues.

---

## 6. Personalisation & Equivalence Engine

### Safe Variation vs. Invariant Core
- **Safe to Vary**: Character names, locations, narrative framing, numerical values, datasets, distractor details, hint phrasing, clue order.
- **Must Remain Invariant**: Learning objectives, curriculum scope, rubric criteria, point weights, cognitive demand band, stage count, and estimated time budget.

### Equivalence Safeguards
- Matrix mapping every checkpoint to canonical learning objectives.
- Stored random seed and generation version for exact reproducibility during teacher review.
- Teacher-visible canonical solution guide and acceptable alternative approaches.

---

## 7. Technical Architecture

- **Frontend**: Next.js / React + TypeScript; responsive, desktop-first authoring, mobile-friendly solving, WCAG 2.2 AA accessibility.
- **Backend API**: Python FastAPI or TypeScript API.
- **Database**: PostgreSQL (relational schemas for users, classes, assignments, variants, attempts, rubric versions, scores, audit trails).
- **Search & Retrieval**: Full-text search + `pgvector` for grounded context retrieval from uploaded teacher materials.
- **Storage**: Private S3-compatible object storage for uploaded slides, PDFs, notes, and generated assets.
- **AI / LLM Layer**: Provider-agnostic abstraction for material extraction, grounded mystery generation, equivalence validation, and rubric-based evaluation.
- **Job Queue**: Asynchronous workers for file parsing, mystery generation, evaluation, and report exports.

---

## 8. MVP Acceptance Criteria Summary

1. Teacher can ingest documents (PDF, DOCX, PPTX, TXT/MD, ZIP) and review extracted text and candidate learning objectives.
2. Teacher can edit/approve learning objectives before mystery generation.
3. System generates grounded mystery with clear objective-to-checkpoint mapping.
4. Teacher can preview canonical solution, rubric, answer guides, and at least two distinct student variants before publishing.
5. Students receive unique, reproducible variants with autosave and version history.
6. Multi-level hint ladder logs usage without penalizing curiosity or claiming misconduct.
7. Evaluator provides evidence citations, misconception labels, and suggested points against the 100-point rubric.
8. Teachers can override grades with an audit trail and export CSV gradebooks.
