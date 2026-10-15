"use client";

import React from "react";
import Link from "next/link";
import { GeometricBeamGraphic } from "@/components/GeometricBeamGraphic";
import { ArrowRight, Search, FileText, ShieldCheck, Compass, GraduationCap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-[#153D2E] text-white overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#245844]">
      {/* Ambient background glows tailored to forest palette */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#1C523E]/50 via-[#153D2E]/20 to-transparent blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-[40%] right-[-100px] w-[450px] h-[450px] bg-[#2EE6A8]/5 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-[50%] left-[-100px] w-[450px] h-[450px] bg-[#C084FC]/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Big Editorial Headline */}
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-[#1C523E] border border-[#349666]/40 text-[#DCEBDD] text-[12px] font-medium tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2EE6A8]" />
              Authentic Pedagogical Assessment
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-[5.4rem] xl:text-[6.2rem] font-bold text-white tracking-[-0.035em] leading-[1.02] mb-8 select-none">
              <span className="block">Make answer-</span>
              <span className="block">copying</span>
              <span className="block">
                irrelevant{" "}
                <span className="font-serif-italic italic font-normal text-[#E8F5EB]">
                  for
                </span>
              </span>
              <span className="block font-serif-italic italic font-normal text-[#E8F5EB] text-[0.98em]">
                genuine learning
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl text-[16px] sm:text-[18px] text-[#C8DBD1] font-normal leading-relaxed mb-10">
              Turn assignments into discoveries. Teachers upload course materials; Mystery Learning generates curriculum-grounded case files, interactive clue ladders, and 100-point transparent rubrics — rewarding reasoned deductions over fluent copied answers.
            </p>

            {/* Hero CTA Action Group */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/assignments/create"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-[15px] font-semibold text-[#153D2E] bg-[#2EE6A8] hover:bg-[#3bf5b6] rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <span>Start Creating Assignments</span>
                <ArrowRight className="w-4 h-4 text-[#153D2E]" />
              </Link>

              <Link
                href="#product-showcase"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-[15px] font-medium text-[#DCEBDD] bg-[#1C523E]/80 hover:bg-[#1C523E] border border-[#349666]/50 rounded-xl transition-all transform hover:-translate-y-0.5"
              >
                <Search className="w-4 h-4 text-[#2EE6A8]" />
                <span>Explore Sample Mystery</span>
              </Link>
            </div>
          </div>

          {/* Right Column: 3D Aerodynamic Neon Beam & Particle Stream */}
          <div className="lg:col-span-4 relative flex items-center justify-center lg:justify-end mt-4 lg:mt-0">
            <GeometricBeamGraphic />
          </div>
        </div>

        {/* 4 Proof Points / Core Pillar Strip */}
        <div className="mt-16 pt-10 border-t border-[#245844] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[#2EE6A8] text-xs font-semibold tracking-wider uppercase mb-1">
              <FileText className="w-4 h-4" />
              <span>Syllabus Grounded</span>
            </div>
            <p className="text-sm text-[#A9C4B7]">
              RAG extraction directly from teacher PDFs with page-level citations.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[#2EE6A8] text-xs font-semibold tracking-wider uppercase mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Copy-Proof Design</span>
            </div>
            <p className="text-sm text-[#A9C4B7]">
              Safe variation of characters & numbers while keeping core objectives invariant.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[#2EE6A8] text-xs font-semibold tracking-wider uppercase mb-1">
              <Compass className="w-4 h-4" />
              <span>3-Level Hint Ladders</span>
            </div>
            <p className="text-sm text-[#A9C4B7]">
              Scaffolded nudges without penalties or automated misconduct claims.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[#2EE6A8] text-xs font-semibold tracking-wider uppercase mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>100-Point Rubric</span>
            </div>
            <p className="text-sm text-[#A9C4B7]">
              Transparent scoring: 90 core curriculum points + 10 conceptual extension points.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
