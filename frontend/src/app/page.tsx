"use client";

import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustAndContext } from "@/components/landing/TrustAndContext";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ApproachSection } from "@/components/landing/ApproachSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { TeacherFeatures } from "@/components/landing/TeacherFeatures";
import { StudentExperience } from "@/components/landing/StudentExperience";
import { AssessmentSection } from "@/components/landing/AssessmentSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { UseCasesSection } from "@/components/landing/UseCasesSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFBF8] text-[#202722] flex flex-col">
      {/* 1. Navigation */}
      <Navbar />

      <main className="flex-grow">
        {/* 2. Hero Section (Preserved Core Identity & Geometric Graphic) */}
        <HeroSection />

        {/* 3. Trust & Product Context (Transition into Light Theme) */}
        <TrustAndContext />

        {/* 4. The Structural Problem with Traditional Assignments */}
        <ProblemSection />

        {/* 5. The Mystery Learning Approach (6-Stage Progressive Flow) */}
        <ApproachSection />

        {/* 6. How It Works (Interactive 5-Step Workflow for Teachers & Students) */}
        <HowItWorksSection />

        {/* 7. Product Showcase (Interactive Tabs: Teacher Studio, Student Solver, 100-pt Rubric) */}
        <ProductShowcase />

        {/* 8. Features for Teachers */}
        <TeacherFeatures />

        {/* 9. The Student Experience */}
        <StudentExperience />

        {/* 10. Learning Insights & 100-Point Transparent Assessment */}
        <AssessmentSection />

        {/* 11. Comparative Analysis (Traditional vs Generic AI vs Mystery Learning) */}
        <ComparisonSection />

        {/* 12. Cross-Disciplinary Use Cases */}
        <UseCasesSection />

        {/* 13. Frequently Asked Questions (Interactive Accordion) */}
        <FaqSection />

        {/* 14. Final Conversion Section (Deep Forest Green Anchor) */}
        <FinalCtaSection />
      </main>

      {/* 15. Polished Multi-Column Footer */}
      <Footer />
    </div>
  );
}
