import type { CompanyProfile, Evaluation, Lot, Tender } from '../types/domain'

export interface Weighting {
  performance: number
  evidence: number
  region: number
  deadline: number
  capacity: number
  calculation: number
  risk: number
}

export const defaultWeighting: Weighting = {
  performance: 25,
  evidence: 20,
  region: 10,
  deadline: 15,
  capacity: 10,
  calculation: 10,
  risk: 10
}

const dimension = (key: string, label: string, score: number, max: number, reasoning: string, missing: string[] = []) => ({ key, label, score, max, reasoning, missing })

export const evaluateTender = (tender: Pick<Tender, 'deadlines' | 'requirements' | 'risks' | 'lineItems' | 'files' | 'location'>, profile: CompanyProfile, lots: Lot[], now = new Date(), weights = defaultWeighting): Evaluation => {
  const chosenLots = lots.filter((lot) => lot.selection === 'anbieten')
  const hardStops: string[] = []
  const excludedService = chosenLots.flatMap((lot) => lot.requiredServices).find((service) => profile.exclusions.some((x) => service.toLowerCase().includes(x.toLowerCase()) || x.toLowerCase().includes(service.toLowerCase())))
  if (excludedService) hardStops.push(`Die ausgewählte Leistung „${excludedService}“ ist im Firmenprofil ausdrücklich ausgeschlossen.`)

  const submission = tender.deadlines.find((deadline) => deadline.type === 'Angebotsfrist' && deadline.confirmed)
  if (submission?.value && new Date(submission.value) < now) hardStops.push('Die bestätigte Angebotsfrist ist bereits abgelaufen.')

  const serviceMatches = chosenLots.length > 0 && chosenLots.every((lot) => lot.requiredServices.some((service) => profile.services.some((own) => service.toLowerCase().includes(own.toLowerCase()) || own.toLowerCase().includes(service.toLowerCase()))))
  const perfScore = hardStops.some((stop) => stop.includes('ausgeschlossen')) ? 0 : serviceMatches ? weights.performance : Math.round(weights.performance * 0.45)

  const required = tender.requirements.filter((item) => item.mandatory)
  const valid = required.filter((item) => item.status === 'gueltig_bestaetigt').length
  const evidenceScore = required.length === 0 ? Math.round(weights.evidence * 0.5) : Math.round((valid / required.length) * weights.evidence)
  const missingRequirements = required.filter((item) => item.status !== 'gueltig_bestaetigt').map((item) => item.name)

  const locationMatch = profile.regions.some((region) => tenderLocation(tender).toLowerCase().includes(region.toLowerCase()))
  const regionScore = locationMatch ? weights.region : Math.round(weights.region * 0.4)

  const unknownDeadline = !tender.deadlines.some((d) => d.type === 'Angebotsfrist' && d.confirmed && d.value)
  const deadlineScore = hardStops.some((stop) => stop.includes('Frist')) ? 0 : unknownDeadline ? Math.round(weights.deadline * 0.3) : weights.deadline

  const capacityScore = profile.maxParallelProjects > 0 ? Math.round(weights.capacity * 0.75) : Math.round(weights.capacity * 0.25)
  const priced = tender.lineItems.filter((item) => item.confirmed).length
  const calculationScore = tender.lineItems.length === 0 ? 0 : Math.round((priced / tender.lineItems.length) * weights.calculation)
  const criticalRisk = tender.risks.some((risk) => risk.severity === 'kritisch' && risk.status !== 'erledigt')
  const riskScore = criticalRisk ? 0 : Math.round(weights.risk * 0.7)

  const dimensions = [
    dimension('performance', 'Leistungspassung', perfScore, weights.performance, serviceMatches ? 'Gewählte Lose decken sich mit hinterlegten Leistungen.' : 'Mindestens eine Leistung ist nicht eindeutig im Firmenprofil bestätigt.'),
    dimension('evidence', 'Nachweisfähigkeit', evidenceScore, weights.evidence, `${valid} von ${required.length} Muss-Nachweisen sind bestätigt.`, missingRequirements),
    dimension('region', 'Region und Einsatzort', regionScore, weights.region, locationMatch ? 'Einsatzort liegt in einer hinterlegten Zielregion.' : 'Region muss vor einer Teilnahme geprüft werden.', locationMatch ? [] : ['Einsatzradius/Region bestätigen']),
    dimension('deadline', 'Frist und Bearbeitbarkeit', deadlineScore, weights.deadline, unknownDeadline ? 'Keine bestätigte Angebotsfrist vorhanden.' : 'Eine bestätigte Angebotsfrist liegt vor.', unknownDeadline ? ['Angebotsfrist bestätigen'] : []),
    dimension('capacity', 'Kapazität', capacityScore, weights.capacity, 'Kapazität ist als Firmenangabe hinterlegt, muss projektbezogen bestätigt werden.', ['Projektkapazität bestätigen']),
    dimension('calculation', 'Kalkulierbarkeit', calculationScore, weights.calculation, `${priced} von ${tender.lineItems.length} Positionen sind kalkulatorisch bestätigt.`, tender.lineItems.length - priced > 0 ? ['Offene Positionen kalkulieren'] : []),
    dimension('risk', 'Risiko und Formalia', riskScore, weights.risk, criticalRisk ? 'Ein kritischer Prüfhinweis ist offen.' : 'Keine offenen kritischen Prüfhinweise erkannt.', criticalRisk ? ['Kritischen Hinweis bearbeiten'] : [])
  ]
  const totalScore = dimensions.reduce((sum, item) => sum + item.score, 0)
  let recommendation: Evaluation['recommendation'] = totalScore >= 75 ? 'go_recommended' : totalScore >= 55 ? 'go_after_review' : 'manual_review'
  if (hardStops.length > 0) recommendation = 'no_go_recommended'
  else if (unknownDeadline) recommendation = 'manual_review'
  else if (missingRequirements.length > 0 || priced < tender.lineItems.length || criticalRisk) recommendation = totalScore >= 55 ? 'go_after_review' : 'manual_review'
  return { totalScore, recommendation, hardStops, dimensions, computedAt: now.toISOString() }
}

const tenderLocation = (tender: Pick<Tender, 'deadlines' | 'requirements' | 'risks' | 'lineItems' | 'files' | 'location'> & { location?: string }) => tender.location ?? 'Hannover'
