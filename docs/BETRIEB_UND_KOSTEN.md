# Betrieb und Kostenkontrolle

## Laufende Komponenten

| Komponente | Aufgabe | Betreiberverantwortung |
|---|---|---|
| GitHub | Versionsverwaltung und CI | Privates Repository, Secretprüfung, Branch-/Security-Einstellungen |
| Cloudflare Pages | Frontend-Hosting aus GitHub | Buildvariablen, Domain, Deployments |
| Supabase Auth/Postgres/Storage | Benutzer, Mandantendaten, private Dokumente | Region, Policies, Backups, Migrationen |
| Supabase Edge Functions | KI-/Import-/Admin-Endpunkte | Secrets, Logs, Limits, Function-Deployments |
| Cloudflare Email Worker optional | Eingangsmails an Function weiterreichen | Domain, Routing, Worker Secret, Missbrauchsschutz |
| KI-Anbieter | Strukturierte Analyse extrahierter Dokumenttexte | API-Key, Vertrags-/Datenschutzprüfung, Kostenlimits |

## Variable Kostenquellen

Aktuelle Preise sind tarif- und zeitabhängig und vor Betrieb direkt bei den Plattformen zu prüfen. Relevant sind:

- Supabase Plan, Datenbank, Storage, Egress und Function-Ausführungen.
- Cloudflare Pages/Workers/Email-Routing-Nutzung und eigene Domain.
- KI-Aufrufe nach Dokumentumfang, Tokenverbrauch, Wiederholungen und später gegebenenfalls OCR/Vision.
- Eigener E-Mail-/SMTP-Dienst für Produkt-E-Mails.
- Später ein Zahlungsanbieter, falls Abonnements automatisiert werden.

## Kostenbegrenzung im Produktkonzept

- Organisationen besitzen einen Lizenzstatus und ein Analysekontingent.
- `reserve_analysis_job` prüft die Berechtigung serverseitig, bevor eine Analyse beginnt.
- `usage_events` sind für Nutzung, Fehler und spätere Kostenkontrolle vorgesehen.
- E-Mail-Import startet im sicheren Standard keine automatische KI-Analyse.
- Große/nicht verarbeitbare Dateien führen nicht still zu wiederholten Analyseaufrufen.

## Monitoring und Fehlerdiagnose

Der Betreiber sollte in Staging und Produktion kontrollieren:

- Supabase Function Logs für fehlgeschlagene Jobs und Importfehler.
- `analysis_jobs`, `analysis_runs` und `usage_events` für Status und Verbrauch.
- `email_imports` für importierte beziehungsweise quarantänisierte Nachrichten.
- Cloudflare Worker Logs für Routing-/Attachment-Fehler.
- GitHub Actions für Lint-/Test-/Buildfehler.

Der Nutzer soll bei Fehlern nur sichere Fehlermeldungen und eine Projekt-/Jobreferenz erhalten, nicht Secrets oder komplette vertrauliche Dokumenttexte.

## Staging und Deployment

Für ernsthafte Tests empfiehlt sich ein eigenes Supabase-Stagingprojekt. Frontend-Preview-Deployments dürfen nicht unbeabsichtigt auf produktive Kundendaten zeigen. Änderungen an Migrationen zunächst in Staging ausführen, Sicherheitstests wiederholen und erst danach in Produktion anwenden.

## Backups, Löschung und Aufbewahrung

Supabase-Backupmöglichkeiten hängen vom gewählten Tarif ab und müssen vor Kundenbetrieb geprüft werden. Die Anwendung sieht private Speicherung und Projektlöschung als fachliches Ziel vor; eine verbindliche Aufbewahrungsregel kann nicht allgemein automatisch festgelegt werden. Der Betreiber muss klären, wie lange Originalunterlagen, Nachweise, Auditdaten und Exporte gespeichert werden müssen beziehungsweise dürfen.

## Runbook häufiger Fehler

| Problem | Prüfung | Sichere nächste Aktion |
|---|---|---|
| Login funktioniert nicht | Auth Redirect-URL und E-Mail-Verifikation | Auth-Konfiguration korrigieren; keine RLS deaktivieren |
| Analyse startet nicht | KI-Secret, Kontingent, Function Logs | Secret/Quota prüfen; fiktiven Test erneut ausführen |
| Datei nicht auslesbar | Parserstatus | Datei manuell prüfen oder getesteten Parser/OCR ergänzen |
| Zugriff verweigert | Mitgliedschaft/RLS | Rolle/Policy in Staging prüfen; keine pauschale Freigabe setzen |
| E-Mail fehlt | Route, Worker Logs, Importtoken | Mit synthetischer Mail und gültigem Token testen |
| Export fehlt | Analyse-/RLS-Daten | sicheren Berichtspfad prüfen; keine Originaldateien verändern |
