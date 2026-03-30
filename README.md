# Alina

**Sicher. Dezentral. Deins.**

Alina ist ein Ende-zu-Ende verschlüsselter Messenger ohne Server, ohne Konto und ohne Werbung — gebaut auf dem offenen [Nostr](https://nostr.com)-Protokoll.

---

## Was macht Alina besonders?

- **Kein Konto nötig** — kein Benutzername, keine Telefonnummer, keine E-Mail
- **Kein Server** — Nachrichten laufen über dezentrale Nostr-Relays
- **Ende-zu-Ende verschlüsselt** — private Chats mit NIP-04 Verschlüsselung
- **Einladungsbasiert** — Kontakte werden über 6-stellige Einmalcodes hinzugefügt
- **Gruppenräume** — alle mit demselben Gruppenname landen im gleichen Gespräch
- **Standort teilen** — via what3words Integration
- **PWA** — installierbar auf dem Homescreen wie eine native App

---

## Technologie

| Was | Womit |
|---|---|
| Frontend | React 19 + TypeScript |
| State | Zustand |
| Protokoll | Nostr (NIP-01, NIP-04, NIP-19) |
| Build | Vite + vite-plugin-pwa |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Lokale Entwicklung

```bash
git clone https://github.com/Leon-Muehlenbruch/Alina
cd Alina
npm install
npm run dev
```

App läuft auf `http://localhost:5173`

---

## Roadmap

Siehe [ROADMAP.md](./ROADMAP.md)

---

## Lizenz

MIT
