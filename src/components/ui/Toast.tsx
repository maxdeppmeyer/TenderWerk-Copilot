import { CheckCircle2 } from 'lucide-react'
export const Toast = ({ message }: { message?: string }) => message ? <div className="fixed bottom-5 right-5 z-50 flex max-w-md items-start gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-soft"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"/><span className="text-sm text-slate-700">{message}</span></div> : null
