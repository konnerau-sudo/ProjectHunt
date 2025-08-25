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
  const { title, teaser, categories, status } = await req.json().catch(() => ({}));

  if (!title || typeof title !== 'string') {
    return new NextResponse('Title required', { status: 400 });
  }

  if (!status || !['offen', 'suche_hilfe', 'biete_hilfe'].includes(status)) {
    return new NextResponse('Valid status required', { status: 400 });
  }

  if (!Array.isArray(categories)) {
    return new NextResponse('Categories must be an array', { status: 400 });
  }

  // Create project
  const { error } = await supabase
    .from('projects')
    .insert({
      owner_id: user.id,
      title: title.trim(),
      teaser: teaser ? teaser.trim() : null,
      categories: categories,
      status: status,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Project creation error:', error);
    return new NextResponse(error.message, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
