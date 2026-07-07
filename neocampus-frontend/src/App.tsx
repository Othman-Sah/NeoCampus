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
import TeacherSalaryPage from '@/ui/pages/salaires/TeacherSalaryPage'
import FeeConfigPage from '@/ui/pages/finance/FeeConfigPage'
import FinanceStudentListPage from '@/ui/pages/finance/FinanceStudentListPage'
import StudentPaymentView from '@/ui/pages/finance/StudentPaymentView'
import ReportsPage from '@/ui/pages/finance/ReportsPage'
import PayoutsPage from '@/ui/pages/finance/PayoutsPage'
import AccountantDirectoryPage from '@/ui/pages/users/AccountantDirectoryPage'
import { TimetablePage } from '@/ui/pages/timetable/TimetablePage'
import { AttendanceSheetPage } from '@/ui/pages/attendance/AttendanceSheetPage'
import { GradeEntrySheetPage } from '@/ui/pages/grades/GradeEntrySheetPage'
import { ExamUploadWizardPage } from '@/ui/pages/exams/ExamUploadWizardPage'
import { AdminExamManagementPage } from '@/ui/pages/exams/AdminExamManagementPage'
import { TeacherExamManagementPage } from '@/ui/pages/exams/TeacherExamManagementPage'
import { AttendanceDashboardPage } from '@/ui/pages/attendance/AttendanceDashboardPage'
import { GradesDashboardPage } from '@/ui/pages/grades/GradesDashboardPage'
import LibraryDashboard from '@/ui/pages/library/LibraryDashboard'
import BookCatalog from '@/ui/pages/library/BookCatalog'
import LoansManager from '@/ui/pages/library/LoansManager'
import LibraryMembers from '@/ui/pages/library/LibraryMembers'
import LibraryFines from '@/ui/pages/library/LibraryFines'
import LibraryAnalytics from '@/ui/pages/library/LibraryAnalytics'
import LibrarySettings from '@/ui/pages/library/LibrarySettings'
import AdminDashboard from '@/ui/pages/bulletins/AdminDashboard'
import AppreciationEditor from '@/ui/pages/bulletins/AppreciationEditor'
import BulletinPrintView from '@/ui/pages/bulletins/BulletinPrintView'
import BulletinSettingsPage from '@/ui/pages/bulletins/BulletinSettingsPage'

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
            <Route path="/bulletins" element={<AdminDashboard />} />
            <Route path="/bulletins/:id" element={<BulletinPrintView />} />
            <Route path="/bulletins/:id/appreciations" element={<AppreciationEditor />} />
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
             <Route path="/admin/accountants" element={<AccountantDirectoryPage />} />
             <Route path="/admin/classes" element={<ClassesPage />} />
             <Route path="/admin/classes/:id" element={<ClassDetailsPage />} />
             <Route path="/admin/exams" element={<AdminExamManagementPage />} />
             <Route path="/bulletins/settings" element={<BulletinSettingsPage />} />
          </Route>
        </Route>

        {/* Finance-only Routes */}
        <Route element={<ProtectedRoute allowedRoles={['comptable', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/finance" element={<Navigate to="/finance/salaires" replace />} />
            <Route path="/finance/salaires" element={<PayoutsPage />} />
            <Route path="/finance/fees" element={<FeeConfigPage />} />
            <Route path="/finance/payments" element={<FinanceStudentListPage />} />
            <Route path="/finance/students/:id/balance" element={<StudentPaymentView />} />
            <Route path="/finance/reports" element={<ReportsPage />} />
          </Route>
        </Route>

        {/* Teacher specific Routes */}
        <Route element={<ProtectedRoute allowedRoles={['enseignant', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/teacher/salaires" element={<TeacherSalaryPage />} />
            <Route path="/teacher/attendance/:seanceId" element={<AttendanceSheetPage />} />
            <Route path="/teacher/grades/:examenId" element={<GradeEntrySheetPage />} />
            <Route path="/teacher/exams/upload/:id" element={<ExamUploadWizardPage />} />
            <Route path="/teacher/exams" element={<TeacherExamManagementPage />} />
          </Route>
        </Route>

        {/* Library-only Routes */}
        <Route element={<ProtectedRoute allowedRoles={['bibliothecaire', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/library" element={<Navigate to="/library/dashboard" replace />} />
            <Route path="/library/dashboard" element={<LibraryDashboard />} />
            <Route path="/library/books" element={<BookCatalog />} />
            <Route path="/library/loans" element={<LoansManager />} />
            <Route path="/library/members" element={<LibraryMembers />} />
            <Route path="/library/fines" element={<LibraryFines />} />
            <Route path="/library/analytics" element={<LibraryAnalytics />} />
            <Route path="/library/settings" element={<LibrarySettings />} />
          </Route>
        </Route>



        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
