# 🔧 Supabase Database Setup für ProjectHunt

## ❌ Problem: 406 Not Acceptable Errors

Wenn Sie diese Fehlermeldung sehen:
```
GET https://[...].supabase.co/rest/v1/profiles?select=id%2Cname&id=eq.[...] 406 (Not Acceptable)
```

Das bedeutet, dass die Supabase-Datenbank-Tabellen noch nicht existieren oder falsch konfiguriert sind.

## ✅ Lösung: Database Setup

### 1. Supabase SQL Editor öffnen
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Öffnen Sie Ihr ProjectHunt-Projekt
3. Klicken Sie auf **"SQL Editor"** in der linken Sidebar

### 2. SQL Setup ausführen
1. Öffnen Sie die Datei `supabase-setup.sql` in diesem Projektordner
2. Kopieren Sie den gesamten Inhalt
3. Fügen Sie ihn in den SQL Editor ein
4. Klicken Sie auf **"Run"** (oder Strg+Enter)

### 3. Tabellen überprüfen
Nach dem Ausführen sollten Sie diese Tabellen sehen:
- ✅ `profiles` (User-Profile)
- ✅ `projects` (Projekte)
- ✅ `swipes` (Swipe-Verlauf)
- ✅ `matches` (Matches zwischen Usern)
- ✅ `messages` (Chat-Nachrichten)

### 4. RLS Policies prüfen
Stellen Sie sicher, dass Row Level Security (RLS) aktiviert ist:
- Gehen Sie zu **"Authentication"** → **"Policies"**
- Sie sollten Policies für alle Tabellen sehen

## 🔍 Debugging

### Test 1: Debug-Route testen
Öffnen Sie: `http://localhost:3000/api/auth/me`

**Erwartete Response (nicht eingeloggt):**
```json
{
  "hasUser": false,
  "userId": null,
  "userEmail": null,
  "error": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test 2: Nach Login/Registration
Nach erfolgreichem Login sollte die Debug-Route zeigen:
```json
{
  "hasUser": true,
  "userId": "12345678-1234-5678-9abc-123456789012",
  "userEmail": "user@example.com",
  "error": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test 3: Onboarding Flow
1. **Registrierung**: `/auth/sign-up`
2. **E-Mail bestätigen**: Check your inbox
3. **Onboarding**: Automatischer Redirect zu `/onboarding`
4. **Funnel ausfüllen**: 3 Schritte durchlaufen
5. **Discover**: Automatischer Redirect zu `/discover`

## 🚨 Häufige Probleme

### Problem: "Table 'profiles' doesn't exist"
**Lösung**: SQL Setup aus `supabase-setup.sql` ausführen

### Problem: "permission denied for table profiles"
**Lösung**: RLS Policies aus dem SQL Setup sind nicht aktiv

### Problem: "Invalid JWT token"
**Lösung**: Logout/Login durchführen oder Session-Cookies löschen

## 📞 Support

Falls weiterhin Probleme auftreten:
1. Supabase Logs prüfen (Dashboard → Logs)
2. Browser Developer Tools → Console → Fehler kopieren
3. Environment Variables prüfen (`.env.local`)

## 🎯 Nach dem Setup

Nach erfolgreichem Database Setup sollten folgende Features funktionieren:
- ✅ User Registration & Login
- ✅ Onboarding Funnel (speichert in DB)
- ✅ Profile & Project Creation
- ✅ Discover Page mit echten Projekten
- ✅ Wiederholte Logins überspringen Onboarding
