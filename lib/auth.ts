"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { UserSession } from "@/lib/types";
import { redirect } from "next/navigation";

const DEMO_COOKIE_NAME = "stoku_demo_user";

/** Get the currently logged in user session (either Supabase Auth or Demo session) */
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const userSession: UserSession = {
        id: user.id,
        email: user.email ?? null,
        name:
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          user.email?.split("@")[0] ||
          "Pengguna",
        avatarUrl: (user.user_metadata?.avatar_url as string) || null,
        isDemo: false,
      };

      return userSession;
    }
  } catch (error) {
    console.error("Error reading Supabase user:", error);
  }

  // Check for guest/demo cookie session
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME);
  if (demoCookie?.value) {
    try {
      const parsed = JSON.parse(demoCookie.value) as UserSession;
      return parsed;
    } catch {
      // invalid cookie
    }
  }

  return null;
}

/** Action to start Google OAuth flow */
export async function signInWithGoogleAction(redirectTo?: string) {
  const supabase = await createClient();
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const proto =
    headerList.get("x-forwarded-proto") ||
    (host?.includes("localhost") ? "http" : "https");
  const detectedOrigin = host ? `${proto}://${host}` : null;
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || detectedOrigin || "http://localhost:3000";
  const targetRedirect = `${origin}/auth/callback?next=${encodeURIComponent(
    redirectTo || "/inventaris"
  )}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: targetRedirect,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data?.url) {
    redirect(data.url);
  }
}

/** Action to start a demo session (starts with clean empty inventory) */
export async function signInDemoAction(name?: string) {
  const cookieStore = await cookies();
  const demoId = `demo-${Date.now().toString(36)}`;
  const session: UserSession = {
    id: demoId,
    email: "demo@stoku.app",
    name: name || "Demo User",
    avatarUrl: null,
    isDemo: true,
  };

  cookieStore.set(DEMO_COOKIE_NAME, JSON.stringify(session), {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });

  redirect("/inventaris");
}

/** Sign out action */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE_NAME);

  redirect("/");
}
