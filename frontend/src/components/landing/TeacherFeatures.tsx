import React from "react";
import { BookOpen, Edit3, Target, ShieldCheck, FileCheck, Users, BarChart2, Cpu } from "lucide-react";

export function TeacherFeatures() {
  const features = [
    {
      icon: BookOpen,
      title: "Grounded in Your Actual Syllabus",
      benefit: "No generic AI trivia. Challenges are extracted directly from your uploaded lecture slides, notes, and textbook chapters with page-level citations.",
    },
    {
      icon: Edit3,
      title: "Complete Editorial Control",
      benefit: "Review, tweak, regenerate, or rewrite any question, clue, or rubric weight before students ever see it. The teacher retains final authority.",
    },
    {
      icon: Target,
      title: "Strict Objective Alignment",
      benefit: "Every puzzle checkpoint is mathematically mapped to specific curriculum learning objectives so assignments measure taught standards.",
    },
    {
      icon: ShieldCheck,
      title: "Safe Parametric Equivalence",
      benefit: "Generate copy-proof student variants with different characters, numbers, and distractor clues while keeping cognitive difficulty identical.",
    },
    {
      icon: FileCheck,
      title: "Transparent 100-Point Rubrics",
      benefit: "Automated scoring evaluates conceptual accuracy, reasoning, and evidence citations against an explicit rubric — eliminating subjective ambiguity.",
    },
    {
      icon: BarChart2,
      title: "Classroom Misconception Heatmaps",
      benefit: "Instantly see which concept confused the most students. Use data-driven insights to target review sessions before high-stakes exams.",
    },
  ];

  return (
    <section id="for-teachers" className="bg-[#FFFFFF] py-20 lg:py-28 border-b border-[#E4E9E3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold tracking-widest text-[#287A52] uppercase mb-3">
            Designed for Educators
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#153D2E] mb-6">
            Author engaging assignments without spending your entire weekend.
          </h2>
          <p className="text-[17px] text-[#68736B] leading-relaxed">
            Mystery Learning is your curriculum-grounded teaching assistant. Prepare rigorous, authentic assessments in minutes while retaining absolute instructional oversight.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-2xl bg-[#FAFBF8] border border-[#E4E9E3] hover:border-[#287A52]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F3F7F1] border border-[#DCEBDD] text-[#287A52] flex items-center justify-center mb-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#153D2E] mb-3">
                    {f.title}
                  </h3>
                  <p className="text-[14.5px] text-[#68736B] leading-relaxed">
                    {f.benefit}
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
