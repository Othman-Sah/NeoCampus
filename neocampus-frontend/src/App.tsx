import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '@/ui/layouts/AuthLayout'
import DashboardLayout from '@/ui/layouts/DashboardLayout'
import ProtectedRoute from '@/ui/components/ProtectedRoute'
import LoginPage from '@/ui/pages/login/LoginPage'
import PlaceholderPage from '@/ui/pages/PlaceholderPage'
import DashboardPage from '@/ui/pages/dashboard/DashboardPage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Dashboard Routes (Shared by all roles) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/timetable" element={<PlaceholderPage />} />
            <Route path="/attendance" element={<PlaceholderPage />} />
            <Route path="/grades" element={<PlaceholderPage />} />
            <Route path="/announcements" element={<PlaceholderPage />} />
            <Route path="/bulletins" element={<PlaceholderPage />} />
            <Route path="/transport" element={<PlaceholderPage />} />
          </Route>
        </Route>

        {/* Admin-only Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/students" element={<PlaceholderPage />} />
            <Route path="/admin/teachers" element={<PlaceholderPage />} />
            <Route path="/admin/classes" element={<PlaceholderPage />} />
          </Route>
        </Route>

        {/* Finance-only Routes */}
        <Route element={<ProtectedRoute allowedRoles={['comptable', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/finance" element={<PlaceholderPage />} />
          </Route>
        </Route>

        {/* Library-only Routes */}
        <Route element={<ProtectedRoute allowedRoles={['bibliothecaire', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/library" element={<PlaceholderPage />} />
          </Route>
        </Route>



        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
