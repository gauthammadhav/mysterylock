import React from "react";
import { Search, Layers, FileSearch, HelpCircle, CheckCheck, RefreshCw } from "lucide-react";

export function ApproachSection() {
  const steps = [
    {
      num: "01",
      icon: Search,
      title: "The Investigative Hook",
      description:
        "The assignment opens with a real-world dilemma or scientific anomaly directly tied to the syllabus. Students take on the role of an investigator needing to uncover the root cause.",
    },
    {
      num: "02",
      icon: FileSearch,
      title: "Evidence Cards & Clues",
      description:
        "Data logs, witness testimonies, formulas, and primary source excerpts derived from your uploaded course materials. Students must sort signal from distractors.",
    },
    {
      num: "03",
      icon: Layers,
      title: "Progressive Checkpoints",
      description:
        "Rather than an overwhelming one-shot essay, the investigation unfolds in structured stages. Solving Stage 1 unlocks the deeper context for Stage 2.",
    },
    {
      num: "04",
      icon: CheckCheck,
      title: "Hypothesis & Evidence Defense",
      description:
        "Students submit structured hypotheses, select the exact evidence cards that support their deduction, and articulate their reasoning in their own words.",
    },
    {
      num: "05",
      icon: HelpCircle,
      title: "3-Level Hint Ladders",
      description:
        "When students get stuck, they request progressive assistance: Level 1 (Nudge), Level 2 (Concept Reminder), or Level 3 (Explicit Scaffold) without penalty.",
    },
    {
      num: "06",
      icon: RefreshCw,
      title: "Formative Revision & Feedback",
      description:
        "Instant, grounded feedback highlights conceptual gaps, allowing students to refine their arguments and demonstrate mastery before final submission.",
    },
  ];

  return (
    <section className="bg-[#FAFBF8] py-20 lg:py-28 border-b border-[#E4E9E3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold tracking-widest text-[#287A52] uppercase mb-3">
            The Methodology
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#153D2E] mb-6">
            Make learning something students uncover.
          </h2>
          <p className="text-[17px] text-[#68736B] leading-relaxed">
            Mystery Learning transforms static curriculum topics into an active investigation. Every checkpoint requires students to analyze evidence, defend logic, and uncover conceptual principles step by step.
          </p>
        </div>

        {/* 6-Stage Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E4E9E3] hover:border-[#287A52]/40 transition-colors shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono font-bold text-[#287A52] bg-[#F3F7F1] px-2.5 py-1 rounded-md border border-[#DCEBDD]">
                      STAGE {s.num}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-[#FAFBF8] border border-[#E4E9E3] flex items-center justify-center text-[#153D2E]">
                      <Icon className="w-4 h-4 text-[#287A52]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#153D2E] mb-2.5">
                    {s.title}
                  </h3>
                  <p className="text-[14.5px] text-[#68736B] leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
