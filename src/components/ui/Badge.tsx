import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export const Badge = ({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info' }) => (
  <span className={clsx('badge', tone === 'success' && 'bg-emerald-50 text-emerald-700', tone === 'warning' && 'bg-amber-50 text-amber-700', tone === 'danger' && 'bg-red-50 text-red-700', tone === 'neutral' && 'bg-slate-100 text-slate-700', tone === 'info' && 'bg-brand-50 text-brand-700')}>{children}</span>
)
