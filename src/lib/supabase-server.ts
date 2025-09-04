import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (App Router).
 * Works with Next versions where cookies() is async.
 */
export async function supabaseServer(): Promise<SupabaseClient> {
  // In some Next versions cookies() is Promise<ReadonlyRequestCookies>
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Write/overwrite response cookie
          store.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // Clear cookie by setting empty value
          store.set({ name, value: "", ...options });
        },
      },
      // Optional, recommended in ssr helpers
      cookieEncoding: "base64url",
      cookieOptions: { name: "sb" },
    }
  );
}
