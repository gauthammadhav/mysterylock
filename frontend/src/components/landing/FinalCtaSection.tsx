import React from "react";
import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="relative bg-[#153D2E] text-white py-20 lg:py-28 overflow-hidden">
      {/* Restrained ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#287A52]/20 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-8 rounded-full bg-[#1C523E] border border-[#349666]/40 text-[#DCEBDD] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#2EE6A8]" />
          <span>Transform Your Classroom Today</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Make every assignment an opportunity to discover.
        </h2>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#C8DBD1] leading-relaxed mb-10">
          Upload your course materials and create structured, grounded mysteries that inspire genuine student reasoning — while cutting your preparation time in half.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/assignments/create"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm sm:text-base font-semibold text-[#153D2E] bg-[#2EE6A8] hover:bg-[#3bf5b6] rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <span>Start Creating Assignments</span>
            <ArrowRight className="w-4 h-4 text-[#153D2E]" />
          </Link>

          <Link
            href="#product-showcase"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm sm:text-base font-medium text-[#DCEBDD] bg-[#1C523E] hover:bg-[#216745] border border-[#349666]/50 rounded-xl transition-all"
          >
            <Search className="w-4 h-4 text-[#2EE6A8]" />
            <span>Explore Interface Demo</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
