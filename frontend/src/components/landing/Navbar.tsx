"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#153D2E] border-b border-[#245844] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Brand Mark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#1C523E] border border-[#349666]/40 flex items-center justify-center shadow-sm group-hover:border-[#2EE6A8]/60 transition-colors">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              className="w-5 h-5 text-[#2EE6A8] transform group-hover:scale-105 transition-transform"
            >
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
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              mystery
            </span>
            <span className="text-xl font-medium tracking-tight text-[#2EE6A8] font-sans">
              learning
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2EE6A8] ml-1 mb-1" />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-[#C8DBD1]">
          <Link href="#product-showcase" className="hover:text-white transition-colors py-1">
            Product
          </Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors py-1">
            How It Works
          </Link>
          <Link href="#for-teachers" className="hover:text-white transition-colors py-1">
            For Teachers
          </Link>
          <Link href="#for-students" className="hover:text-white transition-colors py-1">
            For Students
          </Link>
          <Link href="#assessment" className="hover:text-white transition-colors py-1">
            Assessment
          </Link>
          <Link href="#faq" className="hover:text-white transition-colors py-1">
            FAQ
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-[14px] font-medium text-[#DCEBDD] hover:text-white px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/assignments/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-[#153D2E] bg-[#2EE6A8] hover:bg-[#3bf5b6] rounded-lg transition-all shadow-sm active:scale-95"
          >
            <span>Start Creating</span>
            <ArrowRight className="w-4 h-4 text-[#153D2E]" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#C8DBD1] hover:text-white hover:bg-[#1C523E] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F2D22] border-b border-[#245844] px-6 py-6 animate-fade-in">
          <nav className="flex flex-col gap-4 text-[15px] font-medium text-[#C8DBD1] mb-6">
            <Link
              href="#product-showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Product
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              How It Works
            </Link>
            <Link
              href="#for-teachers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              For Teachers
            </Link>
            <Link
              href="#for-students"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              For Students
            </Link>
            <Link
              href="#assessment"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Assessment & Rubrics
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Frequently Asked Questions
            </Link>
          </nav>
          <div className="pt-4 border-t border-[#245844] flex flex-col gap-3">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 text-[14px] font-medium text-[#DCEBDD] hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/assignments/create"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-3 text-[14px] font-semibold text-[#153D2E] bg-[#2EE6A8] hover:bg-[#3bf5b6] rounded-lg transition-all"
            >
              Start Creating Assignments
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
