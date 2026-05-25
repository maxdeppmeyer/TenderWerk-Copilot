# Einrichtung Schritt für Schritt

Diese Anleitung richtet sich an einen Betreiber ohne fertige technische Infrastruktur. Beginnen Sie ausschließlich mit den fiktiven Beispielunterlagen. Verwenden Sie erst nach Sicherheits- und Löschtests anonymisierte oder echte Unterlagen.

## 1. Was Sie benötigen

- GitHub-Account für das private Repository.
- Cloudflare-Account für das Frontend über Pages und optional den E-Mail-Worker.
- Supabase-Account für Authentifizierung, Datenbank, Storage und Edge Functions.
- Lokal installierte aktuelle Node.js-LTS-Version mit npm; für diesen Build wurde Node.js 22 vorgesehen.
- Optional: Git, GitHub Desktop und Supabase CLI.
- Für echte KI-Analyse: API-Schlüssel eines unterstützten OpenAI-kompatiblen KI-Anbieters. Cloudflare, GitHub und Supabase allein liefern für diese Implementierung keinen automatisch aktivierten Analyse-API-Schlüssel.
- Für E-Mail-Import: eine Domain, deren eingehende E-Mail-Routen in Cloudflare eingerichtet werden können.

**Kein Zahlungsanbieter ist für den MVP erforderlich.** Testzugänge und Kontingente werden administrativ verwaltet.

## 2. Erstprüfung im lokalen Demomodus

### 2.1 ZIP entpacken

1. ZIP-Datei in einen eigenen Ordner entpacken.
2. Prüfen, dass direkt im Ordner `package.json`, `src`, `supabase`, `workers`, `docs` und `samples` sichtbar sind.
3. Öffnen Sie ein Terminal in diesem Ordner.

### 2.2 Abhängigkeiten und lokale Umgebung

```bash
npm install
cp .env.example .env.local
npm run dev
```

Unter Windows kann `.env.example` im Explorer kopiert und in `.env.local` umbenannt werden. In `.env.local` bleibt zunächst:

```env
VITE_DEMO_MODE=true
VITE_SUPABASE_URL=<DEINE_SUPABASE_PROJECT_URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<DEIN_OEFFENTLICHER_SUPABASE_KEY>
VITE_APP_URL=http://localhost:5173
```

Im Demomodus sind URL und Key noch nicht aktiv erforderlich. Die Platzhalter dürfen bestehen bleiben.

### 2.3 Demoflow prüfen

1. Öffnen Sie die lokale Browseradresse, die im Terminal angezeigt wird, üblicherweise `http://localhost:5173`.
2. Wählen Sie **Demo öffnen**.
3. Nutzen Sie das vorausgefüllte Unternehmensprofil oder bearbeiten Sie es.
4. Laden Sie das synthetische Demoprojekt über die Dashboard-Aktion.
5. Prüfen Sie Projektübersicht, Fristen, Lose, Nachweise, Risiken, Positionen, Kalkulation, Checkliste und Freigabe.
6. Prüfen Sie, dass die App deutlich darauf hinweist, dass keine echte Einreichung erfolgt.

Im Demomodus werden Projektdaten nur im Browser gespeichert. Es werden keine echten Dateien zu Supabase übertragen und keine KI-Kosten ausgelöst.

## 3. Privates GitHub-Repository anlegen

### Variante A: Git im Terminal

1. Erstellen Sie bei GitHub ein **privates** leeres Repository, beispielsweise `tenderwerk-copilot`.
2. Prüfen Sie vor dem Upload die Datei `.gitignore`. Sie schließt lokale `.env`-Dateien und Builddaten aus.
3. Führen Sie im Projektordner aus:

```bash
git init
git add .
git commit -m "Initialer TenderWerk-Copilot-MVP"
git branch -M main
git remote add origin <DEINE_GITHUB_REPOSITORY_URL>
git push -u origin main
```

### Variante B: GitHub Desktop

1. Wählen Sie in GitHub Desktop **Add existing repository** beziehungsweise erstellen Sie ein Repository aus dem entpackten Ordner.
2. Stellen Sie sicher, dass `.env.local` nicht in der Dateiliste zum Commit erscheint.
3. Committen und veröffentlichen Sie das Repository als privat.

