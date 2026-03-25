import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './guards'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { LoginPage } from '@/pages/auth/login'
import { RegisterPage } from '@/pages/auth/register'
import { DashboardPage } from '@/pages/dashboard'
import { PrdTrackerPage } from '@/pages/prd-tracker'
import { KnowledgeBasePage } from '@/pages/knowledge-base'
import { ChatPage } from '@/pages/chat'

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<PrdTrackerPage />} />
          <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
