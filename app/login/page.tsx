"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
    } catch {
      setError("로그인 중 오류가 발생했습니다. Supabase 설정을 확인해주세요.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" aria-label="꽃폈네 메인으로 이동">
            <Image
              src="/assets/brand/logo-farm-blossom.png"
              alt="꽃폈네"
              width={120}
              height={48}
              className="h-12 w-auto mx-auto rounded-lg mb-4"
            />
          </Link>
          <h1 className="text-xl font-bold text-on-surface">관리자 로그인</h1>
          <p className="text-sm text-on-surface-variant mt-1">FM 쩡이 운영자 전용</p>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 shadow-sm border border-outline-variant/30">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white border border-outline-variant/50 text-on-surface font-semibold hover:bg-surface-container-low transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? "로그인 중..." : "Google로 로그인"}
          </button>
          <p className="text-xs text-outline text-center mt-4">
            승인된 관리자 계정만 접근할 수 있습니다.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← 꽃폈네 대문으로
          </Link>
        </div>
      </div>
    </div>
  );
}
