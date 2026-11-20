import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy-helper";

const ADMIN_PATHS = [
  "/media-content",
  "/dashboard",
  "/customer-participation",
  "/farm-furrow",
  "/field-journal",
  "/customer-requests",
  "/harvest-delivery",
  "/ai-draft-storybook",
  "/channel-management",
  "/settings",
  "/admin",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (!isAdminPath) {
    return NextResponse.next();
  }

  // 환경변수 미설정 → admin 경로 항상 차단 (보안 기본값: deny)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { supabaseResponse, user } = await updateSession(request);

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ADMIN_EMAILS 미설정이거나 비어있으면 Google 로그인 여부와 무관하게 거부
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (adminEmails.length === 0 || !adminEmails.includes(user.email ?? "")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return supabaseResponse;
  } catch {
    // Supabase 오류 시에도 admin 접근 차단
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|api/auth).*)",
  ],
};
