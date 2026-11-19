import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";
import { browserCookieOptions } from "./cookies";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY, { cookieOptions: browserCookieOptions });
}
