import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p_limit = Number(url.searchParams.get("limit") ?? 20);
  const p_offset = Number(url.searchParams.get("offset") ?? 0);

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { data, error } = await supabase.rpc("get_matches_for_current_user", { p_limit, p_offset });
  if (error) return NextResponse.json({ error: "DB_ERROR", detail: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [] });
}
