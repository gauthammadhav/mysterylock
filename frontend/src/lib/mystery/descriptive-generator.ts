import { GoogleGenAI } from "@google/genai";
import { ExtractedFact } from "@/types/facts";
import { DescriptiveMysteryAssignment, DescriptiveQuestion, NarrativeAct } from "@/types/descriptive";

interface MysteryGenerationParams {
  assignmentId: string;
  assignmentTitle: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  learningObjectives: string[];
  approvedFacts: ExtractedFact[];
}

/**
 * Generates an authentic academic deduction mystery following the Murdle reading-comprehension pattern:
 * - A substantial, multi-act academic narrative (2-3 paragraphs per act).
 * - Immediately following each act: a deduction brief summarizing the observations as a hint,
 *   paired with an unlocked clue card and simple, intuitive everyday analogies.
 * - Progressive strict descriptive inquiries directly tied to each act.
 */
export async function generateDescriptiveMystery(
  params: MysteryGenerationParams
): Promise<DescriptiveMysteryAssignment> {
  const {
    assignmentId,
    assignmentTitle,
    subject,
    difficulty,
    learningObjectives,
    approvedFacts,
  } = params;

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a talented educational storyteller.
Create a SIMPLE, RELATABLE, and ENGAGING educational story for students learning "${subject}".
The assignment topic is "${assignmentTitle}".
The difficulty level is "${difficulty}".

IMPORTANT: KEEP IT A SIMPLE STORY (NOT A COMPLEX PUZZLE):
- Do NOT generate complex forensic puzzles, multi-suspect logic grids, trick deduction grids, or convoluted forensics.
- Write a warm, relatable, and realistic story that students genuinely enjoy reading (e.g. students Maya and Leo working on an exciting practical project in ${subject}).
- Use clear, friendly, vivid language. Strictly avoid heavy jargon.

KEY REQUIREMENTS:
1. 3 TO 4 CLEAR STORY CHAPTERS:
   - Part 1: "Part 1: A Promising Start" (Setting up the project, how things normally work).
   - Part 2: "Part 2: An Unexpected Discovery" (Something changes or a challenge appears).
   - Part 3: "Part 3: Finding the Real Cause" (Testing ideas and understanding the science).
   - Part 4: "Part 4: Solving the Challenge" (Putting the solution in place and seeing the healthy result).

2. SUBSTANTIAL PASSAGES WITH KEYWORDS HIGHLIGHTED IN GREEN:
   - Provide generous, descriptive, easy-to-read story paragraphs (the passage can be big and rich with descriptive details!).
   - Wrap necessary keywords, core concepts, and key findings in double asterisks, e.g. **${subject}**, **photosynthesis**, **temperature**, **soil moisture**, so they render highlighted in green.

3. SIMPLE HELPFUL HINT ABOVE EACH QUESTION:
   - "section_brief": A friendly 1-sentence hint guiding the student (e.g. "Hint: Notice how both sunlight and moisture worked together in this step.").
   - "unlocked_clue": Name, observation detail, and a simple everyday analogy ("Think of it like...").

4. REALLY SIMPLE AND CLEAR QUESTIONS:
   - 1 simple, clear question per section asking the student to explain the mechanism or lesson in their own words based on the story.
   - Simple conversational English without convoluted multi-clause questions.

Respond strictly with valid JSON conforming to this schema:
{
  "title": "The Mystery of the [Relatable Scene]: A ${subject} Investigation",
  "case_number": "CASE-${Math.floor(1000 + Math.random() * 9000)}",
  "narrative_premise": "A friendly 2-3 sentence introduction to the mystery...",
  "academic_discipline": "${subject}",
  "setting_context": "e.g. The Oakridge School Science Greenhouse",
  "investigative_role": "Student Science Detective",
  "story_acts": [
    {
      "act_number": 1,
      "title": "Act 1: A Promising Start",
      "paragraphs": [
        "First warm paragraph introducing the friendly setting, the students, and the experiment...",
        "Second paragraph describing what was happening normally and how the system works..."
      ],
      "section_brief": "Quick Clue: Everything was running smoothly with plenty of light, but they noticed something important...",
      "unlocked_clue": {
        "id": "clue_1",
        "name": "Friendly Clue Name",
        "type": "observation_log",
        "highlight_evidence": "Simple clear fact observed",
        "analogy_explanation": "Think of it like baking cookies: even with a hot oven, you still need flour and water to make dough!",
        "is_anomaly": false
      },
      "related_question_id": "q_1"
    }
  ],
  "timeline_and_observations": [
    { "timestamp_or_step": "Day 1 - Morning", "observation": "Students set up the experiment with healthy plants and bright lights." }
  ],
  "clues_and_evidence": [
    {
      "id": "clue_1",
      "name": "Friendly Clue Name",
      "type": "observation_log",
      "content": "Simple clear fact observed",
      "connected_fact_ids": ["fact_1"],
      "is_anomaly": false
    }
  ],
  "questions": [
    {
      "id": "q_1",
      "question_number": 1,
      "question_type": "concept_explanation",
      "title": "Friendly Short Title",
      "question_text": "Simple, clear question asking the student to explain the idea in their own words...",
      "target_learning_objectives": ["${learningObjectives[0] || subject}"],
      "grounded_fact_ids": ["fact_1"],
      "expected_reasoning": "What a good answer should mention in plain English...",
      "required_evidence_citations": ["Clue 1"],
      "max_marks": 25,
      "difficulty": "introductory",
      "rubric": {
        "criteria_name": "Clear Understanding & Explanation",
        "description": "Evaluates how clearly the student explains the science using clues from the story.",
        "scoring_levels": [
          { "score_range": "21-25", "level_name": "Exemplary", "descriptor": "Gives a full, clear explanation and cites the clues." },
          { "score_range": "16-20", "level_name": "Proficient", "descriptor": "Explains the main idea correctly with good detail." },
          { "score_range": "10-15", "level_name": "Developing", "descriptor": "Understands part of the idea but misses a key detail." },
          { "score_range": "0-9", "level_name": "Insufficient", "descriptor": "Incomplete or inaccurate explanation." }
        ]
      },
      "graduated_hints": [
        { "tier": 1, "hint_type": "Conceptual Prompt", "hint_text": "Think about what happened in Act 1..." },
        { "tier": 2, "hint_type": "Evidence Direction", "hint_text": "Look at the quick takeaway clue..." },
        { "tier": 3, "hint_type": "Reasoning Guide", "hint_text": "Remember the cookie baking analogy..." }
      ]
    }
  ],
  "canonical_solution": "Clear, friendly teacher solution explaining what happened and why.",
  "total_marks": 100
}
Ensure strictly valid JSON without markdown formatting.`;

      const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let parsed: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.35,
            },
          });

          const rawText = response.text || "{}";
          const candidateParsed = JSON.parse(rawText);
          if (
            candidateParsed.title &&
            Array.isArray(candidateParsed.questions) &&
            candidateParsed.questions.length > 0
          ) {
            parsed = candidateParsed;
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Gemini model ${modelName} error (${modelErr?.message || modelErr}), trying fallback model...`);
        }
      }

      if (parsed) {
        return {
          ...parsed,
          assignment_id: assignmentId,
        };
      }
    } catch (err: any) {
      console.warn("Gemini mystery generation error, falling back to deterministic Murdle case:", err?.message);
    }
  }

  // Deterministic pedagogical fallback matching the exact Murdle multi-act pattern
  return generateDeterministicMurdleCase(
    assignmentId,
    assignmentTitle,
    subject,
    difficulty,
    learningObjectives,
    approvedFacts
  );
}

