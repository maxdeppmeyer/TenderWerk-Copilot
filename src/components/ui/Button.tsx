import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

export const Button = ({ children, variant = 'primary', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) => (
  <button className={clsx(variant === 'primary' && 'btn-primary', variant === 'secondary' && 'btn-secondary', variant === 'danger' && 'inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800', variant === 'ghost' && 'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100', className)} {...props}>{children}</button>
)
