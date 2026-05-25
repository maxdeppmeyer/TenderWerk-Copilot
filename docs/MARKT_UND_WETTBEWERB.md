# Markt- und Wettbewerbsrecherche: TenderWerk Copilot

**Recherchedatum:** 25.05.2026  
**Methodik:** Prüfung öffentlich zugänglicher offizieller Produktseiten und offizieller institutioneller Quellen. Aussagen zu Wettbewerbern geben deren öffentlich sichtbare Selbstdarstellung wieder; sie sind kein eigener Funktionstest und keine Bewertung der tatsächlichen Leistungsqualität.

## 1. Belegter Bedarf

Die Vergabestatistik des Statistischen Bundesamts weist für das Berichtsjahr 2024 **199.334 öffentliche Vergaben** mit einem Auftragsvolumen von **135,2 Mrd. Euro** aus. Der KOINNO-Vergabereport „Startups und KMU“ (05/2025) behandelt ausdrücklich die Themen Recherche nach öffentlichen Aufträgen, Eignungsnachweise, Leistungsbeschreibungen und Angebotserstellung. Die Befragung zeigt unter anderem, dass ein erheblicher Teil der befragten Unternehmen die Suche nach öffentlichen Ausschreibungen als aufwändiger als die Akquise vergleichbarer Aufträge empfindet.

**Primärquellen:**
- Destatis, Vergabestatistik: https://www.destatis.de/DE/Themen/Staat/Oeffentliche-Finanzen/Vergabestatistik/_inhalt.html
- KOINNO, Vergabereport Startups/KMU 05/2025: https://www.koinno.de/fileadmin/user_upload/publikationen/Vergabereport_Startups_KMU_05_2025.pdf

## 2. Marktbeobachtung

Bestehende Lösungen adressieren mehrere Teile des Vergabeprozesses: Marktrecherche und Bekanntmachungsmonitoring, Dokumentenfragen per KI, Extraktion von Fristen und Kriterien, Go-/No-Go-Hilfen, Angebotsantworten, LV-/GAEB-nahe Bearbeitung oder kollaboratives Bid Management. Für den gewählten MVP wird nicht behauptet, etablierte Sourcing-Datenbanken zu ersetzen. Die Produktlücke liegt in einem verständlichen, dokumentenzentrierten Arbeitsablauf für kleinere Betriebe, die bereits Unterlagen erhalten haben und schnell entscheiden müssen, ob eine Teilnahme sinnvoll und vorbereitbar ist.

## 3. Funktionsmatrix öffentlich sichtbarer Anbieterinformationen

| Anbieter | Öffentlich sichtbarer Fokus | Dokument/KI-Funktionen laut Anbieter | Relevanz für den MVP | Bewusste Abgrenzung von TenderWerk |
|---|---|---|---|---|
| DTAD | Ausschreibungsdatenbank, Monitoring, Marktinformationen | KI-Assistent zur Erstanalyse und Kriterienextraktion | Schnelle erste Sichtung und Kriterienstruktur | Keine Behauptung eigener umfassender Ausschreibungsdatenbank; Schwerpunkt auf hochgeladenen Projektunterlagen und Firmenabgleich |
| Deutsches Ausschreibungsblatt | Recherche und Bekanntmachungen | KI-Chat über Unterlagen, Go-/No-Go-Unterstützung, nächste Schritte | Entscheidungsunterstützung ist nachfragegerecht | Deterministische Bewertungsmatrix mit Fundstellen, Nachweisen und Kalkulation statt reiner Chat-Ausgabe |
| Vergabepilot.AI | Semantische Suche und Suchprofile | Multi-Dokument-Fragen, E-Mail-Hinweise, Aussagen zu Hosting/Trainingsnutzung | Dokumentkontext und Datenschutztransparenz | MVP startet beim sicheren Upload/E-Mail-Import, nicht bei Portalabdeckung |
| BidFix | Analyse und Angebotsunterstützung | Fristen, Kriterien, Leistungszusammenfassung, Risikohinweise | Analyse bis Arbeitsvorbereitung | Formulare werden im MVP nicht unkontrolliert automatisch befüllt; Freigabegate bleibt manuell |
| BlackSwanAI | KI-gestützte Ausschreibungsanalyse im DACH-Kontext | Risiko-/Entscheidungsunterstützung; GAEB-/VOB-Bezug laut Eigendarstellung | Baunahe Anforderungen und Risikostruktur | Erst nach getesteter Parserqualität wird tiefe GAEB-Unterstützung behauptet |
| Everwise | Analyse von Ausschreibungsdokumenten | Kriterien, Anforderungen und Fristen laut Produktbeschreibung | Strukturierte Extraktion | Quellenabdeckung, Nutzerbestätigung und organisationseigene Matrix stehen im Vordergrund |
| GAEB.ai | Bau-/Handwerksnähe, LV und Produktbezug | GAEB/PDF/Excel, LV-Positionen und Produktermittlung laut Anbieter | Positionsorientierte Arbeitsansicht | Gelieferter MVP kennzeichnet nicht vollständig ausgelesene Formate ehrlich; kein erfundener nativer GAEB-Vollparser |
| Loopio | RFP-/Response-Management | Wissens- und Antwortmanagement | Team-/Antwortbibliothek als spätere Erweiterung | Öffentliche deutsche Vergabeformalitäten und Unterlagenprüfung stehen zuerst im Fokus |
| Responsive | Response Management und Automatisierung | KI-Entwürfe und kollaborative Workflows | Teamfreigaben später ausbaubar | Kein Versprechen zur Automatisierung der Abgabe |
| Tendium | Öffentliche Tender finden und bearbeiten | Monitoring, Qualifizierung, Bid-Erstellung laut Anbieter | End-to-End-Vision | MVP beschränkt sich bewusst auf sichere Dokumentprüfung und Vorbereitung |
| Mercell | Plattform für Ausschreibungen | Chancen, Fristen und Dokumentverwaltung | Sourcing-/Portalperspektive | Keine Portal-/Sourcing-Reichweitenbehauptung im MVP |

