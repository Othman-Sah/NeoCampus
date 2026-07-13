import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/application/useCases/useTranslation'
import {
  useOverviewStats,
  useAttendanceTrend,
  useGradeDistribution,
  useFinanceTrend,
  useUpcomingExams,
  useRecentActivities
} from '@/application/useCases/admin/useStatistics'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  CalendarDays, 
  History, 
  BookMarked,
  ArrowRight,
  ChevronRight,
  TrendingDown,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend
} from 'recharts'

// Custom count up micro-animation for KPIs
const CountUp: React.FC<{ value: number; duration?: number; decimals?: number; suffix?: string }> = ({ 
  value, 
  duration = 1000, 
  decimals = 0, 
  suffix = '' 
}) => {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setCount(progress * value)
      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setCount(value)
      }
    }
    window.requestAnimationFrame(step)
  }, [value, duration])

  return <span>{count.toFixed(decimals)}{suffix}</span>
}

export const AdminDashboardPage: React.FC = () => {
  const { t, language } = useTranslation()

  // Queries
  const { data: overview, isLoading: loadingOverview } = useOverviewStats()
  const { data: attendanceTrend, isLoading: loadingAttendance } = useAttendanceTrend('month')
  const { data: gradeDistribution, isLoading: loadingGrades } = useGradeDistribution()
  const { data: financeTrend, isLoading: loadingFinance } = useFinanceTrend('month')
  const { data: upcomingExams, isLoading: loadingExams } = useUpcomingExams(5)
  const { data: recentActivities, isLoading: loadingActivities } = useRecentActivities(10)

  // Calculate days remaining helper
  const getDaysRemaining = (dateStr: string) => {
    const examDate = new Date(dateStr)
    const today = new Date()
    const diffTime = examDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Format activity action icon helper
  const getActivityIcon = (action: string) => {
    if (action.includes('Paiement') || action.includes('Payment')) {
      return <DollarSign className="h-4 w-4 text-emerald-600" />
    }
    if (action.includes('Absence') || action.includes('Attendance')) {
      return <Clock className="h-4 w-4 text-red-650" />
    }
    return <BookMarked className="h-4 w-4 text-teal-600" />
  }

  const getActivityBg = (action: string) => {
    if (action.includes('Paiement') || action.includes('Payment')) {
      return 'bg-emerald-50'
    }
    if (action.includes('Absence') || action.includes('Attendance')) {
      return 'bg-red-50'
    }
    return 'bg-teal-50'
  }

  return (
    <div className="space-y-8 animate-fade-in text-neutral-900 pb-12">
      {/* Dashboard Title Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
          {t('admin_dashboard_title' as any, 'Super Admin Dashboard')}
        </h1>
        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">
          {t('admin_dashboard_subtitle' as any, 'General school statistics, attendance logs, finance trends and activity feeds.')}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Students */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-neutral-250 transition-all duration-300">
          <CardHeader className="p-0 flex flex-row items-center justify-between">
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
              {t('total_students', 'Total Students')}
            </span>
            <div className="p-2 bg-neutral-50 rounded-xl text-neutral-600">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <h2 className="text-3xl font-black tracking-tight text-neutral-900">
              {loadingOverview ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <CountUp value={overview?.total_eleves ?? 0} />
              )}
            </h2>
            <div className="flex items-center gap-1 text-[10px] font-bold text-teal-600 mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+4% this month</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Teachers */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-neutral-250 transition-all duration-300">
          <CardHeader className="p-0 flex flex-row items-center justify-between">
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
              {t('total_teachers' as any, 'Total Teachers')}
            </span>
            <div className="p-2 bg-neutral-50 rounded-xl text-neutral-600">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <h2 className="text-3xl font-black tracking-tight text-neutral-900">
              {loadingOverview ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <CountUp value={overview?.total_enseignants ?? 0} />
              )}
            </h2>
            <div className="flex items-center gap-1 text-[10px] font-bold text-teal-600 mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>Full active staff</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Attendance Today */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-neutral-250 transition-all duration-300">
          <CardHeader className="p-0 flex flex-row items-center justify-between">
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
              {t('daily_attendance' as any, "Today's Attendance")}
            </span>
            <div className="p-2 bg-teal-50 rounded-xl text-teal-650">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <h2 className="text-3xl font-black tracking-tight text-neutral-900">
              {loadingOverview ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <CountUp value={overview?.attendance_rate_today ?? 100.0} decimals={1} suffix="%" />
              )}
            </h2>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-black h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${overview?.attendance_rate_today ?? 100.0}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Monthly Revenue */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-neutral-250 transition-all duration-300">
          <CardHeader className="p-0 flex flex-row items-center justify-between">
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
              {t('monthly_revenue' as any, 'Monthly Collection Rate')}
            </span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-650">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <h2 className="text-3xl font-black tracking-tight text-neutral-900">
              {loadingOverview ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <CountUp value={overview?.collection_rate_month ?? 100.0} decimals={1} suffix="%" />
              )}
            </h2>
            <div className="flex items-center gap-1 text-[10px] font-bold text-teal-600 mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>Target 80% this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance Line Chart */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6">
          <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between border-b border-neutral-50 mb-6">
            <div>
              <CardTitle className="text-xs font-black uppercase tracking-wider text-neutral-900">
                {t('attendance_trend' as any, 'Attendance Rate (Last 30 Days)')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-80">
            {loadingAttendance ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#a3a3a3" 
                    fontSize={10} 
                    tickLine={false} 
                    tickFormatter={(date) => date.substring(8, 10) + '/' + date.substring(5, 7)}
                  />
                  <YAxis stroke="#a3a3a3" fontSize={10} tickLine={false} domain={[50, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#09090b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    labelStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '12px', color: '#14b8a6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attendance_rate" 
                    name="Attendance Rate"
                    stroke="#14b8a6" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Finance Area Chart */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6">
          <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between border-b border-neutral-50 mb-6">
            <div>
              <CardTitle className="text-xs font-black uppercase tracking-wider text-neutral-900">
                {t('finance_overview' as any, 'Collections vs Outstanding (Last 6 Months)')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-80">
            {loadingFinance ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financeTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="outstandingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis dataKey="month" stroke="#a3a3a3" fontSize={10} tickLine={false} />
                  <YAxis stroke="#a3a3a3" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#09090b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                  <Area 
                    type="monotone" 
                    dataKey="collected" 
                    name="Collected (MAD)"
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#collectedGrad)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="outstanding" 
                    name="Outstanding (MAD)"
                    stroke="#f43f5e" 
                    fillOpacity={1} 
                    fill="url(#outstandingGrad)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Grade Distribution Bar Chart */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6 lg:col-span-2">
          <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between border-b border-neutral-50 mb-6">
            <div>
              <CardTitle className="text-xs font-black uppercase tracking-wider text-neutral-900">
                {t('grade_distribution' as any, 'Grade Averages & Extremes by Subject')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-80">
            {loadingGrades ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : gradeDistribution?.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs font-bold uppercase tracking-wider text-neutral-400">
                {t('no_data', 'No Data Available')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis dataKey="subject" stroke="#a3a3a3" fontSize={10} tickLine={false} />
                  <YAxis stroke="#a3a3a3" fontSize={10} tickLine={false} domain={[0, 20]} />
                  <Tooltip 
                    contentStyle={{ background: '#09090b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                  <Bar dataKey="min_grade" name="Min Grade" fill="#e5e5e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="average_grade" name="Average Grade" fill="#09090b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max_grade" name="Max Grade" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams & Recent Activities Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Exams Widget */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6 lg:col-span-1">
          <CardHeader className="p-0 pb-4 border-b border-neutral-50 mb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-teal-600" />
              <span>{t('upcoming_exams' as any, 'Upcoming Exams')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {loadingExams ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : upcomingExams?.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-400 font-bold uppercase">
                {t('no_upcoming_exams' as any, 'No exams scheduled')}
              </div>
            ) : (
              upcomingExams?.map((exam) => {
                const daysLeft = getDaysRemaining(exam.date)
                const isUrgent = daysLeft <= 2
                return (
                  <div key={exam.id} className="p-3.5 bg-neutral-50/70 border border-neutral-100 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-neutral-900 truncate flex-1">{exam.title}</h4>
                      <Badge variant="outline" className="text-[9px] font-black uppercase bg-teal-50 border-teal-200 text-teal-700 shrink-0">
                        {exam.subject}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
                      <span>{exam.class_name}</span>
                      <span className={isUrgent ? 'text-rose-600' : 'text-neutral-500'}>
                        {daysLeft > 0 ? `${daysLeft} days remaining` : 'Scheduled today'}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6 lg:col-span-2">
          <CardHeader className="p-0 pb-4 border-b border-neutral-50 mb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <History className="h-4 w-4 text-neutral-900" />
              <span>{t('recent_activities' as any, 'System Logs & Feed')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-neutral-50 max-h-[350px] overflow-y-auto pr-1">
            {loadingActivities ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : recentActivities?.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400 font-bold uppercase">
                {t('no_activities' as any, 'No recent activity')}
              </div>
            ) : (
              recentActivities?.map((act) => (
                <div key={act.id} className="flex items-start justify-between py-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${getActivityBg(act.action)}`}>
                      {getActivityIcon(act.action)}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-neutral-950">{act.action}</p>
                      <p className="text-[11px] font-semibold text-neutral-500">{act.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{act.user_name}</p>
                    <p className="text-[9px] text-neutral-400 mt-0.5">{act.created_at}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboardPage;
