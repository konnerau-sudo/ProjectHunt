# Like/Icebreaker Implementation

## 🎯 Übersicht

Implementierung der Like/Icebreaker-Logik für ProjectHunt:

- **Nur liken** → Projekt zur Merkliste hinzufügen (ohne Chat)
- **Icebreaker senden** → Conversation erstellen + erste Nachricht senden → Chat öffnen

## 🔧 API Endpoints

### POST `/api/swipes`

**Für "Nur liken" und "Skip"**

```typescript
// Request
{
  "projectId": "uuid",
  "direction": "like" | "skip"
}

// Response (like)
{
  "ok": true,
  "projectTitle": "Projekt Name" // Für bessere UX
}

// Response (skip)
{
  "ok": true
}
```

**Features:**
- ✅ Unique constraint (409 bei duplicate)
- ✅ Tageslimit (10 swipes/Tag, 429 bei Überschreitung)
- ✅ RLS aktiv (nur eigene swipes)

### POST `/api/icebreaker`

**Für Conversation + erste Message**

```typescript
// Request
{
  "projectId": "uuid",
  "recipientId": "uuid",
  "icebreakerText": "string"
}

// Response
{
  "conversationId": "uuid",
  "success": true
}
```

**Flow:**
1. 🔍 Validierung (Projekt existiert, Recipient ist Owner)
2. 🤝 Match finden/erstellen (idempotent mit canonical order)
3. 💬 Message erstellen (sender_id + content)
4. ❤️ Optional: Like in swipes upserten
5. 📝 Conversation ID zurückgeben

## 🎨 Frontend (Discover Page)

### Swipe Actions

```typescript
// Skip Button
handleSkip() // → POST /api/swipes { direction: "skip" }

// Like Button → öffnet Modal
handleLike() // → Zeigt Icebreaker Dialog
```

### Modal Actions

```typescript
// "Nur liken" Button
handleJustLike() // → POST /api/swipes { direction: "like" }
  → Toast: "Projekt zur Merkliste hinzugefügt"

// Icebreaker Buttons  
handleSendIcebreaker(text) // → POST /api/icebreaker
  → Toast: "Icebreaker gesendet!"
  → router.push(`/chats?conversation=${conversationId}`)
```

### UX Features

- ✅ **Loading States**: Spinner während API calls
- ✅ **Disabled States**: Buttons während Loading deaktiviert
- ✅ **Optimistic UI**: Karte sofort entfernen
- ✅ **Error Handling**: Toast-Nachrichten für alle Fehler
- ✅ **Auto-Navigation**: Nach Icebreaker → Chat-Detail

## 🗄️ Database Schema

### Tabellen

```sql
-- Swipes (Merkliste)
swipes (
  swiper_id UUID,     -- Wer hat geliked/geskipt
  project_id UUID,    -- Welches Projekt
  direction TEXT,     -- 'like' | 'skip'
  UNIQUE(swiper_id, project_id)
)

-- Matches (Conversations)
matches (
  user_a_id UUID,     -- Canonical order (< user_b_id)
  user_b_id UUID,     -- 
  project_id UUID,    -- Projekt-Kontext
  UNIQUE(user_a_id, user_b_id, project_id)
)

-- Messages (Chat-Nachrichten)
messages (
  match_id UUID,      -- Reference zu matches
  sender_id UUID,     -- Wer hat gesendet
  content TEXT        -- Nachrichteninhalt
)
```

### RLS Policies

- ✅ **swipes**: Nur eigene sehen/erstellen
- ✅ **matches**: Nur eigene Matches sehen/erstellen
- ✅ **messages**: Nur Messages der eigenen Matches

## 🚀 Akzeptanzkriterien

### ✅ Implementiert

1. **Icebreaker Flow**
   - ✅ Modal öffnet sich bei Like-Button
   - ✅ Icebreaker-Auswahl startet Conversation
   - ✅ Erste Message wird erstellt
   - ✅ Automatische Navigation zum Chat
   - ✅ Keine doppelten Conversations

2. **Like Flow**
   - ✅ "Nur liken" speichert in Merkliste
   - ✅ Kein Chat wird erstellt
   - ✅ Toast-Bestätigung
   - ✅ Keine Duplikate (409)

3. **UX/UI**
   - ✅ Loading-Spinner während Requests
   - ✅ Buttons deaktiviert während Loading
   - ✅ Modal kann nicht geschlossen werden während Loading
   - ✅ Optimistic UI (Karte verschwindet sofort)
   - ✅ Error-Handling mit Toasts

4. **API Security**
   - ✅ Authentifizierung erforderlich (401)
   - ✅ Input-Validierung
   - ✅ RLS aktiv
   - ✅ Duplicate-Guards

## 🧪 Testing

```bash
# API Tests (ohne Auth = 401 erwartet)
curl -X POST http://localhost:3000/api/swipes \
  -H "Content-Type: application/json" \
  -d '{"projectId":"test","direction":"like"}'

curl -X POST http://localhost:3000/api/icebreaker \
  -H "Content-Type: application/json" \
  -d '{"projectId":"test","recipientId":"test2","icebreakerText":"Hallo!"}'
```

## 📋 Nächste Schritte

1. **Chat-Integration**: Chat-Komponente sollte Conversations aus `matches` laden
2. **Merkliste**: Tab in Chat-Übersicht für gelikte Projekte aus `swipes`
3. **Analytics**: Optional Events für `like_saved`, `icebreaker_sent`
4. **Push Notifications**: Bei neuen Messages/Icebreakers

