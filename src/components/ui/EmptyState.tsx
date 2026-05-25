import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
export const EmptyState = ({ title, description, action }: { title: string; description: string; action?: ReactNode }) => <div className="card flex flex-col items-center justify-center py-12 text-center"><Inbox className="mb-3 h-10 w-10 text-brand-500"/><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 max-w-lg text-sm text-slate-600">{description}</p>{action && <div className="mt-5">{action}</div>}</div>
