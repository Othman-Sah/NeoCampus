import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/application/stores/authStore'
import { useStudentDashboard } from '@/application/useCases/useStudentPortal'
import { useAnnouncement } from '@/application/useCases/useAnnouncement'
import { 
  Clock, 
  GraduationCap, 
  BookOpen, 
  CalendarDays,
  Bell,
  AlertTriangle
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface StudentDashboardProps {
  language: 'fr' | 'en';
  MiniCalendar: React.ComponentType;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ language, MiniCalendar }) => {
  const { user } = useAuthStore()
  const { data: dashboard, isLoading } = useStudentDashboard()
  
  // We can fetch announcements to show the latest 3 in the sidebar
  const { useAnnouncements } = useAnnouncement()
  const { data: announcementsData } = useAnnouncements({ page: 1 })
  const announcements = announcementsData?.data || []

  if (!user) return null

  // Adjust greeting by time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 
    ? 'Good Morning' 
    : hour < 18 
      ? 'Good Afternoon' 
      : 'Good Evening'

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  const stats = dashboard?.stats
  const todaySchedule = dashboard?.today_schedule || []
  const recentGrades = dashboard?.recent_grades || []
  const pendingHomework = dashboard?.pending_homework || []

  // Check overdue homework count
  const overdueCount = pendingHomework.filter(h => h.days_remaining < 0).length

  return (
    <div className="space-y-8 animate-fade-in text-neutral-900">
      
      {/* Personalized Header */}
      <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-4 ring-neutral-100">
            {user.avatar && <img src={user.avatar} alt={user.prenom} className="object-cover w-full h-full" />}
            <AvatarFallback className="bg-neutral-900 text-white text-base font-extrabold uppercase">
              {user.nom.charAt(0)}{user.prenom.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              {greeting}, {user.prenom}!
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Today is {formattedDate}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Row (4 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* KPI 1: Attendance */}
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              My Attendance
            </span>
            <Clock className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {stats?.attendance_rate !== undefined ? `${stats.attendance_rate.toFixed(1)}%` : '100%'}
          </h2>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-black h-1.5 rounded-full" 
              style={{ width: `${stats?.attendance_rate || 100}%` }} 
            />
          </div>
        </Card>

        {/* KPI 2: GPA */}
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              My GPA Average
            </span>
            <GraduationCap className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            {stats?.overall_average !== null && stats?.overall_average !== undefined 
              ? `${Number(stats.overall_average).toFixed(2)} / 20` 
              : '—'}
          </h2>
          <div className="text-[10px] text-teal-650 font-bold mt-2">
            Target grade tracking active
          </div>
        </Card>

        {/* KPI 3: Pending Homework */}
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              Pending Homework
            </span>
            <BookOpen className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            {pendingHomework.length}
          </h2>
          {overdueCount > 0 ? (
            <div className="flex items-center gap-1 text-[10px] text-red-650 font-bold mt-2">
              <AlertTriangle className="h-3 w-3" />
              {overdueCount} assignment(s) overdue!
            </div>
          ) : (
            <div className="text-[10px] text-neutral-400 font-semibold mt-2">
              All up to date
            </div>
          )}
        </Card>

        {/* KPI 4: Unread Announcements */}
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              Announcements
            </span>
            <Bell className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-teal-600">
            {stats?.unread_announcements || 0}
          </h2>
          <div className="text-[10px] text-neutral-450 font-semibold mt-2">
            New messages from school
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Schedule timeline */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-6 pb-2 border-b border-neutral-50">
              Today's Schedule
            </h3>
            {todaySchedule.length > 0 ? (
              <div className="relative border-l border-neutral-100 ml-3 pl-6 space-y-6">
                {todaySchedule.map((session, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full bg-black ring-4 ring-white" />
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400">
                        {session.heure_debut} - {session.heure_fin}
                      </span>
                      <h4 className="text-xs font-extrabold text-neutral-900 mt-0.5">{session.matiere_nom}</h4>
                      <p className="text-[10px] text-neutral-450 mt-0.5">Teacher: {session.enseignant_nom}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-450 py-4 text-center">No classes scheduled for today! 🎉</p>
            )}
          </Card>

          {/* Homework Due This Week */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-50">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Homework Due
              </h3>
              <Link to="/student/homework" className="text-xs font-bold text-neutral-500 hover:text-black">
                View All
              </Link>
            </div>
            <div className="p-6 divide-y divide-neutral-50">
              {pendingHomework.length > 0 ? (
                pendingHomework.slice(0, 5).map((hw, idx) => {
                  const remains = hw.days_remaining
                  const badgeColor = remains < 0
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : remains <= 1
                      ? 'bg-orange-50 text-orange-700 border-orange-250'
                      : 'bg-green-50 text-green-700 border-green-200'

                  return (
                    <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                      <div>
                        <p className="text-xs font-bold text-neutral-850">{hw.titre}</p>
                        <p className="text-[10px] text-neutral-400">
                          Course: <span className="font-semibold text-neutral-600">{hw.matiere_nom}</span> · Due: {hw.date_echeance}
                        </p>
                      </div>
                      <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${badgeColor}`}>
                        {remains < 0 
                          ? 'Overdue' 
                          : remains === 0 
                            ? 'Due Today' 
                            : remains === 1 
                              ? 'Due Tomorrow' 
                              : `${remains} days left`
                        }
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-neutral-450 py-4 text-center">No pending homework assignments.</p>
              )}
            </div>
          </Card>

          {/* Recent Grades Widget */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-50">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Recent Grades
              </h3>
              <Link to="/student/grades" className="text-xs font-bold text-neutral-500 hover:text-black">
                View All
              </Link>
            </div>
            <div className="p-6 divide-y divide-neutral-50">
              {recentGrades.length > 0 ? (
                recentGrades.map((grade, idx) => {
                  const val = grade.valeur
                  const badgeColor = val >= 14
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : val >= 10
                      ? 'bg-yellow-50 text-yellow-750 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'

                  return (
                    <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                      <div>
                        <p className="text-xs font-bold text-neutral-850">{grade.matiere}</p>
                        <p className="text-[10px] text-neutral-400">Published: {grade.date}</p>
                      </div>
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${badgeColor}`}>
                        {grade.valeur !== null ? `${grade.valeur} / 20` : 'Absent'}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-neutral-450 py-4 text-center">No grades published recently.</p>
              )}
            </div>
          </Card>

        </div>

        {/* Right column */}
        <div className="space-y-6">
          <MiniCalendar />

          {/* Announcements Feed Preview */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-50 pb-2">
              Announcements Feed
            </h4>
            <div className="space-y-4">
              {announcements.slice(0, 3).map((ann, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[9px] font-bold text-neutral-400">{ann.published_at ? ann.published_at.substring(0, 10) : ''}</span>
                  <h5 className="text-xs font-bold text-neutral-800 leading-snug">{ann.titre}</h5>
                  <p className="text-[10px] text-neutral-450 line-clamp-2">{ann.extrait}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-xs text-neutral-400 text-center py-2">No announcements published.</p>
              )}
              <div className="pt-2 text-center border-t border-neutral-50">
                <Link to="/announcements" className="text-xs font-bold text-black hover:underline">
                  View Feed
                </Link>
              </div>
            </div>
          </Card>
        </div>

      </div>

    </div>
  )
}

export default StudentDashboard
