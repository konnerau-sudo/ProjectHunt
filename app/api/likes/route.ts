import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? 20);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  const { data, error } = await supabase
    .from("swipes")
    .select(`
      project_id,
      created_at,
      projects (
        id,
        title,
        teaser,
        categories,
        status,
        owner_id,
        profiles!projects_owner_id_fkey (
          id,
          name
        )
      )
    `)
    .eq("swiper_id", user.id)
    .eq("direction", "like")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: "DB_ERROR", detail: error.message }, { status: 500 });

  // Transform data to match expected format
  const items = data?.map(item => ({
    id: item.projects[0]?.id,
    title: item.projects[0]?.title,
    teaser: item.projects[0]?.teaser,
    categories: item.projects[0]?.categories,
    status: item.projects[0]?.status,
    owner_id: item.projects[0]?.owner_id,
    owner: {
      name: item.projects[0]?.profiles?.[0]?.name || 'Unbekannt'
    },
    liked_at: item.created_at
  })).filter(item => item.id) || [];

  return NextResponse.json({ items });
}
