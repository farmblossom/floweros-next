import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center">
      <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">lock</span>
      <h1 className="text-xl font-bold text-on-surface mb-2">접근 권한이 없습니다</h1>
      <p className="text-sm text-on-surface-variant mb-6 max-w-xs">
        이 페이지는 승인된 관리자만 접근할 수 있습니다.<br />
        FM 쩡이 운영자 계정으로 로그인해주세요.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm"
        >
          다시 로그인
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold text-sm"
        >
          꽃폈네 대문으로
        </Link>
      </div>
    </div>
  );
}
