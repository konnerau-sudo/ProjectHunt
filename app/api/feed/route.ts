import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createSupabaseServer();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? 20);

  const { data, error } = await supabase.rpc("projects_not_swiped_by_user", {
    p_user_id: user.id,
    p_limit: limit,
  });
  if (error) {
    return NextResponse.json({ error: "DB_ERROR", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

