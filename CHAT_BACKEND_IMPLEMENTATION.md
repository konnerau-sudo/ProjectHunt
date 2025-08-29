# Chat Backend Implementation

Diese Dokumentation beschreibt die Implementierung des Chat-Backends für ProjectHunt.

## Übersicht

Das Chat-System ermöglicht es Nutzern, Nachrichten in bestehenden Matches zu senden und zu empfangen. Die Implementierung besteht aus:

1. **API-Route**: `/api/messages` für POST und GET Requests
2. **Frontend-Integration**: Aktualisierte `ChatThread` und `Composer` Komponenten
3. **Datenbank**: Nutzung der bestehenden `messages` Tabelle

## API-Endpunkte

### POST /api/messages
Sendet eine neue Nachricht in einem Match.

**Request Body:**
```json
{
  "matchId": "uuid",
  "content": "Nachrichteninhalt"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "match_id": "uuid",
    "sender_id": "uuid",
    "content": "Nachrichteninhalt",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "ERROR_CODE",
  "message": "Fehlerbeschreibung"
}
```

**Validierungen:**
- User muss authentifiziert sein
- `matchId` und `content` sind erforderlich
- Content darf nicht leer sein (nach trim)
- Content max. 1000 Zeichen
- User muss Teil des Matches sein

### GET /api/messages
Lädt Nachrichten für ein Match.

**Query Parameters:**
- `matchId` (required): UUID des Matches
- `limit` (optional): Anzahl Nachrichten (default: 50)
- `offset` (optional): Offset für Pagination (default: 0)

**Response (Success - 200):**
```json
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "match_id": "uuid",
      "sender_id": "uuid",
      "content": "Nachrichteninhalt",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

## Datenbank-Schema

Die Implementierung nutzt die bestehende `messages` Tabelle aus `supabase-setup.sql`:

```sql
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Row Level Security (RLS):**
- Benutzer können nur Nachrichten ihrer eigenen Matches lesen/schreiben
- Automatische Validierung über Match-Zugehörigkeit

## Frontend-Integration

### ChatThread Komponente

**Neue Features:**
- Lädt echte Nachrichten über API beim Mount
- Sendet Nachrichten über API statt Mock-Funktion
- Loading States für bessere UX
- Error Handling mit Toast-Notifications
- Type-sichere Konvertierung zwischen DB- und UI-Message-Formaten

**State Management:**
```typescript
const [messages, setMessages] = useState<UIMessage[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isSending, setIsSending] = useState(false);
```

### Composer Komponente

**Neue Features:**
- `disabled` Prop für externe Steuerung
- Besseres Loading-Verhalten während dem Senden
- Automatic Draft-Speicherung bleibt bestehen

## Sicherheit

1. **Authentifizierung**: Alle API-Calls erfordern gültigen Session
2. **Autorisierung**: User können nur in ihren eigenen Matches schreiben
3. **Validierung**: Input-Validierung auf Client- und Server-Seite
4. **RLS**: Datenbank-Level Sicherheit über Row Level Security

## Error Handling

**Client-Side:**
- Toast-Notifications für User-Feedback
- Loading States für bessere UX
- Fallback-Verhalten bei API-Fehlern

**Server-Side:**
- Strukturierte Error-Responses
- Logging für Debugging
- Verschiedene HTTP-Status-Codes

## Deployment-Hinweise

1. **Umgebungsvariablen**: Supabase-Credentials müssen gesetzt sein
2. **Datenbank**: `supabase-setup.sql` muss ausgeführt sein
3. **RLS**: Row Level Security Policies müssen aktiv sein

## Bekannte Limitations

1. **Real-time Updates**: Aktuell keine Live-Updates (WebSocket/Server-Sent Events)
2. **Read Receipts**: Delivery Status ist aktuell statisch ("read")
3. **Attachments**: Noch nicht implementiert
4. **Message Threading**: Keine Unterstützung für Antworten auf spezifische Nachrichten

## Nächste Schritte

1. **Real-time**: WebSocket-Integration für Live-Updates
2. **Read Receipts**: Echte Delivery Status Tracking
3. **Push Notifications**: Mobile/Browser Notifications
4. **Message Search**: Volltext-Suche in Nachrichten
5. **Attachments**: File-Upload Funktionalität
