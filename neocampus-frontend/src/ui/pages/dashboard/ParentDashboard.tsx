import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { 
  GraduationCap, 
  CreditCard, 
  TrendingUp, 
  CalendarDays,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react'
import { 
  useChildren, 
  useChildGrades, 
  useChildAttendance, 
  useChildBalance 
} from '@/application/useCases/useParentPortal'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ParentDashboardProps {
  language: 'fr' | 'en';
  MiniCalendar: React.ComponentType;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ language, MiniCalendar }) => {
  const { data: children, isLoading: loadingChildren } = useChildren()
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null)
  
  // Collapsible states
  const [gradesExpanded, setGradesExpanded] = useState(true)
  const [attendanceExpanded, setAttendanceExpanded] = useState(true)
  const [financeExpanded, setFinanceExpanded] = useState(true)

  // Sync selected child to localStorage so layout sidebar can access it
  useEffect(() => {
    if (children && children.length > 0) {
      const saved = localStorage.getItem('selected_child_id')
      const savedId = saved ? parseInt(saved, 10) : null
      const exists = children.some(c => c.id === savedId)
      
      if (exists && savedId) {
        setSelectedChildId(savedId)
      } else {
        setSelectedChildId(children[0].id)
        localStorage.setItem('selected_child_id', children[0].id.toString())
      }
    }
  }, [children])

  const handleSelectChild = (id: number) => {
    setSelectedChildId(id)
    localStorage.setItem('selected_child_id', id.toString())
    window.dispatchEvent(new Event('childChanged'))
  }

  const activeChild = children?.find(c => c.id === selectedChildId)
  
  // Queries enabled only when child is selected
  const childId = selectedChildId || 0
  const { data: grades } = useChildGrades(childId)
  const { data: attendance } = useChildAttendance(childId)
  const { data: balance } = useChildBalance(childId)

  if (loadingChildren) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!children || children.length === 0) {
    return (
      <div className="p-6 bg-red-50 border border-red-150 rounded-2xl text-red-700 flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <div>
          <p className="font-bold">No Children Linked</p>
          <p className="text-xs">There are no children linked to your parent portal account. Please contact the administration.</p>
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalDue = balance?.solde?.montant_du ? parseFloat(balance.solde.montant_du) : 0
  const totalPaid = balance?.solde?.montant_paye ? parseFloat(balance.solde.montant_paye) : 0
  const remainingSolde = totalDue - totalPaid

  const totalAbsences = attendance?.filter(a => a.statut === 'absent').length || 0
  const totalLates = attendance?.filter(a => a.statut === 'retard').length || 0

  return (
    <div className="space-y-8 animate-fade-in text-neutral-900">
      
      {/* Child Selector Row */}
      {children.length > 1 && (
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Select Child
          </span>
          <div className="flex flex-wrap gap-4">
            {children.map((child) => {
              const isSelected = child.id === selectedChildId
              return (
                <button
                  key={child.id}
                  onClick={() => handleSelectChild(child.id)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-left transition-all duration-300 ${
                    isSelected 
                      ? 'bg-black text-white border-black shadow-md scale-[1.02]' 
                      : 'bg-white text-neutral-800 border-neutral-100 shadow-sm hover:border-neutral-300'
                  }`}
                >
                  <Avatar className="h-9 w-9 ring-2 ring-neutral-200">
                    <AvatarFallback className={`text-xs font-bold uppercase ${isSelected ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                      {child.nom.charAt(0)}{child.prenom.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-xs font-extrabold tracking-tight">{child.prenom} {child.nom}</h4>
                    <p className={`text-[10px] ${isSelected ? 'text-neutral-400' : 'text-neutral-450'}`}>{child.classe_nom}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Child summary greeting */}
      {activeChild && (
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              Viewing Portal for {activeChild.prenom} {activeChild.nom}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Class: <span className="font-bold text-neutral-800">{activeChild.classe_nom}</span> · Matricule: <span className="font-mono font-bold text-neutral-800">{activeChild.matricule}</span>
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wider">
            {activeChild.relation || 'Child'}
          </span>
        </div>
      )}

      {/* KPI Cards Row */}
      {activeChild && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* KPI 1: Latest Grade */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                Latest Grade
              </span>
              <GraduationCap className="h-4 w-4 text-neutral-400" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">
              {activeChild.latest_grade ? `${activeChild.latest_grade.valeur} / 20` : '—'}
            </h2>
            <div className="text-[10px] text-neutral-400 font-semibold mt-2 truncate">
              {activeChild.latest_grade 
                ? `${activeChild.latest_grade.matiere} (${activeChild.latest_grade.date})` 
                : 'No grades recorded'
              }
            </div>
          </Card>

          {/* KPI 2: Absences This Week */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                Absences This Week
              </span>
              <CalendarDays className="h-4 w-4 text-neutral-400" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">
              {activeChild.absence_count_week}
            </h2>
            <div className="text-[10px] text-neutral-400 font-semibold mt-2">
              Absences in the current week
            </div>
          </Card>

          {/* KPI 3: Next Payment */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                Next Payment Due
              </span>
              <CreditCard className="h-4 w-4 text-neutral-400" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-teal-600">
              {activeChild.next_payment ? `${activeChild.next_payment.montant} MAD` : '0 MAD'}
            </h2>
            <div className="text-[10px] text-neutral-450 font-semibold mt-2">
              {activeChild.next_payment 
                ? `Due by: ${activeChild.next_payment.date_echeance}` 
                : 'No upcoming fees'
              }
            </div>
          </Card>

          {/* KPI 4: Overall Average */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                Overall Average
              </span>
              <TrendingUp className="h-4 w-4 text-neutral-400" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">
              {activeChild.overall_average !== null 
                ? `${Number(activeChild.overall_average).toFixed(2)} / 20` 
                : '—'
              }
            </h2>
            <div className="text-[10px] text-neutral-400 font-semibold mt-2">
              Current term GPA
            </div>
          </Card>
        </div>
      )}

      {/* Main dashboard widgets */}
      {selectedChildId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Widget 1: Recent Grades */}
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
              <div 
                className="flex justify-between items-center px-6 py-4 border-b border-neutral-50 cursor-pointer select-none"
                onClick={() => setGradesExpanded(!gradesExpanded)}
              >
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Recent Grades
                </h3>
                {gradesExpanded ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
              </div>

              {gradesExpanded && (
                <div className="p-6 divide-y divide-neutral-50">
                  {grades && grades.length > 0 ? (
                    grades.slice(0, 5).map((grade, idx) => {
                      const value = grade.valeur ?? 0
                      const badgeColor = value >= 14 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : value >= 10 
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-250' 
                          : 'bg-red-50 text-red-700 border-red-200'

                      return (
                        <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                          <div>
                            <p className="text-xs font-bold text-neutral-850">{grade.matiere}</p>
                            <p className="text-[10px] text-neutral-400">{grade.examen} · {grade.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {grade.classe_average && (
                              <span className="text-[9px] text-neutral-400 font-semibold">
                                Class Avg: {grade.classe_average}/20
                              </span>
                            )}
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${badgeColor}`}>
                              {grade.valeur !== null ? `${grade.valeur} / 20` : 'Absent'}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-xs text-neutral-450 py-4 text-center">No grades recorded yet.</p>
                  )}
                  {grades && grades.length > 0 && (
                    <div className="pt-4 text-right">
                      <Link 
                        to={`/parent/child/${selectedChildId}/grades`}
                        className="text-xs font-bold text-black hover:underline"
                      >
                        View All Grades →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Widget 2: Attendance Summary */}
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
              <div 
                className="flex justify-between items-center px-6 py-4 border-b border-neutral-50 cursor-pointer select-none"
                onClick={() => setAttendanceExpanded(!attendanceExpanded)}
              >
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Attendance Tracker
                </h3>
                {attendanceExpanded ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
              </div>

              {attendanceExpanded && (
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-neutral-50 rounded-xl text-center">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase">Absences</p>
                      <h4 className="text-2xl font-extrabold text-red-600 mt-1">{totalAbsences}</h4>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-xl text-center">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase">Lateness</p>
                      <h4 className="text-2xl font-extrabold text-yellow-600 mt-1">{totalLates}</h4>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-xl text-center">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase">Attendance Rate</p>
                      <h4 className="text-2xl font-extrabold text-neutral-850 mt-1">
                        {attendance && attendance.length > 0 
                          ? `${((attendance.length - totalAbsences) / attendance.length * 100).toFixed(1)}%` 
                          : '100%'
                        }
                      </h4>
                    </div>
                  </div>

                  {attendance && attendance.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Recent Incidents
                      </h4>
                      <div className="divide-y divide-neutral-50">
                        {attendance.slice(0, 3).map((record, idx) => (
                          <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                            <div>
                              <p className="text-xs font-bold text-neutral-850 truncate max-w-xs">{record.matiere_nom}</p>
                              <p className="text-[10px] text-neutral-400">{record.date} at {record.heure}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                record.statut === 'absent' 
                                  ? 'bg-red-50 text-red-700' 
                                  : 'bg-yellow-50 text-yellow-750'
                              }`}>
                                {record.statut}
                              </span>
                              <p className="text-[9px] text-neutral-400 mt-1">
                                {record.justifie ? 'Justified' : 'Unjustified'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-450 py-2 text-center">No attendance incidents reported.</p>
                  )}

                  <div className="pt-4 text-right border-t border-neutral-50 mt-4">
                    <Link 
                      to={`/parent/child/${selectedChildId}/attendance`}
                      className="text-xs font-bold text-black hover:underline"
                    >
                      View Attendance Details →
                    </Link>
                  </div>
                </div>
              )}
            </Card>

            {/* Widget 3: Financial Summary */}
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
              <div 
                className="flex justify-between items-center px-6 py-4 border-b border-neutral-50 cursor-pointer select-none"
                onClick={() => setFinanceExpanded(!financeExpanded)}
              >
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Financial Status
                </h3>
                {financeExpanded ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
              </div>

              {financeExpanded && (
                <div className="p-6">
                  {balance ? (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Payment Progress</span>
                          <span>{totalPaid} / {totalDue} MAD Paid</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${totalDue > 0 ? (totalPaid / totalDue * 100) : 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                        <div>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase">Remaining Balance</p>
                          <h4 className={`text-xl font-extrabold mt-0.5 ${remainingSolde > 0 ? 'text-red-500' : 'text-teal-600'}`}>
                            {remainingSolde} MAD
                          </h4>
                        </div>
                        {remainingSolde > 0 && (
                          <span className="text-[9px] font-bold bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200">
                            Unpaid Fees Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-450 py-4 text-center">No financial logs recorded.</p>
                  )}

                  <div className="pt-4 text-right border-t border-neutral-50 mt-4">
                    <Link 
                      to={`/parent/child/${selectedChildId}/balance`}
                      className="text-xs font-bold text-black hover:underline"
                    >
                      View Financial Details →
                    </Link>
                  </div>
                </div>
              )}
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MiniCalendar />
            
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-50 pb-2">
                Quick Actions
              </h4>
              <div className="flex flex-col gap-2.5">
                <Link 
                  to={`/parent/child/${selectedChildId}/timetable`}
                  className="w-full text-center py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  View Class Timetable
                </Link>
                <Link 
                  to={`/parent/child/${selectedChildId}/bulletins`}
                  className="w-full text-center py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition"
                >
                  View Term Report Cards
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParentDashboard
