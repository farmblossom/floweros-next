import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppShell from "./_components/AppShell";

// Server Component — 페이지 렌더 전에 서버 인증 검사를 수행합니다.
// proxy.ts(엣지)와 이중 보호: proxy가 실패해도 여기서 차단됩니다.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // 환경변수 미설정 → 항상 거부 (보안 기본값: deny)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    redirect("/login");
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    // ADMIN_EMAILS 비어있거나 목록에 없으면 Google 로그인 여부와 무관하게 거부
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (adminEmails.length === 0 || !adminEmails.includes(user.email ?? "")) {
      redirect("/unauthorized");
    }
  } catch {
    // Supabase 오류 시에도 admin 접근 차단
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
