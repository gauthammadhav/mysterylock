"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Compass, Search, Sparkles } from "lucide-react";

export default function SolveIndexPage() {
  const router = useRouter();
  const [assignmentCode, setAssignmentCode] = useState("");

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = assignmentCode.trim();
    if (clean) {
      router.push(`/solve/${clean}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBF8] text-[#202722] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-[#153D2E] text-white mb-4">
            <Sparkles className="w-5 h-5 text-[#2EE6A8]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#153D2E]">
            Student Assignment Portal
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#68736B]">
            Enter the assignment link or ID provided by your teacher to access your reading comprehension investigation.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E4E9E3] p-8 shadow-xs">
          <form onSubmit={handleGo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#153D2E] mb-2">
                Assignment ID or URL
              </label>
              <input
                type="text"
                required
                value={assignmentCode}
                onChange={(e) => setAssignmentCode(e.target.value)}
                placeholder="Paste assignment ID (e.g. 4a254b42-...)"
                className="w-full px-4 py-3 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-sm text-[#202722] focus:bg-white focus:border-[#287A52] outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-[#153D2E] hover:bg-[#1C523E] transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-[#2EE6A8]" />
              <span>Open Assignment</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E4E9E3] text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-[#68736B] hover:text-[#153D2E] transition-colors"
            >
              ← Back to Mystery Learning Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