### Sicherheitsprüfung

Öffnen Sie nach dem Push bei GitHub die Dateiansicht. Dort dürfen keine Werte für `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `EMAIL_INGEST_SECRET` oder echte `.env.local`-Dateien auftauchen.

## 4. Supabase-Projekt erstellen

### 4.1 Neues Projekt

1. Erstellen Sie in Supabase ein neues Projekt.
2. Wählen Sie die Region bewusst. Für einen Betrieb mit deutschen/EU-Kunden ist eine geeignete EU-Region sowie die vertragliche/datenschutzrechtliche Einordnung vor Livebetrieb zu prüfen.
3. Bewahren Sie das Datenbankpasswort sicher außerhalb des Repositories auf.
4. Kopieren Sie aus den Projekteinstellungen:
   - die Projekt-URL für `VITE_SUPABASE_URL`;
   - den öffentlichen Publishable-/Anon-Key für `VITE_SUPABASE_PUBLISHABLE_KEY`.

**Nicht in das Frontend eintragen:** Service-Role-/Secret-Keys oder KI-Schlüssel.

### 4.2 Migrationen ausführen – empfohlener CLI-Weg

Installieren und authentifizieren Sie die Supabase CLI nach der aktuellen offiziellen Supabase-Dokumentation. Danach im Repository:

```bash
supabase login
supabase link --project-ref <DEIN_PROJECT_REF>
supabase db push
```

Die Migrationen liegen in `supabase/migrations/` und erstellen Tabellen, Rollenhilfen, Row Level Security, private Buckets, Policies, Freigabe- und Analysejob-Helfer.

### 4.3 Alternative: SQL Editor

Wenn Sie die CLI noch nicht einsetzen, öffnen Sie im Supabase-Dashboard den SQL Editor und führen Sie die drei Dateien in exakt dieser Reihenfolge aus:

1. `202605250001_initial_schema.sql`
2. `202605250002_admin_approval_helpers.sql`
3. `202605250003_jobs_email_storage_hardening.sql`

Speichern Sie keine Secretwerte im SQL-Verlauf, außer eine bewusst notwendige einmalige Adminzuweisung im eigenen Projekt.

### 4.4 Kontrollprüfung

Im Supabase-Dashboard prüfen:

- Die Anwendungstabellen sind vorhanden.
- RLS ist bei allen fachlichen Tabellen aktiviert.
- Die Buckets `tender-originals`, `tender-derived` und `organization-evidence` existieren und sind privat.
- Die Policies sind vorhanden und nicht als allgemeine Freigabe für alle angemeldeten Nutzer formuliert.

## 5. Authentifizierung konfigurieren

1. Öffnen Sie die Auth-Konfiguration Ihres Supabase-Projekts.
2. Setzen Sie für lokale Tests die erlaubte Redirect-Adresse `http://localhost:5173`.
3. Nach Cloudflare-Deployment ergänzen Sie die produktive Pages-Domain und gegebenenfalls Ihre eigene Domain.
4. Für erste Tests kann E-Mail/Passwort mit Verifikation genutzt werden. Für Kundenbetrieb richten Sie einen geeigneten SMTP-Dienst und korrekte E-Mail-Vorlagen ein und prüfen die datenschutzrechtliche Einordnung.

## 6. Edge Functions deployen und Server-Secrets setzen

### 6.1 Deploy

Aus dem Repository mit verlinktem Supabase-Projekt:

```bash
supabase functions deploy create-analysis-job
supabase functions deploy process-document
supabase functions deploy analyze-tender
supabase functions deploy email-ingest
supabase functions deploy export-report
supabase functions deploy admin-license
```

### 6.2 Secrets

Setzen Sie Secrets ausschließlich serverseitig. Beispielbefehle mit Platzhaltern:

```bash
supabase secrets set OPENAI_API_KEY=<DEIN_KI_API_KEY>
supabase secrets set OPENAI_MODEL=<DEIN_ANALYSEMODELL>
supabase secrets set ALLOWED_ORIGIN=<DEINE_PRODUKTIONS_URL>
supabase secrets set EMAIL_INGEST_SECRET=<SEHR_LANGES_ZUFAELLIGES_SECRET>
```

