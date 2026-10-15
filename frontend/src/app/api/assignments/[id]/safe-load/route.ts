import { NextRequest, NextResponse } from "next/server";
import { getStudentSafeAssignment } from "@/lib/assignments/access";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const studentIdCode = searchParams.get("studentId");

    const { payload, error } = await getStudentSafeAssignment(assignmentId, token);

    if (error || !payload) {
      return NextResponse.json(
        { error: error || "Assignment not accessible." },
        { status: 404 }
      );
    }

    // If student ID is provided, check for existing draft autosaves
    let draftAnswers: Record<string, string> = {};
    if (studentIdCode) {
      const supabase = await createClient();
      const { data: existingDraft } = await supabase
        .from("submissions")
        .select("descriptive_answers, submission_status")
        .eq("assignment_id", assignmentId)
        .eq("student_id_code", studentIdCode.trim())
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingDraft?.descriptive_answers) {
        draftAnswers = existingDraft.descriptive_answers;
      }
    }

    return NextResponse.json({
      success: true,
      assignment: payload,
      savedDraft: draftAnswers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
