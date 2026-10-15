import { ExtractedFact } from "@/types/facts";

export interface SelectionCriteria {
  maxFacts?: number;
  prioritizeCausal?: boolean;
  requiredObjectiveIds?: string[];
}

/**
 * Evaluates candidate facts against learning objectives, topic importance,
 * and ability to support deduction-based descriptive questions.
 */
export function selectBalancedFacts(
  candidateFacts: ExtractedFact[],
  targetObjectives: string[],
  criteria: SelectionCriteria = {}
): ExtractedFact[] {
  const { maxFacts = 8, prioritizeCausal = true } = criteria;

  if (!candidateFacts || candidateFacts.length === 0) return [];

  // Group candidate facts by learning objective
  const groupedByObjective = new Map<string, ExtractedFact[]>();
  for (const lo of targetObjectives) {
    groupedByObjective.set(lo, []);
  }

  for (const fact of candidateFacts) {
    const list = groupedByObjective.get(fact.learning_objective);
    if (list) {
      list.push(fact);
    } else {
      // Find closest matching objective
      const matched = targetObjectives.find(
        (lo) => lo.toLowerCase().includes(fact.learning_objective.toLowerCase()) ||
          fact.learning_objective.toLowerCase().includes(lo.toLowerCase())
      );
      if (matched) {
        groupedByObjective.get(matched)?.push(fact);
      }
    }
  }

  const selected: ExtractedFact[] = [];

  // 1. Pick at least one primary fact for each objective
  for (const [_, factsForObj] of groupedByObjective.entries()) {
    if (factsForObj.length > 0) {
      // Sort to prioritize causal relationships and mechanisms over pure definitions
      factsForObj.sort((a, b) => {
        if (prioritizeCausal) {
          const typeScore = (t: string) =>
            t === "causal_relationship" ? 3 : t === "mechanism" ? 2 : t === "application" ? 2 : 1;
          return typeScore(b.fact_type) - typeScore(a.fact_type);
        }
        return 0;
      });

      const topFact = factsForObj[0];
      selected.push({ ...topFact, is_selected: true, is_approved: true });
    }
  }

  // 2. Fill remaining slots with high-value secondary facts
  if (selected.length < maxFacts) {
    const alreadySelectedIds = new Set(selected.map((f) => f.id));
    for (const fact of candidateFacts) {
      if (!alreadySelectedIds.has(fact.id) && selected.length < maxFacts) {
        selected.push({ ...fact, is_selected: true, is_approved: true });
        alreadySelectedIds.add(fact.id);
      }
    }
  }

  return selected;
}
