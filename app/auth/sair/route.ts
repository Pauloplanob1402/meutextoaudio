import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { forbidden, sameOrigin } from "@/lib/origin";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), 303);
}
