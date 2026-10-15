import React from "react";
import { Sparkles, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";

export function TrustAndContext() {
  return (
    <section className="bg-[#FAFBF8] py-16 lg:py-20 border-b border-[#E4E9E3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-xs font-semibold tracking-widest text-[#287A52] uppercase mb-3">
            Pedagogical Commitment
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#153D2E] mb-4">
            Built for teaching. Designed for understanding.
          </h2>
          <p className="text-[17px] text-[#68736B] leading-relaxed">
            Mystery Learning is not an AI detection tool or an automated surveillance system. It is an authentic assessment framework engineered so that copying answers is ineffective, while genuine curiosity and reasoned investigation are rewarded.
          </p>
        </div>

        {/* 3 Core Product Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E4E9E3] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#DCEBDD] text-[#153D2E] flex items-center justify-center font-bold text-lg mb-6">
                01
              </div>
              <h3 className="text-xl font-bold text-[#153D2E] mb-3">
                Curiosity Over Compliance
              </h3>
              <p className="text-[15px] text-[#68736B] leading-relaxed">
                When assignments are framed as investigative challenges with clues and anomalies, students engage to discover the mechanism, rather than rushing to fulfill a grade checkpoint.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F3F7F1] flex items-center gap-2 text-xs font-medium text-[#287A52]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Intrinsic motivation by design</span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E4E9E3] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#DCEBDD] text-[#153D2E] flex items-center justify-center font-bold text-lg mb-6">
                02
              </div>
              <h3 className="text-xl font-bold text-[#153D2E] mb-3">
                Defensible Reasoning
              </h3>
              <p className="text-[15px] text-[#68736B] leading-relaxed">
                A final answer alone earns minimal credit. Students must cite evidence cards, detail their cause-and-effect chain, and defend their hypotheses in their own words.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F3F7F1] flex items-center gap-2 text-xs font-medium text-[#287A52]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Visible cognitive process</span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E4E9E3] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#DCEBDD] text-[#153D2E] flex items-center justify-center font-bold text-lg mb-6">
                03
              </div>
              <h3 className="text-xl font-bold text-[#153D2E] mb-3">
                Transparent Evaluation
              </h3>
              <p className="text-[15px] text-[#68736B] leading-relaxed">
                Every score is mapped to a teacher-approved 100-point rubric with direct evidence citations. Teachers maintain full review authority with zero automated misconduct accusations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F3F7F1] flex items-center gap-2 text-xs font-medium text-[#287A52]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Teacher retains final authority</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
