import type { DataQuality, Recommendation, RequirementStatus, TenderStatus } from '../types/domain'

export const recommendationLabel: Record<Recommendation, string> = {
  go_recommended: 'Go empfohlen',
  go_after_review: 'Go nach Prüfung',
  manual_review: 'Manuelle Prüfung erforderlich',
  no_go_recommended: 'No-Go empfohlen'
}

export const statusLabel: Record<TenderStatus, string> = {
  eingegangen: 'Eingegangen', in_analyse: 'In Analyse', pruefung_noetig: 'Prüfung nötig',
  go_empfohlen: 'Go empfohlen', no_go_empfohlen: 'No-Go empfohlen', in_kalkulation: 'In Kalkulation',
  bereit_zur_freigabe: 'Bereit zur Freigabe', freigegeben: 'Freigegeben – manuelle Abgabe ausstehend',
  manuell_eingereicht: 'Manuell als eingereicht markiert', abgeschlossen: 'Abgeschlossen', archiviert: 'Archiviert'
}

export const dataQualityLabel: Record<DataQuality, string> = {
  gut_belegt: 'Gut belegt', teilweise_belegt: 'Teilweise belegt', unzureichende_unterlagen: 'Unterlagen unzureichend',
  widerspruechlich: 'Widersprüchliche Angaben', manuell_geprueft: 'Manuell geprüft'
}

export const requirementStatusLabel: Record<RequirementStatus, string> = {
  fehlt: 'Fehlt', vorhanden_ungeprueft: 'Vorhanden, ungeprüft', gueltig_bestaetigt: 'Gültig bestätigt',
  muss_aktualisiert_werden: 'Muss aktualisiert werden', nicht_zutreffend: 'Nicht zutreffend', manuell_pruefen: 'Manuell prüfen'
}