Der E-Mail-Wert wird nur benötigt, wenn Sie den E-Mail-Worker aktivieren.

### 6.3 Wichtige Parsergrenze

Die gelieferte serverseitige Function `process-document` verarbeitet im sicheren Grundstand TXT-, CSV- und XML-Inhalte. PDF, DOCX, XLSX, Scans und tiefere GAEB-Dateien erfordern vor einem echten Pilotbetrieb eine getestete Parser-/OCR-Erweiterung. Laden Sie keine vertraulichen Unterlagen hoch, solange diese Verarbeitung und die Mandantentrennung nicht geprüft wurden.

## 7. Betreiberaccount und Trialstatus

1. Stellen Sie `VITE_DEMO_MODE=false` erst ein, wenn Supabase konfiguriert ist.
2. Registrieren Sie Ihren Betreiberaccount in der App.
3. Legen Sie im Onboarding Ihre Testorganisation an.
4. Um den Account als Plattformadministrator zu kennzeichnen, tragen Sie im Supabase SQL Editor bewusst Ihre registrierte Auth-User-ID ein:

```sql
insert into public.platform_admins (user_id)
values ('<AUTH_USER_UUID>')
on conflict (user_id) do nothing;
```

5. Prüfen Sie, dass ein normaler zweiter Testnutzer die Adminfunktionen nicht ausführen kann.
6. Lizenzen und Kontingente können anschließend über die vorgesehene serverseitig geschützte Admin-Function verwaltet werden; bis zur vollständigen UI-Verdrahtung kann dies kontrolliert in der Datenbank/Testumgebung geprüft werden.

## 8. Cloudflare Pages aus GitHub deployen

Die offizielle Cloudflare-Pages-Dokumentation unterstützt den GitHub-Integrationsweg für Vite-Projekte mit dem Buildbefehl `npm run build` und dem Ausgabeverzeichnis `dist`.

1. Öffnen Sie in Cloudflare den Bereich **Workers & Pages** beziehungsweise den aktuell gleichwertigen Bereich.
2. Erstellen Sie eine Pages-Anwendung über **Import an existing Git repository**.
3. Wählen Sie Ihr privates GitHub-Repository und den Branch `main`.
4. Setzen Sie:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Fügen Sie als Pages-Umgebungsvariablen nur öffentliche Werte ein:

```env
VITE_DEMO_MODE=false
VITE_SUPABASE_URL=<DEINE_SUPABASE_PROJECT_URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<DEIN_OEFFENTLICHER_KEY>
VITE_APP_URL=<DEINE_CLOUDFLARE_PAGES_URL>
```

6. Deployen Sie und öffnen Sie die Pages-URL.
7. Tragen Sie diese URL in Supabase Auth als Site URL und erlaubte Redirect-URL ein.
8. Führen Sie Registrierung und Login zunächst mit fiktiven Daten durch.

**Niemals in Cloudflare Pages als Frontendvariable eintragen:** KI-Key, Service-Role-Key oder E-Mail-Ingest-Secret.

## 9. Optionale eigene Domain

1. Binden Sie die gewünschte Domain an das Cloudflare-Pages-Projekt.
2. Prüfen Sie HTTPS und Weiterleitungen.
3. Aktualisieren Sie `VITE_APP_URL`, Supabase Auth Site URL und Redirect-URLs.
4. Prüfen Sie vor öffentlicher Nutzung den Produktnamen sowie Impressums- und Datenschutzangaben.

## 10. Optionaler E-Mail-Eingang über Cloudflare Email Worker

Der Uploadpfad ist der Kern des MVP. Der Email Worker ist ein Zusatzmodul und erfordert eine in Cloudflare nutzbare Domain sowie Email Routing.

### 10.1 Voraussetzungen

- Domain in Cloudflare verwaltet oder entsprechend angebunden.
- Email Routing in Cloudflare eingerichtet.
- Edge Function `email-ingest` deployed.
- Gleiches langes zufälliges `EMAIL_INGEST_SECRET` als Supabase Function Secret und Cloudflare Worker Secret.

