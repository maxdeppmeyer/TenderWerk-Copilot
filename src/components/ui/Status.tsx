import { Badge } from './Badge'
import { dataQualityLabel, recommendationLabel, statusLabel } from '../../lib/labels'
import type { DataQuality, Recommendation, TenderStatus } from '../../types/domain'

export const RecommendationBadge = ({ value }: { value: Recommendation }) => <Badge tone={value === 'go_recommended' ? 'success' : value === 'go_after_review' ? 'warning' : value === 'no_go_recommended' ? 'danger' : 'neutral'}>{recommendationLabel[value]}</Badge>
export const TenderStatusBadge = ({ value }: { value: TenderStatus }) => <Badge tone={value === 'freigegeben' || value === 'manuell_eingereicht' ? 'success' : value === 'no_go_empfohlen' ? 'danger' : value === 'pruefung_noetig' ? 'warning' : 'info'}>{statusLabel[value]}</Badge>
export const QualityBadge = ({ value }: { value: DataQuality }) => <Badge tone={value === 'gut_belegt' || value === 'manuell_geprueft' ? 'success' : value === 'widerspruechlich' ? 'danger' : 'warning'}>{dataQualityLabel[value]}</Badge>
