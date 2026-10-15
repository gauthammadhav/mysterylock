import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMysteryWithGemini } from "@/lib/ai/geminiMysteryGenerator";
import { generateStudentVariant } from "@/lib/ai/equivalenceEngine";

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
        { error: "Unauthorized. Please log in as a teacher." },
        { status: 401 }
      );
    }

    const { assignmentId } = await request.json();

    if (!assignmentId) {
      return NextResponse.json(
        { error: "assignmentId is required." },
        { status: 400 }
      );
    }

    // 1. Fetch assignment details
    const { data: assignment, error: fetchError } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", assignmentId)
      .eq("teacher_id", user.id)
      .single();

    if (fetchError || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found or unauthorized." },
        { status: 404 }
      );
    }

    // 2. Generate Mystery Blueprint using Gemini (with fallback)
    const blueprint = await generateMysteryWithGemini({
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      subject: assignment.subject,
      difficulty: assignment.difficulty,
      learningObjectives: assignment.learning_objectives || [],
      extractedPassage: assignment.description || undefined,
    });

    // 3. Insert or update mystery record in Supabase
    const { data: mysteryRecord, error: mysteryError } = await supabase
      .from("mysteries")
      .insert({
        assignment_id: assignment.id,
        title: blueprint.title,
        narrative_premise: blueprint.narrative_premise,
        setting_context: blueprint.setting_context,
        canonical_solution: blueprint.canonical_solution,
        rubric_definition: blueprint.rubric_definition,
        total_stages: blueprint.total_stages,
      })
      .select()
      .single();

    if (mysteryError) {
      console.error("Error creating mystery record:", mysteryError);
      return NextResponse.json(
        { error: mysteryError.message || "Failed to save mystery blueprint." },
        { status: 500 }
      );
    }

    blueprint.id = mysteryRecord.id;

    // 4. Insert checkpoints
    const checkpointsToInsert = blueprint.checkpoints.map((cp) => ({
      mystery_id: mysteryRecord.id,
      stage_index: cp.stage_index,
      title: cp.title,
      puzzle_type: cp.puzzle_type,
      target_learning_objective: cp.target_learning_objective,
      narrative_stage: cp.narrative_stage,
      clues: cp.clues,
      prompt_question: cp.prompt_question,
      rubric_criteria: cp.rubric_criteria,
      hint_ladder: cp.hint_ladder,
    }));

    const { error: checkpointsError } = await supabase
      .from("checkpoints")
      .insert(checkpointsToInsert);

    if (checkpointsError) {
      console.error("Error inserting checkpoints:", checkpointsError);
    }

    // 5. Generate sample variants for preview
    const sampleVariantA = generateStudentVariant(blueprint, "student_preview_1", 1);
    const sampleVariantB = generateStudentVariant(blueprint, "student_preview_2", 2);

    await supabase.from("student_variants").insert([
      {
        mystery_id: mysteryRecord.id,
        seed: sampleVariantA.seed,
        variant_index: 1,
        narrative_overrides: sampleVariantA.narrative_overrides,
        checkpoint_variants: sampleVariantA.checkpoint_variants,
      },
      {
        mystery_id: mysteryRecord.id,
        seed: sampleVariantB.seed,
        variant_index: 2,
        narrative_overrides: sampleVariantB.narrative_overrides,
        checkpoint_variants: sampleVariantB.checkpoint_variants,
      },
    ]);

    return NextResponse.json({
      success: true,
      mystery: mysteryRecord,
      checkpoints: blueprint.checkpoints,
      sampleVariants: [sampleVariantA, sampleVariantB],
    });
  } catch (error: any) {
    console.error("Mystery generation handler error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate mystery blueprint." },
      { status: 500 }
    );
  }
}
