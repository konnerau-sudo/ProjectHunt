# ProjectHunt Chat System

Ein vollständig implementierter Chat-Bereich für ProjectHunt mit modernem, mobile-first Design.

## 🚀 Features

### Layout & Design
- **Mobile-first**: Einspaltiges Layout auf Mobile, Split-View ab md-Breakpoint
- **Responsive**: Optimiert für alle Bildschirmgrößen mit h-dvh für iOS
- **Dark Mode**: Vollständige Unterstützung für Dark/Light Mode
- **Modern UI**: Clean, minimalistisches Design mit Tailwind CSS
- **Sticky Composer**: Bleibt am unteren Rand, nur Messages-Bereich scrollt

### Konversations-Liste (`ConversationsList`)
- **Filter**: Alle / Ungelesen / Archiviert
- **Sortierung**: Gepinnte Gespräche oben, dann nach neuester Nachricht
- **Badges**: Ungelesene Nachrichten-Anzahl
- **Status**: Online/Offline Indikatoren
- **Aktionen**: Pin/Unpin, Archivieren über Kontextmenü
- **Empty States**: Informative leere Zustände

### Chat Thread (`ChatThread`)
- **Header**: Avatar, Name, Projekt, Online-Status, Back-Button (mobile)
- **Nachrichten**: Virtualisierte Liste mit optimaler Performance
- **Gruppierung**: Nachrichten nach Tag gruppiert mit Day Dividers
- **Bubbles**: Unterschiedliche Styles für eigene/fremde Nachrichten
- **Delivery States**: Senden → Gesendet → Zugestellt → Gelesen
- **Typing Indicator**: Animierte "tippt gerade" Anzeige

### Composer (`Composer`)
- **Smart Input**: Auto-Resize Textarea (max 120px)
- **Tastatur-Shortcuts**: Enter = Senden, Shift+Enter = Neue Zeile
- **Draft-Persistenz**: Automatisches Speichern von Entwürfen in localStorage
- **Zeichen-Limit**: 2000 Zeichen mit visuellem Counter
- **Anhänge**: UI-Buttons für zukünftige Datei-Uploads
- **Loading States**: Send-Button mit Spinner während Upload

## ♿ Accessibility

### Screen Reader Support
- **ARIA Labels**: Alle interaktiven Elemente haben aussagekräftige Labels
- **Live Regions**: Neue Nachrichten werden automatisch angekündigt
- **Role Attributes**: Semantisch korrekte HTML-Struktur

### Keyboard Navigation
- **Tab-Reihenfolge**: Logische Keyboard-Navigation
- **Enter/Space**: Aktivierung von Buttons und Links
- **Esc-Taste**: Zurück-Navigation aus Chat-Thread (mobile)
- **Shortcuts**: Enter/Shift+Enter im Composer

### Visual Accessibility
- **Fokus-Indikatoren**: Klare visuelle Fokuszustände
- **Kontrast**: WCAG-konforme Farbkontraste
- **Text-Skalierung**: Responsive bei vergrößertem Text

## 📱 Mobile Optimierung

### Touch-Friendly
- **Target-Größen**: Mindestens 44px Touch-Targets
- **Swipe-Gesten**: Vorbereitet für Archivieren/Pin-Aktionen
- **Scroll-Performance**: Optimierte virtuelle Listen

### Mobile Navigation
- **Zurück-Button**: Sichtbar nur <md, navigiert zur Liste zurück
- **Keyboard Support**: Enter/Space/Esc aktiviert Zurück-Navigation
- **Full-Screen**: Chat nimmt vollen Bildschirm ein
- **Sticky Composer**: Bleibt immer sichtbar am unteren Rand

## 🎭 Mock Data

Realistische Seed-Daten für sofortige Verwendung:
- 5 Konversationen mit verschiedenen Status
- Unterschiedliche Online-Status
- Ungelesene Nachrichten
- Gepinnte Gespräche
- Verschiedene Projekte und Teilnehmer

## 🔧 Technische Details

### Performance
- **Virtualisierung**: Optimiert für große Nachrichten-Listen
- **Lazy Loading**: Komponenten laden nur bei Bedarf
- **Memoization**: React.memo für optimierte Re-Renders

### State Management
- **Local State**: React useState für UI-Zustand
- **Persistence**: localStorage für Entwürfe
- **URL State**: Konversations-Auswahl via URL-Parameter

### Styling
- **Tailwind CSS**: Utility-first CSS Framework
- **Custom Components**: Shadcn/ui Basis-Komponenten
- **Responsive Design**: Mobile-first Breakpoints

## 🚧 Zukünftige Erweiterungen

- Real-time WebSocket Integration
- Datei-Upload und Medien-Nachrichten
- Emoji-Picker
- Push-Benachrichtigungen
- Erweiterte Swipe-Gesten
- Suchfunktion für Gespräche
- Thread-Antworten
- Reaktionen (Like, etc.)
