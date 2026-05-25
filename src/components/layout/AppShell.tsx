import { Bell, Building2, ClipboardCheck, FileUp, FolderKanban, Home, LogOut, Menu, Settings, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../../app/AppContext'
import { Logo } from './PublicLayout'
import { Badge } from '../ui/Badge'
import { Toast } from '../ui/Toast'

const links = [
  { to: '/app', label: 'Dashboard', icon: Home, end: true },
  { to: '/app/ausschreibungen', label: 'Ausschreibungen', icon: FolderKanban },
  { to: '/app/ausschreibungen/neu', label: 'Neue Prüfung', icon: FileUp },
  { to: '/app/nachweis-tresor', label: 'Nachweis-Tresor', icon: ClipboardCheck },
  { to: '/app/unternehmen', label: 'Unternehmen', icon: Building2 },
  { to: '/app/einstellungen', label: 'Einstellungen', icon: Settings }
]

export const AppShell = () => {
  const { user, profile, license, logout, mode, toast } = useApp()
  const [open, setOpen] = useState(false)
  return <div className="min-h-screen bg-[#f7f9f8]"><aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-4 transition lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center justify-between"><Logo/><button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Menü schließen"><X/></button></div><div className="mt-7 rounded-xl bg-brand-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Organisation</p><p className="mt-1 truncate text-sm font-semibold">{profile?.organizationName ?? 'Noch nicht eingerichtet'}</p><div className="mt-2 flex gap-2"><Badge tone={mode === 'demo' ? 'warning' : 'success'}>{mode === 'demo' ? 'Demo' : 'Supabase konfiguriert'}</Badge><Badge tone="info">{license.status}</Badge></div></div><nav className="mt-6 space-y-1">{links.map(({ to, label, icon: Icon, end }) => <NavLink end={end} key={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`} to={to}><Icon className="h-5 w-5"/>{label}</NavLink>)}{user?.platformAdmin && <NavLink className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`} to="/app/admin"><ShieldCheck className="h-5 w-5"/>Administration</NavLink>}</nav><div className="absolute bottom-4 left-4 right-4 border-t border-slate-100 pt-4"><p className="truncate text-sm font-medium">{user?.name}</p><p className="truncate text-xs text-slate-500">{user?.email}</p><button onClick={logout} className="mt-3 flex items-center gap-2 text-sm text-slate-600 hover:text-red-700"><LogOut className="h-4 w-4"/>Abmelden</button></div></aside>{open && <button className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden" onClick={() => setOpen(false)} aria-label="Menü schließen"/>}<div className="lg:pl-72"><header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="flex h-16 items-center justify-between px-4 sm:px-6"><button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Menü öffnen"><Menu/></button><p className="hidden text-sm text-slate-500 sm:block">{mode === 'demo' ? 'Automatisch erkannte Angaben müssen vor einer Abgabe geprüft werden.' : 'Pilot-Grundlage: produktive Fachpersistenz vor Kundeneinsatz vollständig prüfen.'}</p><div className="flex items-center gap-3"><button className="rounded-lg p-2 text-slate-500" aria-label="Benachrichtigungen"><Bell className="h-5 w-5"/></button><Link to="/app/ausschreibungen/neu" className="btn-primary hidden sm:inline-flex">Neue Ausschreibung</Link></div></div></header><main className="p-4 sm:p-6 lg:p-8"><Outlet/></main></div><Toast message={toast}/></div>
}