/**
 * Friendly, intuitive deterministic fallback generator structuring the narrative into 4 rich Acts,
 * with warm storytelling, relatable analogies, and simple, clear descriptive questions.
 */
function generateDeterministicMurdleCase(
  assignmentId: string,
  assignmentTitle: string,
  subject: string,
  difficulty: string,
  learningObjectives: string[],
  approvedFacts: ExtractedFact[]
): DescriptiveMysteryAssignment {
  const caseNumber = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;

  const fact1 = approvedFacts[0]?.statement || `${subject} relies on balanced inputs and natural equilibrium to stay healthy.`;
  const fact2 = approvedFacts[1]?.statement || `When a vital ingredient is scarce, living systems slow down to protect themselves.`;
  const fact3 = approvedFacts[2]?.statement || `Internal protective signals temporarily close pathways to conserve energy and moisture.`;
  const fact4 = approvedFacts[3]?.statement || `Restoring the missing ingredient allows normal growth and activity to resume quickly.`;

  // Create a friendly, topic-aware title
  const friendlyTitle = `The Mystery of the Wilting Greenhouse Plants: A ${subject} Investigation`;

  const story_acts: NarrativeAct[] = [
    {
      act_number: 1,
      title: "Act 1: A Promising Start in the Greenhouse",
      paragraphs: [
        `On Monday morning, middle school science partners Maya and Leo walked into the sunny school greenhouse to begin their class science project on **${subject}**. The tables were lined with **vibrant green potted sunflower seedlings**, basking under **full-spectrum grow lights** that simulated bright summer sunshine. The room felt warm, humid, and full of life.`,
        `Maya took out her notebook to record their baseline measurements. Every leaf looked crisp and green, and the seedlings were actively growing. "Look at **Table Alpha and Table Beta**," Leo remarked, adjusting the light timer. "Both tables have the exact same soil, the exact same temperature at **22°C**, and identical grow lights. Everything is in **perfect balance**!"`,
      ],
      section_brief:
        "Quick Clue: Under **bright lights** and **warm air**, both sets of plants started off healthy and growing quickly, showing that their basic systems were working perfectly.",
      unlocked_clue: {
        id: "clue_1",
        name: "Morning Lab Notebook: Healthy Baseline",
        type: "observation_log",
        highlight_evidence: `Baseline verified: ${fact1} Both **Table Alpha** and **Table Beta** showed healthy green leaves and active growth under bright lights.`,
        analogy_explanation:
          "Think of cars cruising down a clear highway on a sunny morning: when the road is open and tanks are full of fuel, everything moves smoothly at steady speed.",
        is_anomaly: false,
      },
      related_question_id: "q_1",
    },
    {
      act_number: 2,
      title: "Act 2: The Mystery of the Drooping Leaves",
      paragraphs: [
        `By Wednesday afternoon, something strange had happened. While the plants on **Table Alpha** were still standing tall and proud, the plants on **Table Beta** looked sad and droopy. Their leaves hung limp, and their stems were bending toward the table.`,
        `Maya and Leo rushed over to investigate. "Did somebody turn off the lights?" Leo wondered aloud. But the **overhead grow lights** above Table Beta were shining just as brightly as always. Leo guessed that hungry greenhouse beetles had chewed through the stems. But Maya leaned in with a magnifying glass and noticed something different: the stems were **completely intact**, but the leaf openings were **clamped tightly shut**.`,
      ],
      section_brief:
        "Quick Clue: Even though Table Beta had the exact same **bright light**, the plants started drooping. Light alone was not enough to keep them healthy!",
      unlocked_clue: {
        id: "clue_2",
        name: "Magnifying Lens Inspection: Shrunken Leaves",
        type: "specimen_sample",
        highlight_evidence: `Leaf inspection reveals: ${fact2} No insects or bite marks were found; instead, **tiny leaf openings were clamped shut**.`,
        analogy_explanation:
          "Think of rolling down storm shutters during a storm: the house shuts its windows tight to keep warmth and moisture from escaping.",
        is_anomaly: true,
      },
      related_question_id: "q_2",
    },
    {
      act_number: 3,
      title: "Act 3: Searching for the Hidden Cause",
      paragraphs: [
        `Determined to solve the puzzle, Maya checked the **soil moisture meter**. When she pressed the probe into Table Alpha's pots, the needle pointed to **'Optimal Moisture'**. But when she poked it into Table Beta, the needle plummeted to zero—the soil was **bone dry**!`,
        `Looking up, Leo spotted the culprit: a small **ventilation window** right above Table Beta had been left cracked open, blowing a steady stream of **dry, chilly air** straight across the pots. Because the dry air was pulling moisture out of the leaves faster than normal, the plants had triggered a **natural survival reflex**, clamping their **leaf pores shut** so they would not dry out completely.`,
      ],
      section_brief:
        "Quick Clue: The **dry air draft** dried out the soil. The plants **closed their tiny leaf pores** to save whatever water was left inside them.",
      unlocked_clue: {
        id: "clue_3",
        name: "Moisture Meter Reading & Draft Alert",
        type: "observation_log",
        highlight_evidence: `Draft inspection confirms: ${fact3} Dry breeze dropped soil moisture to **near zero**, triggering the plant's natural protective closure.`,
        analogy_explanation:
          "Think of a runner on a hot summer day: when you run out of water, your body stops sweating and you have to rest so you don't overheat.",
        is_anomaly: true,
      },
      related_question_id: "q_3",
    },
    {
      act_number: 4,
      title: "Act 4: Cracking the Case and Saving the Plants",
      paragraphs: [
        `With the real cause uncovered, Maya and Leo sprang into action. Leo **latched the drafty window tightly shut** to stop the dry breeze, while Maya carefully watered each pot on Table Beta with **room-temperature water**.`,
        `They sat back to watch what happened. Within just two hours, the dry soil **soaked up the moisture**, the roots absorbed the water, and the leaves **reopened their tiny pores**. By late afternoon, Table Beta's sunflowers stood tall, green, and healthy once more. The mystery was solved: the plants weren't sick—they had simply protected themselves until they got the **water they needed**!`,
      ],
      section_brief:
        "Quick Clue: As soon as the **water was replenished** and the draft was stopped, the plants **reopened their leaf pores** and bounced right back to life.",
      unlocked_clue: {
        id: "clue_4",
        name: "Recovery Log: Fresh Standing Leaves",
        type: "field_test",
        highlight_evidence: `Follow-up verification: ${fact4} Seedlings **fully regained their upright posture** within 2 hours of watering and closing the draft.`,
        analogy_explanation:
          "Think of watering a dry, flat kitchen sponge: the moment it touches water, it springs right back into its soft, full shape!",
        is_anomaly: false,
      },
      related_question_id: "q_4",
    },
  ];

  const clues_and_evidence = story_acts.map((act) => ({
    id: act.unlocked_clue.id,
    name: act.unlocked_clue.name,
    type: act.unlocked_clue.type,
    content: act.unlocked_clue.highlight_evidence,
    connected_fact_ids: [act.unlocked_clue.id],
    is_anomaly: Boolean(act.unlocked_clue.is_anomaly),
  }));

  const questions: DescriptiveQuestion[] = [
    {
      id: "q_1",
      question_number: 1,
      question_type: "concept_explanation",
      title: "What Do Plants Need to Grow?",
      question_text: `In Act 1, the sunflowers on both tables were growing fast under bright grow lights. But light isn't the only thing plants need to make food. Using what you read in Act 1, explain what other essential ingredients plants need to stay healthy, and how light and water work together.`,
      target_learning_objectives: [learningObjectives[0] || subject],
      grounded_fact_ids: [approvedFacts[0]?.id || "fact_1"],
      expected_reasoning: `The student explains that ${fact1}, noting that plants need both light and water/nutrients together to produce food.`,
      required_evidence_citations: ["Morning Lab Notebook", "Act 1 Paragraph 2"],
      max_marks: 25,
      difficulty: "introductory",
      rubric: {
        criteria_name: "Clear Understanding & Explanation",
        description: "Evaluates how clearly the student explains the science using clues from the story.",
        scoring_levels: [
          { score_range: "21-25", level_name: "Exemplary", descriptor: "Gives a full, clear explanation of how light and water work together, citing the baseline notes." },
          { score_range: "16-20", level_name: "Proficient", descriptor: "Explains the main idea correctly with good detail." },
          { score_range: "10-15", level_name: "Developing", descriptor: "Mentions light or water, but doesn't explain how they work together." },
          { score_range: "0-9", level_name: "Insufficient", descriptor: "Incomplete or inaccurate explanation." },
        ],
      },
      graduated_hints: [
        { tier: 1, hint_type: "Conceptual Prompt", hint_text: "Think about what happened in Act 1 when everything was balanced." },
        { tier: 2, hint_type: "Evidence Direction", hint_text: "Look at the highway traffic analogy in Clue 1." },
        { tier: 3, hint_type: "Reasoning Guide", hint_text: "What does a plant use light for, and what raw ingredients does it need?" },
      ],
    },
    {
      id: "q_2",
      question_number: 2,
      question_type: "competing_hypotheses",
      title: "Testing Leo's Insect Theory",
      question_text: `In Act 2, Leo thought insects were chewing on Table Beta's plants, while Maya thought the leaves were closing to protect themselves. Look at Clue 2. Which student was correct, and what evidence from the magnifying lens proves it?`,
      target_learning_objectives: [learningObjectives[1] || subject],
      grounded_fact_ids: [approvedFacts[1]?.id || "fact_2"],
      expected_reasoning: `The student explains that Maya was correct because ${fact2}—the leaves had no bite marks or bugs, but instead had closed their openings to save moisture.`,
      required_evidence_citations: ["Magnifying Lens Inspection", "Act 2 Paragraph 2"],
      max_marks: 25,
      difficulty: "intermediate",
      rubric: {
        criteria_name: "Comparing Ideas with Evidence",
        description: "Assesses ability to choose the correct idea and back it up with evidence from the clue.",
        scoring_levels: [
          { score_range: "21-25", level_name: "Exemplary", descriptor: "Clearly identifies Maya as correct and explains the clue showing intact leaves with closed pores." },
          { score_range: "16-20", level_name: "Proficient", descriptor: "Chooses Maya and mentions the lack of insects." },
          { score_range: "10-15", level_name: "Developing", descriptor: "Chooses the right person but doesn't cite the evidence." },
          { score_range: "0-9", level_name: "Insufficient", descriptor: "Chooses the wrong idea or gives contradictory reasoning." },
        ],
      },
      graduated_hints: [
        { tier: 1, hint_type: "Conceptual Prompt", hint_text: "Did Maya see any bugs under the magnifying glass?" },
        { tier: 2, hint_type: "Evidence Direction", hint_text: "Check what Clue 2 says about leaf openings and bite marks." },
      ],
    },
    {
      id: "q_3",
      question_number: 3,
      question_type: "evidence_interpretation",
      title: "Why Did the Leaves Close Up?",
      question_text: `In Act 3, Maya and Leo found that a cracked window was blowing dry air onto Table Beta. Using the analogy of closing storm shutters on a house, explain why the plants closed their leaf pores. How did this reaction help the plant survive?`,
      target_learning_objectives: [learningObjectives[2] || subject],
      grounded_fact_ids: [approvedFacts[2]?.id || "fact_3"],
      expected_reasoning: `The student explains that ${fact3}, connecting the draft and dry soil to the plant's survival reflex of closing pores to prevent fatal drying out.`,
      required_evidence_citations: ["Moisture Meter Reading", "Act 3 Paragraph 2"],
      max_marks: 25,
      difficulty: "advanced",
      rubric: {
        criteria_name: "Connecting Cause & Effect",
        description: "Measures understanding of how living things adapt to stay alive when their environment changes.",
        scoring_levels: [
          { score_range: "21-25", level_name: "Exemplary", descriptor: "Thoroughly explains how the dry breeze triggered pore closure to stop water loss, using the shutter analogy." },
          { score_range: "16-20", level_name: "Proficient", descriptor: "Explains that closing pores saved water during the dry breeze." },
          { score_range: "10-15", level_name: "Developing", descriptor: "Mentions water loss but doesn't explain the role of the leaf openings." },
          { score_range: "0-9", level_name: "Insufficient", descriptor: "Fails to explain the cause and effect." },
        ],
      },
    },
    {
      id: "q_4",
      question_number: 4,
      question_type: "experimental_design",
      title: "What Did We Learn from Saving the Plants?",
      question_text: `In Act 4, Maya and Leo watered the soil and closed the window, and the plants stood tall again within two hours. What does this experiment teach us about what living things need to survive? If you were to test another plant, how could you prove that water was the real reason it recovered?`,
      target_learning_objectives: [learningObjectives[0] || subject],
      grounded_fact_ids: [approvedFacts[0]?.id || "fact_1"],
      expected_reasoning: `The student explains that ${fact4}, suggesting a simple fair test (e.g. keeping one plant dry and watering another) to prove that water was the deciding factor.`,
      required_evidence_citations: ["Recovery Log", "Act 4 Paragraph 2"],
      max_marks: 25,
      difficulty: "advanced",
      rubric: {
        criteria_name: "Drawing Conclusions & Fair Testing",
        description: "Evaluates ability to summarize what was learned and describe a simple follow-up test.",
        scoring_levels: [
          { score_range: "21-25", level_name: "Exemplary", descriptor: "Clearly summarizes the survival lesson and describes a simple, fair experiment comparing watered vs unwatered plants." },
          { score_range: "16-20", level_name: "Proficient", descriptor: "Summarizes the lesson and suggests watering tests." },
          { score_range: "10-15", level_name: "Developing", descriptor: "Understands that water helped, but gives a vague test description." },
          { score_range: "0-9", level_name: "Insufficient", descriptor: "Incomplete or unclear response." },
        ],
      },
    },
  ];

  return {
    assignment_id: assignmentId,
    title: friendlyTitle,
    case_number: caseNumber,
    narrative_premise: `At the Oakridge School Greenhouse, student detectives Maya and Leo are running a science experiment on ${subject}. While Table Alpha flourishes, Table Beta's sunflowers suddenly begin drooping under the exact same lights! Put on your detective hat, investigate the 4 story acts, and help Maya and Leo uncover what went wrong and how to fix it.`,
    academic_discipline: subject,
    setting_context: `Oakridge School Greenhouse & Botany Lab`,
    investigative_role: "Student Science Detective",
    story_acts,
    timeline_and_observations: [
      { timestamp_or_step: "Monday 9:00 AM", observation: "Seedlings on both tables are green, healthy, and growing fast under bright grow lights." },
      { timestamp_or_step: "Wednesday 1:00 PM", observation: "Table Beta plants start drooping, even though the grow lights are on full power." },
      { timestamp_or_step: "Wednesday 2:30 PM", observation: "Moisture meter shows zero water in Table Beta pots; open drafty window discovered." },
      { timestamp_or_step: "Wednesday 4:30 PM", observation: "Window closed and soil watered; plants stand tall and fully recover in 2 hours." },
    ],
    clues_and_evidence,
    questions,
    canonical_solution: `The drooping sunflowers on Table Beta were not diseased or attacked by insects. Instead, a cracked ventilation window blew dry air directly onto the pots, drying out the soil. To prevent drying out completely, the plants triggered a natural survival reflex and closed their tiny leaf pores. As soon as Maya and Leo closed the window and watered the dry soil, the roots absorbed the water and the leaves opened up again, fully recovering within two hours.`,
    total_marks: 100,
  };
}
