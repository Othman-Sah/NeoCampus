import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '@/ui/layouts/AuthLayout'
import DashboardLayout from '@/ui/layouts/DashboardLayout'
import ProtectedRoute from '@/ui/components/ProtectedRoute'
import LoginPage from '@/ui/pages/login/LoginPage'
import PlaceholderPage from '@/ui/pages/PlaceholderPage'
import DashboardPage from '@/ui/pages/dashboard/DashboardPage'
import UserHubPage from '@/ui/pages/users/UserHubPage'
import StudentDirectoryPage from '@/ui/pages/students/StudentDirectoryPage'
import StudentCreatePage from '@/ui/pages/students/StudentCreatePage'
import StudentDetailsPage from '@/ui/pages/students/StudentDetailsPage'
import StudentEditPage from '@/ui/pages/students/StudentEditPage'
import StudentImportPage from '@/ui/pages/students/StudentImportPage'
import ClassesPage from '@/ui/pages/classes/ClassesPage'
import ClassDetailsPage from '@/ui/pages/classes/ClassDetailsPage'
import TeachersPage from '@/ui/pages/teachers/TeachersPage'
import TeacherCreatePage from '@/ui/pages/teachers/TeacherCreatePage'
import TeacherEditPage from '@/ui/pages/teachers/TeacherEditPage'
import ComptableSalaryPage from '@/ui/pages/salaires/ComptableSalaryPage'
import TeacherSalaryPage from '@/ui/pages/salaires/TeacherSalaryPage'
import { TimetablePage } from '@/ui/pages/timetable/TimetablePage'
import { AttendanceSheetPage } from '@/ui/pages/attendance/AttendanceSheetPage'
import { GradeEntrySheetPage } from '@/ui/pages/grades/GradeEntrySheetPage'
import { ExamUploadWizardPage } from '@/ui/pages/exams/ExamUploadWizardPage'
import { AdminExamManagementPage } from '@/ui/pages/exams/AdminExamManagementPage'
import { AttendanceDashboardPage } from '@/ui/pages/attendance/AttendanceDashboardPage'
import { GradesDashboardPage } from '@/ui/pages/grades/GradesDashboardPage'

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
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/attendance" element={<AttendanceDashboardPage />} />
            <Route path="/grades" element={<GradesDashboardPage />} />
            <Route path="/announcements" element={<PlaceholderPage />} />
            <Route path="/bulletins" element={<PlaceholderPage />} />
            <Route path="/transport" element={<PlaceholderPage />} />
          </Route>
        </Route>

        {/* Admin-only Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
             <Route path="/admin/users" element={<UserHubPage />} />
             <Route path="/admin/students" element={<StudentDirectoryPage />} />
             <Route path="/admin/students/create" element={<StudentCreatePage />} />
             <Route path="/admin/students/:id" element={<StudentDetailsPage />} />
             <Route path="/admin/students/:id/edit" element={<StudentEditPage />} />
             <Route path="/admin/students/import" element={<StudentImportPage />} />
             <Route path="/admin/teachers" element={<TeachersPage />} />
             <Route path="/admin/teachers/create" element={<TeacherCreatePage />} />
             <Route path="/admin/teachers/:id/edit" element={<TeacherEditPage />} />
             <Route path="/admin/accountants" element={<PlaceholderPage />} />
             <Route path="/admin/classes" element={<ClassesPage />} />
             <Route path="/admin/classes/:id" element={<ClassDetailsPage />} />
             <Route path="/admin/exams" element={<AdminExamManagementPage />} />
          </Route>
        </Route>

        {/* Finance-only Routes */}
        <Route element={<ProtectedRoute allowedRoles={['comptable', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/finance" element={<Navigate to="/finance/salaires" replace />} />
            <Route path="/finance/salaires" element={<ComptableSalaryPage />} />
          </Route>
        </Route>

        {/* Teacher specific Routes */}
        <Route element={<ProtectedRoute allowedRoles={['enseignant', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/teacher/salaires" element={<TeacherSalaryPage />} />
            <Route path="/teacher/attendance/:seanceId" element={<AttendanceSheetPage />} />
            <Route path="/teacher/grades/:examenId" element={<GradeEntrySheetPage />} />
            <Route path="/teacher/exams/upload/:id" element={<ExamUploadWizardPage />} />
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
