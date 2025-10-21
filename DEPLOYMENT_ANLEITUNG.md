# Nervgun Website - Kostenloses Deployment

## 🎯 Empfohlene Option: Vercel (100% kostenlos)

### Warum Vercel?
- **Von Next.js-Machern entwickelt** - perfekt optimiert
- **100% kostenlos** für persönliche Projekte
- **Automatische Deployments** bei jedem Git-Push
- **Eigene Domain** möglich
- **SSL-Zertifikat** automatisch inklusive

## 📋 Schritt-für-Schritt Anleitung

### Voraussetzungen:
- ✅ GitHub Account (kostenlos)
- ✅ Vercel Account (kostenlos)
- ✅ Dein Projekt (bereits vorhanden)

### Schritt 1: Projekt auf GitHub hochladen

```bash
# Im Terminal (du bist bereits im richtigen Ordner)
git add .
git commit -m "Initial commit - Nervgun project"
git push origin main
```

### Schritt 2: Vercel Account erstellen

1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke "Sign Up"
3. Wähle "Continue with GitHub"
4. Erlaube Vercel Zugriff auf dein GitHub Repository

### Schritt 3: Projekt deployen

1. In Vercel Dashboard: "New Project" klicken
2. Dein GitHub Repository auswählen
3. Vercel erkennt automatisch Next.js
4. "Deploy" klicken
5. **Fertig!** 🎉

### Was passiert dann:
- ✅ Website wird automatisch gebaut
- ✅ Du bekommst eine URL wie `nervgun-abc123.vercel.app`
- ✅ Bei jedem Git-Push wird automatisch neu deployed
- ✅ SSL-Zertifikat wird automatisch hinzugefügt

## 🔄 Automatische Updates

Nach dem ersten Deployment:
- Jedes Mal wenn du `git push` machst
- Wird deine Website automatisch aktualisiert
- Keine manuellen Schritte nötig

## 🌐 Eigene Domain (optional)

Falls du eine eigene Domain haben möchtest:
1. Domain kaufen (z.B. bei Namecheap, GoDaddy)
2. In Vercel: "Domains" → "Add Domain"
3. DNS-Einstellungen anpassen
4. **Fertig!** Deine Website läuft auf deiner eigenen Domain

## 📊 Kostenlose Limits

**Vercel Free Plan:**
- ✅ Unbegrenzte Bandbreite
- ✅ Unbegrenzte Deployments
- ✅ Globale CDN
- ✅ SSL-Zertifikat
- ✅ GitHub-Integration
- ✅ 100GB Bandbreite pro Monat
- ✅ 1000 Build-Minuten pro Monat

**Für dein Projekt völlig ausreichend!**

## 🆚 Alternative: Netlify

Falls du Vercel nicht möchtest:
- Gehe zu [netlify.com](https://netlify.com)
- Ähnlicher Prozess wie bei Vercel
- Auch 100% kostenlos
- Aber weniger optimiert für Next.js

## 🚨 Wichtige Hinweise

### Vor dem Deployment:
1. **Beispieldaten entfernen** (falls gewünscht)
2. **Umgebungsvariablen prüfen** (falls vorhanden)
3. **Datenbank-URL anpassen** (für Produktion)

### Nach dem Deployment:
- Website ist öffentlich zugänglich
- Jeder kann sie sehen
- Automatische Updates bei Git-Push

## 🆘 Hilfe bei Problemen

Falls etwas nicht funktioniert:
1. **Build-Logs** in Vercel Dashboard prüfen
2. **GitHub Repository** auf Fehler prüfen
3. **Lokale Tests** durchführen (`npm run dev`)
4. **Vercel Support** kontaktieren (sehr hilfsbereit)

## 🎉 Ergebnis

Nach erfolgreichem Deployment hast du:
- ✅ Kostenlose, professionelle Website
- ✅ Automatische Updates
- ✅ Globale Verfügbarkeit
- ✅ SSL-Sicherheit
- ✅ Eigene URL (z.B. `nervgun.vercel.app`)
