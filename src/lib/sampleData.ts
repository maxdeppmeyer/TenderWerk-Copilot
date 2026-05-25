import { evaluateTender } from './scoring'
import type { CompanyProfile, License, SessionUser, Tender } from '../types/domain'

const inDays = (days: number, hour = 10) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

export const demoUser: SessionUser = { id: 'demo-user', email: 'demo@tenderwerk.test', name: 'Max Mustermann', role: 'owner', platformAdmin: true }
export const demoLicense: License = { status: 'trial', analysesRemaining: 2, periodLabel: 'Testzugang' }
export const defaultProfile: CompanyProfile = {
  id: 'profile-demo', organizationName: 'MusterGlanz Facility GmbH', location: 'Hannover', radiusKm: 40,
  regions: ['Hannover', 'Isernhagen', 'Langenhagen'], categories: ['Reinigung', 'Facility Management'],
  services: ['Unterhaltsreinigung', 'Glasreinigung', 'Hausmeisterservice'], exclusions: ['Bewachungsleistung', 'Elektroinstallation'],
  employeesBand: '11–50 Mitarbeitende', vehiclesAndEquipment: ['2 Transporter', 'Reinigungsmaschinen'], maxParallelProjects: 3,
  hourlyRate: 34.5, travelCostPerKm: 0.62, materialMarkupPercent: 8, riskMarkupPercent: 4, targetMarginPercent: 12, vatPercent: 19,
  profileTemplate: 'Reinigung & Facility', completed: true
}

const evidence = (id: string, fileName: string, locator: string, excerpt: string, confidence: 'hoch' | 'mittel' | 'niedrig' = 'hoch') => ({ id, fileName, locator, excerpt, confidence, verification: 'belegt' as const })

