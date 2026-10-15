import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateStudentSubmissionWithAI } from "@/lib/ai/evaluationEngine";

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
    const body = await request.json();

    const {
      studentName,
      studentIdCode,
      studentEmail,
      storyTitle,
      storyText,
      answers,
      tabSwitchCount = 0,
      tabSwitchLogs = [],
      timeSpentSeconds = 0,
      photoUploadUrl = null,
    } = body;

    if (!studentName || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Student name and answers are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch assignment to get subject and learning objectives
    const { data: assignment } = await supabase
      .from("assignments")
      .select("subject, learning_objectives")
      .eq("id", assignmentId)
      .single();

    const subject = assignment?.subject || "General";
    const learningObjectives = assignment?.learning_objectives || [];

    // Run AI Evaluation with Gemini
    const evaluation = await evaluateStudentSubmissionWithAI({
      subject,
      storyTitle: storyTitle || "Reading Comprehension Case",
      storyPassage: storyText || "",
      learningObjectives,
      answers,
      tabSwitchCount,
    });

    // Insert into public.submissions with full telemetry
    const { data: submission, error } = await supabase
      .from("submissions")
      .insert({
        assignment_id: assignmentId,
        student_name: studentName.trim(),
        student_id_code: studentIdCode ? studentIdCode.trim() : null,
        student_email: studentEmail ? studentEmail.trim() : null,
        story_title: storyTitle || "Assignment Story",
        story_text: storyText || "",
        answers,
        score: evaluation.overall_score,
        feedback: evaluation.strengths.join(" • "),
        tab_switch_count: tabSwitchCount,
        tab_switch_logs: tabSwitchLogs,
        time_spent_seconds: timeSpentSeconds,
        photo_upload_url: photoUploadUrl,
        ai_evaluations: [evaluation],
      })
      .select()
      .single();

    if (error) {
      console.error("Submission insert error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to save submission." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission,
      evaluation,
    });
  } catch (error: any) {
    console.error("Submission API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
