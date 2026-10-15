"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  Award, 
  HelpCircle, 
  Sliders, 
  ChevronRight, 
  Eye, 
  Layers, 
  Clock,
  Sparkles,
  ShieldCheck
} from "lucide-react";

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<"teacher" | "student" | "rubric">("teacher");

  return (
    <section id="product-showcase" className="bg-[#FAFBF8] py-20 lg:py-28 border-b border-[#E4E9E3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-semibold tracking-widest text-[#287A52] uppercase mb-3">
            Interface Experience
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#153D2E] mb-6">
            A cohesive platform for teaching and investigation.
          </h2>
          <p className="text-[17px] text-[#68736B] leading-relaxed">
            Explore the authentic interfaces designed for instructors authoring assignments and students solving them.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveTab("teacher")}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === "teacher"
                ? "bg-[#153D2E] text-white shadow-sm"
                : "bg-[#FFFFFF] text-[#68736B] border border-[#E4E9E3] hover:text-[#153D2E]"
            }`}
          >
            <Sliders className="w-4 h-4 text-[#287A52]" />
            <span>Teacher Assignment Studio</span>
          </button>

          <button
            onClick={() => setActiveTab("student")}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === "student"
                ? "bg-[#153D2E] text-white shadow-sm"
                : "bg-[#FFFFFF] text-[#68736B] border border-[#E4E9E3] hover:text-[#153D2E]"
            }`}
          >
            <Search className="w-4 h-4 text-[#287A52]" />
            <span>Student Investigation Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab("rubric")}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === "rubric"
                ? "bg-[#153D2E] text-white shadow-sm"
                : "bg-[#FFFFFF] text-[#68736B] border border-[#E4E9E3] hover:text-[#153D2E]"
            }`}
          >
            <Award className="w-4 h-4 text-[#287A52]" />
            <span>100-Point Transparent Rubric & Analytics</span>
          </button>
        </div>

        {/* TAB 1: Teacher Assignment Studio */}
        {activeTab === "teacher" && (
          <div className="rounded-3xl bg-[#FFFFFF] border border-[#DCEBDD] shadow-sm overflow-hidden p-6 lg:p-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E4E9E3] gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#287A52] uppercase tracking-wider mb-1">
                  <span>BLUEPRINT REVIEWER</span>
                  <span>•</span>
                  <span>ASSIGNMENT ID: #CHEM-4091</span>
                </div>
                <h3 className="text-xl font-bold text-[#153D2E]">
                  Case Blueprint: The Anomaly at Cryo-Station 7
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-[#F3F7F1] text-[#287A52] border border-[#DCEBDD] px-3 py-1.5 rounded-lg font-medium">
                  Status: Ready for Approval
                </span>
                <button className="px-4 py-2 bg-[#153D2E] text-white text-xs font-semibold rounded-lg hover:bg-[#1C523E] transition-colors">
                  Publish to Class
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Learning Objectives & Source Passages */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3]">
                  <h4 className="text-xs font-bold text-[#153D2E] uppercase mb-2">
                    Extracted Learning Objectives
                  </h4>
                  <ul className="space-y-2 text-xs text-[#68736B]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#287A52] shrink-0 mt-0.5" />
                      <span>LO-1: Distinguish zero, first, and second-order chemical reaction kinetics.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#287A52] shrink-0 mt-0.5" />
                      <span>LO-2: Analyze Arrhenius equation temperature vs activation energy shifts.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#287A52] shrink-0 mt-0.5" />
                      <span>LO-3: Formulate defensible causal explanations supported by pressure logs.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3]">
                  <h4 className="text-xs font-bold text-[#153D2E] uppercase mb-2">
                    Source Material Grounding
                  </h4>
                  <p className="text-xs text-[#68736B] leading-relaxed">
                    Source: <span className="font-semibold text-[#153D2E]">Unit_4_Kinetics_Lecture_Slides.pdf</span> (Pages 14–22).
                    All candidate clues and numbers are grounded in the uploaded syllabus.
                  </p>
                </div>
              </div>

              {/* Right Column: Checkpoint & Variant Matrix */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 rounded-2xl bg-[#F3F7F1] border border-[#DCEBDD]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#153D2E]">STAGE 1 CHECKPOINT</span>
                    <span className="text-xs text-[#287A52] font-semibold">Weight: 30 Points</span>
                  </div>
                  <p className="text-sm text-[#202722] font-medium mb-3">
                    "Identify which pressure log metric contradicts the assumption of a standard first-order decomposition."
                  </p>
                  <div className="text-xs text-[#68736B] bg-[#FFFFFF] p-3 rounded-xl border border-[#E4E9E3]">
                    <span className="font-semibold text-[#153D2E]">Canonical Guide: </span>
                    Pressure doubles with quadrupled catalyst concentration, revealing pseudo-second-order mechanism.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#153D2E]">Safe Variation Engine: </span>
                    <span className="text-[#68736B]">32 unique student variants generated with randomized catalyst batch IDs and numerical pressure offsets.</span>
                  </div>
                  <span className="text-[#287A52] font-bold shrink-0 ml-4">Equivalent Difficulty ✓</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Student Investigation Workspace */}
        {activeTab === "student" && (
          <div className="rounded-3xl bg-[#FFFFFF] border border-[#DCEBDD] shadow-sm overflow-hidden p-6 lg:p-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E4E9E3] gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#287A52] uppercase tracking-wider mb-1">
                  <span>STUDENT CASE FILE</span>
                  <span>•</span>
                  <span>TIME REMAINING: 28 MIN</span>
                </div>
                <h3 className="text-xl font-bold text-[#153D2E]">
                  Case #ML-4091: The Anomaly at Cryo-Station 7
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-3.5 py-1.5 bg-[#FAFBF8] border border-[#E4E9E3] text-[#287A52] text-xs font-medium rounded-lg flex items-center gap-1.5 hover:bg-[#F3F7F1]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Request Hint (Level 1)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Evidence Deck */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="text-xs font-bold text-[#153D2E] uppercase">
                  Available Evidence Cards
                </h4>
                <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#287A52]/30 text-xs">
                  <div className="flex items-center justify-between font-bold text-[#153D2E] mb-1">
                    <span>Evidence Card #A: Chamber Pressure Log</span>
                    <span className="text-[10px] text-[#287A52] bg-[#DCEBDD] px-1.5 py-0.5 rounded">Selected</span>
                  </div>
                  <p className="text-[#68736B]">Recorded pressure spiked from 1.2 atm to 4.8 atm at T+14 min when Chamber Valve B was released.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3] text-xs">
                  <div className="flex items-center justify-between font-bold text-[#153D2E] mb-1">
                    <span>Evidence Card #B: Gas Chromatography</span>
                    <span className="text-[10px] text-[#68736B]">Click to inspect</span>
                  </div>
                  <p className="text-[#68736B]">Peak retention time indicates pure Argon carrier with trace hydrocarbon contaminants.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3] text-xs">
                  <div className="flex items-center justify-between font-bold text-[#153D2E] mb-1">
                    <span>Evidence Card #C: Technician Shift Log</span>
                    <span className="text-[10px] text-[#68736B]">Click to inspect</span>
                  </div>
                  <p className="text-[#68736B]">Shift report notes uncalibrated digital thermocouple during 02:00 batch cycle.</p>
                </div>
              </div>

              {/* Student Deduction Form */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-[#153D2E] uppercase">
                  Your Hypothesis & Evidence Defense
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#202722] mb-1.5">
                      1. State your proposed root cause:
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Thermal runaway caused by catalytic contamination in Valve B."
                      className="w-full text-xs p-3 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3] text-[#153D2E] font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#202722] mb-1.5">
                      2. Support your reasoning citing the evidence cards:
                    </label>
                    <textarea
                      readOnly
                      rows={4}
                      value="Evidence Card A shows an immediate fourfold pressure surge rather than the gradual slope expected in first-order decomposition. Cross-referencing with Evidence Card B indicates trace hydrocarbon contaminants which lowered the activation energy barrier according to the Arrhenius relation taught in Lecture 4."
                      className="w-full text-xs p-3 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3] text-[#153D2E] leading-relaxed resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button className="px-5 py-2.5 bg-[#287A52] text-white text-xs font-semibold rounded-lg hover:bg-[#216745] transition-colors">
                    Submit Stage 1 Checkpoint
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 100-Point Rubric & Feedback */}
        {activeTab === "rubric" && (
          <div className="rounded-3xl bg-[#FFFFFF] border border-[#DCEBDD] shadow-sm overflow-hidden p-6 lg:p-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E4E9E3] gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#287A52] uppercase tracking-wider mb-1">
                  <span>EVALUATION REPORT</span>
                  <span>•</span>
                  <span>STUDENT: ALEX M.</span>
                </div>
                <h3 className="text-xl font-bold text-[#153D2E]">
                  Transparent Scoring: 94 / 100 Total Points
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#DCEBDD] text-[#153D2E] font-bold px-3 py-1.5 rounded-lg">
                  Teacher Verified ✓
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Criterion 1 */}
              <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#153D2E]">Conceptual Accuracy</span>
                  <span className="text-xs font-bold text-[#287A52]">28 / 30 pts</span>
                </div>
                <p className="text-xs text-[#68736B] leading-relaxed">
                  Correctly identified non-linear kinetics and applied the Arrhenius equation to the temperature-pressure relationship.
                </p>
              </div>

              {/* Criterion 2 */}
              <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#153D2E]">Reasoning & Working</span>
                  <span className="text-xs font-bold text-[#287A52]">24 / 25 pts</span>
                </div>
                <p className="text-xs text-[#68736B] leading-relaxed">
                  Logical multi-step deduction connecting valve release to activation energy reduction. Clear causal steps demonstrated.
                </p>
              </div>

              {/* Criterion 3 */}
              <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#153D2E]">Evidence Use</span>
                  <span className="text-xs font-bold text-[#287A52]">15 / 15 pts</span>
                </div>
                <p className="text-xs text-[#68736B] leading-relaxed">
                  Explicitly cited Evidence Cards A and B to validate the claim. Distinguished primary data from distractors.
                </p>
              </div>

              {/* Criterion 4 */}
              <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#153D2E]">Application</span>
                  <span className="text-xs font-bold text-[#287A52]">10 / 10 pts</span>
                </div>
                <p className="text-xs text-[#68736B] leading-relaxed">
                  Applied lecture principles directly to the scenario parameters without generic abstract repetition.
                </p>
              </div>

              {/* Criterion 5 */}
              <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#153D2E]">Communication</span>
                  <span className="text-xs font-bold text-[#287A52]">9 / 10 pts</span>
                </div>
                <p className="text-xs text-[#68736B] leading-relaxed">
                  Clear, coherent scientific phrasing enabling full transparency into the student's thought process.
                </p>
              </div>

              {/* Extension */}
              <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E4E9E3]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#153D2E]">Conceptual Extension</span>
                  <span className="text-xs font-bold text-[#287A52]">8 / 10 pts</span>
                </div>
                <p className="text-xs text-[#68736B] leading-relaxed">
                  Proposed valid preventative purge protocol for Cryo-Station 7 based on kinetics findings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
