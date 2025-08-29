import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { projectId, direction } = await req.json().catch(() => ({}));
  if (!projectId || !["like","skip"].includes(direction)) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { error } = await supabase
    .from("swipes")
    .upsert([{ swiper_id: user.id, project_id: projectId, direction }], { onConflict: "swiper_id,project_id" });

  if (error?.code === "23505") return NextResponse.json({ error: "ALREADY_SWIPED" }, { status: 409 });
  if (error) return NextResponse.json({ error: "DB_ERROR", detail: error.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function GET(request: Request) {
  try {
    // Authentifizierung prüfen
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Heutige Swipe-Statistiken abrufen
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count: todaySwipeCount, error: countError } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true })
      .eq('swiper_id', user.id)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    if (countError) {
      console.error('Error getting swipe stats:', countError);
      return NextResponse.json({ 
        error: 'Failed to get swipe statistics' 
      }, { status: 500 });
    }

    const MAX_DAILY_SWIPES = 10;
    
    return NextResponse.json({
      todaySwipes: todaySwipeCount || 0,
      maxDailySwipes: MAX_DAILY_SWIPES,
      remainingSwipes: Math.max(0, MAX_DAILY_SWIPES - (todaySwipeCount || 0)),
      limitReached: (todaySwipeCount || 0) >= MAX_DAILY_SWIPES
    });

  } catch (error: any) {
    console.error('Swipe stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

