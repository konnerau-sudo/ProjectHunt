import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  // Create fresh Supabase server client for this request
  const supabase = await createSupabaseServer();

  // Get authenticated user from session cookies
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Parse request body with error handling
  const { name, location, about } = await req.json().catch(() => ({}));

  if (!name || typeof name !== 'string') {
    return new NextResponse('Name required', { status: 400 });
  }

  // Upsert profile with onConflict specification
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { 
        id: user.id, 
        name: name.trim(), 
        location: location ? location.trim() : null, 
        about: about ? about.trim() : null,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id', ignoreDuplicates: false }
    );

  if (error) {
    console.error('Profile upsert error:', error);
    return new NextResponse(error.message, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
