import React from "react";
import { AlertCircle, Clock, Copy, Sparkles, ArrowRight, XCircle, CheckCircle2 } from "lucide-react";

export function ProblemSection() {
  return (
    <section className="bg-[#FFFFFF] py-20 lg:py-28 border-b border-[#E4E9E3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold tracking-widest text-[#287A52] uppercase mb-3">
            The Structural Challenge
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#153D2E] leading-tight mb-6">
            Completing an assignment isn’t the same as understanding it.
          </h2>
          <p className="text-[17px] text-[#68736B] leading-relaxed">
            When educational workflows reward speed and polished final answers, students naturally optimize for completion over comprehension. Generative AI didn't create this habit — it simply magnified an existing vulnerability in traditional homework design.
          </p>
        </div>

        {/* Editorial Layout: 3 Connected Problems */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Problem 1 */}
            <div className="flex gap-5 items-start p-6 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3]">
              <div className="w-10 h-10 rounded-xl bg-[#F3F7F1] border border-[#DCEBDD] text-[#153D2E] flex items-center justify-center shrink-0 mt-1">
                <Clock className="w-5 h-5 text-[#287A52]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#153D2E] mb-2">
                  1. The Checklist Trap: Marks Over Mastery
                </h3>
                <p className="text-[15px] text-[#68736B] leading-relaxed">
                  Students facing packed schedules prioritize getting work submitted before midnight. Memory of the underlying principles often decays within 48 hours because static worksheets fail to demand active synthesis or causal deduction.
                </p>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="flex gap-5 items-start p-6 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3]">
              <div className="w-10 h-10 rounded-xl bg-[#F3F7F1] border border-[#DCEBDD] text-[#153D2E] flex items-center justify-center shrink-0 mt-1">
                <Copy className="w-5 h-5 text-[#287A52]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#153D2E] mb-2">
                  2. The AI Mirage: Fluency Masks True Misconceptions
                </h3>
                <p className="text-[15px] text-[#68736B] leading-relaxed">
                  A student can paste a standard essay prompt into a frontier LLM and generate a grammatically pristine response. This creates an illusion of understanding while obscuring foundational gaps from both the student and the instructor.
                </p>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="flex gap-5 items-start p-6 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3]">
              <div className="w-10 h-10 rounded-xl bg-[#F3F7F1] border border-[#DCEBDD] text-[#153D2E] flex items-center justify-center shrink-0 mt-1">
                <AlertCircle className="w-5 h-5 text-[#287A52]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#153D2E] mb-2">
                  3. Instructor Grading Fatigue
                </h3>
                <p className="text-[15px] text-[#68736B] leading-relaxed">
                  Educators spend hours drafting custom assignments, only to spend whole weekends deciphering repetitive submissions without clear evidence of where conceptual misunderstandings actually occurred.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Comparative Visual Flow */}
          <div className="lg:col-span-5 p-8 rounded-2xl bg-[#F3F7F1] border border-[#DCEBDD]">
            <h4 className="text-xs font-bold tracking-wider text-[#287A52] uppercase mb-6">
              The Cognitive Shift
            </h4>

            {/* Traditional Homework Pathway */}
            <div className="mb-6 pb-6 border-b border-[#DCEBDD]/80">
              <div className="flex items-center gap-2 text-sm font-bold text-[#991B1B] mb-2">
                <XCircle className="w-4 h-4" />
                <span>Traditional Static Assignment</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-[#68736B] bg-[#FFFFFF] p-3 rounded-lg border border-[#E4E9E3]">
                <p>Prompt: "Explain Le Chatelier's Principle."</p>
                <p className="text-[#991B1B]">→ External AI pastes fluent 3-paragraph summary.</p>
                <p className="text-[#991B1B]">→ Student submits without engaging working memory.</p>
                <p className="font-sans font-semibold text-[#202722] pt-1">Outcome: 100% Score, 0% Retention</p>
              </div>
            </div>

            {/* Mystery Learning Pathway */}
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#153D2E] mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#287A52]" />
                <span>Mystery Learning Investigation</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-[#202722] bg-[#FFFFFF] p-3 rounded-lg border border-[#349666]/30 shadow-xs">
                <p>Case: "Cryo-Station 7: Why did reaction rate spike?"</p>
                <p className="text-[#287A52]">→ Inspect Pressure Logs & Gas Chromatography Clues.</p>
                <p className="text-[#287A52]">→ Select 2 evidence cards & justify causal chain.</p>
                <p className="text-[#287A52]">→ Revise after Stage 2 scaffold nudge.</p>
                <p className="font-sans font-semibold text-[#153D2E] pt-1">Outcome: Defensible Understanding</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
