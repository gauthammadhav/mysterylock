import { GoogleGenAI } from "@google/genai";
import { MysteryBlueprint, CheckpointBlueprint, PuzzleType, HintTier } from "@/types/mystery";

interface GenerateMysteryParams {
  assignmentId: string;
  assignmentTitle: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  learningObjectives: string[];
  extractedPassage?: string;
}

/**
 * Generates an investigative mystery blueprint using Google Gemini API.
 * Uses structured JSON generation with intelligent pedagogical fallback.
 */
export async function generateMysteryWithGemini(
  params: GenerateMysteryParams
): Promise<MysteryBlueprint> {
  const {
    assignmentId,
    assignmentTitle,
    subject,
    difficulty,
    learningObjectives,
    extractedPassage,
  } = params;

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an elite educational game designer and professor.
Create a curriculum-grounded investigative mystery assignment for university students.
The student will act as a lead investigator/analyst solving a realistic professional case.

Assignment Title: "${assignmentTitle}"
Subject Discipline: "${subject}"
Difficulty: "${difficulty}"
Approved Learning Objectives (Invariant Core):
${learningObjectives.map((lo, i) => `${i + 1}. ${lo}`).join("\n")}

${extractedPassage ? `Course Grounding Excerpt:\n"""${extractedPassage.slice(0, 3000)}"""\n` : ""}

REQUIREMENTS:
1. Narrative Premise: Craft an immersive, realistic inquiry (e.g. industrial failure analysis, forensic anomaly, diagnostic lab crisis, cyber-physical investigation, historical audit).
2. Exactly ${Math.min(learningObjectives.length, 5)} Checkpoints:
   - Each checkpoint must map 1:1 to one of the approved learning objectives.
   - Choose one of the 4 puzzle types for each checkpoint:
     * "constructed_response": Student explains a phenomenon or mechanism in their own words.
     * "evidence_selection": Student selects 2-3 genuine evidence cards from 4-5 clues (including realistic distractors) and justifies why.
     * "data_interpretation": Student analyzes data readings, error logs, or calculation values.
     * "sequence": Student diagnoses a timeline, causal chain, or event sequence.
3. For each checkpoint, provide:
   - 3 to 4 clue items (name, type, description, content, and mark whether it's a distractor).
   - A 3-tier Hint Ladder:
     * Tier 1: Conceptual Nudge (a gentle reminder of the principle).
     * Tier 2: Guiding Question (directs student to look at specific evidence).
     * Tier 3: Direct Clue Reference (explicitly cites which clues connect).
   - Rubric Criteria (criterion name, points summing to 90 total across checkpoints, key evidence required, expected reasoning).
4. Canonical solution explaining how the entire case is resolved.

Respond with strict JSON matching this structure:
{
  "title": "Case Title",
  "narrative_premise": "Engaging case background...",
  "setting_context": "Location, time, organization...",
  "canonical_solution": "Full explanation of the root cause...",
  "checkpoints": [
    {
      "stage_index": 1,
      "title": "Stage 1 Title",
      "puzzle_type": "constructed_response" | "evidence_selection" | "data_interpretation" | "sequence",
      "target_learning_objective": "Learning objective title",
      "narrative_stage": "What happens as the investigator reaches this stage...",
      "clues": [
        {
          "id": "clue-1",
          "name": "Clue Name",
          "type": "document" | "data_log" | "physical_evidence" | "witness_statement" | "sensor_reading",
          "description": "Short description",
          "content": "Specific evidence content or excerpt",
          "is_distractor": false
        }
      ],
      "prompt_question": "Specific question the student must answer",
      "rubric_criteria": {
        "criterion_name": "Criterion Title",
        "points": 25,
        "key_evidence_required": "What evidence must be cited",
        "expected_reasoning": "What logical connection must be explained"
      },
      "hint_ladder": [
        { "tier": 1, "name": "Conceptual Nudge", "text": "..." },
        { "tier": 2, "name": "Guiding Question", "text": "..." },
        { "tier": 3, "name": "Direct Clue Reference", "text": "..." }
      ],
      "canonical_answer": "Model correct response"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const jsonText = response.text;
      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        return {
          assignment_id: assignmentId,
          title: parsed.title || assignmentTitle,
          narrative_premise: parsed.narrative_premise,
          setting_context: parsed.setting_context || `Academic Investigation in ${subject}`,
          canonical_solution: parsed.canonical_solution,
          rubric_definition: {
            core_points: 90,
            extension_points: 10,
            total_points: 100,
          },
          total_stages: parsed.checkpoints?.length || learningObjectives.length,
          checkpoints: parsed.checkpoints.map((cp: any, idx: number) => ({
            ...cp,
            stage_index: idx + 1,
            target_learning_objective:
              learningObjectives[idx] || cp.target_learning_objective,
          })),
        };
      }
    } catch (err) {
      console.warn("Gemini generation failed, falling back to heuristic engine:", err);
    }
  }

  // Fallback: Intelligent Grounded Mystery Generator (Guarantees immediate zero-error operation)
  return generateHeuristicMystery(params);
}

/**
 * Intelligent deterministic fallback generator when Gemini API key is pending.
 */
function generateHeuristicMystery(params: GenerateMysteryParams): MysteryBlueprint {
  const { assignmentId, assignmentTitle, subject, difficulty, learningObjectives } = params;

  const puzzleTypes: PuzzleType[] = [
    "constructed_response",
    "evidence_selection",
    "data_interpretation",
    "sequence",
  ];

  const stagesCount = Math.max(2, Math.min(learningObjectives.length, 4));
  const pointsPerStage = Math.floor(90 / stagesCount);

  const checkpoints: CheckpointBlueprint[] = learningObjectives
    .slice(0, stagesCount)
    .map((objective, i) => {
      const pType = puzzleTypes[i % puzzleTypes.length];
      const stageNum = i + 1;

      return {
        stage_index: stageNum,
        title: `Phase ${stageNum}: Investigation of ${objective.slice(0, 40)}`,
        puzzle_type: pType,
        target_learning_objective: objective,
        narrative_stage: `The research team at the Horizon Institute detected unexpected discrepancies in the ${subject} lab logs. You are tasked with analyzing the initial indicators.`,
        clues: [
          {
            id: `clue-${stageNum}-1`,
            name: `${subject} Incident Telemetry Log #${100 + stageNum}`,
            type: "data_log",
            description: `Sensor timestamp data recorded during the anomaly.`,
            content: `Timestamp: 04:12:00. Peak value exceeded baseline variance by 34.2%. Signature matches theoretical predictions of ${objective.slice(0, 30)}.`,
            is_distractor: false,
          },
          {
            id: `clue-${stageNum}-2`,
            name: `Laboratory Protocol Excerpt 4.${stageNum}`,
            type: "document",
            description: `Official guidelines outlining standard operating thresholds.`,
            content: `Section 4.${stageNum}: Under nominal conditions, all components must maintain stability within the tolerances outlined in course units.`,
            is_distractor: false,
          },
          {
            id: `clue-${stageNum}-3`,
            name: `Shift Supervisor Maintenance Note`,
            type: "witness_statement",
            description: `Handwritten observation filed right before the anomaly occurred.`,
            content: `"Replaced auxiliary cooling pump filter at 02:00. Ambient temperature remained normal." Note: Routine unrelated maintenance record.`,
            is_distractor: true,
          },
        ],
        prompt_question:
          pType === "evidence_selection"
            ? `Review the evidence cards in your dossier. Select the relevant clues that demonstrate ${objective.toLowerCase()} and justify your selection.`
            : pType === "data_interpretation"
            ? `Analyze the incident telemetry log above. Calculate the deviation from nominal threshold and explain what mechanical failure it indicates.`
            : pType === "sequence"
            ? `Order the event timestamps chronologically and identify the exact catalyst that triggered the system anomaly.`
            : `Explain how the evidence from the lab logs demonstrates ${objective.toLowerCase()}. Formulate a defensible conclusion supported by specific citations.`,
        rubric_criteria: {
          criterion_name: `Evidence-Based Reasoning for ${objective.slice(0, 30)}`,
          points: pointsPerStage,
          key_evidence_required: `Must cite Incident Telemetry Log #${100 + stageNum} and contrast with baseline tolerances.`,
          expected_reasoning: `Demonstrates understanding of causal mechanisms rather than surface correlation.`,
        },
        hint_ladder: [
          {
            tier: 1,
            name: "Conceptual Nudge",
            text: `Recall how ${objective.toLowerCase()} defines baseline stability. Look for measurements that deviate from equilibrium.`,
          },
          {
            tier: 2,
            name: "Guiding Question",
            text: `Does the maintenance record in Clue 3 explain the 34.2% variance observed in the telemetry log, or is it a distractor?`,
          },
          {
            tier: 3,
            name: "Direct Clue Reference",
            text: `Examine Clue 1 carefully. The timestamp correlation at 04:12:00 directly reveals the initial causal breakdown.`,
          },
        ],
        canonical_answer: `The anomaly is directly attributed to the 34.2% variance in Telemetry Log #${100 + stageNum}. When compared against Protocol Excerpt 4.${stageNum}, the operating parameters clearly violated safety limits. The maintenance log is an irrelevant distractor.`,
      };
    });

  return {
    assignment_id: assignmentId,
    title: `The ${subject} Anomaly: Case File #89`,
    narrative_premise: `At the Horizon Research Facility, an unexplained failure interrupted the primary ${subject} research initiative. All standard automated diagnostics failed to diagnose the cause. As Lead Technical Investigator, your objective is to evaluate staged clues, isolate root causes, and justify your conclusions.`,
    setting_context: `Horizon Advanced Systems Research Lab, Sector 4`,
    canonical_solution: `The incident occurred due to cascading threshold violations identified across all investigation checkpoints, accurately isolated through rigorous evaluation of telemetry logs.`,
    rubric_definition: {
      core_points: 90,
      extension_points: 10,
      total_points: 100,
    },
    total_stages: checkpoints.length,
    checkpoints,
  };
}
