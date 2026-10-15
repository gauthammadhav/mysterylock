"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    institution: z.string().trim().optional().default(""),
    email: z.string().trim().email("Please provide a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid credentials provided.",
    };
  }

  const { email, password } = validation.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        success: false,
        error:
          "Account found in Supabase, but email is not confirmed. To sign in immediately: go to your Supabase Dashboard > Authentication > Users, click the '...' menu next to your email, and select 'Confirm User' (or disable 'Confirm email' under Authentication > Providers > Email).",
      };
    }
    return {
      success: false,
      error: error.message || "Failed to sign in. Please verify your credentials.",
    };
  }

  const redirectTo = (formData.get("redirectTo") as string) || "/teacher/dashboard";
  redirect(redirectTo);
}

export async function registerAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    fullName: formData.get("fullName"),
    institution: formData.get("institution"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validation = registerSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Validation error.",
    };
  }

  const { fullName, institution, email, password } = validation.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        institution: institution || "Independent Educator",
        role: "teacher",
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("rate limit")) {
      return {
        success: false,
        error:
          "Supabase email rate limit reached. Please try again later or verify your email provider settings in Supabase.",
      };
    }
    return {
      success: false,
      error: error.message || "Failed to create account. Please try again.",
    };
  }

  // If Supabase has email confirmation enabled and session is not immediately active:
  if (data.user && (!data.session || data.user.identities?.length === 0)) {
    return {
      success: true,
      message:
        "Account created! Please check your email to confirm your account before logging in.",
    };
  }

  // If email confirmation is disabled or auto-confirmed, redirect to dashboard
  redirect("/teacher/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
