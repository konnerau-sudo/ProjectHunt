import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  return NextResponse.json({
    hasUser: !!user,
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    error: error?.message ?? null,
    timestamp: new Date().toISOString(),
  });
}
