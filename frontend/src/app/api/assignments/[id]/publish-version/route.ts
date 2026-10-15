import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publishAssignmentVersion } from "@/lib/assignments/publishing";

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

    const body = await request.json();
    const { mysteryData, approvedFacts } = body;

    if (!mysteryData) {
      return NextResponse.json(
        { error: "mysteryData is required for publishing." },
        { status: 400 }
      );
    }

    const publishResult = await publishAssignmentVersion(
      assignmentId,
      user.id,
      mysteryData,
      approvedFacts || []
    );

    if (!publishResult.success) {
      return NextResponse.json(
        { error: publishResult.error || "Failed to publish assignment version." },
        { status: 500 }
      );
    }

    return NextResponse.json(publishResult);
  } catch (error: any) {
    console.error("Publish version error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
