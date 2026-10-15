"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Mystery Learning work?",
      a: "Teachers upload course materials such as syllabi, lecture slides, or textbook chapters. Our RAG engine extracts key learning objectives and generates an investigative case file where students solve challenges by analyzing evidence cards, defending their reasoning, and unlocking progressive checkpoints.",
    },
    {
      q: "Can teachers use their own course materials?",
      a: "Yes. Mystery Learning is specifically designed to work directly from your curriculum. All generated questions, clue decks, and rubrics cite exact page numbers and passages from your uploaded PDFs or notes.",
    },
    {
      q: "Can teachers edit AI-generated questions before publishing?",
      a: "Absolutely. The teacher retains final authority over every assignment. You can edit question wording, add custom clues, adjust rubric weightings, or discard candidate questions before publishing to your students.",
    },
    {
      q: "How does the platform encourage students to show their reasoning?",
      a: "Rather than asking simple multiple-choice questions, checkpoints require students to select supporting evidence cards and articulate their causal deduction. Full marks are awarded for logical coherence and valid citations, not just the final conclusion.",
    },
    {
      q: "Does Mystery Learning replace teachers?",
      a: "No. Mystery Learning is designed to save teachers time during assignment authoring and grading, while giving them deeper diagnostic insight into student misconceptions. The instructor always reviews submissions and controls the final gradebook.",
    },
    {
      q: "Can students use hints without being penalized?",
      a: "Yes. Our 3-level hint ladder (Nudge → Targeted Guide → Explicit Scaffold) encourages students to ask for help when stuck. Hint usage is tracked as positive learning engagement rather than penalized with grade deductions.",
    },
    {
      q: "How are assignments evaluated?",
      a: "Submissions are evaluated against a transparent 100-point rubric (90 core curriculum points + 10 conceptual extension points). The AI evaluator highlights exact evidence citations and flags misconceptions, which teachers can review or override at any time.",
    },
    {
      q: "How does the platform approach AI-assisted student work?",
      a: "Rather than attempting unreliable AI detection, Mystery Learning makes answer-copying ineffective by design. Because assignments feature varied student parameters, progressive clue unlocks, and explicit evidence defense, pasting generic AI answers fails to satisfy the rubric.",
    },
    {
      q: "Is the platform available for individual teachers or institutions?",
      a: "Mystery Learning can be used by individual classroom teachers today, and also supports school-wide and departmental deployments with centralized syllabus repositories and shared rubric standards.",
    },
  ];

  return (
    <section id="faq" className="bg-[#FAFBF8] py-20 lg:py-28 border-b border-[#E4E9E3]">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest text-[#287A52] uppercase mb-3">
            Common Inquiries
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#153D2E] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[17px] text-[#68736B] leading-relaxed">
            Everything you need to know about the pedagogy, technology, and classroom workflow.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#FFFFFF] border border-[#E4E9E3] overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-[#153D2E]">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-[#F3F7F1] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-[#DCEBDD] text-[#153D2E]" : "text-[#68736B]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-[#68736B] leading-relaxed border-t border-[#F3F7F1]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
