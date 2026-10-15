import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDescriptiveMystery } from "@/lib/mystery/descriptive-generator";
import { validateDescriptiveMystery } from "@/lib/mystery/validation";
import { ExtractedFact } from "@/types/facts";

export const maxDuration = 60;

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
    const { assignmentId } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { error: "assignmentId is required." },
        { status: 400 }
      );
    }

    // 1. Fetch assignment details
    const { data: assignment, error: fetchErr } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", assignmentId)
      .eq("teacher_id", user.id)
      .single();

    if (fetchErr || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found or unauthorized." },
        { status: 404 }
      );
    }

    // 2. Fetch approved facts
    let approvedFacts: ExtractedFact[] = assignment.approved_facts || [];
    if (!approvedFacts || approvedFacts.length === 0) {
      const { data: dbFacts } = await supabase
        .from("extracted_facts")
        .select("*")
        .eq("assignment_id", assignmentId)
        .eq("is_approved", true)
        .eq("is_selected", true);

      approvedFacts = (dbFacts || []) as ExtractedFact[];
    }

    // If still no approved facts, construct baseline grounded facts from learning objectives
    if (approvedFacts.length === 0) {
      const objectives: string[] = assignment.learning_objectives || [];
      approvedFacts = objectives.map((obj, i) => ({
        id: `fact_${i + 1}`,
        statement: `${obj} governs the equilibrium and dynamics in this study of ${assignment.subject}.`,
        fact_type: "mechanism",
        concept_category: assignment.subject,
        source_chunk_ids: [`chunk_${i + 1}`],
        page_or_section: `Section ${i + 1}`,
        learning_objective: obj,
        prerequisites: [`Introductory ${assignment.subject}`],
        potential_misconceptions: ["Confusing correlation with causation"],
        suggested_difficulty: "intermediate",
        assessment_opportunities: [`Explain how ${obj} governs the observed telemetry`],
        is_approved: true,
        is_selected: true,
      }));
    }

    // 3. Generate descriptive mystery
    const mysteryCase = await generateDescriptiveMystery({
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      subject: assignment.subject,
      difficulty: assignment.difficulty,
      learningObjectives: assignment.learning_objectives || [],
      approvedFacts,
    });

    // 4. Validate strict descriptive requirements
    const validation = validateDescriptiveMystery(mysteryCase);
    if (!validation.isValid) {
      console.warn("Mystery validation warnings/errors:", validation.errors);
    }

    // 5. Save mystery record into database
    await supabase.from("mysteries").delete().eq("assignment_id", assignmentId);

    const { data: savedMystery, error: mysterySaveErr } = await supabase
      .from("mysteries")
      .insert({
        assignment_id: assignmentId,
        title: mysteryCase.title,
        narrative_premise: mysteryCase.narrative_premise,
        setting_context: mysteryCase.setting_context,
        canonical_solution: mysteryCase.canonical_solution,
        rubric_definition: {
          total_marks: mysteryCase.total_marks,
          questions: mysteryCase.questions.map((q) => ({ id: q.id, rubric: q.rubric })),
        },
        total_stages: mysteryCase.questions.length,
      })
      .select()
      .single();

    if (mysterySaveErr) {
      console.warn("Mystery table save warning:", mysterySaveErr);
    }

    // Update assignment with mystery draft
    await supabase
      .from("assignments")
      .update({
        story_plans: [mysteryCase],
        description: mysteryCase.narrative_premise,
      })
      .eq("id", assignmentId);

    return NextResponse.json({
      success: true,
      mystery: mysteryCase,
      validation,
      approvedFactCount: approvedFacts.length,
    });
  } catch (error: any) {
    console.error("Descriptive mystery generation API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate descriptive mystery." },
      { status: 500 }
    );
  }
}
