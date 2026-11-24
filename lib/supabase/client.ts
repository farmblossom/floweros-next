import { createBrowserClient } from "@supabase/ssr";

// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (신규) 또는
// NEXT_PUBLIC_SUPABASE_ANON_KEY (구 명칭) 모두 지원
const resolvePublishableKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = resolvePublishableKey();
  if (!url || !key) {
    throw new Error(
      "Supabase 환경변수가 설정되지 않았습니다.\n" +
      ".env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 " +
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY(또는 NEXT_PUBLIC_SUPABASE_ANON_KEY)를 설정해 주세요."
    );
  }
  return createBrowserClient(url, key);
}
