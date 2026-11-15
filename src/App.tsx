import { QueryClientProvider } from '@tanstack/react-query'
import { Link, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { DefectDetailPage } from './pages/DefectDetailPage'
import { makeQueryClient } from './queryClient'

export function AppRoutes() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="app-header">
        <Link to="/" className="brand">Deferral Watch</Link>
        <span className="muted">MEL deferrals · Maintenance Control</span>
      </header>
      <main id="main" tabIndex={-1} className="app-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/defects/:id" element={<DefectDetailPage />} />
          <Route path="*" element={<p>Page not found. <Link to="/">Back to dashboard</Link></p>} />
        </Routes>
      </main>
    </>
  )
}

const client = makeQueryClient()

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <AppRoutes />
    </QueryClientProvider>
  )
}
