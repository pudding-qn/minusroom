import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useStore from './store/useStore'
import { AppShell } from './components/ui/AppShell'
import { AuthPage } from './pages/AuthPage'
import { VerifyPage } from './pages/VerifyPage'
import { SpacePage } from './pages/SpacePage'
import { CardDetailPage } from './pages/CardDetailPage'
import { TagsPage } from './pages/TagsPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage, ErrorPage } from './pages/ErrorPages'

function RequireAuth({ children }) {
  const user = useStore((s) => s.user)
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function AppWithShell() {
  return (
    <RequireAuth>
      <AppShell>
        <Routes>
          <Route path="/space" element={<SpacePage />} />
          <Route path="/space/card/:id" element={<CardDetailPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </RequireAuth>
  )
}

export default function App() {
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/verify" element={<VerifyPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/" element={<Navigate to="/space" replace />} />
      <Route path="/*" element={<AppWithShell />} />
    </Routes>
  )
}
