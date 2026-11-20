import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase 환경변수가 없으면 보호 없이 통과 (로컬 개발 편의)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.next();
  }

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (!isAdminPath) {
    return NextResponse.next();
  }

  try {
    const { supabaseResponse, user } = await updateSession(request);

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 관리자 이메일 체크
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (adminEmails.length > 0 && !adminEmails.includes(user.email ?? "")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return supabaseResponse;
  } catch {
    // Supabase 오류 시 통과 (환경변수 미설정 등)
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|api/auth).*)",
  ],
};
