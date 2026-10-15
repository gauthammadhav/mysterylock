import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ExtractedFact } from "@/types/facts";

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

    const body = await request.json();
    const { assignmentId, facts } = body;

    if (!assignmentId || !Array.isArray(facts)) {
      return NextResponse.json(
        { error: "assignmentId and facts array are required." },
        { status: 400 }
      );
    }

    // Update assignment approved_facts column
    const { error: updateErr } = await supabase
      .from("assignments")
      .update({
        approved_facts: facts,
      })
      .eq("id", assignmentId)
      .eq("teacher_id", user.id);

    if (updateErr) {
      return NextResponse.json(
        { error: updateErr.message || "Failed to update approved facts." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      approvedCount: facts.filter((f: ExtractedFact) => f.is_approved && f.is_selected).length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
