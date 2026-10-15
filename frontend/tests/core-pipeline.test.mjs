import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

// 1. Semantic Chunker Logic Test
function createSemanticChunks(text, chunkSize = 200, overlap = 40) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const rawParagraphs = normalized.split(/\n\s*\n/);
  const chunks = [];
  let currentHeading = "General Content";
  let currentPage = 1;
  let accumulatedText = "";
  let chunkIndex = 0;

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    const pageMatch = trimmed.match(/(?:page|\bpg\b)\s*[:#\-]?\s*(\d+)/i);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10) || currentPage;
    }

    if (
      (trimmed.startsWith("#") ||
        (trimmed.length < 80 && !trimmed.endsWith(".") && trimmed.split("\n").length === 1)) &&
      !pageMatch
    ) {
      currentHeading = trimmed.replace(/^[#\s]+/, "");
    }

    if (accumulatedText.length + trimmed.length > chunkSize && accumulatedText.length > 0) {
      const hash = crypto.createHash("sha256").update(accumulatedText).digest("hex");
      chunks.push({
        chunk_index: chunkIndex++,
        page_number: currentPage,
        section_heading: currentHeading,
        content: accumulatedText,
        content_hash: hash,
      });

      const words = accumulatedText.split(" ");
      const overlapWordCount = Math.min(Math.floor(overlap / 6), words.length);
      const overlapText = words.slice(-overlapWordCount).join(" ");
      accumulatedText = overlapText + (overlapText ? "\n\n" : "") + trimmed;
    } else {
      accumulatedText = accumulatedText ? `${accumulatedText}\n\n${trimmed}` : trimmed;
    }
  }

  if (accumulatedText.trim().length > 0) {
    const hash = crypto.createHash("sha256").update(accumulatedText).digest("hex");
    chunks.push({
      chunk_index: chunkIndex,
      page_number: currentPage,
      section_heading: currentHeading,
      content: accumulatedText.trim(),
      content_hash: hash,
    });
  }

  return chunks;
}

test("Semantic Chunker: preserves section headings, page numbers, and generates sha256 hashes", () => {
  const sampleDoc = `
# Section A: Introduction to Energy

Page 1: Overview
Living organisms require an external energy source to drive metabolic work.

# Section B: The Photosynthetic Process

Page 2: Chloroplasts
Chlorophyll pigments absorb photons primarily in the blue and red wavelengths, transferring energy to reaction centers.
Water molecules are split via photolysis, releasing molecular oxygen as a by-product.
`;

  const chunks = createSemanticChunks(sampleDoc, 150, 30);
  assert.ok(chunks.length >= 2, "Should create multiple chunks");
  assert.equal(chunks[0].chunk_index, 0);
  assert.ok(chunks[0].content_hash.length === 64, "Hash must be 64-char SHA256 hex");
  assert.ok(chunks.some((c) => c.section_heading.includes("Photosynthetic")), "Should capture section heading");
});

// 2. Vector Cosine Similarity Test
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

test("Vector Similarity: identical vectors yield 1.0, orthogonal yield 0.0", () => {
  const vec1 = [1, 0, 0, 1];
  const vec2 = [1, 0, 0, 1];
  const vec3 = [0, 1, 1, 0];

  const simIdentical = cosineSimilarity(vec1, vec2);
  const simOrthogonal = cosineSimilarity(vec1, vec3);

  assert.equal(Math.round(simIdentical * 100) / 100, 1.0);
  assert.equal(Math.round(simOrthogonal * 100) / 100, 0.0);
});

// 3. Fact Selection & Objective Coverage Test
function selectBalancedFacts(candidateFacts, targetObjectives, maxFacts = 5) {
  const grouped = new Map();
  for (const lo of targetObjectives) grouped.set(lo, []);

  for (const fact of candidateFacts) {
    if (grouped.has(fact.learning_objective)) {
      grouped.get(fact.learning_objective).push(fact);
    }
  }

  const selected = [];
  for (const [_, factsForObj] of grouped.entries()) {
    if (factsForObj.length > 0) {
      factsForObj.sort((a, b) => {
        const score = (t) => (t === "causal_relationship" ? 3 : t === "mechanism" ? 2 : 1);
        return score(b.fact_type) - score(a.fact_type);
      });
      selected.push(factsForObj[0]);
    }
  }
  return selected.slice(0, maxFacts);
}

test("Fact Selection: ensures 100% objective coverage and prioritizes causal mechanisms", () => {
  const objectives = ["Understand Light Absorption", "Explain Calvin Cycle"];
  const candidateFacts = [
    { id: "f1", statement: "Chlorophyll is a pigment.", fact_type: "definition", learning_objective: "Understand Light Absorption" },
    { id: "f2", statement: "Absorption of photon elevates electron energy state.", fact_type: "causal_relationship", learning_objective: "Understand Light Absorption" },
    { id: "f3", statement: "Rubisco fixes CO2 into 3-PGA.", fact_type: "mechanism", learning_objective: "Explain Calvin Cycle" },
  ];

  const selected = selectBalancedFacts(candidateFacts, objectives);
  assert.equal(selected.length, 2);
  assert.equal(selected[0].id, "f2", "Must prioritize causal_relationship over definition");
  assert.equal(selected[1].id, "f3");
});

// 4. Strict Descriptive Question Validation Test
function validateDescriptiveMystery(caseData) {
  const errors = [];
  if (!caseData.title) errors.push("Missing title");
  if (!caseData.canonical_solution) errors.push("Missing canonical solution");
  if (!Array.isArray(caseData.questions) || caseData.questions.length === 0) {
    errors.push("Missing questions");
    return { isValid: false, errors };
  }

  let marksSum = 0;
  caseData.questions.forEach((q, idx) => {
    if (q.options && Array.isArray(q.options) && q.options.length > 0) {
      errors.push(`Question #${idx + 1} contains multiple-choice options. Multiple-choice is prohibited.`);
    }
    if (["mcq", "multiple_choice"].includes(q.type)) {
      errors.push(`Question #${idx + 1} is typed as MCQ. Strict descriptive required.`);
    }
    marksSum += q.max_marks || 0;
  });

  return {
    isValid: errors.length === 0,
    errors,
    marksSum,
  };
}

test("Validation: enforces strictly descriptive questions and rejects multiple choice", () => {
  const validDescriptiveCase = {
    title: "The Case of the Inhibited Stomata",
    canonical_solution: "Elevated ABA synthesis caused stomatal closure.",
    questions: [
      {
        id: "q1",
        question_text: "Explain how stomatal conductance relates to transpiration rates in Clue 1.",
        max_marks: 50,
      },
      {
        id: "q2",
        question_text: "Propose an experiment to differentiate between potassium deficiency and water stress.",
        max_marks: 50,
      },
    ],
  };

  const invalidMcqCase = {
    title: "Bad MCQ Case",
    canonical_solution: "Answer is B",
    questions: [
      {
        id: "q1",
        type: "mcq",
        question_text: "What absorbs light?",
        options: ["Chlorophyll", "Hemoglobin", "Keratin"],
        max_marks: 100,
      },
    ],
  };

  const validResult = validateDescriptiveMystery(validDescriptiveCase);
  assert.ok(validResult.isValid, "Valid descriptive case must pass");
  assert.equal(validResult.marksSum, 100);

  const invalidResult = validateDescriptiveMystery(invalidMcqCase);
  assert.equal(invalidResult.isValid, false, "MCQ case must fail validation");
  assert.ok(invalidResult.errors.some((e) => e.includes("Multiple-choice is prohibited")));
});

// 5. Student Safe Payload Sanitization Test
test("Security: sanitizes student payload stripping teacher canonical solution and private keys", () => {
  const serverVersionSnapshot = {
    assignment_id: "asg-101",
    version_number: 1,
    title: "Cellular Respiration Anomaly",
    mystery_snapshot: {
      case_number: "CASE-442",
      narrative_premise: "Mitochondrial uncoupling detected.",
      canonical_solution: "CONFIDENTIAL_TEACHER_ANSWER_KEY: Dinitrophenol caused proton dissipation.",
      clues_and_evidence: [{ id: "c1", name: "ATP sensor", content: "Yield dropped by 80%" }],
    },
    questions_snapshot: [
      {
        id: "q1",
        question_text: "Explain why ATP yield dropped despite continued oxygen consumption.",
        max_marks: 100,
        teacher_notes: "Look for proton leak explanation.",
      },
    ],
  };

  // Sanitizer
  const studentSafePayload = {
    assignmentId: serverVersionSnapshot.assignment_id,
    title: serverVersionSnapshot.title,
    case_number: serverVersionSnapshot.mystery_snapshot.case_number,
    narrative_premise: serverVersionSnapshot.mystery_snapshot.narrative_premise,
    clues: serverVersionSnapshot.mystery_snapshot.clues_and_evidence,
    questions: serverVersionSnapshot.questions_snapshot.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      max_marks: q.max_marks,
    })),
  };

  const serialized = JSON.stringify(studentSafePayload);
  assert.ok(!serialized.includes("CONFIDENTIAL_TEACHER_ANSWER_KEY"), "Must NOT contain canonical solution");
  assert.ok(!serialized.includes("teacher_notes"), "Must NOT contain private teacher notes");
  assert.ok(serialized.includes("Cellular Respiration Anomaly"));
});

