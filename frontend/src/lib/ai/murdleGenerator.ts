import { GoogleGenAI } from "@google/genai";

export interface MurdleClue {
  id: string;
  category: "Suspect / Actor" | "Location / Environment" | "Mechanism / Method" | "Data / Reading";
  name: string;
  icon?: string;
  highlight_color: string; // e.g. '#F59E0B' (amber), '#3B82F6' (blue), '#10B981' (emerald), '#8B5CF6' (purple)
  detail: string;
  verified_fact: boolean;
}

export interface MurdleQuestion {
  id: string;
  type: "mcq" | "puzzle" | "descriptive" | "photo";
  title: string;
  prompt: string;
  options?: string[]; // for MCQ and Puzzle deduction
  correct_answer?: string;
  rubric_goal: string;
  hint?: string;
}

export interface GamifiedStoryPassage {
  title: string;
  subtitle: string;
  case_number: string;
  passage_text: string;
  clues: MurdleClue[];
  questions: MurdleQuestion[];
}

interface GenerateParams {
  studentName: string;
  studentId: string;
  title: string;
  subject: string;
  learningObjectives: string[];
}

/**
 * Generates an engaging, colorful Murdle-style comprehension case study + deduction grid
 * with highlighted clues, multi-type questions, and trace-back evidence.
 */
