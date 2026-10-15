import React from "react";
import { Award, CheckCircle2, TrendingUp, AlertTriangle, HelpCircle } from "lucide-react";

export function AssessmentSection() {
  return (
    <section id="assessment" className="bg-[#FFFFFF] py-20 lg:py-28 border-b border-[#E4E9E3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold tracking-widest text-[#287A52] uppercase mb-3">
            Pedagogical Integrity
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#153D2E] mb-6">
            Look beyond the final score to see how students think.
          </h2>
          <p className="text-[17px] text-[#68736B] leading-relaxed">
            Conventional grading flattens learning into a binary pass/fail or percentage score. Mystery Learning separates measured submission data, rubric evidence, and predictive concept mastery to give educators real diagnostic visibility.
          </p>
        </div>

        {/* 100-Point Rubric Architecture Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* 90 Core Points Breakdown */}
          <div className="lg:col-span-7 p-8 rounded-3xl bg-[#FAFBF8] border border-[#E4E9E3]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E9E3] mb-6">
              <span className="text-xs font-mono font-bold text-[#287A52] uppercase">
                CORE CURRICULUM (90 POINTS)
              </span>
              <span className="text-xs font-semibold text-[#153D2E]">Taught Learning Outcomes</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-[#153D2E]">Conceptual Accuracy</span>
                <span className="font-bold text-[#287A52]">30 Pts</span>
              </div>
              <p className="text-xs text-[#68736B]">
                Accurate definitions, formulas, calculations, and conclusions aligned to course lectures.
              </p>

              <div className="pt-3 border-t border-[#F3F7F1] flex items-center justify-between text-sm">
                <span className="font-semibold text-[#153D2E]">Reasoning & Working</span>
                <span className="font-bold text-[#287A52]">25 Pts</span>
              </div>
              <p className="text-xs text-[#68736B]">
                Logical step-by-step causal explanations connecting premise to conclusion.
              </p>

              <div className="pt-3 border-t border-[#F3F7F1] flex items-center justify-between text-sm">
                <span className="font-semibold text-[#153D2E]">Evidence Use</span>
                <span className="font-bold text-[#287A52]">15 Pts</span>
              </div>
              <p className="text-xs text-[#68736B]">
                Explicit references to supplied clues and accurate justification of relevance.
              </p>

              <div className="pt-3 border-t border-[#F3F7F1] flex items-center justify-between text-sm">
                <span className="font-semibold text-[#153D2E]">Application to Scenario</span>
                <span className="font-bold text-[#287A52]">10 Pts</span>
              </div>
              <p className="text-xs text-[#68736B]">
                Application of principles to the specific mystery parameters without generic rote answers.
              </p>

              <div className="pt-3 border-t border-[#F3F7F1] flex items-center justify-between text-sm">
                <span className="font-semibold text-[#153D2E]">Clarity of Communication</span>
                <span className="font-bold text-[#287A52]">10 Pts</span>
              </div>
              <p className="text-xs text-[#68736B]">
                Coherent prose and structured argumentation making the student's thinking transparent.
              </p>
            </div>
          </div>

          {/* 10 Extension Points */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-[#F3F7F1] border border-[#DCEBDD]">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCEBDD] mb-6">
              <span className="text-xs font-mono font-bold text-[#287A52] uppercase">
                EXTENSION DEPTH (10 POINTS)
              </span>
              <span className="text-xs font-semibold text-[#153D2E]">Transfer & Synthesis</span>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm font-semibold text-[#153D2E] mb-1">
                  <span>Transfer Beyond Baseline</span>
                  <span className="font-bold text-[#287A52]">6 Pts</span>
                </div>
                <p className="text-xs text-[#68736B]">
                  Applies concepts to novel scenarios, tests counterfactuals, or bridges distinct topics.
                </p>
              </div>

              <div className="pt-4 border-t border-[#DCEBDD]">
                <div className="flex items-center justify-between text-sm font-semibold text-[#153D2E] mb-1">
                  <span>Original Synthesis</span>
                  <span className="font-bold text-[#287A52]">4 Pts</span>
                </div>
                <p className="text-xs text-[#68736B]">
                  Proposes justified insights, identifies model limitations, or frames next research questions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DCEBDD] text-xs text-[#68736B]">
                <span className="font-semibold text-[#153D2E]">Teacher Override Notice: </span>
                Instructors can modify any individual score with an audited comment. The teacher retains final authority over the gradebook.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
