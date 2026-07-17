import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/application/stores/authStore'
import { Card } from '@/components/ui/card'
import AdminDashboard from './AdminDashboard'
import TeacherDashboard from './TeacherDashboard'
import FinanceDashboard from './FinanceDashboard'
import LibraryDashboard from './LibraryDashboard'
import ParentDashboard from './ParentDashboard'
import StudentDashboard from './StudentDashboard'

export const DashboardPage: React.FC = () => {
  const { user, language } = useAuthStore()

  if (!user) return null

  // Shared Mini Calendar Component (Passed down to dashboards)
  const MiniCalendar = () => (
    <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4 border-b border-neutral-50 pb-2">
        <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
          {language === 'fr' ? 'Calendrier' : 'Calendar'}
        </span>
        <span className="text-xs font-bold text-neutral-505">
          Juin 2024
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
        <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-700">
        <span className="text-neutral-300 py-1"></span>
        <span className="text-neutral-300 py-1"></span>
        <span className="text-neutral-300 py-1"></span>
        <span className="text-neutral-300 py-1"></span>
        <span className="text-neutral-300 py-1"></span>
        <span className="text-neutral-300 py-1"></span>
        <span className="py-1">1</span>
        <span className="py-1">2</span>
        <span className="py-1">3</span>
        <span className="py-1 text-teal-600 bg-teal-50 rounded-full">4</span>
        <span className="py-1 text-teal-600 bg-teal-50 rounded-full">5</span>
        <span className="py-1">6</span>
        <span className="py-1">7</span>
        <span className="py-1">8</span>
        <span className="py-1">9</span>
        <span className="py-1">10</span>
        <span className="py-1 bg-black text-white rounded-full">11</span>
        <span className="py-1">12</span>
        <span className="py-1">13</span>
        <span className="py-1">14</span>
        <span className="py-1 text-teal-600 bg-teal-50 rounded-full">15</span>
        <span className="py-1">16</span>
        <span className="py-1">17</span>
        <span className="py-1">18</span>
        <span className="py-1">19</span>
        <span className="py-1">20</span>
        <span className="py-1">21</span>
        <span className="py-1">22</span>
        <span className="py-1">23</span>
        <span className="py-1">24</span>
        <span className="py-1">25</span>
        <span className="py-1">26</span>
        <span className="py-1">27</span>
        <span className="py-1">28</span>
        <span className="py-1">29</span>
        <span className="py-1">30</span>
      </div>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-50 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
          <span>Aujourd'hui</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
          <span>Examens</span>
        </div>
      </div>
    </Card>
  )

  // Route to specific dashboard components based on user role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />
    case 'super-admin':
      return <Navigate to="/super-admin" replace />
    case 'comptable':
      return <FinanceDashboard language={language} MiniCalendar={MiniCalendar} />
    case 'enseignant':
      return <TeacherDashboard language={language} MiniCalendar={MiniCalendar} />
    case 'bibliothecaire':
      return <LibraryDashboard language={language} MiniCalendar={MiniCalendar} />
    case 'parent':
      return <ParentDashboard language={language} MiniCalendar={MiniCalendar} />
    case 'eleve':
      return <StudentDashboard language={language} MiniCalendar={MiniCalendar} />
    default:
      return (
        <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-red-700">
          Rôle utilisateur inconnu.
        </div>
      )
  }
}

export default DashboardPage;