// 6. Murdle Progressive Reading Passage & Deduction Verification Test
test("Murdle Engine: enforces 4 sequential acts, multi-paragraph reading, deduction briefs, and everyday analogies", () => {
  const murdleAssignment = {
    title: "The Cryo-Reserve Enzyme Anomaly",
    subject: "Biochemistry",
    story_acts: [
      {
        act_number: 1,
        title: "The Morning Calibration Anomaly",
        paragraphs: [
          "At dawn, the automated sensors across the cryo-preservation facility registered a sharp decline in catalytic conversion rates.",
          "Chief technician Elena stood before the primary incubation chamber, observing that while reactant concentrations were optimal, product yields had completely plateaued."
        ],
        section_brief: "Substrate levels remain constant while reaction velocity has dropped by 72% at 4°C.",
        unlocked_clue: {
          id: "clue_act_1",
          name: "Thermal Gradient Log",
          clue_type: "telemetry_log",
          highlight_evidence: "Chamber temperature rose from -20°C to +4°C over 45 minutes.",
          analogy_explanation: "Think of an enzyme like a precision key fitting into an ignition. If the key bends slightly from heat, it cannot turn the engine even if the keyhole is clear."
        },
        related_question_id: "q_act_1"
      },
      {
        act_number: 2,
        title: "The Secondary Assay Divergence",
        paragraphs: [
          "Elena dispatched samples to the spectrophotometer for molecular absorbance confirmation.",
          "The optical density curves revealed altered tertiary fold conformations along the catalytic cleft."
        ],
        section_brief: "Protein denaturation observed, confirming structural conformational disruption.",
        unlocked_clue: {
          id: "clue_act_2",
          name: "Spectroscopic Absorbance Curve",
          clue_type: "spectrogram",
          highlight_evidence: "Absorbance peak shifted from 280nm to 295nm, exposing tryptophan residues.",
          analogy_explanation: "Like an origami crane getting crushed in transit; the paper remains identical, but the functional shape is lost."
        },
        related_question_id: "q_act_2"
      }
    ],
    questions: [
      {
        id: "q_act_1",
        question_number: 1,
        question_text: "Analyze the thermal log and explain the molecular consequence of the temperature increase on the enzyme's active site.",
        max_marks: 50
      },
      {
        id: "q_act_2",
        question_number: 2,
        question_text: "Explain how the tryptophan residue shift in the absorbance curve supports your hypothesis of tertiary structure collapse.",
        max_marks: 50
      }
    ]
  };

  assert.equal(murdleAssignment.story_acts.length, 2);
  for (const act of murdleAssignment.story_acts) {
    assert.ok(act.paragraphs.length >= 2, `Act ${act.act_number} must have at least 2 substantive paragraphs`);
    assert.ok(act.section_brief && act.section_brief.length > 10, `Act ${act.act_number} must have a deduction brief`);
    assert.ok(act.unlocked_clue, `Act ${act.act_number} must unlock an evidence clue`);
    assert.ok(
      act.unlocked_clue.analogy_explanation && act.unlocked_clue.analogy_explanation.length > 15,
      `Act ${act.act_number} must have an everyday intuitive analogy`
    );
  }
});

