export type VerificationStatus = 'belegt' | 'pruefen' | 'bestaetigt' | 'abgelehnt' | 'unklar'
export type Confidence = 'hoch' | 'mittel' | 'niedrig'
export type Origin = 'parser' | 'ai' | 'user' | 'system_calculation'
export type Recommendation = 'go_recommended' | 'go_after_review' | 'manual_review' | 'no_go_recommended'
export type TenderStatus = 'eingegangen' | 'in_analyse' | 'pruefung_noetig' | 'go_empfohlen' | 'no_go_empfohlen' | 'in_kalkulation' | 'bereit_zur_freigabe' | 'freigegeben' | 'manuell_eingereicht' | 'abgeschlossen' | 'archiviert'
export type DataQuality = 'gut_belegt' | 'teilweise_belegt' | 'unzureichende_unterlagen' | 'widerspruechlich' | 'manuell_geprueft'
export type UserRole = 'owner' | 'admin' | 'editor' | 'approver' | 'viewer'
export type FileStatus = 'uploaded' | 'validating' | 'extracted' | 'requires_ocr' | 'unsupported' | 'quarantined' | 'failed'
export type RequirementStatus = 'fehlt' | 'vorhanden_ungeprueft' | 'gueltig_bestaetigt' | 'muss_aktualisiert_werden' | 'nicht_zutreffend' | 'manuell_pruefen'
export type ChecklistStatus = 'offen' | 'erledigt' | 'nicht_zutreffend'
export type Severity = 'kritisch' | 'hoch' | 'mittel' | 'niedrig' | 'hinweis'

export interface Evidence { id: string; fileName: string; locator: string; excerpt: string; confidence: Confidence; verification: VerificationStatus }
export interface CompanyProfile { id: string; organizationId?: string; organizationName: string; location: string; radiusKm: number; regions: string[]; categories: string[]; services: string[]; exclusions: string[]; employeesBand: string; vehiclesAndEquipment: string[]; maxParallelProjects: number; hourlyRate: number; travelCostPerKm: number; materialMarkupPercent: number; riskMarkupPercent: number; targetMarginPercent: number; vatPercent: number; profileTemplate: string; completed: boolean }
export interface TenderFile { id: string; name: string; type: string; size: number; uploadedAt: string; status: FileStatus; role: string; hash?: string; warning?: string; origin: 'original' | 'derived' | 'email' }
export interface Deadline { id: string; type: string; value?: string; originalText: string; critical: boolean; conflict: boolean; evidence: Evidence[]; confirmed: boolean }
export interface Lot { id: string; label: string; title: string; description: string; selection: 'anbieten' | 'nicht_anbieten' | 'unklar'; recommendation: Recommendation; requiredServices: string[]; evidence: Evidence[] }
export interface Requirement { id: string; name: string; category: string; mandatory: boolean; dueMoment: string; status: RequirementStatus; linkedDocument?: string; evidence: Evidence[] }
export interface Risk { id: string; category: string; severity: Severity; description: string; action: string; status: 'offen' | 'bestaetigt' | 'erledigt'; evidence: Evidence[] }
export interface LineItem { id: string; lotId: string; number: string; shortText: string; longText: string; quantity: number; unit: string; costType: string; workHoursPerUnit: number; hourlyRate: number; materialCostPerUnit: number; equipmentCostPerUnit: number; externalCostPerUnit: number; overheadPercent: number; riskPercent: number; marginPercent: number; confirmed: boolean; evidence: Evidence[] }
export interface ChecklistItem { id: string; section: string; title: string; priority: Severity; status: ChecklistStatus; dueDate?: string; source?: string; note?: string }
export interface AuditEvent { id: string; at: string; actor: string; type: string; description: string }
export interface ScoreDimension { key: string; label: string; score: number; max: number; reasoning: string; missing: string[] }
export interface Evaluation { totalScore: number; recommendation: Recommendation; hardStops: string[]; dimensions: ScoreDimension[]; computedAt: string }
export interface Tender { id: string; title: string; contractingAuthority: string; source: string; createdAt: string; status: TenderStatus; dataQuality: DataQuality; summary: string; location: string; category: string; processingMode: string; files: TenderFile[]; deadlines: Deadline[]; lots: Lot[]; requirements: Requirement[]; risks: Risk[]; lineItems: LineItem[]; checklist: ChecklistItem[]; evaluation: Evaluation; analysisVersion: number; analysisJobStatus?: string; approvedAt?: string; audit: AuditEvent[] }
export interface License { status: 'trial' | 'active' | 'lifetime' | 'inactive' | 'past_due' | 'blocked' | 'cancelled' | 'expired'; analysesRemaining: number; periodLabel: string }
export interface SessionUser { id: string; email: string; name: string; role: UserRole; platformAdmin: boolean }
export interface AssistantSource { fileName: string; locator: string; excerpt: string }
export interface AssistantAnswer { answer: string; sources: AssistantSource[]; limitations: string[] }
