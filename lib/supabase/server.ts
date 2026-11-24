import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (신규) 또는
// NEXT_PUBLIC_SUPABASE_ANON_KEY (구 명칭) 모두 지원
const resolvePublishableKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    resolvePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {}
        },
      },
    }
  );
}
