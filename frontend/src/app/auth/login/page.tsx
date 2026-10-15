"use client";

import React, { useActionState, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction, type AuthActionResult } from "@/app/actions/auth";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldAlert, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/teacher/dashboard";
  const isUnconfigured = searchParams.get("unconfigured") === "true";
  const queryError = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    loginAction,
    null
  );

  return (
    <div className="bg-[#FFFFFF] py-8 px-6 sm:px-10 shadow-sm border border-[#E4E9E3] rounded-3xl">
      {/* Unconfigured Notice */}
      {isUnconfigured && (
        <div className="mb-6 p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs leading-relaxed flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
          <div>
            <span className="font-bold">Supabase setup required:</span> Add your{" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in{" "}
            <code>frontend/.env.local</code> to authenticate.
          </div>
        </div>
      )}

      {/* Verification link error notice */}
      {queryError && (
        <div className="mb-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs leading-relaxed flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>The confirmation link was invalid or has expired. Please sign in or request a new link.</div>
        </div>
      )}

      {/* Action error banner */}
      {state?.error && (
        <div className="mb-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs leading-relaxed flex items-start gap-3 animate-fade-in">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-[#153D2E] mb-2"
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
              placeholder="teacher@school.edu"
              className="block w-full pl-10 pr-4 py-3 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-[#202722] text-sm placeholder-[#9AA59D] focus:border-[#287A52] focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#287A52] transition-colors"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-[#153D2E]"
            >
              Password
            </label>
          </div>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736B]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              className="block w-full pl-10 pr-11 py-3 rounded-xl border border-[#E4E9E3] bg-[#FAFBF8] text-[#202722] text-sm placeholder-[#9AA59D] focus:border-[#287A52] focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#287A52] transition-colors"
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

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#153D2E] hover:bg-[#1C523E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#287A52] shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#2EE6A8]" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In as Teacher</span>
            )}
          </button>
        </div>
      </form>

      {/* Registration link */}
      <div className="mt-8 pt-6 border-t border-[#E4E9E3] text-center">
        <p className="text-xs text-[#68736B]">
          New to Mystery Learning?{" "}
          <Link
            href="/auth/register"
            className="font-bold text-[#287A52] hover:text-[#153D2E] transition-colors"
          >
            Create a Teacher Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFBF8] flex flex-col justify-center py-12 px-6 lg:px-8 selection:bg-[#DCEBDD] selection:text-[#153D2E]">
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
          Teacher Portal Sign In
        </h1>
        <p className="mt-2 text-center text-sm text-[#68736B]">
          Sign in to access your classes, assignment drafts, and student investigations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense
          fallback={
            <div className="bg-[#FFFFFF] py-12 px-6 text-center rounded-3xl border border-[#E4E9E3]">
              <Loader2 className="w-6 h-6 animate-spin text-[#287A52] mx-auto mb-2" />
              <p className="text-xs text-[#68736B]">Loading sign-in form...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
