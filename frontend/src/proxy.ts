import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseUrl, getSupabasePublishableKey, isSupabaseConfigured } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();

  // If Supabase is not configured yet, allow public access but intercept /teacher to show guide
  if (!isSupabaseConfigured()) {
    if (request.nextUrl.pathname.startsWith("/teacher")) {
      const redirectUrl = new URL("/auth/login?unconfigured=true", request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const isTeacherRoute = request.nextUrl.pathname.startsWith("/teacher");
  const isAuthRoute =
    request.nextUrl.pathname === "/auth/login" ||
    request.nextUrl.pathname === "/auth/register";

  // If not teacher or auth route, return response immediately without network overhead
  if (!isTeacherRoute && !isAuthRoute) {
    return response;
  }

  // Refresh auth session only when needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection: /teacher/* requires authentication
  if (isTeacherRoute && !user) {
    const redirectUrl = new URL(
      `/auth/login?redirect=${encodeURIComponent(request.nextUrl.pathname)}`,
      request.url
    );
    return NextResponse.redirect(redirectUrl);
  }

  // If user is already logged in and navigates to login/register, send to dashboard
  if (isAuthRoute && user) {
    const dashboardUrl = new URL("/teacher/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
