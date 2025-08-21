import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServer();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, teaser, categories, status } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' }, 
        { status: 400 }
      );
    }

    if (!status || !['offen', 'suche_hilfe', 'biete_hilfe'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' }, 
        { status: 400 }
      );
    }

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Categories must be an array' }, 
        { status: 400 }
      );
    }

    // Create project
    const { error: projectError } = await supabase
      .from('projects')
      .insert({
        owner_id: user.id,
        title: title.trim(),
        teaser: teaser ? teaser.trim() : null,
        categories: categories,
        status: status,
        created_at: new Date().toISOString()
      });

    if (projectError) {
      console.error('Project creation error:', projectError);
      return NextResponse.json(
        { error: 'Failed to create project' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Project created successfully' 
    });

  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
