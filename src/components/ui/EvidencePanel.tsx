import type { Evidence } from '../../types/domain'
import { Badge } from './Badge'
import { FileText } from 'lucide-react'
export const EvidencePanel = ({ items }: { items: Evidence[] }) => items.length ? <div className="mt-3 space-y-2">{items.map((item) => <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm"><div className="flex flex-wrap items-center gap-2 font-medium text-slate-700"><FileText className="h-4 w-4"/>{item.fileName}<span className="text-slate-400">·</span>{item.locator}<Badge tone={item.confidence === 'hoch' ? 'success' : 'warning'}>{item.confidence}</Badge></div><p className="mt-2 text-slate-600">„{item.excerpt}“</p></div>)}</div> : <p className="mt-2 text-sm text-amber-700">Keine Fundstelle hinterlegt – manuell prüfen.</p>
