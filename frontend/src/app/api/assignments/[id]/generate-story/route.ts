import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMurdlePassageAndQuestions } from "@/lib/ai/murdleGenerator";

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
    const body = await request.json();
    const studentName = (body.studentName || "Student").trim();
    const studentId = (body.studentId || "ID-UNKNOWN").trim();

    const supabase = await createClient();

    // Fetch assignment public data (open to student access via link)
    const { data: assignment, error } = await supabase
      .from("assignments")
      .select("id, title, subject, difficulty, learning_objectives, status")
      .eq("id", assignmentId)
      .single();

    if (error || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      );
    }

    // Generate Murdle-style gamified comprehension case
    const storyData = await generateMurdlePassageAndQuestions({
      studentName,
      studentId,
      subject: assignment.subject,
      title: assignment.title,
      learningObjectives: assignment.learning_objectives || [],
    });

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment.id,
        title: assignment.title,
        subject: assignment.subject,
      },
      storyData,
    });
  } catch (error: any) {
    console.error("Story generation route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate story." },
      { status: 500 }
    );
  }
}
