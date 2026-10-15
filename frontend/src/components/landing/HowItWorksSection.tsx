"use client";

import React, { useState } from "react";
import { Upload, Sparkles, CheckCircle2, Search, BarChart3, ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: "01",
      title: "Upload Learning Materials",
      role: "Teacher Action",
      headline: "Ingest Syllabi, Notes, or Chapters",
      description:
        "Teachers upload lecture slides, PDF readings, syllabi, or textbook chapters. Mystery Learning securely parses the text, extracts key concepts, and generates semantic vector embeddings.",
      tags: ["PDF, DOCX, TXT", "PyMuPDF Extraction", "pgvector Embedding"],
      details: "Upload raw course handouts with zero manual reformatting. Page numbers and citations are automatically indexed.",
    },
    {
      step: "02",
      title: "Generate Assignment Blueprint",
      role: "AI Generation",
      headline: "Transform Materials into Mystery Checkpoints",
      description:
        "Our RAG pipeline constructs an investigative storyline, evidence cards, distractor clues, and progressive challenges grounded exclusively in your uploaded source passages.",
      tags: ["Grounded RAG", "Syllabus Aligned", "Parametric Equivalence"],
      details: "The engine defines invariant learning objectives while creating varied student variants to eliminate direct answer copying.",
    },
    {
      step: "03",
      title: "Review, Edit & Publish",
      role: "Teacher Approval",
      headline: "Maintain Complete Instructional Authority",
      description:
        "Inspect the canonical solution, adjust question wording, tweak rubric point distributions, preview sample student variants, and publish when satisfied.",
      tags: ["100-Point Rubric", "Full Editability", "One-Click Publish"],
      details: "You remain in total control. No AI-generated question is ever released without explicit teacher review and approval.",
    },
    {
      step: "04",
      title: "Students Investigate",
      role: "Student Experience",
      headline: "Explore Evidence & Defend Deductions",
      description:
        "Students access their personalized case file. They examine clues, calculate parameters, cite evidence cards, and request multi-level hints if stuck.",
      tags: ["Interactive Evidence", "3-Level Hint Ladder", "Safe Revision"],
      details: "Curiosity is encouraged. Hint requests are logged as active engagement rather than penalized with grade deductions.",
    },
    {
      step: "05",
      title: "Understand Progress",
      role: "Analytics & Feedback",
      headline: "Inspect Reasoning & Address Misconceptions",
      description:
        "Review rubric-scored submissions with cited evidence passages. Inspect class-wide misconception heatmaps and concept-level mastery predictions to guide tomorrow's lecture.",
      tags: ["Objective Heatmaps", "Evidence Citations", "Gradebook Export"],
      details: "Identify exactly which students grasped the core principles and who needs support before exam week.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-[#FFFFFF] py-20 lg:py-28 border-b border-[#E4E9E3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold tracking-widest text-[#287A52] uppercase mb-3">
            Workflow Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#153D2E] mb-6">
            From raw course materials to active investigation in five steps.
          </h2>
          <p className="text-[17px] text-[#68736B] leading-relaxed">
            Mystery Learning bridges course design and student problem-solving into a cohesive, accountable feedback loop.
          </p>
        </div>

        {/* Step Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-xl text-left border transition-all ${
                activeStep === idx
                  ? "bg-[#153D2E] text-white border-[#153D2E] shadow-sm"
                  : "bg-[#FAFBF8] text-[#202722] border-[#E4E9E3] hover:border-[#287A52]/40"
              }`}
            >
              <div
                className={`text-xs font-mono font-bold mb-1 ${
                  activeStep === idx ? "text-[#2EE6A8]" : "text-[#287A52]"
                }`}
              >
                STEP {s.step}
              </div>
              <div className="text-sm font-semibold truncate">{s.title}</div>
            </button>
          ))}
        </div>

        {/* Active Step Showcase Card */}
        <div className="p-8 lg:p-12 rounded-3xl bg-[#F3F7F1] border border-[#DCEBDD] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#DCEBDD] text-xs font-semibold text-[#287A52] uppercase tracking-wider mb-4">
              <span>{steps[activeStep].role}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#153D2E] mb-4">
              {steps[activeStep].headline}
            </h3>
            <p className="text-[16px] text-[#68736B] leading-relaxed mb-6">
              {steps[activeStep].description}
            </p>
            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E4E9E3] text-sm text-[#202722] mb-6">
              <span className="font-semibold text-[#153D2E]">Practical Benefit: </span>
              {steps[activeStep].details}
            </div>
            <div className="flex flex-wrap gap-2">
              {steps[activeStep].tags.map((t, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs font-medium bg-[#FFFFFF] text-[#287A52] rounded-lg border border-[#DCEBDD]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#FFFFFF] border border-[#DCEBDD] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E9E3] mb-4">
              <span className="text-xs font-mono text-[#68736B]">SYSTEM LOG #STEP-{steps[activeStep].step}</span>
              <span className="w-2 h-2 rounded-full bg-[#287A52]" />
            </div>
            <div className="space-y-3 text-xs font-mono text-[#202722]">
              <div className="p-2.5 rounded bg-[#FAFBF8] border border-[#E4E9E3]">
                <span className="text-[#287A52] font-bold">STAGE:</span> {steps[activeStep].title}
              </div>
              <div className="p-2.5 rounded bg-[#FAFBF8] border border-[#E4E9E3]">
                <span className="text-[#287A52] font-bold">ACTOR:</span> {steps[activeStep].role}
              </div>
              <div className="p-2.5 rounded bg-[#FAFBF8] border border-[#E4E9E3]">
                <span className="text-[#287A52] font-bold">STATE:</span> Verified & Ready for Execution
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