### 10.2 Worker bereitstellen

```bash
cd workers/email-ingest
npm install
npx wrangler secret put EMAIL_INGEST_SECRET
npx wrangler deploy
```

Setzen Sie in der Worker-Konfiguration den Endpoint auf die URL Ihrer `email-ingest` Function. Secretwerte gehören nicht in `wrangler.jsonc`.

### 10.3 Importtoken anlegen

Für jede Testorganisation wird ein zufälliger Importtoken erzeugt. Speichern Sie nur seinen SHA-256-Hash in `organization_import_tokens`; die Mailadresse verwendet den unverschlüsselten Token im lokalen Teil, beispielsweise `eingang+<token>@ihre-domain.de`. Verwenden Sie lange, nicht erratbare Token. Die genaue Administrationsoberfläche für Tokenrotation ist im MVP noch als Betreiberaufgabe zu behandeln.

### 10.4 E-Mail testen

1. Senden Sie ausschließlich eine fiktive Testmail mit TXT/CSV/XML-Anhang an die Importadresse.
2. Prüfen Sie, dass ein Projekt mit Herkunft E-Mail angelegt und die Datei privat gespeichert wurde.
3. Senden Sie eine Mail mit ungültigem Token und prüfen Sie, dass keine Zuordnung zu einer Organisation erfolgt.
4. Automatische KI-Analyse nach E-Mail-Import ist standardmäßig nicht vorgesehen; Nutzer starten die Prüfung bewusst.

## 11. RLS- und Sicherheitstest vor echten Daten

Erstellen Sie zwei Testorganisationen A und B. Prüfen Sie mit den jeweiligen Nutzern:

- A kann Projekt A anlegen und sehen.
- B kann die Projekt-ID von A nicht lesen oder aktualisieren.
- B kann keinen privaten Storage-Pfad von A öffnen oder signieren.
- Ein Viewer kann nicht freigeben oder Kalkulationen ändern.
- Ein Editor kann nicht eigenmächtig Plattformadmin werden.
- Ein Freigabeereignis erzeugt einen Auditdatensatz.

Erst nach erfolgreichem Ergebnis dürfen anonymisierte, später gegebenenfalls reale Unterlagen verarbeitet werden.

## 12. Qualität prüfen

Lokal im Repository:

```bash
npm run lint
npm run test
npm run build
```

Cloud-Tests nach Deployment:

- Registrierung und Login.
- Onboarding und private Projektanlage.
- Storagezugriff und RLS mit zwei Organisationen.
- Function-Fehlerfall ohne KI-Key.
- Analysis-Flow mit fiktiven TXT/CSV/XML-Unterlagen nach KI-Konfiguration.
- Export- und Freigabeprozess.
- Optionaler E-Mail-Import mit gültigem und ungültigem Token.

## 13. Vor Liveverkauf manuell erforderlich

- Vollständige produktive UI-Persistenz und Parser-/Extraktionspipeline für die tatsächlich akzeptierten Kundenformate fertigstellen und testen.
- Rechtstexte und Vertrags-/Preisgestaltung final prüfen lassen.
- Marken- und Domainprüfung für den Produktnamen durchführen.
- Regionen, AV-Verträge, KI-Anbieterbedingungen, Speicher-/Löschkonzept und Backups prüfen.
- SMTP/E-Mailversand und E-Mail-Importbedingungen prüfen, falls genutzt.
- Paymentanbieter erst nach eigener Entscheidung integrieren.
- Keine automatische Vergabeportalabgabe aktivieren; die abschließende Einreichung bleibt menschlich verantwortet.

## 14. Offizielle Dokumentationen zur Kontrolle aktueller Oberflächen

- Cloudflare Pages / Vite: https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/
- Cloudflare Pages Git Integration: https://developers.cloudflare.com/pages/configuration/git-integration/
- Cloudflare Email Workers: https://developers.cloudflare.com/email-routing/email-workers/
- Supabase Dokumentation: https://supabase.com/docs
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
