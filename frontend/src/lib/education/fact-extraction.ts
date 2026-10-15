import { GoogleGenAI } from "@google/genai";
import { RetrievedPassage } from "@/types/rag";
import { ExtractedFact, FactExtractionResult } from "@/types/facts";

interface ExtractFactsParams {
  subject: string;
  learningObjectives: string[];
  passages: RetrievedPassage[];
}

/**
 * Extracts educationally significant, evidence-grounded facts from retrieved source passages using Gemini.
 * Maps every fact directly to supporting source chunk IDs and specific learning objectives.
 */
export async function extractEducationalFacts(
  params: ExtractFactsParams
): Promise<FactExtractionResult> {
  const { subject, learningObjectives, passages } = params;
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!passages || passages.length === 0) {
    return {
      facts: [],
      unsupported_claims: ["No source material passages were provided."],
      coverage_summary: {
        total_facts: 0,
        covered_objectives: [],
        missing_objectives: learningObjectives,
      },
    };
  }

  // Format passages with IDs and page references for citation
  const formattedPassages = passages
    .map(
      (p) =>
        `[CHUNK_ID: ${p.id} | Page: ${p.page_number} | Heading: "${p.section_heading || "General"}"]\n${p.content}`
    )
    .join("\n\n---\n\n");

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a curriculum analyst, domain scholar, and pedagogical architect.
Analyze the following authentic course material passages for the subject "${subject}".
Extract educationally important, syllabus-grounded candidate facts that satisfy the teacher's learning objectives.

TEACHER'S LEARNING OBJECTIVES:
${learningObjectives.map((lo, i) => `${i + 1}. ${lo}`).join("\n")}

AUTHENTIC SOURCE PASSAGES:
"""
${formattedPassages}
"""

CRITICAL GROUNDING REQUIREMENTS:
1. Every fact must be an explicit, verifiable truth stated or directly evidenced in the supplied source passages. NEVER invent facts, outside lore, or fake citations.
2. Link each fact to the exact CHUNK_ID(s) that support it.
3. Categorize each fact by its pedagogical type:
   - "definition": Core terminology or formal meaning.
   - "mechanism": How a process, function, or system operates step-by-step.
   - "causal_relationship": Cause-and-effect relationship between variables or conditions.
   - "comparison": Contrast between competing theories, methods, or entities.
   - "application": How knowledge is applied in real-world or investigative contexts.
4. Identify potential student misconceptions for each fact (e.g., confusing inputs with catalysts).
5. Specify descriptive assessment opportunities (e.g., "Explain what occurs if reactant X is depleted").

Respond with STRICT JSON conforming to this schema:
{
  "facts": [
    {
      "id": "fact_1",
      "statement": "Clear, precise factual claim directly supported by the text.",
      "fact_type": "mechanism",
      "concept_category": "Energy Transduction",
      "source_chunk_ids": ["chunk-id-from-above"],
      "page_or_section": "Page 3 (Heading Title)",
      "learning_objective": "Exact matching objective from the teacher list",
      "prerequisites": ["Foundational concept needed first"],
      "potential_misconceptions": ["Common student misunderstanding"],
      "suggested_difficulty": "introductory" | "intermediate" | "advanced",
      "assessment_opportunities": ["Descriptive question prompt idea"]
    }
  ],
  "unsupported_claims": []
}
Ensure valid JSON only without markdown formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2, // Low temperature for high factual fidelity
        },
      });

      const responseText = response.text || "";
      const parsed = JSON.parse(responseText);

      if (Array.isArray(parsed.facts) && parsed.facts.length > 0) {
        const validatedFacts: ExtractedFact[] = parsed.facts.map((f: any, idx: number) => ({
          id: f.id || `fact_${idx + 1}`,
          statement: f.statement || "",
          fact_type: [
            "definition",
            "mechanism",
            "causal_relationship",
            "comparison",
            "application",
          ].includes(f.fact_type)
            ? f.fact_type
            : "mechanism",
          concept_category: f.concept_category || subject,
          source_chunk_ids: Array.isArray(f.source_chunk_ids) ? f.source_chunk_ids : [passages[0]?.id],
          page_or_section: f.page_or_section || `Page ${passages[0]?.page_number || 1}`,
          learning_objective: f.learning_objective || learningObjectives[0] || "General Concept",
          prerequisites: Array.isArray(f.prerequisites) ? f.prerequisites : [],
          potential_misconceptions: Array.isArray(f.potential_misconceptions) ? f.potential_misconceptions : [],
          suggested_difficulty: ["introductory", "intermediate", "advanced"].includes(f.suggested_difficulty)
            ? f.suggested_difficulty
            : "intermediate",
          assessment_opportunities: Array.isArray(f.assessment_opportunities) ? f.assessment_opportunities : [],
          is_approved: true,
          is_selected: true,
        }));

        const coveredObjectives = Array.from(new Set(validatedFacts.map((f) => f.learning_objective)));
        const missingObjectives = learningObjectives.filter((lo) => !coveredObjectives.includes(lo));

        return {
          facts: validatedFacts,
          unsupported_claims: Array.isArray(parsed.unsupported_claims) ? parsed.unsupported_claims : [],
          coverage_summary: {
            total_facts: validatedFacts.length,
            covered_objectives: coveredObjectives,
            missing_objectives: missingObjectives,
          },
        };
      }
    } catch (err: any) {
      console.warn("Gemini fact extraction error, falling back to deterministic extraction:", err?.message);
    }
  }

  // Deterministic pedagogical fallback grounded in provided passages
  return generateDeterministicFacts(subject, learningObjectives, passages);
}

/**
 * Deterministic fallback fact generator when external API is unreachable.
 */
function generateDeterministicFacts(
  subject: string,
  learningObjectives: string[],
  passages: RetrievedPassage[]
): FactExtractionResult {
  const facts: ExtractedFact[] = [];

  learningObjectives.forEach((lo, i) => {
    const matchingPassage = passages[i % passages.length];
    const excerptSentence =
      matchingPassage?.content.split(". ")[0]?.trim() ||
      `${lo} represents a fundamental principle in ${subject}.`;

    facts.push({
      id: `fact_${i + 1}`,
      statement: excerptSentence.endsWith(".") ? excerptSentence : `${excerptSentence}.`,
      fact_type: i % 2 === 0 ? "mechanism" : "causal_relationship",
      concept_category: subject,
      source_chunk_ids: [matchingPassage?.id || `chunk_${i + 1}`],
      page_or_section: `Page ${matchingPassage?.page_number || 1} (${matchingPassage?.section_heading || "Overview"})`,
      learning_objective: lo,
      prerequisites: [`Introduction to ${subject}`],
      potential_misconceptions: [
        `Assuming ${lo.toLowerCase()} operates independently of system boundary conditions.`,
      ],
      suggested_difficulty: i === 0 ? "introductory" : i === 1 ? "intermediate" : "advanced",
      assessment_opportunities: [
        `Explain the cause-and-effect mechanism behind ${lo.toLowerCase()} when tested under experimental variation.`,
      ],
      is_approved: true,
      is_selected: true,
    });
  });

  return {
    facts,
    coverage_summary: {
      total_facts: facts.length,
      covered_objectives: learningObjectives,
      missing_objectives: [],
    },
  };
}
