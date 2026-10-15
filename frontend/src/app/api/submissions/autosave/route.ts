import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      assignmentId,
      accessToken,
      studentName,
      studentIdCode,
      descriptiveAnswers,
      tabSwitchCount = 0,
      timeSpentSeconds = 0,
    } = body;

    if (!assignmentId || !studentIdCode) {
      return NextResponse.json(
        { error: "assignmentId and studentIdCode are required to autosave." },
        { status: 400 }
      );
    }

    // Check if a submission record already exists for this student & assignment
    const { data: existing } = await supabase
      .from("submissions")
      .select("id")
      .eq("assignment_id", assignmentId)
      .eq("student_id_code", studentIdCode.trim())
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("submissions")
        .update({
          student_name: (studentName || "Student").trim(),
          descriptive_answers: descriptiveAnswers || {},
          tab_switch_count: tabSwitchCount,
          time_spent_seconds: timeSpentSeconds,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("submissions").insert({
        assignment_id: assignmentId,
        access_token: accessToken || null,
        student_name: (studentName || "Student").trim(),
        student_id_code: studentIdCode.trim(),
        descriptive_answers: descriptiveAnswers || {},
        submission_status: "draft",
        tab_switch_count: tabSwitchCount,
        time_spent_seconds: timeSpentSeconds,
      });
    }

    return NextResponse.json({
      success: true,
      autosavedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Autosave API error:", error);
    return NextResponse.json(
      { error: error?.message || "Autosave failed." },
      { status: 500 }
    );
  }
}
