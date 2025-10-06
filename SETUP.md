# Nervesgun Setup Guide

## 🚀 Schritt-für-Schritt Installation

### Voraussetzungen
- Node.js 18+ installiert
- Chrome Browser
- Google Account für OAuth Setup

### 1. Google OAuth Konfiguration

#### 1.1 Google Cloud Console Setup
1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Erstelle ein neues Projekt: "Nervesgun" (oder wähle ein bestehendes)
3. Aktiviere die Google+ API:
   - Gehe zu "APIs & Services" → "Library"
   - Suche nach "Google+ API" und aktiviere sie

#### 1.2 OAuth Credentials erstellen
1. Gehe zu "APIs & Services" → "Credentials"
2. Klicke "Create Credentials" → "OAuth 2.0 Client ID"
3. Wähle "Web application"
4. Name: "Nervesgun Web App"
5. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Klicke "Create"
7. **WICHTIG**: Kopiere Client ID und Client Secret - du brauchst sie für die .env Datei

### 2. Web App Setup

#### 2.1 Dependencies installieren
```bash
cd web
npm install
```

#### 2.2 Environment Variables
```bash
cp .env.example .env
```

Bearbeite die `.env` Datei:
```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dein_langer_zufaelliger_string_hier_min_32_zeichen

# Google OAuth (von Schritt 1.2)
GOOGLE_CLIENT_ID=deine_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=dein_client_secret

# Domain Beschränkung (ersetze mit deiner Domain)
ALLOWED_EMAIL_DOMAIN=deine-firma.com
TRIAGER_EMAILS=admin@deine-firma.com,manager@deine-firma.com

# Database (SQLite für Development)
DATABASE_URL=file:./dev.db

# Image Limits
MAX_IMAGE_BYTES=1048576
```

#### 2.3 Database Setup
```bash
npx prisma migrate dev --name init
```

#### 2.4 Web App starten
```bash
npm run dev
```

Die Web App läuft jetzt auf http://localhost:3000

### 3. Chrome Extension Setup

#### 3.1 Extension laden
1. Öffne Chrome → `chrome://extensions`
2. Aktiviere "Developer Mode" (Toggle oben rechts)
3. Klicke "Load unpacked"
4. Wähle den `extension/` Ordner aus dem Nervesgun Projekt

#### 3.2 API Endpoint konfigurieren
Öffne `extension/popup.js` und stelle sicher, dass die API_BASE korrekt ist:
```javascript
const API_BASE = "http://localhost:3000"; // Für Development
```

Für Production ändere zu deiner deployed URL.

### 4. Erste Nutzung testen

#### 4.1 Web App Login
1. Gehe zu http://localhost:3000
2. Du wirst zur Google Login Seite weitergeleitet
3. Melde dich mit einem Account an, der zu deiner ALLOWED_EMAIL_DOMAIN gehört
4. Nach dem Login siehst du die Nervesgun Gallery

#### 4.2 Extension testen
1. Gehe zu einer beliebigen Website (z.B. google.com)
2. Klicke das Nervesgun Icon in der Chrome Toolbar
3. Schreibe einen Test-Text: "Diese Seite nervt mich"
4. Optional: Klicke "Screenshot anhängen" und teste die Redaktion
5. Klicke "Senden"
6. Gehe zurück zur Web App - dein Ärgernis sollte erscheinen

### 5. Team Setup

#### 5.1 Weitere Nutzer hinzufügen
- Alle Nutzer mit E-Mails von deiner ALLOWED_EMAIL_DOMAIN können sich anmelden
- Füge weitere E-Mails zu TRIAGER_EMAILS hinzu, um ihnen Admin-Rechte zu geben

#### 5.2 Extension verteilen
- Für interne Nutzung: Lade die Extension als .zip und verteile sie
- Für Production: Veröffentliche die Extension im Chrome Web Store

## 🔧 Troubleshooting

### Häufige Probleme

#### "Unauthenticated" Fehler
- Stelle sicher, dass du in der Web App eingeloggt bist
- Prüfe, ob deine E-Mail Domain in ALLOWED_EMAIL_DOMAIN steht

#### Screenshot Upload Fehler
- Prüfe MAX_IMAGE_BYTES in .env (Standard: 1MB)
- Stelle sicher, dass die Extension die richtige API_BASE hat

#### Database Fehler
```bash
# Database zurücksetzen
rm web/dev.db
npx prisma migrate dev --name init
```

#### Google OAuth Fehler
- Prüfe, ob die redirect URI exakt stimmt: `http://localhost:3000/api/auth/callback/google`
- Stelle sicher, dass die Google+ API aktiviert ist
- Prüfe Client ID und Secret in .env

### Logs prüfen
```bash
# Web App Logs
npm run dev

# Browser Console (F12) für Extension Fehler
# Network Tab für API Fehler
```

## 🚀 Production Deployment

### Vercel Deployment
1. Verbinde dein GitHub Repository mit Vercel
2. Setze Environment Variables in Vercel Dashboard
3. Deploy automatisch bei Git Push

### Database für Production
- Ändere DATABASE_URL zu einer PostgreSQL URL
- Führe Migrationen aus: `npx prisma migrate deploy`

### Extension für Production
- Ändere API_BASE in der Extension zu deiner Production URL
- Veröffentliche im Chrome Web Store oder verteile als .crx

## 📞 Support

Bei Problemen:
1. Prüfe die Browser Console (F12)
2. Prüfe die Network Tab für API-Fehler
3. Stelle sicher, dass alle Environment Variables korrekt sind
4. Erstelle ein Issue mit detaillierter Fehlerbeschreibung