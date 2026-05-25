# Testplan und Abnahme

## Automatisierte lokale Tests

Die folgenden Befehle sind für den Build vorgesehen:

```bash
npm run lint
npm run test
npm run build
```

| Testbereich | Enthaltene Fälle |
|---|---|
| Go-/No-Go | Demofall, ausgeschlossene Kernleistung, unbekannte Frist, abgelaufene Frist |
| Kalkulation | Positionssummen, Zuschläge, Gesamtberechnung und Rundung |
| Fristen | Dringlichkeit und Konfliktprüfung |
| Uploadvalidierung | erlaubte Typen, ungültiger Typ, sicherer Dateiname und unsicherer ZIP-Pfad |
| KI-Schema | valide strukturierte Antwort und ungültige Antwort ohne Belege |
| UI | zentrale Statusanzeige |

Die tatsächlichen Ausführungsergebnisse sind in der Übergabenachricht beziehungsweise nach einem erneuten Build zu dokumentieren.

## Fachliche manuelle Demoabnahme

1. App im Demomodus öffnen.
2. Profil „MusterGlanz Facility GmbH“ prüfen.
3. Fiktives Reinigungsvorhaben laden.
4. Los 1 als grundsätzlich passend und Los 2 als Konflikt wegen ausgeschlossener Bewachungsleistung nachvollziehen.
5. Fristen- und Nachweisfundstellen anzeigen.
6. Kalkulationswerte ändern und Summen prüfen.
7. Checklistenpunkte bearbeiten.
8. Interne Freigabe auslösen und bestätigen, dass kein Versand erfolgt.
9. Bericht drucken beziehungsweise als PDF über die Browserdruckfunktion sichern.

## Erforderliche Cloud-/RLS-Tests vor echten Unterlagen

Diese Tests können erst nach einem Betreiberdeployment mit zwei eigenen Testkonten ausgeführt werden:

| Test | Erwartung |
|---|---|
| Organisation A liest eigenes Projekt | Zugriff erlaubt |
| Organisation B liest Projekt-ID von A | Zugriff abgelehnt |
| Organisation B lädt Storage-Datei von A | Zugriff abgelehnt |
| Viewer bearbeitet Kalkulation/freigibt | Zugriff abgelehnt |
| Owner/Approver gibt frei | Audit-Eintrag entsteht |
| Normalnutzer ändert Lizenz | Zugriff abgelehnt |
| Function-Aufruf ohne KI-Secret | Klarer Konfigurationsfehler, keine Scheinanalyse |
| E-Mail mit falschem Token | Quarantäne/keine Mandantenzuordnung |

**Blocker:** Wenn der RLS-/Storage-Test zwischen zwei Organisationen fehlschlägt, darf die Anwendung nicht mit echten Kundendaten genutzt werden.

## Format- und Parserabnahme

| Format | Gelieferter Stand | Vor Pilotbetrieb erforderlich |
|---|---|---|
| TXT | serverseitige Basistextextraktion vorgesehen | Livefunction mit Beispieldatei prüfen |
| CSV | serverseitige Basistextextraktion vorgesehen | Zeichensatz/Spaltenprüfung |
| XML | serverseitige Textbasis vorgesehen | relevante LV-Struktur mit Tests erweitern |
| PDF | Upload/Status, keine behauptete Volltextpipeline | durchsuchbare PDF-Extraktion testen/implementieren |
| DOCX/XLSX | Upload/Status, keine behauptete Volltextpipeline | robuste Parser und Zell-/Abschnittsfundstellen ergänzen |
| ZIP | Frontendvalidierung und sichere Pfadregeltestung | serverseitige kontrollierte Entpackpipeline fertigstellen |
| Scan/OCR | nicht enthalten | Anbieter-, Kosten- und Datenschutzentscheidung |
| GAEB tief | nicht enthalten | native Parser-/Beispieldateitests |

## Ausführungsergebnis dieser Lieferung – 25.05.2026

| Prüfung | Ergebnis |
|---|---|
| `npm install --no-fund --no-audit` | erfolgreich; Lockfile erzeugt |
| `npm run lint` | erfolgreich; keine ESLint-Befunde |
| `npm run test` | erfolgreich; 6 Testdateien / 15 Tests bestanden |
| `npm run build` | erfolgreich; Vite-Produktionsbuild erzeugt |
| `npx wrangler deploy --dry-run` im E-Mail-Worker | erfolgreich; Worker-Bundle erzeugt, kein echtes Deployment |
| `npm audit --audit-level=high --omit=dev` (Root und Worker) | erfolgreich; keine Vulnerabilities in Produktionsabhängigkeiten gemeldet |

Nicht ausgeführt, weil keine Betreiberzugangsdaten oder Cloudprojekte bereitgestellt wurden: Migrationen in einem realen Supabase-Projekt, RLS-Test mit zwei echten Authkonten, Edge-Function-Deployment, Pages-Deployment, E-Mail-Routing und KI-Liveanalyse. Diese Prüfungen bleiben zwingende Schritte vor echten Unterlagen.
