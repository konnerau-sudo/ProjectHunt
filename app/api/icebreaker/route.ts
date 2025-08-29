import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const { recipientId, icebreakerText } = await req.json().catch(() => ({}));
  if (!recipientId || !icebreakerText?.trim()) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { data: matchId, error } = await supabase.rpc("ensure_match_and_send_message", {
    p_other_user: recipientId,
    p_text: icebreakerText.trim(),
  });

  if (error) return NextResponse.json({ error: "DB_ERROR", detail: error.message }, { status: 500 });

  return NextResponse.json({ conversationId: matchId }, { status: 201 });
}
