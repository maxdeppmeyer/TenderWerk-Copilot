# KI und Qualitätssicherung

## Grundsatz

KI-Ausgaben sind Arbeitshilfen, keine Wahrheitsschicht. Kritische Angaben sollen mit Quelldatei, Locator, Ausschnitt, Konfidenz und Nutzerbestätigung gespeichert und angezeigt werden. Wo keine Fundstelle vorhanden ist, muss die Oberfläche „prüfen“ beziehungsweise „nicht gefunden“ anzeigen.

## Providerkonzept

Die serverseitige Function verwendet einen OpenAI-kompatiblen Adapter. Die Modellkonfiguration und der API-Schlüssel werden ausschließlich als Server-Secrets gesetzt. Die Fachlogik und das Datenschema sind vom konkreten Anbieter getrennt, sodass später ein anderer geeigneter Provider integriert werden kann.

Benötigte Secrets:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `ALLOWED_ORIGIN`

## Strukturierte Analyse

Das bereitgestellte Schema erwartet strukturierte Felder für:

- Projektzusammenfassung und Dokumentqualitätswarnungen.
- Klassifikation und Bearbeitungsmodus.
- Fristen und Termine.
- Lose.
- Nachweise/Anforderungen.
- Risiken/Prüfhinweise.
- Positionen.
- Unbekannte oder nicht belegte Angaben.
- Checklistenempfehlungen.

Die Edge Function validiert die Modellantwort per Zod, bevor sie weiterverarbeitet wird. Ungültige Strukturen führen zu einem Fehlerstatus statt zu still gespeicherten Freitextannahmen.

## Quellenbelege

Ein Beleg enthält:

- Quelldatei oder Dokument-ID.
- Locator, beispielsweise Seite, Abschnitt, Sheet/Zellenbereich oder Textabschnitt.
- kurzen Textausschnitt.
- Konfidenz (`hoch`, `mittel`, `niedrig`).
- Prüfstatus (`belegt`, `prüfen`, `bestätigt`, `abgelehnt`).

Im Demoprojekt wird dieses Prinzip sichtbar umgesetzt. In der produktiven Anbindung muss die vollständige Darstellung an die gespeicherten Datenbankeinträge gekoppelt und mit realen Parserergebnissen getestet werden.

## Prompt-Injection-Abwehr

Der Systemprompt der Analysefunktion weist das Modell ausdrücklich an, Dokumenttexte ausschließlich als Daten zu behandeln. Anweisungen innerhalb einer hochgeladenen Datei, die das Systemverhalten verändern, Secrets anfordern, Daten anderer Projekte abfragen oder Regeln umgehen wollen, sind zu ignorieren und als Sicherheitsflag zu melden. Zusätzlich darf die Function nur Dokumentchunks des autorisierten Projekts übermitteln.

## Go-/No-Go ohne KI-Entscheidungsillusion

Die KI kann Anforderungen und Konflikte vorschlagen. Die Empfehlung selbst wird in `src/lib/scoring.ts` deterministisch berechnet. Standardgewichtung:

| Dimension | Gewicht |
|---|---:|
| Leistungspassung | 25 |
| Nachweisfähigkeit | 20 |
| Region | 10 |
| Frist/Bearbeitbarkeit | 15 |
| Kapazität | 10 |
| Kalkulierbarkeit | 10 |
| Risiko/Formalia | 10 |

Harte Stopps werden nur auf Basis bestätigter beziehungsweise expliziter Konflikte gesetzt, zum Beispiel eine abgelaufene bestätigte Angebotsfrist oder eine im Profil ausgeschlossene zwingende Kernleistung im gewählten Los.

## Qualitätsfälle

Die Teststrategie enthält Fälle für:

- eindeutige Leistungspassung mit offenen Nachweisen;
- ausgewähltes, ausdrücklich ausgeschlossenes Los;
- unbekannte oder abgelaufene Frist;
- widersprüchliche Fristen;
- nicht auslesbare Dateien;
- ungültige KI-Schemaantwort;
- Kalkulationsrundung und unbepreiste Positionen.

## Nicht enthaltene Garantien

- Keine Rechtsprüfung und keine Garantie zur formalen Zulässigkeit.
- Keine automatische Portal- oder E-Mail-Abgabe.
- Keine automatischen Preise aus nicht bestätigten Quellen.
- Keine behauptete Vollunterstützung für Scan/OCR oder proprietäre GAEB-Formate im gelieferten Stand.
