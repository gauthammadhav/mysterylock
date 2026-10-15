import React from "react";
import { Check, X, Minus } from "lucide-react";

export function ComparisonSection() {
  const rows = [
    {
      dimension: "Assignment Preparation",
      traditional: "Hours creating static problem sets or recycling old textbook questions.",
      genericAI: "Generic, ungrounded quizzes generated without your specific syllabus context.",
      mysteryLearn: "Uploads your slides/PDFs and generates curriculum-grounded case files in minutes.",
    },
    {
      dimension: "Cheating Resistance",
      traditional: "Zero protection. Answers easily found online or generated via generic AI.",
      genericAI: "Relies on unreliable AI detectors that flag false positives and trigger distrust.",
      mysteryLearn: "Structured staged deductions, unique student variants, and required evidence citations.",
    },
    {
      dimension: "Student Engagement",
      traditional: "Tedious task completion driven by compliance and midnight deadlines.",
      genericAI: "One-click copy-pasting with little working memory retention.",
      mysteryLearn: "Investigative narrative hooks, interactive evidence decks, and anomaly resolution.",
    },
    {
      dimension: "Help & Scaffolding",
      traditional: "Binary answer keys; students either copy from peers or give up.",
      genericAI: "Chatbots give away the final answer immediately, halting critical thinking.",
      mysteryLearn: "3-level hint ladders (Nudge → Guide → Scaffold) that log engagement without penalty.",
    },
    {
      dimension: "Grading & Progress Visibility",
      traditional: "Single numerical score with no insight into where misunderstandings occurred.",
      genericAI: "Opaque black-box percentages with no source validation.",
      mysteryLearn: "100-point transparent rubric with cited evidence passages and misconception heatmaps.",
    },
  ];

  return (
    <section className="bg-[#FAFBF8] py-20 lg:py-28 border-b border-[#E4E9E3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold tracking-widest text-[#287A52] uppercase mb-3">
            Comparative Analysis
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#153D2E] mb-6">
            Making the learning process visible, not just automated.
          </h2>
          <p className="text-[17px] text-[#68736B] leading-relaxed">
            Here is how Mystery Learning compares to traditional homework and generic AI question generators.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-3xl border border-[#E4E9E3] bg-[#FFFFFF] shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E4E9E3] bg-[#F3F7F1]">
                <th className="p-5 lg:p-6 text-xs font-bold uppercase tracking-wider text-[#153D2E] w-1/4">
                  Assessment Dimension
                </th>
                <th className="p-5 lg:p-6 text-xs font-bold uppercase tracking-wider text-[#68736B] w-1/4">
                  Traditional Homework
                </th>
                <th className="p-5 lg:p-6 text-xs font-bold uppercase tracking-wider text-[#68736B] w-1/4">
                  Generic AI Question Bots
                </th>
                <th className="p-5 lg:p-6 text-xs font-bold uppercase tracking-wider text-[#287A52] bg-[#EBF3EA] w-1/4">
                  Mystery Learning Platform
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9E3] text-xs sm:text-sm">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-[#FAFBF8] transition-colors">
                  <td className="p-5 lg:p-6 font-semibold text-[#153D2E]">
                    {r.dimension}
                  </td>
                  <td className="p-5 lg:p-6 text-[#68736B]">
                    {r.traditional}
                  </td>
                  <td className="p-5 lg:p-6 text-[#68736B]">
                    {r.genericAI}
                  </td>
                  <td className="p-5 lg:p-6 font-medium text-[#153D2E] bg-[#F3F7F1]/60">
                    {r.mysteryLearn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
