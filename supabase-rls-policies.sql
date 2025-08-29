-- RLS Policies für Icebreaker-Funktionalität
-- Führe diese SQL-Befehle in deiner Supabase SQL Editor aus

-- Messages: Absender darf schreiben/lesen
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS messages_insert_own ON public.messages;
DROP POLICY IF EXISTS messages_select_in_match ON public.messages;

CREATE POLICY messages_insert_own
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY messages_select_in_match
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = messages.match_id
        AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
    )
  );

-- Matches: Teilnehmer dürfen sehen/erstellen
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS matches_insert_participant ON public.matches;
DROP POLICY IF EXISTS matches_select_participant ON public.matches;

CREATE POLICY matches_insert_participant
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY matches_select_participant
  ON public.matches FOR SELECT
  USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

-- Swipes: User darf eigene Swipes sehen/erstellen
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS swipes_own ON public.swipes;

CREATE POLICY swipes_own
  ON public.swipes FOR ALL
  USING (auth.uid() = swiper_id)
  WITH CHECK (auth.uid() = swiper_id);