### Geprüfte Anbieterquellen

- DTAD: https://www.dtad.com/de/
- Deutsches Ausschreibungsblatt: https://www.deutsches-ausschreibungsblatt.de/
- Vergabepilot.AI: https://www.vergabepilot.ai/
- BidFix: https://bidfix.ai/
- BlackSwanAI: https://blackswanai.de/
- Everwise: https://everwise.ai/
- GAEB.ai: https://gaeb.ai/
- Loopio: https://loopio.com/
- Responsive: https://www.responsive.io/
- Tendium: https://tendium.ai/
- Mercell: https://www.mercell.com/

## 4. Abgeleitete Produktentscheidungen

1. **Dokumente statt Sourcing-Reichweite:** Der MVP verarbeitet Unterlagen, die der Nutzer hochlädt oder über einen kontrollierten E-Mail-Eingang importiert. Eine breite Portaldatenbank ist kein MVP-Versprechen.
2. **Fundstellenpflicht:** Fristen, Nachweise, Risiken, Lose und Positionen werden nicht nur zusammengefasst, sondern mit Quellenbezug und Prüfstatus modelliert.
3. **Firmenbezogene Entscheidung:** Eine Ausschreibung wird gegen Leistungen, Ausschlüsse, Region, Kapazitäten und vorhandene Nachweise des Betriebs geprüft.
4. **Deterministisches Go-/No-Go:** Die Empfehlung basiert auf nachvollziehbaren Gewichtungen und harten Stopps; KI-Daten allein erzeugen keine irreversible Entscheidung.
5. **Kalkulationsvorbereitung statt Preisfiktion:** Preise, Stundensätze und Margen kommen aus Nutzerangaben; fehlende Preise werden sichtbar markiert.
6. **Freigabegate:** Kein automatischer Portalupload und kein autonomer Versand an Vergabestellen.
7. **Sichere Standards:** Private Buckets, RLS, serverseitige Secrets, Nutzungslimits und Auditdaten sind von Beginn an vorgesehen.

## 5. Was der gelieferte Stand besser als ein einfacher Dokumentenchat adressiert

Der gelieferte MVP-Demoflow enthält einen konkreten Unternehmensprofilabgleich, eine fundstellenorientierte Ergebnisansicht, eine deterministische Go-/No-Go-Logik, strukturierte Nachweise/Risiken/Lose, Kalkulations- und Checklistenansichten sowie einen manuellen Freigabeschritt. Er behauptet dagegen nicht, eine vollständige Rechercheplattform, Rechtsprüfung, native Vollverarbeitung aller LV-/GAEB-Formate oder automatisierte Einreichung zu liefern.

## 6. Namenshinweis

Eine orientierende Websuche nach „TenderWerk“ beziehungsweise „TenderWerk Copilot“ ergab zum Recherchezeitpunkt keinen offensichtlichen identischen Produktauftritt. Dies ersetzt **keine** Marken-, Firmen- oder Domainprüfung vor Veröffentlichung.
