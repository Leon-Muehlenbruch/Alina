# Features

## Fertig

### Identität & Schlüssel
- Kein Konto, keine Telefonnummer, keine E-Mail — nur ein kryptografisches Schlüsselpaar
- Privater Schlüssel bleibt ausschließlich auf dem Gerät des Nutzers
- Schlüssel importierbar via `nsec` (NIP-19)
- Name jederzeit änderbar in den Einstellungen

### Direktnachrichten
- Ende-zu-Ende verschlüsselt mit NIP-04 (ECDH + AES-256-CBC)
- Einladungsbasiert: 6-stellige Einmalcodes (Nostr kind 10420, SHA-256 gehasht)
- Einladender bettet seinen Namen im Event ein → Empfänger sieht sofort von wem die Einladung kommt
- Kontakte umbenennen und löschen (inkl. Chatverlauf)

### Gruppenräume
- Offene Räume via Nostr kind 42
- Beitritt durch gleichen Gruppenname — kein zentraler Server
- Einladeflow nach Erstellen: Gruppenname zum Kopieren + Anleitung

### Nachrichten
- Text, Bilder (bis 500 KB, base64), Standort (what3words)
- Zeitstempel: heute = Uhrzeit, gestern = „Gestern HH:MM", älter = Datum + Uhrzeit
- Ungelesene-Badge pro Chat

### Automatische Übersetzung
- Fremdsprachige Nachrichten werden clientseitig übersetzt — der Klartext verlässt das Gerät nie unverschlüsselt
- Primär: Chrome AI Translation API (Chrome 127+) — vollständig offline, kein API-Key
- Fallback: MyMemory API (kostenlos, kein Key erforderlich)
- Übersetzungen werden lokal gecacht (localStorage) → keine wiederholten API-Calls
- Toggle: „Original anzeigen" pro Nachricht
- Ein-/Ausschalten in den Einstellungen

### Mehrsprachige UI
- Deutsch, Englisch, Russisch
- Sprachumschalter auf dem Setup-Screen (vor Login) und in den Einstellungen
- Sprache wird in localStorage gespeichert

### Relay-Status
- Live-Anzeige verbundener Relays (roter/gelber/grüner Punkt)
- Automatische Wiederverbindung

### PWA
- Installierbar auf dem Homescreen (iOS, Android, Desktop)
- Offline-fähig durch Service Worker

---

## Roadmap

### QR-Code zum Kontakte hinzufügen
Statt 6-stelligen Code abtippen — QR-Code zeigen, andere Person scannt. Ideal für Treffen vor Ort.
- Technologie: `qrcode.react` + `html5-qrcode`

### Sprachnachrichten
Mikrofon-Button → aufnehmen → senden. Besonders für Nutzer die lieber sprechen als tippen.
- Technologie: `MediaRecorder` API → base64 → als Nachricht senden

### Selbstlöschende Nachrichten
Ablaufzeit pro Chat oder Nachricht (z.B. 24h, 7 Tage). Lokale Bereinigung beim Laden.
- Passend zum Datenschutz-Fokus von Alina

### App-Sperre mit PIN
Beim Öffnen PIN eingeben. Optional Fingerabdruck/Face ID auf unterstützten Geräten.
