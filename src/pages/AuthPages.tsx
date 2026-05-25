import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { demoMode } from '../lib/supabase'
import { authBackend } from '../lib/backend'

export const LoginPage = ({ register = false }: { register?: boolean }) => {
  const { user, loginDemo, setToast } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/app" replace />
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (demoMode) { loginDemo(); navigate('/app'); return }
    setBusy(true)
    try {
      if (register) await authBackend.signUp(email, password); else await authBackend.signIn(email, password)
      setToast(register ? 'Bitte prüfen Sie Ihre E-Mail zur Bestätigung.' : 'Angemeldet.')
      navigate('/app')
    } catch (error) { setToast(error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen.') } finally { setBusy(false) }
  }
  return <div className="container-shell py-14"><div className="mx-auto max-w-md card"><Badge tone={demoMode ? 'warning' : 'success'}>{demoMode ? 'Lokaler Demomodus' : 'Supabase Auth aktiv'}</Badge><h1 className="mt-4 text-2xl font-semibold">{register ? 'Testzugang erstellen' : 'Anmelden'}</h1><p className="mt-2 text-sm text-slate-600">{demoMode ? 'Im gelieferten Vorschauzustand öffnet die Schaltfläche ein fiktives Projekt ohne Upload oder KI-Kosten.' : 'Ihre Daten werden mandantenbezogen in Supabase verwaltet.'}</p><form className="mt-7 space-y-4" onSubmit={submit}><label className="label">E-Mail<input className="input" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@unternehmen.de"/></label><label className="label">Passwort<input className="input" type="password" required={!demoMode} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••••"/></label><Button className="w-full" disabled={busy}>{demoMode ? 'Demo öffnen' : register ? 'Registrieren' : 'Anmelden'}</Button></form><p className="mt-5 text-center text-sm text-slate-600">{register ? 'Bereits registriert?' : 'Noch kein Zugang?'} <Link className="font-semibold text-brand-700" to={register ? '/login' : '/registrieren'}>{register ? 'Anmelden' : 'Registrieren'}</Link></p>{!register && <Link className="mt-3 block text-center text-sm text-brand-700" to="/passwort-zuruecksetzen">Passwort vergessen</Link>}</div></div>
}

export const ResetPasswordPage = () => {
  const [email, setEmail] = useState('')
  const { setToast } = useApp()
  const submit = async (event: FormEvent) => { event.preventDefault(); if (demoMode) { setToast('Im Demomodus wird keine E-Mail versendet.'); return } try { await authBackend.resetPassword(email, `${window.location.origin}/login`); setToast('E-Mail zum Zurücksetzen wurde angefordert.') } catch (error) { setToast(error instanceof Error ? error.message : 'Anfrage fehlgeschlagen.') } }
  return <div className="container-shell py-14"><form className="card mx-auto max-w-md" onSubmit={submit}><h1 className="text-2xl font-semibold">Passwort zurücksetzen</h1><label className="label mt-6 block">E-Mail<input className="input" type="email" required value={email} onChange={(event) => setEmail(event.target.value)}/></label><Button className="mt-5 w-full">Link anfordern</Button></form></div>
}

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useApp()
  const location = useLocation()
  return user ? children : <Navigate to="/login" replace state={{ from: location }} />
}
