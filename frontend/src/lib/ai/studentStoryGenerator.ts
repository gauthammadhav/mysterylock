import { GoogleGenAI } from "@google/genai";

export interface StoryQuestion {
  id: string;
  type: "mcq" | "written" | "code_or_applied";
  question: string;
  options?: string[]; // For MCQ
  correct_answer?: string;
  hint?: string;
}

export interface GeneratedStudentStory {
  title: string;
  story: string;
  questions: StoryQuestion[];
}

interface GenerateParams {
  studentName: string;
  subject: string;
  title: string;
  learningObjectives: string[];
}

/**
 * Generates an easy-to-read, engaging comprehension story + sequence of questions
 * based on the assignment topic and learning objectives using Gemini.
 */
export async function generateStudentStoryAndQuestions(
  params: GenerateParams
): Promise<GeneratedStudentStory> {
  const { studentName, subject, title, learningObjectives } = params;
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an educational content creator.
Create a simple, engaging, and clear story (comprehension passage) for a student named ${studentName}.
The story must be easy to read and teach/contextualize the following topic.

Topic / Title: ${title}
Subject: ${subject}
Key Concepts / Learning Objectives:
${learningObjectives.map((lo, i) => `${i + 1}. ${lo}`).join("\n")}

REQUIREMENTS:
1. STORY:
   - Length: 2 to 3 readable paragraphs (around 200-300 words).
   - Format: A realistic, relatable scenario (e.g. if Python: writing a script to automate an online shop or fixing a bug; if Physics: testing an electric vehicle battery; if Biology: investigating a water filtration issue).
   - Make it interesting and straightforward. Highlight key terms and concepts naturally.
2. QUESTIONS (3 questions based on the story):
   - Question 1 (type: "mcq"): Multiple-choice question with 4 options testing comprehension of the story's core concept.
   - Question 2 (type: "written"): Open-ended question asking the student to explain the reasoning, mechanism, or cause-and-effect from the story in their own words.
   - Question 3 (type: "code_or_applied"): Applied question (e.g. write a 2-line code snippet, suggest the correct fix, or analyze the outcome).

Respond strictly with valid JSON conforming to:
{
  "title": "Story Title",
  "story": "Full readable story text with paragraphs...",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Question text...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": "A. ...",
      "hint": "Refer back to paragraph 1..."
    },
    {
      "id": "q2",
      "type": "written",
      "question": "Explain why...",
      "hint": "Consider the reason mentioned in the middle of the passage..."
    },
    {
      "id": "q3",
      "type": "code_or_applied",
      "question": "What is the recommended fix...",
      "hint": "Check the final paragraph for the solution..."
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
      console.warn("Gemini story generation failed, using pedagogical fallback:", err);
    }
  }

  // Fallback Story Generator (instant, zero cost, completely readable)
  return getFallbackStory(params);
}

function getFallbackStory({
  studentName,
  subject,
  title,
  learningObjectives,
}: GenerateParams): GeneratedStudentStory {
  const primaryConcept = learningObjectives[0] || `${subject} Core Fundamentals`;

  return {
    title: `${subject} in Practice: The Case of the Unexpected Output`,
    story: `Welcome, ${studentName}! Last week, a team of junior engineers was working on an important project in ${subject}. Everything appeared to run smoothly during initial development, but once the system processed live data, an unexpected behavior surfaced.

Upon reviewing the system logs, the team discovered that the issue was directly linked to ${primaryConcept.toLowerCase()}. The data was being parsed in an order that bypassed standard validation checks. Instead of halting with a clear error, the program continued executing with default fallback parameters, creating subtle discrepancies in the final summary.

The lead supervisor tasked you with examining the sequence of operations. By understanding how the core principles of ${subject} apply in this scenario, you can pinpoint exactly why the discrepancy emerged and recommend the correct modification to ensure reliable performance.`,
    questions: [
      {
        id: "q1",
        type: "mcq",
        question: `Based on the passage, what was the root cause of the subtle discrepancies in the system?`,
        options: [
          `A. The database ran out of memory completely`,
          `B. Data was processed in an order that bypassed validation checks`,
          `C. The server lost network connectivity`,
          `D. The operating system crashed due to hardware failure`,
        ],
        correct_answer: `B. Data was processed in an order that bypassed validation checks`,
        hint: `Re-read paragraph 2 of the story to see how data was parsed.`,
      },
      {
        id: "q2",
        type: "written",
        question: `In your own words, explain how ${primaryConcept.toLowerCase()} should be properly structured to prevent this issue.`,
        hint: `Consider what validation step should occur before the system continues execution.`,
      },
      {
        id: "q3",
        type: "code_or_applied",
        question: `What immediate action or check should the engineering team add to make sure errors are caught early?`,
        hint: `Think about defensive programming, assertions, or explicit error handling.`,
      },
    ],
  };
}
