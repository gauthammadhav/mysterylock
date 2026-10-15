import { MysteryBlueprint, StudentVariant, ClueItem } from "@/types/mystery";

const locationVariations = [
  "Apex Research Station, Sector 7",
  "Nordic Geophysical Institute, Tromsø",
  "Helios Orbital Laboratories, Bay 3",
  "Deepwater Autonomous Station, Marianas",
  "Vanguard Applied Engineering Center, Facility B",
];

const investigatorRoles = [
  "Senior Diagnostic Engineer",
  "Forensic Systems Auditor",
  "Chief Technical Investigator",
  "Lead Research Specialist",
  "Principal Analytical Evaluator",
];

const organizationVariations = [
  "Horizon Research Consortium",
  "AeroDynamics Systems Ltd.",
  "Genesis Bioscience Labs",
  "Quantum Dynamics Group",
  "Pacific Applied Sciences",
];

/**
 * Deterministic pseudo-random number generator using seed string
 */
function pseudoRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return () => {
    hash = (hash * 9301 + 49297) % 233280;
    return Math.abs(hash) / 233280;
  };
}

/**
 * Generates an individually personalized, parametrically equivalent variant for a student.
 * Preserves the Invariant Core (Learning Objectives, Rubric, Cognitive Band, Checkpoints)
 * while safely varying surface narrative framing, locations, and numerical values.
 */
export function generateStudentVariant(
  blueprint: MysteryBlueprint,
  studentIdOrSeed: string,
  variantIndex: number = 1
): StudentVariant {
  const seed = `${blueprint.id || blueprint.assignment_id}-${studentIdOrSeed}-${variantIndex}`;
  const random = pseudoRandom(seed);

  // 1. Safe Narrative Framing Variations
  const locIndex = Math.floor(random() * locationVariations.length);
  const roleIndex = Math.floor(random() * investigatorRoles.length);
  const orgIndex = Math.floor(random() * organizationVariations.length);

  const narrativeOverrides = {
    detective_role: investigatorRoles[roleIndex],
    location_name: locationVariations[locIndex],
    organization_name: organizationVariations[orgIndex],
    timestamp_epoch: `2026-10-${10 + Math.floor(random() * 18)} 0${4 + Math.floor(random() * 5)}:${Math.floor(random() * 50)}:00`,
  };

  // 2. Safe Checkpoint & Clue Variations (preserving the target learning objective and rubric)
  const checkpointVariants = blueprint.checkpoints.map((cp) => {
    // Generate slight numerical variance for data interpretation puzzles
    const deltaVariance = (25 + Math.floor(random() * 35) + random()).toFixed(1);

    // Shuffle clue cards order safely so adjacent students can't just copy "Card 1"
    const shuffledClues: ClueItem[] = [...cp.clues]
      .sort(() => random() - 0.5)
      .map((clue) => {
        let modifiedContent = clue.content;
        // If data log, vary numerical readings while keeping the analytical conclusion invariant
        if (clue.type === "data_log" && modifiedContent.includes("%")) {
          modifiedContent = modifiedContent.replace(/\d+\.?\d*%/g, `${deltaVariance}%`);
        }
        return {
          ...clue,
          content: modifiedContent,
        };
      });

    return {
      stage_index: cp.stage_index,
      varied_clues: shuffledClues,
      numerical_overrides: {
        peak_variance: `${deltaVariance}%`,
      },
    };
  });

  return {
    mystery_id: blueprint.id || "",
    seed,
    variant_index: variantIndex,
    narrative_overrides: narrativeOverrides,
    checkpoint_variants: checkpointVariants,
  };
}
