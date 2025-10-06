# nervgun - "Attacke auf das, was uns nervt"

Ein Chrome Extension + Web App System zum Sammeln von Arbeitsplatz-Ärgernissen und deren Diskussion im Team.

## 🎯 Was ist nervgun?

nervgun ist ein ultra-einfaches Tool, um Ärgernisse im Arbeitsalltag zu erfassen:
- **Chrome Extension**: Ein Klick → Text eingeben → optional Screenshot → senden
- **Web Gallery**: Private Galerie mit Google OAuth für Team-Diskussion
- **Social Features**: Upvotes, Kommentare, Status-Management

## 🚀 Quick Start

### 1. Web App Setup

```bash
cd web
cp .env.example .env
# Bearbeite .env mit deinen Google OAuth Credentials

npm install
npx prisma migrate dev --name init
npm run dev
```

Öffne http://localhost:3000 und melde dich mit Google an.

### 2. Chrome Extension Setup

1. Öffne Chrome → `chrome://extensions`
2. Aktiviere "Developer Mode"
3. Klicke "Load unpacked" → wähle den `extension/` Ordner
4. In `extension/popup.js` setze `API_BASE = "http://localhost:3000"`

### 3. Erste Nutzung

1. Gehe zu einer Website, die dich nervt
2. Klicke das nervgun Icon in der Chrome Toolbar
3. Schreibe was dich nervt
4. Optional: Screenshot anhängen und sensible Bereiche schwärzen
5. "Senden" klicken
6. In der Web Gallery siehst du alle Ärgernisse deines Teams

## 🔧 Konfiguration

### Environment Variables (.env)

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dein_langer_zufaelliger_string

# Google OAuth (von Google Cloud Console)
GOOGLE_CLIENT_ID=deine_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=dein_client_secret

# Domain Beschränkung
ALLOWED_EMAIL_DOMAIN=deine-firma.com
TRIAGER_EMAILS=admin@deine-firma.com,manager@deine-firma.com

# Database
DATABASE_URL=file:./dev.db

# Limits
MAX_IMAGE_BYTES=1048576
```

### Google OAuth Setup

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Erstelle ein neues Projekt oder wähle ein bestehendes
3. Aktiviere die Google+ API
4. Gehe zu "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Wähle "Web application"
6. Füge `http://localhost:3000/api/auth/callback/google` zu den Authorized redirect URIs hinzu
7. Kopiere Client ID und Secret in deine .env Datei

## 📁 Projekt Struktur

```
nervgun/
├── extension/              # Chrome Extension
│   ├── manifest.json       # Extension Manifest
│   ├── popup.html         # Extension UI
│   ├── popup.js           # Extension Logic
│   └── style.css          # Extension Styling
└── web/                   # Next.js Web App
    ├── app/
    │   ├── api/           # API Routes
    │   └── (site)/        # Web Pages
    ├── lib/               # Utilities
    └── prisma/            # Database Schema
```

## 🎨 Features

### Chrome Extension
- ✅ Ein-Klick Ärgernis erfassen
- ✅ Optional Screenshot mit Redaktion
- ✅ Automatische Kontext-Erfassung (URL, Titel)
- ✅ Offline-Queue (geplant für v0.2)

### Web Gallery
- ✅ Google OAuth mit Domain-Beschränkung
- ✅ Liste aller Ärgernisse (neueste zuerst)
- ✅ Detail-Ansicht mit Screenshots
- ✅ Upvoting und Kommentare
- ✅ Status-Management (Open/Triaged/Resolved)
- ✅ Rollen-basierte Berechtigung

### API
- ✅ RESTful Endpoints
- ✅ Session-basierte Authentifizierung
- ✅ Rate Limiting (geplant)
- ✅ Bildgrößen-Validierung (1MB Limit)

## 🔒 Sicherheit

- **Domain Allowlist**: Nur bestimmte E-Mail-Domains können sich anmelden
- **PII Redaction**: Screenshots können vor dem Senden redigiert werden
- **Session Security**: HTTPOnly Cookies, CSRF Protection
- **Data Minimization**: Nur URL und Titel werden gespeichert, kein DOM

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production (Vercel)
```bash
npm run build
npm start
```

### Database Migration
```bash
npx prisma migrate deploy
```

## 📊 Monitoring

- **Success Metrics**: ≤10 Sekunden Capture-Zeit, ≥10 Nutzer in Woche 1
- **Engagement**: ≥50% der Reports erhalten Upvotes/Kommentare
- **Stability**: <1% Submission-Fehlerrate

## 🔄 Roadmap

### v0.2 (geplant)
- [ ] Duplicate Detection
- [ ] Slack Integration
- [ ] Mobile Support
- [ ] Advanced Analytics

### v0.3 (geplant)
- [ ] Jira/Linear Sync
- [ ] Team Dashboards
- [ ] Automated Triage

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📄 License

MIT License - siehe LICENSE Datei für Details.

## 🆘 Support

Bei Problemen:
1. Prüfe die Browser Console auf Fehler
2. Prüfe die Network Tab für API-Fehler
3. Stelle sicher, dass alle Environment Variables gesetzt sind
4. Erstelle ein Issue mit detaillierter Fehlerbeschreibung