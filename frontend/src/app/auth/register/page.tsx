"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionResult } from "@/app/actions/auth";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail, School, ShieldAlert, User, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    registerAction,
    null
  );

  return (
    <div className="min-h-screen bg-[#FAFBF8] flex flex-col justify-center py-12 px-6 lg:px-8 selection:bg-[#DCEBDD] selection:text-[#153D2E]">
      {/* Return to Home link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#68736B] hover:text-[#153D2E] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Mystery Learning Home</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#153D2E] border border-[#287A52]/40 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#2EE6A8]">
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
            <span className="text-2xl font-bold tracking-tight text-[#153D2E] font-sans">
              mystery
            </span>
            <span className="text-2xl font-medium tracking-tight text-[#287A52] font-sans">
              learning
            </span>
          </div>
        </div>

        <h1 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-[#153D2E]">
          Create a Teacher Account
        </h1>
        <p className="mt-2 text-center text-sm text-[#68736B]">
          Start building curriculum-grounded mysteries and authentic learning assessments.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] py-8 px-6 sm:px-10 shadow-sm border border-[#E4E9E3] rounded-3xl">
          {/* Success Banner */}
          {state?.success && state?.message && (
            <div className="mb-6 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs leading-relaxed flex items-start gap-3 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#22C55E]" />
              <div>
                <p className="font-bold mb-1">Registration Complete!</p>
                <p>{state.message}</p>
                <p className="mt-2">
                  <Link href="/auth/login" className="underline font-bold text-[#153D2E]">
                    Proceed to Sign In →
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {state?.error && (
            <div className="mb-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs leading-relaxed flex items-start gap-3 animate-fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold uppercase tracking-wider text-[#153D2E] mb-1.5"
              >
                Full Name
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736B]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Prof. Evelyn Reed"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-[#202722] text-sm placeholder-[#9AA59D] focus:border-[#287A52] focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#287A52] transition-colors"
                />
              </div>
            </div>

            {/* School / Institution */}
            <div>
              <label
                htmlFor="institution"
                className="block text-xs font-semibold uppercase tracking-wider text-[#153D2E] mb-1.5"
              >
                School or Institution <span className="text-[#68736B] font-normal">(Optional)</span>
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736B]">
                  <School className="w-4 h-4" />
                </div>
                <input
                  id="institution"
                  name="institution"
                  type="text"
                  placeholder="Lincoln High School / Dept of Chemistry"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-[#202722] text-sm placeholder-[#9AA59D] focus:border-[#287A52] focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#287A52] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#153D2E] mb-1.5"
              >
                Teacher Email
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="evelyn.reed@school.edu"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-[#202722] text-sm placeholder-[#9AA59D] focus:border-[#287A52] focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#287A52] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#153D2E] mb-1.5"
              >
                Password <span className="text-[#68736B] font-normal">(Min. 8 characters)</span>
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-11 py-2.5 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-[#202722] text-sm placeholder-[#9AA59D] focus:border-[#287A52] focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#287A52] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#68736B] hover:text-[#153D2E] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-[#153D2E] mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-[#202722] text-sm placeholder-[#9AA59D] focus:border-[#287A52] focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#287A52] transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#153D2E] hover:bg-[#1C523E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#287A52] shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#2EE6A8]" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register as Teacher</span>
                )}
              </button>
            </div>
          </form>

          {/* Sign In link */}
          <div className="mt-8 pt-6 border-t border-[#E4E9E3] text-center">
            <p className="text-xs text-[#68736B]">
              Already registered?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-[#287A52] hover:text-[#153D2E] transition-colors"
              >
                Sign In to Teacher Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
