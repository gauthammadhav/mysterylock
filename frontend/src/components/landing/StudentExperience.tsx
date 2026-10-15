import React from "react";
import { Compass, Lightbulb, FileText, CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";

export function StudentExperience() {
  const pillars = [
    {
      icon: Compass,
      title: "Investigate Real Dilemmas",
      desc: "Step into the role of a researcher, forensic analyst, or historian. Assignments are structured around solving an authentic problem, not filling in blank fields.",
    },
    {
      icon: Lightbulb,
      title: "Safe 3-Level Hint Ladders",
      desc: "Stuck on a calculation? Request a staged hint without point penalties. Curiosity and asking for guidance are tracked as positive learning engagement.",
    },
    {
      icon: FileText,
      title: "Defend with Evidence",
      desc: "Connect data points, cite witness statements, and demonstrate your working. You are rewarded for the strength of your reasoning, not just the final number.",
    },
    {
      icon: RotateCcw,
      title: "Revise Before Final Scoring",
      desc: "Receive formative nudges that point out logical inconsistencies, giving you the opportunity to refine your hypothesis and master the concept.",
    },
  ];

  return (
    <section id="for-students" className="bg-[#FAFBF8] py-20 lg:py-28 border-b border-[#E4E9E3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold tracking-widest text-[#287A52] uppercase mb-3">
            The Student Journey
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#153D2E] mb-6">
            Assignments that challenge your curiosity, not your endurance.
          </h2>
          <p className="text-[17px] text-[#68736B] leading-relaxed">
            Move past sterile worksheets. Mystery Learning gives you a structured sandbox to explore evidence, test hypotheses, and build genuine mastery.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E4E9E3] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F3F7F1] border border-[#DCEBDD] text-[#287A52] flex items-center justify-center mb-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#153D2E] mb-3">
                    {p.title}
                  </h3>
                  <p className="text-[15px] text-[#68736B] leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Callout: The 3-Level Hint Ladder */}
        <div className="p-8 rounded-3xl bg-[#F3F7F1] border border-[#DCEBDD]">
          <h3 className="text-lg font-bold text-[#153D2E] mb-4">
            How the 3-Level Hint Ladder Works in Practice
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E4E9E3]">
              <span className="text-xs font-mono font-bold text-[#287A52] block mb-1">
                LEVEL 1: CONCEPTUAL NUDGE
              </span>
              <p className="text-xs text-[#68736B] leading-relaxed">
                "Review the relationship between reaction rate and catalyst concentration in Lecture 4, Slide 18."
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E4E9E3]">
              <span className="text-xs font-mono font-bold text-[#287A52] block mb-1">
                LEVEL 2: TARGETED CLUE
              </span>
              <p className="text-xs text-[#68736B] leading-relaxed">
                "Compare the pressure change in Chamber Valve B between T+10 and T+14. Notice the exponential jump?"
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E4E9E3]">
              <span className="text-xs font-mono font-bold text-[#287A52] block mb-1">
                LEVEL 3: EXPLICIT SCAFFOLD
              </span>
              <p className="text-xs text-[#68736B] leading-relaxed">
                "Set up the Arrhenius equation: k = A * exp(-Ea / RT). Calculate whether Ea decreased by a factor of 2."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
