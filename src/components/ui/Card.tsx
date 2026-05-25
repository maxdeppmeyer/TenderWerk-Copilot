import type { ReactNode } from 'react'
import { clsx } from 'clsx'
export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => <section className={clsx('card', className)}>{children}</section>
