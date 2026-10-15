import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0F2D22] text-[#A9C4B7] border-t border-[#1C523E] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-[#1C523E] border border-[#349666]/50 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#2EE6A8]">
                  <path 
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="#2EE6A8" />
                </svg>
              </div>
              <div className="flex items-baseline">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  mystery
                </span>
                <span className="text-lg font-medium tracking-tight text-[#2EE6A8] font-sans">
                  learning
                </span>
              </div>
            </Link>
            <p className="text-sm text-[#8DAEA0] max-w-sm leading-relaxed mb-6">
              Transforming syllabus-aligned coursework into structured, story-driven investigations that reward defensible reasoning over copied answers.
            </p>
            <div className="text-xs text-[#6B8E80]">
              Built for teaching. Designed for authentic understanding.
            </div>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="#product-showcase" className="hover:text-white transition-colors">
                  Product Overview
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#assessment" className="hover:text-white transition-colors">
                  100-Point Rubric
                </Link>
              </li>
              <li>
                <Link href="/assignments/create" className="hover:text-white transition-colors">
                  Assignment Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Educators */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              For Educators
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="#for-teachers" className="hover:text-white transition-colors">
                  Course Material Ingestion
                </Link>
              </li>
              <li>
                <Link href="#for-teachers" className="hover:text-white transition-colors">
                  Safe Parametric Equivalence
                </Link>
              </li>
              <li>
                <Link href="#assessment" className="hover:text-white transition-colors">
                  Misconception Heatmaps
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-white transition-colors">
                  Teacher Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Students & Architecture */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Architecture & Help
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="#for-students" className="hover:text-white transition-colors">
                  Student Case Files
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-white transition-colors">
                  FAQ & Documentation
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright strip */}
        <div className="pt-8 border-t border-[#1C523E] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B8E80]">
          <div>
            &copy; 2026 Mystery Learning Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>RAG Grounded</span>
            <span>•</span>
            <span>pgvector Persistence</span>
            <span>•</span>
            <span>Explainable Rubrics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
