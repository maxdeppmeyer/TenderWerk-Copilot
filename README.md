# TenderWerk Copilot

**Ausschreibungen prüfen. Sicher entscheiden. Angebote vorbereiten.**

TenderWerk Copilot ist ein deutschsprachiger MVP für kleine und mittlere Unternehmen, die erhaltene Ausschreibungsunterlagen nachvollziehbar prüfen und intern vorbereiten möchten. Der gelieferte Stand enthält eine startbare React-Webanwendung mit vollständig interaktivem, synthetischem Demoprojekt sowie eine produktionsnahe Supabase-/Cloudflare-Grundlage für sichere Weiterentwicklung.

## Wichtigster Statushinweis

Der Demoflow funktioniert lokal ohne Zugangsdaten und ohne KI-Kosten. Die bereitgestellte Backendstruktur enthält Datenmodell, Row Level Security, private Storage-Buckets, Analyse-/Import-Functions und einen Cloudflare-E-Mail-Worker. Vor einem echten Kundenpilot müssen die produktive Datenanbindung der Ergebnisansichten vollständig integriert, die Supabase-Policies in einem Testprojekt geprüft und die gewünschten Dokumentparser erweitert werden. In der gelieferten serverseitigen Extraktion werden **TXT, CSV und XML** verarbeitet; PDF, DOCX, XLSX, Scans und tiefere GAEB-Formate werden sicher gespeichert beziehungsweise als zusätzlicher Prüf-/Parserbedarf behandelt, nicht als vollständig analysiert behauptet.

## Enthaltene Funktionen

- Öffentliche Produktseiten, Preise als Testmodell, Sicherheit sowie Rechtstext-Vorlagen.
- Login-/Registrierungsansichten; Supabase-Auth-Konfiguration ist vorgesehen, der Standardstart erfolgt im Demomodus.
- Unternehmensprofil mit Branchen-, Leistungs-, Radius-, Kapazitäts- und Nachweisangaben.
- Interaktives fiktives Ausschreibungsprojekt mit zwei Losen, Fundstellen, Fristen, Nachweisen, Risiken und Positionsdaten.
- Deterministische Go-/No-Go-Bewertung mit gewichteten Dimensionen und harten Stopps.
- Kalkulationsvorbereitung, Checkliste, interner Freigabeprozess und druckoptimierte Berichtsausgabe.
- Supabase-SQL-Migrationen mit Organisationsmodell, Rollen, privaten Buckets, RLS-Policies, Lizenz-/Kontingenttabellen und Auditdaten.
- Supabase Edge Functions für Jobanlage, begrenzte Dokumentverarbeitung, strukturierte KI-Analyse, Lizenzverwaltung, Export und E-Mail-Ingest.
- Optionaler Cloudflare Email Worker mit geheimer Importtoken-Zuordnung.
- Testdateien, technische Dokumentation und CI-Konfiguration.

## Technologie

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router.
- Backendgrundlage: Supabase Auth, Postgres, private Storage-Buckets, Edge Functions.
- Hosting: Cloudflare Pages; optional Cloudflare Email Worker.
- KI-Integration: serverseitiger OpenAI-kompatibler Adapter; Secret nur in Supabase Functions.
- Qualität: TypeScript strict, ESLint, Vitest und Testing Library.

## Schnellstart im sicheren Demomodus

```bash
npm install
cp .env.example .env.local
npm run dev
```

In `.env.local` bleibt `VITE_DEMO_MODE=true`. Danach im Browser die Schaltfläche **Demo öffnen** wählen und das fiktive Beispielprojekt laden. Es werden keine echten Unterlagen hochgeladen und keine KI-Aufrufe ausgeführt.

## Produktionsgrundlage einrichten

Die vollständige Schrittfolge steht in [`docs/SETUP_SCHRITT_FUER_SCHRITT.md`](docs/SETUP_SCHRITT_FUER_SCHRITT.md). Wesentliche Schritte:

1. Privates GitHub-Repository anlegen und den Quellcode ohne Secrets pushen.
2. Supabase-Projekt in bewusst gewählter Region erstellen, SQL-Migrationen anwenden und Functions deployen.
3. Server-Secrets für KI und gegebenenfalls E-Mail-Import konfigurieren.
4. Cloudflare Pages mit GitHub verbinden und nur öffentliche Frontendvariablen eintragen.
5. Zuerst mit synthetischen Unterlagen testen; erst danach anonymisierte echte Unterlagen nutzen.

## Dokumentation

| Datei | Inhalt |
|---|---|
| `docs/SETUP_SCHRITT_FUER_SCHRITT.md` | Einsteiger-Einrichtung für GitHub, Supabase und Cloudflare |
| `docs/MARKT_UND_WETTBEWERB.md` | Recherchegrundlage und Produktpositionierung |
| `docs/ARCHITEKTUR.md` | Komponenten, Datenfluss und Datenmodell |
| `docs/SICHERHEIT_UND_DSGVO.md` | Sicherheitsmaßnahmen und Betreiberprüfungen |
| `docs/KI_UND_QUALITAETSSICHERUNG.md` | KI-Schema, Fundstellen und Grenzen |
| `docs/BENUTZERHANDBUCH.md` | Bedienung des MVP |
| `docs/BETRIEB_UND_KOSTEN.md` | Betrieb, Monitoring und variable Kosten |
| `docs/TESTPLAN.md` | Testumfang und Abnahmekriterien |
| `docs/ROADMAP.md` | Funktionsfähiger Stand und nächste Ausbauschritte |

## Produktgrenzen

TenderWerk Copilot ersetzt keine Rechtsberatung, Fachkalkulation, Unterschrift oder formelle Prüfung der Originalunterlagen. Die Anwendung sendet keine Angebote an Vergabestellen. Vor kommerziellem Einsatz müssen insbesondere Rechtstexte, Datenschutz-/AV-Verträge, Hostingregion, KI-Anbieterbedingungen, Preise, Marken-/Domainlage und die produktive Mandantentrennung extern beziehungsweise technisch abschließend geprüft werden.

## Lizenzhinweis

Der Code wird als Projektlieferung bereitgestellt. Drittanbieterbibliotheken unterliegen ihren jeweiligen Open-Source-Lizenzen. Einen geeigneten kommerziellen Lizenztext und Betreibervertrag vor Weitergabe an Kunden festlegen.
