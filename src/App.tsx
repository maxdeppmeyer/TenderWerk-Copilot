import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './app/AppContext'
import { AppShell } from './components/layout/AppShell'
import { PublicLayout } from './components/layout/PublicLayout'
import { ApprovalExportPage, AdminPage, CalculationPage, ChecklistPage, CompanyPage, DashboardPage, DocumentPage, EvidenceCoveragePage, EvidenceVaultPage, NewTenderPage, OnboardingPage, PositionsPage, SettingsPage, SimpleTenderSection, TenderListPage, TenderOverviewPage } from './pages/AppPages'
import { LoginPage, ProtectedRoute, ResetPasswordPage } from './pages/AuthPages'
import { FeaturesPage, HomePage, LegalTemplatePage, PricesPage, SecurityPage } from './pages/PublicPages'

const ProtectedShell = () => <ProtectedRoute><AppShell /></ProtectedRoute>

export default function App() {
  return <AppProvider><BrowserRouter><Routes>
    <Route element={<PublicLayout/>}>
      <Route index element={<HomePage/>}/>
      <Route path="funktionen" element={<FeaturesPage/>}/>
      <Route path="preise" element={<PricesPage/>}/>
      <Route path="sicherheit" element={<SecurityPage/>}/>
      <Route path="login" element={<LoginPage/>}/>
      <Route path="registrieren" element={<LoginPage register/>}/>
      <Route path="passwort-zuruecksetzen" element={<ResetPasswordPage/>}/>
      <Route path="impressum" element={<LegalTemplatePage type="impressum"/>}/>
      <Route path="datenschutz" element={<LegalTemplatePage type="datenschutz"/>}/>
    </Route>
    <Route path="app" element={<ProtectedShell/>}>
      <Route index element={<DashboardPage/>}/>
      <Route path="onboarding" element={<OnboardingPage/>}/>
      <Route path="ausschreibungen" element={<TenderListPage/>}/>
      <Route path="ausschreibungen/neu" element={<NewTenderPage/>}/>
      <Route path="ausschreibungen/:id" element={<Navigate to="uebersicht" replace/>}/>
      <Route path="ausschreibungen/:id/uebersicht" element={<TenderOverviewPage/>}/>
      <Route path="ausschreibungen/:id/dokumente" element={<DocumentPage/>}/>
      <Route path="ausschreibungen/:id/analyse" element={<EvidenceCoveragePage/>}/>
      <Route path="ausschreibungen/:id/fristen" element={<SimpleTenderSection section="fristen"/>}/>
      <Route path="ausschreibungen/:id/lose" element={<SimpleTenderSection section="lose"/>}/>
      <Route path="ausschreibungen/:id/nachweise" element={<SimpleTenderSection section="nachweise"/>}/>
      <Route path="ausschreibungen/:id/risiken" element={<SimpleTenderSection section="risiken"/>}/>
      <Route path="ausschreibungen/:id/positionen" element={<PositionsPage/>}/>
      <Route path="ausschreibungen/:id/kalkulation" element={<CalculationPage/>}/>
      <Route path="ausschreibungen/:id/checkliste" element={<ChecklistPage/>}/>
      <Route path="ausschreibungen/:id/export-freigabe" element={<ApprovalExportPage/>}/>
      <Route path="nachweis-tresor" element={<EvidenceVaultPage/>}/>
      <Route path="unternehmen" element={<CompanyPage/>}/>
      <Route path="einstellungen" element={<SettingsPage/>}/>
      <Route path="admin" element={<AdminPage/>}/>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></BrowserRouter></AppProvider>
}
