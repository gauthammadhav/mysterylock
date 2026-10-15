import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assignmentFormSchema } from "@/lib/validations/assignment";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in as a teacher." },
        { status: 401 }
      );
    }

    const json = await request.json();
    const validation = assignmentFormSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid assignment data." },
        { status: 400 }
      );
    }

    const {
      title,
      subject,
      course_name,
      description,
      learning_objectives,
      difficulty,
      due_at,
      status,
    } = validation.data;

    // Insert into public.assignments with teacher_id
    const { data: assignment, error: insertError } = await supabase
      .from("assignments")
      .insert({
        teacher_id: user.id,
        title,
        subject,
        course_name: course_name || null,
        description: description || null,
        learning_objectives,
        difficulty,
        due_at: due_at ? new Date(due_at).toISOString() : null,
        status,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Assignment insert error:", insertError);
      return NextResponse.json(
        { error: insertError.message || "Failed to save assignment in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      assignment,
    });
  } catch (error: any) {
    console.error("Unexpected error in assignment creation:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
