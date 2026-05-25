/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CompanyProfile, License, SessionUser, Tender } from '../types/domain'
import { createDemoTender, defaultProfile, demoLicense, demoUser } from '../lib/sampleData'
import { demoMode, supabase } from '../lib/supabase'
import { evaluateTender } from '../lib/scoring'
import { validateUpload } from '../lib/upload'
import { authBackend } from '../lib/backend'

interface AppContextValue {
  mode: 'demo' | 'production'
  user: SessionUser | null
  profile: CompanyProfile | null
  license: License
  tenders: Tender[]
  toast?: string
  loginDemo: () => void
  logout: () => void
  completeOnboarding: (profile: CompanyProfile) => void
  loadDemoProject: () => void
  createTenderFromFiles: (files: File[], title: string, source: string) => string | null
  updateTender: (tender: Tender) => void
  recalculate: (id: string) => void
  approve: (id: string) => void
  markSubmitted: (id: string) => void
  setToast: (message?: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)
const STORAGE_KEY = 'tenderwerk-demo-state-v1'

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [license, setLicense] = useState<License>(demoLicense)
  const [tenders, setTenders] = useState<Tender[]>([])
  const [toast, setToast] = useState<string | undefined>()

  useEffect(() => {
    if (demoMode || !supabase) return
    const mapSession = (session: { user?: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } } | null) => {
      if (!session?.user) { setUser(null); return }
      const fullName = typeof session.user.user_metadata?.full_name === 'string' ? session.user.user_metadata.full_name : session.user.email ?? 'Nutzer'
      setUser({ id: session.user.id, email: session.user.email ?? '', name: fullName, role: 'editor', platformAdmin: false })
    }
    void supabase.auth.getSession().then(({ data }) => mapSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => mapSession(session))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!demoMode) return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const state = JSON.parse(raw) as { user: SessionUser | null; profile: CompanyProfile | null; license: License; tenders: Tender[] }
      setUser(state.user)
      setProfile(state.profile)
      setLicense(state.license)
      setTenders(state.tenders)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (!demoMode) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, profile, license, tenders }))
  }, [user, profile, license, tenders])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(undefined), 4200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const loginDemo = () => {
    setUser(demoUser)
    if (!profile) setProfile(defaultProfile)
    setToast('Demomodus geöffnet. Es werden keine echten Dokumente oder KI-Kosten verwendet.')
  }

  const logout = () => {
    if (!demoMode) void authBackend.signOut().catch(() => setToast('Abmeldung konnte nicht abgeschlossen werden.'))
    setUser(null)
    setToast('Sie wurden abgemeldet.')
  }

  const completeOnboarding = (newProfile: CompanyProfile) => {
    setProfile({ ...newProfile, completed: true })
    setToast('Unternehmensprofil gespeichert.')
  }

  const loadDemoProject = () => {
    const project = createDemoTender(profile ?? defaultProfile)
    setTenders((existing) => [project, ...existing.filter((item) => item.id !== project.id)])
    setToast('Fiktives Demoprojekt geladen. Die Ergebnisse sind vorbereitet und keine echte Analyse.')
  }

  const createTenderFromFiles = (files: File[], title: string, source: string) => {
    const error = files.map(validateUpload).find(Boolean)
    if (error) {
      setToast(error)
      return null
    }
    const base = createDemoTender(profile ?? defaultProfile)
    const id = crypto.randomUUID()
    const tender: Tender = {
      ...base,
      id,
      title: title || 'Neue Ausschreibung – Analyse ausstehend',
      source,
      status: 'eingegangen',
      dataQuality: 'unzureichende_unterlagen',
      summary: 'Dateien wurden erfasst. Starten Sie die Analyse nach Prüfung des Dokumentinventars.',
      files: files.map((file) => ({ id: crypto.randomUUID(), name: file.name, type: file.name.split('.').pop()?.toUpperCase() ?? 'DATEI', size: file.size, uploadedAt: new Date().toISOString(), status: 'uploaded', role: 'Noch nicht erkannt', origin: 'original' })),
      deadlines: [], lots: [], requirements: [], risks: [], lineItems: [], checklist: [], analysisVersion: 0,
      evaluation: { totalScore: 0, recommendation: 'manual_review', hardStops: [], dimensions: [], computedAt: new Date().toISOString() },
      audit: [{ id: crypto.randomUUID(), at: new Date().toISOString(), actor: user?.name ?? 'Nutzer', type: 'Upload', description: `${files.length} Datei(en) in der Demo-Inbox erfasst.` }]
    }
    setTenders((existing) => [tender, ...existing])
    setToast('Projekt angelegt. Im Produktionsmodus werden Dateien in einem privaten Supabase-Bucket gespeichert.')
    return id
  }

  const updateTender = (updated: Tender) => setTenders((all) => all.map((item) => item.id === updated.id ? updated : item))

  const recalculate = (id: string) => {
    setTenders((all) => all.map((tender) => tender.id === id && profile ? { ...tender, evaluation: evaluateTender(tender, profile, tender.lots) } : tender))
    setToast('Bewertung anhand der bestätigten Angaben neu berechnet.')
  }

  const approve = (id: string) => {
    setTenders((all) => all.map((tender) => tender.id === id ? {
      ...tender, status: 'freigegeben', approvedAt: new Date().toISOString(),
      audit: [{ id: crypto.randomUUID(), at: new Date().toISOString(), actor: user?.name ?? 'Prüfer', type: 'Freigabe', description: 'Interne Freigabe erteilt. Die Einreichung muss weiterhin manuell erfolgen.' }, ...tender.audit]
    } : tender))
    setToast('Intern freigegeben. Die Anwendung sendet kein Angebot an die Vergabestelle.')
  }

  const markSubmitted = (id: string) => {
    setTenders((all) => all.map((tender) => tender.id === id ? { ...tender, status: 'manuell_eingereicht', audit: [{ id: crypto.randomUUID(), at: new Date().toISOString(), actor: user?.name ?? 'Nutzer', type: 'Status', description: 'Nutzer hat die manuelle Einreichung bestätigt.' }, ...tender.audit] } : tender))
    setToast('Als manuell eingereicht markiert.')
  }

  const value = { mode: demoMode ? 'demo' as const : 'production' as const, user, profile, license, tenders, toast, loginDemo, logout, completeOnboarding, loadDemoProject, createTenderFromFiles, updateTender, recalculate, approve, markSubmitted, setToast }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const value = useContext(AppContext)
  if (!value) throw new Error('AppContext fehlt.')
  return value
}