export const createDemoTender = (profile = defaultProfile): Tender => {
  const core = {
    id: 'tw-demo-001', title: 'Unterhaltsreinigung Verwaltungszentrum Musterstadt', contractingAuthority: 'Fiktive Vergabestelle Musterstadt', source: 'Demoprojekt',
    createdAt: new Date().toISOString(), status: 'pruefung_noetig' as const, dataQuality: 'teilweise_belegt' as const,
    summary: 'Fiktive Ausschreibung für Unterhaltsreinigung und ergänzenden Schließdienst an zwei Standorten. Los 1 passt grundsätzlich zum hinterlegten Leistungsprofil; Los 2 erfordert eine ausgeschlossene Leistung.',
    location: 'Hannover-Mitte', category: 'Reinigung und Facility Management', processingMode: 'cleaning_calculation', analysisVersion: 1,
    files: [
      { id: 'f1', name: '01_Bekanntmachung_Musterstadt.pdf', type: 'PDF', size: 421400, uploadedAt: new Date().toISOString(), status: 'extracted' as const, role: 'Bekanntmachung', origin: 'original' as const },
      { id: 'f2', name: '02_Leistungsverzeichnis_Reinigung.xlsx', type: 'XLSX', size: 88201, uploadedAt: new Date().toISOString(), status: 'extracted' as const, role: 'Leistungsverzeichnis', origin: 'original' as const },
      { id: 'f3', name: '03_Nachweise_und_Formblaetter.docx', type: 'DOCX', size: 54090, uploadedAt: new Date().toISOString(), status: 'extracted' as const, role: 'Nachweisanforderungen', origin: 'original' as const },
      { id: 'f4', name: 'anlage_scan_besichtigung.pdf', type: 'PDF', size: 1300188, uploadedAt: new Date().toISOString(), status: 'requires_ocr' as const, role: 'Anlage', warning: 'Scan/OCR erforderlich – Inhalt nicht vollständig automatisch bewertet.', origin: 'original' as const }
    ],
    deadlines: [
      { id: 'd1', type: 'Angebotsfrist', value: inDays(12), originalText: 'Angebote sind bis zum genannten Termin um 10:00 Uhr elektronisch einzureichen.', critical: true, conflict: false, confirmed: true, evidence: [evidence('e1', '01_Bekanntmachung_Musterstadt.pdf', 'Seite 2, Abschnitt 4', 'Angebotsfrist: [Demodatum], 10:00 Uhr; Übermittlung über das Vergabeportal.')] },
      { id: 'd2', type: 'Ortsbesichtigung', value: inDays(5, 9), originalText: 'Eine verpflichtende Ortsbesichtigung ist vor Angebotsabgabe durchzuführen.', critical: true, conflict: false, confirmed: false, evidence: [evidence('e2', '03_Nachweise_und_Formblaetter.docx', 'Abschnitt 2', 'Verpflichtende Ortsbesichtigung vor Einreichung des Angebots.', 'mittel')] },
      { id: 'd3', type: 'Bindefrist', value: inDays(42), originalText: 'Der Bieter bleibt bis zum Ablauf der Bindefrist gebunden.', critical: false, conflict: false, confirmed: false, evidence: [evidence('e3', '01_Bekanntmachung_Musterstadt.pdf', 'Seite 3', 'Bindefrist endet 30 Tage nach Angebotsfrist.')] }
    ],
    lots: [
      { id: 'lot1', label: 'Los 1', title: 'Unterhaltsreinigung Verwaltungsgebäude', description: 'Regelmäßige Unterhaltsreinigung im Verwaltungszentrum.', selection: 'anbieten' as const, recommendation: 'go_after_review' as const, requiredServices: ['Unterhaltsreinigung'], evidence: [evidence('e4', '02_Leistungsverzeichnis_Reinigung.xlsx', 'Tabellenblatt Los 1', 'Unterhaltsreinigung Büroräume, Flure und Sanitärbereiche.')] },
      { id: 'lot2', label: 'Los 2', title: 'Schließ- und Bewachungsdienst', description: 'Kontrollgänge und Schließdienst außerhalb der Öffnungszeiten.', selection: 'nicht_anbieten' as const, recommendation: 'no_go_recommended' as const, requiredServices: ['Bewachungsleistung'], evidence: [evidence('e5', '01_Bekanntmachung_Musterstadt.pdf', 'Seite 4', 'Los 2 umfasst Bewachungs- und Schließdienste.')] }
    ],
    requirements: [
      { id: 'r1', name: 'Betriebshaftpflichtversicherung', category: 'Versicherung', mandatory: true, dueMoment: 'mit Angebot', status: 'gueltig_bestaetigt' as const, linkedDocument: 'Haftpflicht_2026.pdf', evidence: [evidence('e6', '03_Nachweise_und_Formblaetter.docx', 'Abschnitt 1.2', 'Nachweis einer gültigen Betriebshaftpflicht ist mit dem Angebot vorzulegen.')] },
      { id: 'r2', name: 'Referenzliste Gebäudereinigung', category: 'Referenzen', mandatory: true, dueMoment: 'mit Angebot', status: 'fehlt' as const, evidence: [evidence('e7', '03_Nachweise_und_Formblaetter.docx', 'Abschnitt 1.4', 'Mindestens drei vergleichbare Referenzen der letzten drei Jahre.')] },
      { id: 'r3', name: 'Tariftreueerklärung', category: 'Eigenerklärung', mandatory: true, dueMoment: 'mit Angebot', status: 'vorhanden_ungeprueft' as const, evidence: [evidence('e8', '03_Nachweise_und_Formblaetter.docx', 'Formblatt F-03', 'Die beigefügte Tariftreueerklärung ist ausgefüllt einzureichen.')] }
    ],
    risks: [
      { id: 'risk1', category: 'Formalia', severity: 'hoch' as const, description: 'Verpflichtende Ortsbesichtigung ist noch nicht bestätigt.', action: 'Termin prüfen, Teilnahme dokumentieren und Fundstelle bestätigen.', status: 'offen' as const, evidence: [evidence('e9', '03_Nachweise_und_Formblaetter.docx', 'Abschnitt 2', 'Ohne Teilnahme an der Ortsbesichtigung kann das Angebot ausgeschlossen werden.', 'mittel')] },
      { id: 'risk2', category: 'Dokumentenqualität', severity: 'mittel' as const, description: 'Eine Anlage liegt nur als nicht auslesbarer Scan vor.', action: 'Scan manuell prüfen oder OCR nach Betreiberfreigabe aktivieren.', status: 'offen' as const, evidence: [] }
    ],
    lineItems: [
      { id: 'li1', lotId: 'lot1', number: '1.1', shortText: 'Büroräume reinigen', longText: 'Unterhaltsreinigung Büroräume nach Leistungsbeschreibung, werktäglich.', quantity: 3200, unit: 'm²/Monat', costType: 'Personal', workHoursPerUnit: 0.008, hourlyRate: profile.hourlyRate, materialCostPerUnit: 0.02, equipmentCostPerUnit: 0.01, externalCostPerUnit: 0, overheadPercent: 10, riskPercent: profile.riskMarkupPercent, marginPercent: profile.targetMarginPercent, confirmed: true, evidence: [evidence('e10', '02_Leistungsverzeichnis_Reinigung.xlsx', 'Los 1!B8:H8', 'Pos. 1.1 – Büroräume – 3.200 m²/Monat')] },
      { id: 'li2', lotId: 'lot1', number: '1.2', shortText: 'Sanitärbereiche reinigen', longText: 'Reinigung und Verbrauchsmaterialkontrolle der Sanitärbereiche.', quantity: 420, unit: 'm²/Monat', costType: 'Personal', workHoursPerUnit: 0.018, hourlyRate: profile.hourlyRate, materialCostPerUnit: 0.06, equipmentCostPerUnit: 0.02, externalCostPerUnit: 0, overheadPercent: 10, riskPercent: profile.riskMarkupPercent, marginPercent: profile.targetMarginPercent, confirmed: true, evidence: [evidence('e11', '02_Leistungsverzeichnis_Reinigung.xlsx', 'Los 1!B9:H9', 'Pos. 1.2 – Sanitärbereiche – 420 m²/Monat')] },
      { id: 'li3', lotId: 'lot1', number: '1.3', shortText: 'Sonderreinigung nach Abruf', longText: 'Optionale Sonderreinigung; Häufigkeit und tatsächliche Fläche sind vor Preisfreigabe zu klären.', quantity: 1, unit: 'Pauschale', costType: 'Pauschal', workHoursPerUnit: 0, hourlyRate: profile.hourlyRate, materialCostPerUnit: 0, equipmentCostPerUnit: 0, externalCostPerUnit: 0, overheadPercent: 10, riskPercent: profile.riskMarkupPercent, marginPercent: profile.targetMarginPercent, confirmed: false, evidence: [evidence('e12', '02_Leistungsverzeichnis_Reinigung.xlsx', 'Los 1!B15:H15', 'Bedarfsposition: Sonderreinigung nach Abruf, Menge offen.', 'mittel')] }
    ],
    checklist: [
      { id: 'c1', section: 'Fristen und Portal', title: 'Abgabefrist anhand Originalunterlage bestätigen', priority: 'kritisch' as const, status: 'erledigt' as const, dueDate: inDays(12), source: 'Bekanntmachung, Seite 2' },
      { id: 'c2', section: 'Fristen und Portal', title: 'Verpflichtende Ortsbesichtigung organisieren und bestätigen', priority: 'kritisch' as const, status: 'offen' as const, dueDate: inDays(5), source: 'Nachweisdokument, Abschnitt 2' },
      { id: 'c3', section: 'Eignung und Nachweise', title: 'Referenzliste mit drei vergleichbaren Leistungen hochladen', priority: 'hoch' as const, status: 'offen' as const, dueDate: inDays(9), source: 'Nachweisdokument, Abschnitt 1.4' },
      { id: 'c4', section: 'Kalkulation', title: 'Bedarfsposition Sonderreinigung kalkulatorisch klären', priority: 'hoch' as const, status: 'offen' as const, source: 'LV, Pos. 1.3' },
      { id: 'c5', section: 'Angebotsdokumente', title: 'Tariftreueerklärung prüfen und finalisieren', priority: 'mittel' as const, status: 'offen' as const, source: 'Formblatt F-03' }
    ],
    audit: [{ id: 'a1', at: new Date().toISOString(), actor: 'Demo-System', type: 'Analyse', description: 'Vorbereiteter Demo-Analysezustand erzeugt; kein KI-Aufruf und keine externen Kosten.' }]
  }
  return { ...core, evaluation: evaluateTender(core, profile, core.lots) }
}
