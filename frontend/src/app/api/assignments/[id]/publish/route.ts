import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
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

    // Update assignment status to published
    const { data: assignment, error: updateError } = await supabase
      .from("assignments")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", assignmentId)
      .eq("teacher_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Failed to publish assignment." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      assignment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
