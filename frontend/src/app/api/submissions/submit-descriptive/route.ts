import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      assignmentId,
      accessToken,
      studentName,
      studentIdCode,
      studentEmail,
      descriptiveAnswers, // Record<string, string> e.g. { "q_1": "...", "q_2": "..." }
      tabSwitchCount = 0,
      tabSwitchLogs = [],
      timeSpentSeconds = 0,
    } = body;

    if (!assignmentId || !studentName || !studentIdCode) {
      return NextResponse.json(
        { error: "assignmentId, studentName, and studentIdCode are required." },
        { status: 400 }
      );
    }

    if (!descriptiveAnswers || typeof descriptiveAnswers !== "object" || Object.keys(descriptiveAnswers).length === 0) {
      return NextResponse.json(
        { error: "Please provide descriptive responses to the case questions." },
        { status: 400 }
      );
    }

    // 1. Fetch assignment version snapshot or mystery definition
    let version: any = null;
    let questions: any[] = [];
    let canonicalSolution = "Nominal system equilibrium.";
    let assignmentTitle = "Mystery Assignment";
    let assignmentSubject = "Science";

    const { data: versionData } = await supabase
      .from("assignment_versions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (versionData) {
      version = versionData;
      questions = version.questions_snapshot || [];
      canonicalSolution = version.mystery_snapshot?.canonical_solution || canonicalSolution;
      assignmentTitle = version.title || assignmentTitle;
      assignmentSubject = version.subject || assignmentSubject;
    } else {
      // Fallback: check parent assignment record if version hasn't been snapshotted
      const { data: assignmentRecord } = await supabase
        .from("assignments")
        .select("id, title, subject, story_plans")
        .eq("id", assignmentId)
        .maybeSingle();

      if (assignmentRecord) {
        assignmentTitle = assignmentRecord.title || assignmentTitle;
        assignmentSubject = assignmentRecord.subject || assignmentSubject;
        if (assignmentRecord.story_plans && assignmentRecord.story_plans[0]) {
          const plan = assignmentRecord.story_plans[0];
          questions = plan.questions || [];
          canonicalSolution = plan.canonical_solution || canonicalSolution;
        }
      }
    }

    // 2. Perform AI assessment of descriptive answers using Gemini
    let overallScore = 0;
    const evaluations: any[] = [];
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey && questions.length > 0) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const gradingPrompt = `You are a fair, rigorous university professor evaluating student descriptive case study submissions.

ASSIGNMENT TITLE: "${version?.title || "Mystery Assignment"}"
SUBJECT: "${version?.subject || "Science"}"
CANONICAL ROOT CAUSE / SOLUTION:
"""${canonicalSolution}"""

STUDENT SUBMISSIONS TO GRADE:
${questions
  .map((q: any) => {
    const studentAnswer = descriptiveAnswers[q.id] || "No answer provided.";
    return `QUESTION [${q.id}] (${q.max_marks} marks):
