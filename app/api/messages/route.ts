import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const body = await req.json();
    const { matchId, content } = body;

    // Validierung
    if (!matchId || !content) {
      return NextResponse.json({ 
        error: "INVALID_DATA", 
        message: "matchId und content sind erforderlich" 
      }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ 
        error: "INVALID_DATA", 
        message: "Nachricht darf nicht leer sein" 
      }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ 
        error: "INVALID_DATA", 
        message: "Nachricht ist zu lang (max. 1000 Zeichen)" 
      }, { status: 400 });
    }

    // Prüfe ob der User berechtigt ist, in diesem Match zu schreiben
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id, user_a_id, user_b_id")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ 
        error: "MATCH_NOT_FOUND", 
        message: "Match nicht gefunden" 
      }, { status: 404 });
    }

    // Prüfe ob der User Teil des Matches ist
    if (match.user_a_id !== user.id && match.user_b_id !== user.id) {
      return NextResponse.json({ 
        error: "UNAUTHORIZED", 
        message: "Keine Berechtigung für dieses Match" 
      }, { status: 403 });
    }

    // Nachricht in die Datenbank einfügen
    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        match_id: matchId,
        sender_id: user.id,
        content: content.trim()
      })
      .select(`
        id,
        match_id,
        sender_id,
        content,
        created_at
      `)
      .single();

    if (insertError) {
      console.error("Fehler beim Einfügen der Nachricht:", insertError);
      return NextResponse.json({ 
        error: "DB_ERROR", 
        message: "Fehler beim Speichern der Nachricht" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: message 
    }, { status: 201 });

  } catch (error) {
    console.error("Unerwarteter Fehler beim Senden der Nachricht:", error);
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      message: "Ein unerwarteter Fehler ist aufgetreten" 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const matchId = url.searchParams.get("matchId");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    if (!matchId) {
      return NextResponse.json({ 
        error: "INVALID_DATA", 
        message: "matchId ist erforderlich" 
      }, { status: 400 });
    }

    // Prüfe ob der User berechtigt ist, Nachrichten dieses Matches zu lesen
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id, user_a_id, user_b_id")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ 
        error: "MATCH_NOT_FOUND", 
        message: "Match nicht gefunden" 
      }, { status: 404 });
    }

    if (match.user_a_id !== user.id && match.user_b_id !== user.id) {
      return NextResponse.json({ 
        error: "UNAUTHORIZED", 
        message: "Keine Berechtigung für dieses Match" 
      }, { status: 403 });
    }

    // Nachrichten abrufen
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(`
        id,
        match_id,
        sender_id,
        content,
        created_at
      `)
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (messagesError) {
      console.error("Fehler beim Abrufen der Nachrichten:", messagesError);
      return NextResponse.json({ 
        error: "DB_ERROR", 
        message: "Fehler beim Laden der Nachrichten" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      messages: messages || [] 
    });

  } catch (error) {
    console.error("Unerwarteter Fehler beim Abrufen der Nachrichten:", error);
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      message: "Ein unerwarteter Fehler ist aufgetreten" 
    }, { status: 500 });
  }
}
