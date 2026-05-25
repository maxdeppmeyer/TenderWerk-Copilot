# Sicherheit und Datenschutz-Grundlage

Dieses Dokument beschreibt technische Maßnahmen und Betreiberprüfungen. Es ist keine Rechtsberatung und ersetzt keine externe Prüfung vor einem Livebetrieb.

## Schutzbedarf

Ausschreibungsunterlagen können Preise, interne Kalkulationen, Kontaktdaten, Vertragsbedingungen und Nachweise enthalten. Daher gilt im Projekt der sichere Standard: private Speicherung, Mandantentrennung, serverseitige Secrets, keine automatische Abgabe und keine ungeprüfte Veröffentlichung.

## Technische Maßnahmen im Repository

- Private Supabase Storage-Buckets mit organisationsbezogenen Pfaden.
- Row Level Security auf den fachlichen Tabellen; normale Nutzerzugriffe sind an aktive Organisationsmitgliedschaften gekoppelt.
- Rollenprüfung für Freigabe und Administration.
- KI-API-Schlüssel ausschließlich als Secret in Supabase Edge Functions.
- E-Mail-Ingest nur über Worker Secret und gehashten Importtoken.
- Uploadvalidierung im Frontend; serverseitige Verarbeitung muss im Produktivbetrieb die Prüfung zusätzlich erzwingen.
- Dateinamenbereinigung und vorgesehene Grenzen für Datei- und Projektgrößen.
- Getrennte Originalunterlagen und abgeleitete Ergebnisse.
- Auditdaten für Freigaben, Analyse- und Lizenzaktionen.
- Content Security Policy und grundlegende Sicherheitsheader für die Pages-Auslieferung.
- Keine Analyse- oder Trackingdienste im Standardfrontend.

## Secrets und Konfiguration

| Wert | Ort | Darf im Frontend erscheinen? |
|---|---|---:|
| `VITE_SUPABASE_URL` | Cloudflare Pages / `.env.local` | Ja, öffentlich vorgesehen |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Cloudflare Pages / `.env.local` | Ja, nur mit korrekter RLS |
| `OPENAI_API_KEY` | Supabase Function Secret | Nein |
| `OPENAI_MODEL` | Supabase Function Secret | Nein |
| `SUPABASE_SERVICE_ROLE_KEY` | Automatisch/Function-Kontext oder Serversecret | Nein |
| `EMAIL_INGEST_SECRET` | Supabase Function Secret und Cloudflare Worker Secret | Nein |

Keine Secretwerte in GitHub, Screenshots, Frontend-Variablen mit `VITE_` oder Supportexports eintragen.

## Policy-Matrix

| Ressource | Datenart | Zulässige Nutzeraktionen | Zusätzliche Prüfung vor Livebetrieb |
|---|---|---|---|
| `organizations` / Mitglieder | Mandanten- und Rollendaten | Mitglieder lesen; Owner/Admin verwalten gemäß Policy | Rollentests mit zwei Organisationen |
| `company_capabilities` | Leistungsprofil | Organisationsmitglieder gemäß Rolle | Update-/Leserechte prüfen |
| `tenders` | Projektdaten | Mitglieder projektspezifisch; Löschung restriktiv | ID-Manipulationstest |
| `tender_files` / `document_chunks` | Datei- und Extraktionsdaten | Nur Mitglieder; Verarbeitung über Functions | Signierte Downloadwege und Textzugriff prüfen |
| `deadlines`, `requirements`, `risks`, `lots`, `line_items` | Analyseergebnisse | Mitglieder; kritische Änderungen protokollieren | Nutzerbestätigung und Herkunft testen |
| `calculation_items` | vertrauliche Kalkulation | Bearbeiter/Admin/Freigeber | Viewer darf nicht schreiben |
| `audit_logs` | Nachweis kritischer Aktionen | Lesbar nach Rolle, nicht normal überschreibbar | Unveränderbarkeit prüfen |
| `licenses`, `usage_events` | Nutzung und Lizenz | organisationsbezogene Anzeige; Änderung nur Plattformadmin | Admin-Bypass testen |
| `tender-originals` | Originaldokumente | private Pfade; berechtigte Mitglieder | Nutzer B kann Datei A nicht signieren/lesen |
| `tender-derived` | Exporte/Arbeitsdateien | private Pfade | Trennung von Originalen prüfen |
| `organization-evidence` | Firmennachweise | private Pfade | Ablaufdaten/Downloads prüfen |

## Pflichtprüfungen mit zwei Testorganisationen

Vor einem Pilotbetrieb zwei Testnutzer und zwei Organisationen anlegen und mindestens prüfen:

1. Nutzer A kann eigenes Projekt, Dokumentmetadaten und Dateien sehen.
2. Nutzer B kann selbst bei Kenntnis einer Projekt-ID oder eines Storage-Pfades keine Daten von A lesen, ändern oder signierte Links erzeugen.
3. Ein `viewer` kann keine Kalkulation ändern und nicht freigeben.
4. Ein `editor` kann bearbeiten, aber keine finale Freigabe durchführen.
5. `approver`, `admin` oder `owner` erzeugen bei Freigabe ein Auditereignis.
6. Ein normaler Nutzer kann seine Lizenz nicht selbst erhöhen und sich nicht zum Plattformadmin machen.

Ein fehlgeschlagener Mandantentrennungstest ist ein Blocker für echte Kundendaten.

## KI-Verarbeitung

Die Functions sind darauf ausgelegt, nur notwendige extrahierte Texte an einen konfigurierten KI-Anbieter zu übermitteln. Der Betreiber muss vor Nutzung mit echten Daten klären:

- Anbieter, Region und Datenverarbeitungsbedingungen.
- Auftragsverarbeitungsvereinbarung beziehungsweise erforderliche Verträge.
- Ob Inhalte für Training verwendet werden und wie dies ausgeschlossen werden kann.
- Kostenlimits, Log-Aufbewahrung und Löschfristen.
- Umgang mit personenbezogenen Daten und Geschäftsgeheimnissen.

## Datenschutz-/Rechtscheck vor Liveverkauf

Vor Kundenbetrieb sind mindestens final zu prüfen und auszufüllen:

- Impressum, Datenschutzerklärung, AGB/Vertrag und Preisangaben.
- Produktname, Marke und Domain.
- Supabase-/Cloudflare-/KI-Anbieter-Verträge, Regionen und Unterauftragsverarbeiter.
- Speicher- und Löschkonzept sowie Backups.
- E-Mail-Eingang, SMTP beziehungsweise Benachrichtigungen.
- Umgang mit realen Vergabeunterlagen, Nachweisen und Kalkulationen.
- Haftungshinweise zur KI-Unterstützung und zur weiterhin manuellen Angebotsabgabe.

## Bewusste Grenzen des gelieferten MVP

Die App garantiert keine Rechtssicherheit, Vollständigkeit oder erfolgreiche Abgabe. Sie sendet keine Angebote. Die serverseitige Dokumentextraktion ist im gelieferten Stand auf TXT/CSV/XML als sichere Basis beschränkt; nicht verlässlich ausgelesene Dateien werden nicht als analysiert ausgegeben.