export async function generateMurdlePassageAndQuestions(
  params: GenerateParams
): Promise<GamifiedStoryPassage> {
  const { studentName, studentId, title, subject, learningObjectives } = params;
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an elite educational game designer inspired by Murdle.com and aptitude reading comprehensions.
Create an exciting, colorful, story-driven comprehension case for university student "${studentName}" (Student ID: ${studentId}).

Topic: "${title}"
Discipline: "${subject}"
Curriculum Concepts / Learning Objectives:
${learningObjectives.map((lo, i) => `${i + 1}. ${lo}`).join("\n")}

REQUIREMENTS:
1. CASE PASSAGE (2 to 3 engaging paragraphs):
   - Frame it as an investigative scenario (e.g. debugging a major system failure, diagnosing an unexplained lab anomaly, uncovering an architectural vulnerability, or solving a forensic audit).
   - Students must read carefully to extract clues.
   - Naturally embed 4 to 6 specific Clues/Key Elements in the text that can be highlighted (e.g. Actor/Suspect, Location, Method/Algorithm, Data Reading).
2. CLUES LIST (4 to 5 structured evidence cards):
   - Category: "Suspect / Actor", "Location / Environment", "Mechanism / Method", or "Data / Reading"
   - Name and detail explaining how it relates to the concept.
   - highlight_color: hex string ('#F59E0B', '#3B82F6', '#10B981', or '#8B5CF6').
3. QUESTIONS (Mix of formats testing deep comprehension and traceback):
   - Question 1 (Puzzle / Deduction): Deductive question (e.g. "Which suspect or parameter must be ruled out based on paragraph 1?").
   - Question 2 (MCQ): Multiple-choice testing accurate subject mechanics.
   - Question 3 (Descriptive Reasoning): Open-ended question where the student explains the root cause and cites evidence from the text.
   - Question 4 (Applied / Diagram or Photo upload prompt): A practical scenario or code fix question.

Respond strictly with valid JSON conforming to:
{
  "title": "The Mystery of ...",
  "subtitle": "Case File #${Math.floor(100 + Math.random() * 900)}: Investigation in ${subject}",
  "case_number": "CASE-${Math.floor(1000 + Math.random() * 9000)}",
  "passage_text": "Story paragraphs with rich detail...",
  "clues": [
    {
      "id": "c1",
      "category": "Mechanism / Method",
      "name": "Clue Name",
      "highlight_color": "#10B981",
      "detail": "How this clue fits into the topic...",
      "verified_fact": true
    }
  ],
  "questions": [
    {
      "id": "q1",
      "type": "puzzle",
      "title": "Clue Deduction Grid",
      "prompt": "Based on the evidence in paragraph 2, which component is definitely NOT the culprit?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "rubric_goal": "Demonstrates logical elimination using passage evidence.",
      "hint": "Check the timestamp correlation in the second paragraph."
    },
    {
      "id": "q2",
      "type": "mcq",
      "title": "Core Mechanism Check",
      "prompt": "What fundamental principle explained in the story explains why the system failed?",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": "A. ...",
      "rubric_goal": "Identifies the core curriculum concept.",
      "hint": "Re-read the explanation of the operating threshold."
    },
    {
      "id": "q3",
      "type": "descriptive",
      "title": "Evidence-Based Defense",
      "prompt": "Explain in your own words the step-by-step sequence of events that caused the anomaly. Quote or cite at least two clues from your dossier.",
      "rubric_goal": "Deep conceptual reasoning and evidence synthesis.",
      "hint": "Trace back from the final error message to the initial input."
    },
    {
      "id": "q4",
      "type": "photo",
      "title": "Solution Architecture / Working Diagram",
      "prompt": "Sketch the corrected sequence or write the 3-line patch on paper/editor, and explain how it prevents this vulnerability.",
      "rubric_goal": "Application of taught engineering concepts to fix the problem.",
      "hint": "Ensure input validation occurs before state mutation."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (err) {
      console.warn("Gemini Murdle passage generation failed, using gamified fallback:", err);
    }
  }

  // High quality Murdle-style fallback generator
  return getFallbackMurdlePassage(params);
}

function getFallbackMurdlePassage({
  studentName,
  title,
  subject,
  learningObjectives,
}: GenerateParams): GamifiedStoryPassage {
  const primaryConcept = learningObjectives[0] || `${subject} Core Principles`;
  const secondaryConcept = learningObjectives[1] || `${subject} Systems Logic`;

  return {
    title: `The Incident at Terminal 9: ${subject} in Crisis`,
    subtitle: `Case File #407 • Special Forensic Assessment for Agent ${studentName}`,
    case_number: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
    passage_text: `At 03:14 AM, the automated monitoring system at Terminal 9 logged an unhandled exception. Systems Architect Dr. Vane insisted the architecture was sound, pointing to the standard test suite which passed with zero warnings. However, Junior Analyst Maya noticed an anomalous memory spike occurring exclusively when concurrent requests processed ${primaryConcept.toLowerCase()}.

Upon closer inspection of the data logs, an intriguing pattern emerged. The batch worker was configured to pull pending records every 500 milliseconds. But whenever ${secondaryConcept.toLowerCase()} was triggered, the lock on the shared memory buffer failed to release before the subsequent worker thread attempted to write. Rather than raising a fatal error, the system quietly dropped payload segments, masking the failure while generating corrupted results.

As the lead investigator assigned to this audit, your mission is to examine the clues in your dossier, trace the execution timeline back to the initial trigger, and prove exactly which condition allowed the silent corruption to spread unnoticed.`,
    clues: [
      {
        id: "c1",
        category: "Mechanism / Method",
        name: "Buffer Lock Failure",
        highlight_color: "#10B981",
        detail: "The lock failed to release before subsequent thread execution, violating mutual exclusion.",
        verified_fact: true,
      },
      {
        id: "c2",
        category: "Data / Reading",
        name: "500ms Worker Heartbeat",
        highlight_color: "#3B82F6",
        detail: "Worker pulls records on fixed intervals, creating race condition window during heavy loads.",
        verified_fact: true,
      },
      {
        id: "c3",
        category: "Suspect / Actor",
        name: "Dr. Vane's Test Suite",
        highlight_color: "#F59E0B",
        detail: "Standard single-threaded tests never simulated concurrent race conditions.",
        verified_fact: true,
      },
      {
        id: "c4",
        category: "Mechanism / Method",
        name: "Silent Payload Dropping",
        highlight_color: "#8B5CF6",
        detail: "The system suppressed runtime exceptions, returning default values instead of throwing errors.",
        verified_fact: true,
      },
    ],
    questions: [
      {
        id: "q1",
        type: "puzzle",
        title: "Deduction: Eliminate False Hypotheses",
        prompt: "Based strictly on Maya's telemetry findings in the passage, which component can be ruled out as the direct cause of the corrupted summaries?",
        options: [
          "A. The automated monitoring system hardware",
          "B. The 500ms concurrent thread race condition",
          "C. The unreleased lock on shared memory buffer",
          "D. Silent exception suppression in payload parsing",
        ],
        correct_answer: "A. The automated monitoring system hardware",
        rubric_goal: "Demonstrates deductive reasoning by isolating software concurrency from hardware false-positives.",
        hint: "The passage notes hardware logs were working normally; the bug was caused by logical execution order.",
      },
      {
        id: "q2",
        type: "mcq",
        title: "Core Subject Mechanism",
        prompt: `How does ${primaryConcept.toLowerCase()} explain why Dr. Vane's test suite passed despite the production defect?`,
        options: [
          "A. The tests only executed sequentially, failing to expose concurrency conflicts",
          "B. The database was entirely offline during unit testing",
          "C. The compiler automatically corrected the logic errors during the build",
          "D. Single-threaded executions consume more memory than multi-threaded executions",
        ],
        correct_answer: "A. The tests only executed sequentially, failing to expose concurrency conflicts",
        rubric_goal: "Applies core knowledge to explain edge-case test suite limitations.",
        hint: "Look at Clue 3 in your dossier regarding single-threaded simulations.",
      },
      {
        id: "q3",
        type: "descriptive",
        title: "Forensic Reasoning & Traceback",
        prompt: "Trace the step-by-step causal chain from the initial 03:14 AM alert to the final corrupted data. In your explanation, explicitly cite at least two clues from your dossier.",
        rubric_goal: "Evaluates ability to synthesize multi-factor causal chains rather than memorized definitions.",
        hint: "Start with the 500ms heartbeat, explain the buffer lock state, and finish with the silent drop behavior.",
      },
      {
        id: "q4",
        type: "photo",
        title: "Applied Remedy / Diagram or Code Patch",
        prompt: "Write out the corrected pseudocode, logic patch, or diagram demonstrating how the buffer lock should be acquired and released safely. Upload a photo of your working or type your detailed fix below.",
        rubric_goal: "Evaluates practical application and defensive design in real engineering contexts.",
        hint: "Consider using atomic operations, context managers, or explicit try/finally release blocks.",
      },
    ],
  };
}
