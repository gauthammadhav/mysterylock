import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
    const supabase = await createClient();

    // 1. Authenticate teacher
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

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required." },
        { status: 400 }
      );
    }

    // 2. Verify assignment ownership
    const { data: assignment, error: fetchError } = await supabase
      .from("assignments")
      .select("id, title, status, teacher_id")
      .eq("id", assignmentId)
      .eq("teacher_id", user.id)
      .single();

    if (fetchError || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found or unauthorized." },
        { status: 404 }
      );
    }

    // 3. Proactively clean up child records across dependent tables
    try {
      await supabase.from("submissions").delete().eq("assignment_id", assignmentId);
    } catch (e) {
      console.warn("Submissions cleanup notice:", e);
    }

    try {
      await supabase.from("assignment_versions").delete().eq("assignment_id", assignmentId);
    } catch (e) {
      console.warn("Assignment versions cleanup notice:", e);
    }

    try {
      await supabase.from("extracted_facts").delete().eq("assignment_id", assignmentId);
    } catch (e) {
      console.warn("Extracted facts cleanup notice:", e);
    }

    try {
      await supabase.from("mysteries").delete().eq("assignment_id", assignmentId);
    } catch (e) {
      console.warn("Mysteries cleanup notice:", e);
    }

    // 4. In case a legacy database RLS policy requires status = 'draft' for DELETE,
    // update status to 'draft' before deleting
    if (assignment.status === "published") {
      await supabase
        .from("assignments")
        .update({ status: "draft" })
        .eq("id", assignmentId)
        .eq("teacher_id", user.id);
    }

    // 5. Delete the assignment row
    const { error: deleteError } = await supabase
      .from("assignments")
      .delete()
      .eq("id", assignmentId)
      .eq("teacher_id", user.id);

    if (deleteError) {
      console.error("Failed to delete assignment:", deleteError);
      return NextResponse.json(
        { error: deleteError.message || "Failed to delete assignment." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Assignment "${assignment.title}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Delete assignment API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