Prompt: ${q.question_text}
Expected Reasoning: ${q.expected_reasoning || "Valid application of concepts"}
Required Evidence: ${(q.required_evidence_citations || []).join(", ")}
Student Written Answer:
"""${studentAnswer}"""`;
  })
  .join("\n\n---\n\n")}

CRITERIA:
- Grade strictly on evidence citations, conceptual reasoning, and accuracy.
- Penalize unsupported speculation or generic non-answers.
- Award points up to max_marks for each question.

Respond strictly with valid JSON conforming to:
{
  "total_score": 85,
  "question_evaluations": [
    {
      "question_id": "q_1",
      "awarded_marks": 22,
      "max_marks": 25,
      "feedback": "Clear explanation of mechanism citing Clue 1.",
      "evidence_found": true
    }
  ],
  "general_feedback": "Strong analytical deduction throughout the case study."
}
Ensure valid JSON only without markdown formatting.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: gradingPrompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed && typeof parsed === "object") {
          evaluations.push(parsed);
        }
      } catch (aiErr: any) {
        console.warn("AI grading warning (using baseline calculation):", aiErr?.message);
      }
    }

    // Baseline calculation if AI evaluation was unavailable
    if (evaluations.length === 0) {
      evaluations.push({
        general_feedback: "Submission received and indexed for teacher review.",
      });
    }

    // When result is published, randomly assign a floating percentage score from 65 to 75 (inclusive)
    const decimals = Math.random() < 0.5 ? 1 : 2;
    const factor = Math.pow(10, decimals);
    const val = 65 + Math.random() * (75 - 65);
    let floatScore = Math.round(val * factor) / factor;
    if (Number.isInteger(floatScore)) {
      floatScore = Number((floatScore > 74.5 ? floatScore - 0.5 : floatScore + 0.5).toFixed(decimals));
    }
    overallScore = floatScore;

    if (evaluations.length > 0 && evaluations[0]) {
      evaluations[0].total_score = overallScore;
    }

    // 3. Upsert submission record
    const { data: existing } = await supabase
      .from("submissions")
      .select("id")
      .eq("assignment_id", assignmentId)
      .eq("student_id_code", studentIdCode.trim())
      .limit(1)
      .maybeSingle();

    let submissionRecord: any;

    if (existing?.id) {
      let { data, error } = await supabase
        .from("submissions")
        .update({
          student_name: studentName.trim(),
          student_email: studentEmail ? studentEmail.trim() : null,
          descriptive_answers: descriptiveAnswers,
          submission_status: "submitted",
          score: overallScore,
          feedback: evaluations[0]?.general_feedback || "Submission completed.",
          ai_evaluations: evaluations,
          tab_switch_count: tabSwitchCount,
          tab_switch_logs: tabSwitchLogs,
          time_spent_seconds: timeSpentSeconds,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select();

      if (error && (error as any).code === "22P02") {
        // Fallback for when Postgres submissions.score column is typed as integer
        const fallback = await supabase
          .from("submissions")
          .update({
            student_name: studentName.trim(),
            student_email: studentEmail ? studentEmail.trim() : null,
            descriptive_answers: descriptiveAnswers,
            submission_status: "submitted",
            score: Math.round(overallScore),
            feedback: evaluations[0]?.general_feedback || "Submission completed.",
            ai_evaluations: evaluations,
            tab_switch_count: tabSwitchCount,
            tab_switch_logs: tabSwitchLogs,
            time_spent_seconds: timeSpentSeconds,
            submitted_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select();
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        console.error("Submission update error:", error);
        throw error;
      }
      submissionRecord = (data && data[0]) || {
        id: existing.id,
        submitted_at: new Date().toISOString(),
      };
    } else {
      let { data, error } = await supabase
        .from("submissions")
        .insert({
          assignment_id: assignmentId,
          version_id: version?.id || null,
          access_token: accessToken || null,
          student_name: studentName.trim(),
          student_email: studentEmail ? studentEmail.trim() : null,
          student_id_code: studentIdCode.trim(),
          descriptive_answers: descriptiveAnswers,
          submission_status: "submitted",
          score: overallScore,
          feedback: evaluations[0]?.general_feedback || "Submission completed.",
          ai_evaluations: evaluations,
          tab_switch_count: tabSwitchCount,
          tab_switch_logs: tabSwitchLogs,
          time_spent_seconds: timeSpentSeconds,
          submitted_at: new Date().toISOString(),
        })
        .select();

      if (error && (error as any).code === "22P02") {
        // Fallback for when Postgres submissions.score column is typed as integer
        const fallback = await supabase
          .from("submissions")
          .insert({
            assignment_id: assignmentId,
            version_id: version?.id || null,
            access_token: accessToken || null,
            student_name: studentName.trim(),
            student_email: studentEmail ? studentEmail.trim() : null,
            student_id_code: studentIdCode.trim(),
            descriptive_answers: descriptiveAnswers,
            submission_status: "submitted",
            score: Math.round(overallScore),
            feedback: evaluations[0]?.general_feedback || "Submission completed.",
            ai_evaluations: evaluations,
            tab_switch_count: tabSwitchCount,
            tab_switch_logs: tabSwitchLogs,
            time_spent_seconds: timeSpentSeconds,
            submitted_at: new Date().toISOString(),
          })
          .select();
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        console.error("Submission insert error:", error);
        throw error;
      }
      submissionRecord = (data && data[0]) || {
        id: "submitted",
        submitted_at: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      submissionId: submissionRecord.id || "submitted",
      score: overallScore,
      submittedAt: submissionRecord.submitted_at || new Date().toISOString(),
      feedback: evaluations[0]?.general_feedback,
    });
  } catch (error: any) {
    console.error("Submit descriptive API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to finalize submission." },
      { status: 500 }
    );
  }
}
