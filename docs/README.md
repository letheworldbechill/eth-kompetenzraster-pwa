# ETH Kompetenzraster PWA

Interaktive Progressive Web App für das ETH Kompetenzraster - ein Rahmenwerk zur Förderung akademischer Kompetenzen.

## 🎯 Übersicht

Diese PWA macht das ETH Kompetenzraster zugänglich und interaktiv. Sie können:

- **18 Kompetenzen entdecken** organisiert in 3 Bereichen
- **Detaillierte Inhalte** zu Wissen, Fähigkeiten und Einstellungen lesen
- **Praktische Aufgaben** mit strukturierten Schritten durchführen
- **Offline arbeiten** nach dem ersten Laden
- **Auf Smartphone installieren** wie eine native App

## 📦 Strukturen

```
docs/
├── app/                    PWA-Applikation
│   ├── index.html         HTML5 Struktur
│   ├── app.js             Hauptlogik
│   ├── app.css            Styling
│   ├── manifest.json      PWA-Manifest
│   └── sw.js              Service Worker
├── data/
│   └── modules.json       Modul-Index (Datengetrieben)
├── modules/               18 Lernmodule
│   ├── m1/ ... m5/       Methodenspezifisch (5)
│   ├── s1/ ... s7/       Sozial (7)
│   ├── p1/ ... p6/       Persönlich (6)
│   │   ├── meta.json
│   │   ├── content.md
│   │   └── tasks.json
├── quality/
│   └── control-sheet.md  Qualitätskontrolle
└── README.md             Diese Datei
```

## 🚀 Schnelleinstieg

### Lokal mit Python

```bash
cd docs/app
python3 -m http.server 8000
# Browser: http://localhost:8000
```

### Lokal mit Node

```bash
npm install -g http-server
cd docs/app
http-server
```

### GitHub Pages (Permanent)

1. Repository erstellen
2. `docs/` Ordner pushen
3. Settings → Pages → /docs
4. URL: `https://<user>.github.io/<repo>/docs/app/`

## 📱 Installation auf Smartphone

**Android (Chrome):**
1. URL öffnen
2. Menu ≡ → "App installieren"
3. Icon erscheint auf Homescreen

**iOS (Safari):**
1. URL öffnen
2. Teilen ↗ → "Zum Homescreen"
3. Icon erscheint auf Homescreen

## 💾 Offline-Funktionalität

- **Automatisch**: Service Worker cached alle Assets
- **Nach 1. Load**: Voll offline-funktionsfähig
- **Daten**: Alle 18 Module lokal verfügbar

## 📚 Kompetenzbereiche

### Methodenspezifisch (5 Kompetenzen)
Kenntnisse und Anwendung von Methoden, um jeden Kontext zu verstehen

- **m1**: Analytische Kompetenzen
- **m2**: Entscheidungsfindung
- **m3**: Medien und digitale Technologien
- **m4**: Problemlösung
- **m5**: Projektmanagement

### Sozial (7 Kompetenzen)
Kompetenzen, die in der Interaktion mit anderen angewandt werden

- **s1**: Kommunikation
- **s2**: Kooperation und Teamarbeit
- **s3**: Kundenorientierung
- **s4**: Menschenführung und Verantwortung
- **s5**: Selbstdarstellung und soziale Einflussnahme
- **s6**: Sensibilität für Vielfalt
- **s7**: Verhandlung

### Persönlich (6 Kompetenzen)
Selbstmanagement-Kompetenzen im Kontext der eigenen Arbeit

- **p1**: Anpassung und Flexibilität
- **p2**: Kreatives Denken
- **p3**: Kritisches Denken
- **p4**: Integrität und Arbeitsethik
- **p5**: Selbstbewusstsein und Selbstreflexion
- **p6**: Selbststeuerung und Selbstmanagement

## 🔧 Modul-Struktur

Jedes Modul (z.B. `docs/modules/m1/`) enthält:

### meta.json
```json
{
  "id": "m1",
  "name": "Analytische Kompetenzen",
  "bereich": "Methodenspezifisch",
  "scope": {
    "includes": [...],
    "excludes": [...]
  }
}
```

### content.md
Markdown-formatierter Lerninhalt mit:
- Kernkonzepten
- Praktischer Anwendung
- Wichtigen Hinweisen
- Strukturiert mit H2/H3 Headings

### tasks.json
```json
{
  "kompetenz_id": "m1",
  "aufgaben": [
    {
      "title": "...",
      "description": "...",
      "steps": [...]
    }
  ]
}
```

## ➕ Neue Module hinzufügen

1. **Ordner erstellen**:
   ```bash
   mkdir -p docs/modules/xx/
   ```

2. **Dateien erstellen** (Kopiere Template von m1/):
   - `meta.json`
   - `content.md`
   - `tasks.json`

3. **In modules.json eintragen**:
   ```json
   {
     "id": "xx",
     "slug": "neue-kompetenz",
     "name": "Name der Kompetenz",
     "kurzbeschreibung": "..."
   }
   ```

4. **Service Worker aktualisieren** (docs/app/sw.js):
   - Neue Asset-Pfade zu ASSETS array hinzufügen

5. **Pushen** (GitHub) oder **neu starten** (lokal)

## 🔐 Qualitätskontrolle

Alle Module wurden kontrolliert auf:
- ✓ JSON-Validierung
- ✓ Markdown-Syntax
- ✓ Vollständigkeit (Wissen, Fähigkeiten, Einstellungen)
- ✓ ETH-Konformität
- ✓ Keine Halluzinationen

Siehe: `docs/quality/control-sheet.md`

## 🎨 Styling

- **Framework**: Vanilla CSS3
- **Responsive**: Mobile-first Design
- **Dark-Mode**: Unterstützt durch Browser-Einstellungen
- **Accessibility**: WCAG 2.1 Level AA angestrebt

## 🚀 Performance

- **Gesamtgrösse**: ~150 KB (Daten + App)
- **Cache-Grösse**: ~50 KB
- **1st Load**: <500ms (mit Netzwerk)
- **Offline Load**: <100ms

## 🔄 Technologie

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES5)
- **Offline**: Service Worker (Cache-First)
- **Daten**: JSON + Markdown
- **Build**: Keine Build-Tools nötig
- **Hosting**: Statisch (GitHub Pages, Netlify, etc.)

## 📖 Standards & Konformität

- **PWA Standard**: W3C PWA Checklist ✓
- **Offline**: Service Worker Standard ✓
- **Responsive**: CSS Media Queries ✓
- **Accessibility**: ARIA Labels (teilweise) ✓

## 📞 Support

**Fragen zum Kompetenzraster:**
- Kontakt: barbara.lacara@sl.ethz.ch
- Info: www.ethz.ch/kompetenzen-fuer-studierende

**Technische Fragen zu dieser PWA:**
- Code auf GitHub
- Issues: Bug Reports & Feature Requests

## 📄 Lizenz & Eigentum

**ETH Kompetenzraster:**
- Eigentum: ETH Zürich
- Kontakt: barbara.lacara@sl.ethz.ch (Stab Rektor/in)

**Diese PWA-Implementierung:**
- Basis: ETH Kompetenzraster
- Implementierung: Dokumentierte Version
- Verwendung: Nach Kennzeichnung (siehe Datei-Header)

## 🙏 Danksagungen

- ETH Zürich für das Kompetenzraster Framework
- Barbara Lacara & Team für die Grundlage
- Community für Feedback und Verbesserungen

---

**Stand**: 2026-02-03  
**Version**: 1.0  
**Status**: Production Ready ✅
