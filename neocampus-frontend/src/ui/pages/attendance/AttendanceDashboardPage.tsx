import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/application/stores/authStore'
import { useTeacher } from '@/application/useCases/useTeacher'
import { useSeance } from '@/application/useCases/useSeance'
import { usePresence } from '@/application/useCases/usePresence'
import { Link } from 'react-router-dom'
import { Calendar, Search, Clock, CheckCircle, AlertTriangle, User, Check, X, ShieldAlert, BookOpen } from 'lucide-react'
import { studentApiService } from '@/infrastructure/api/studentApiService'

export const AttendanceDashboardPage: React.FC = () => {
  const { language, user } = useAuthStore()
  const { teachers } = useTeacher()
  const { useTeacherTimetable } = useSeance()
  const { useStudentPresences, useAllPresences, updatePresenceStatus, updatingPresenceStatus } = usePresence()

  // Admin filter states
  const [range, setRange] = useState<'day' | 'month' | '3_months' | 'year'>('month')
  const [searchQuery, setSearchQuery] = useState('')
  const [inlineMotifs, setInlineMotifs] = useState<Record<number, string>>({})

  // Teacher states
  const [studentSearchMatricule, setStudentSearchMatricule] = useState('')
  const [searchedStudentId, setSearchedStudentId] = useState<number | null>(null)
  const [studentInfo, setStudentInfo] = useState<any>(null)

  // 1. Resolve logged in teacher details
  const teacher = teachers.find((t: any) => t.user_id === user?.id || t.user?.email === user?.email)
  const teacherId = teacher?.id ?? 0

  // 2. Fetch teacher timetable sessions
  const { data: seances = [], isLoading: loadingSeances } = useTeacherTimetable(teacherId)

  // 3. Fetch all presences for admin overview
  const { data: presences = [], isLoading: loadingPresences } = useAllPresences({
    range,
    search: searchQuery
  })

  // 4. Fetch student presence history if searched (for sidebar widget)
  const { data: studentHistory = [], isLoading: loadingHistory } = useStudentPresences(searchedStudentId ?? 0)

  // Separate today's seances and history for teacher
  const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const todayJour = daysOfWeek[new Date().getDay()]
  
  const todaySeances = seances.filter((s: any) => s.jour === todayJour)
  const otherSeances = seances.filter((s: any) => s.jour !== todayJour)

  const handleStudentSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentSearchMatricule) return

    try {
      const studentsList = await studentApiService.search({ search: studentSearchMatricule })
      if (studentsList && studentsList.length > 0) {
        setSearchedStudentId(studentsList[0].id)
        setStudentInfo(studentsList[0])
      } else {
        alert(language === 'fr' ? 'Aucun élève trouvé.' : 'No student found.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleStatusUpdate = async (presenceId: number, statut: 'present' | 'absent' | 'retard') => {
    const motif = inlineMotifs[presenceId] !== undefined ? inlineMotifs[presenceId] : ''
    try {
      await updatePresenceStatus({ id: presenceId, statut, motif: statut === 'present' ? '' : motif })
    } catch (err) {
      console.error(err)
    }
  }

  const getAbsenceCount = () => {
    return studentHistory.filter((p: any) => p.statut === 'absent').length
  }

  const getLateCount = () => {
    return studentHistory.filter((p: any) => p.statut === 'retard').length
  }

  // Calculate statistics from the loaded list
  const totalAbsences = presences.filter((p: any) => p.statut === 'absent').length
  const totalLates = presences.filter((p: any) => p.statut === 'retard').length
  const totalReports = presences.length

  const formatDateFrench = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-6 max-w-[1024px] mx-auto animate-fade-in py-4 text-neutral-900">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {language === 'fr' ? 'Suivi des Absences' : 'Attendance Control'}
        </h1>
        <p className="text-xs text-neutral-400 font-medium">
          {isAdmin 
            ? (language === 'fr' 
                ? 'Régularisation administrative globale, statistiques d\'assiduité et contrôle des absences.' 
                : 'Global administrative adjustments, attendance statistics, and absence overrides.')
            : (language === 'fr'
                ? 'Gérez l\'assiduité quotidienne et suivez l\'historique des élèves.' 
                : 'Manage daily sheets and track student attendance history.')
          }
        </p>
      </div>

      {isAdmin ? (
        // ==========================================
        // ADMIN ATTENDANCE CENTER REDESIGN
        // ==========================================
        <div className="space-y-6">
          
          {/* Analytics Statistics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                    {language === 'fr' ? 'Absences Signalées' : 'Reported Absences'}
                  </span>
                  <span className="text-3xl font-black text-red-950 mt-1 block">{totalAbsences}</span>
                  <span className="text-[9px] font-bold text-neutral-400 mt-2 block">
                    {language === 'fr' ? 'Défaut de présence actif' : 'Active absences reported'}
                  </span>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600">
                  <ShieldAlert className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                    {language === 'fr' ? 'Retards Signalés' : 'Reported Lates'}
                  </span>
                  <span className="text-3xl font-black text-amber-950 mt-1 block">{totalLates}</span>
                  <span className="text-[9px] font-bold text-neutral-400 mt-2 block">
                    {language === 'fr' ? 'Retards de cours accumulés' : 'Late entries registered'}
                  </span>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-600">
                  <Clock className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                    {language === 'fr' ? 'Total Signalements' : 'Total Incidents'}
                  </span>
                  <span className="text-3xl font-black text-neutral-900 mt-1 block">{totalReports}</span>
                  <span className="text-[9px] font-bold text-neutral-400 mt-2 block">
                    {language === 'fr' ? 'Incidents d\'assiduité' : 'Total registered incidents'}
                  </span>
                </div>
                <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-neutral-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Filtering & Listing Workspace Card */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-neutral-50 pb-5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  {language === 'fr' ? 'Registre des Absences & Retards' : 'Absence & Late Registry'}
                </CardTitle>
                <CardDescription className="text-[10px] font-medium text-neutral-400 mt-1">
                  {language === 'fr' 
                    ? 'Régularisez en temps réel. Les élèves marqués présents seront effacés de la liste.'
                    : 'Override in real-time. Students marked present will clear from this queue.'}
                </CardDescription>
              </div>

              {/* Date Filters Segmented Group */}
              <div className="flex border border-neutral-200 rounded-xl overflow-hidden p-0.5 bg-neutral-100">
                {(['day', 'month', '3_months', 'year'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all capitalize ${
                      range === r
                        ? 'bg-black text-white'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {r === 'day' 
                      ? (language === 'fr' ? "Aujourd'hui" : 'Today')
                      : r === 'month' 
                      ? (language === 'fr' ? 'Ce Mois' : '30 Days')
                      : r === '3_months' 
                      ? (language === 'fr' ? '3 Mois' : '90 Days')
                      : (language === 'fr' ? 'Année' : 'Year')
                    }
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder={language === 'fr' ? 'Rechercher un élève par nom, matricule ou classe...' : 'Search student by name, matricule, class...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl h-9 text-xs border-neutral-200"
                />
              </div>

              {/* Absences / Lates Registry List */}
              {loadingPresences ? (
                <div className="text-center py-12 text-xs text-neutral-400">
                  {language === 'fr' ? 'Chargement du registre...' : 'Loading registry...'}
                </div>
              ) : presences.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs font-semibold">
                  {language === 'fr' ? 'Aucune absence ou retard répertorié.' : 'No absences or lates recorded.'}
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {presences.map((p: any) => {
                    const student = p.eleve || {}
                    const seance = p.seance || {}
                    const currentMotif = inlineMotifs[p.id] !== undefined ? inlineMotifs[p.id] : (p.motif || '')

                    return (
                      <div key={p.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors rounded-xl px-2">
                        
                        {/* Student Details & Counter Badges */}
                        <div className="flex items-start gap-3">
                          <div className="bg-neutral-100 border border-neutral-200 rounded-full h-9 w-9 flex items-center justify-center text-neutral-500 mt-0.5">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-neutral-900">{student.prenom} {student.nom}</p>
                              <span className="text-[9px] font-bold text-neutral-400">({student.matricule})</span>
                            </div>
                            
                            {/* Cumulative Attendance Counters */}
                            <div className="flex gap-2 mt-1.5">
                              <span className="bg-red-50 text-red-700 border border-red-100 rounded px-1.5 py-0.5 text-[8px] font-bold flex items-center gap-1">
                                {student.absences_count ?? 0} {language === 'fr' ? 'Absences' : 'Absences'}
                              </span>
                              <span className="bg-amber-50 text-amber-700 border border-amber-100 rounded px-1.5 py-0.5 text-[8px] font-bold flex items-center gap-1">
                                {student.retards_count ?? 0} {language === 'fr' ? 'Retards' : 'Lates'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Class, Date & Session Information */}
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-neutral-700 flex items-center gap-1">
                            <BookOpen className="h-3 w-3 text-neutral-400" />
                            {student.classe?.nom || student.classe_nom || 'Classe'} — {seance.matiere?.nom || seance.matiere_nom || 'Matière'}
                          </p>
                          <p className="text-[10px] text-neutral-500 font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-neutral-400" />
                            {formatDateFrench(p.date)}
                            <span className="text-neutral-300">|</span>
                            {seance.heure_debut ? `${seance.heure_debut.substring(0, 5)} - ${seance.heure_fin.substring(0, 5)}` : 'Session'}
                          </p>
                        </div>

                        {/* Status, Reason & Instant Correct actions */}
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:justify-end">
                          
                          {/* Reason Input */}
                          <div className="min-w-[150px] w-full md:w-auto">
                            <Input
                              placeholder={language === 'fr' ? 'Ajouter un motif...' : 'Add reason...'}
                              value={currentMotif}
                              onChange={(e) => setInlineMotifs({ ...inlineMotifs, [p.id]: e.target.value })}
                              className="h-8 text-[10px] rounded-xl border-neutral-200"
                            />
                          </div>

                          {/* Quick Action correction buttons */}
                          <div className="flex border border-neutral-200 rounded-xl overflow-hidden p-0.5 bg-neutral-100 shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(p.id, 'present')}
                              disabled={updatingPresenceStatus}
                              className="text-[9px] font-bold px-2.5 py-1.5 rounded-lg text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-all flex items-center gap-1"
                              title={language === 'fr' ? 'Régulariser à Présent' : 'Mark as Present'}
                            >
                              <Check className="h-3 w-3" />
                              {language === 'fr' ? 'Présent' : 'Present'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(p.id, 'retard')}
                              disabled={updatingPresenceStatus}
                              className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                                p.statut === 'retard'
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : 'text-amber-700 hover:bg-amber-50 hover:text-amber-800'
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              {language === 'fr' ? 'Retard' : 'Late'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(p.id, 'absent')}
                              disabled={updatingPresenceStatus}
                              className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                                p.statut === 'absent'
                                  ? 'bg-red-600 text-white shadow-sm'
                                  : 'text-red-700 hover:bg-red-50 hover:text-red-800'
                              }`}
                            >
                              <X className="h-3 w-3" />
                              {language === 'fr' ? 'Absent' : 'Absent'}
                            </button>
                          </div>

                        </div>

                      </div>
                    )
                  })}
                </div>
              )}

            </CardContent>
          </Card>

        </div>
      ) : (
        // ==========================================
        // TEACHER DASHBOARD (TIMETABLE SEANCES)
        // ==========================================
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Sheets */}
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
              <CardHeader className="border-b border-neutral-50 pb-4">
                <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  {language === 'fr' ? `Appels d'Aujourd'hui (${todayJour})` : `Today's Sheets (${todayJour})`}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6 space-y-4">
                {loadingSeances ? (
                  <div className="text-center py-6 text-xs text-neutral-400">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>
                ) : todaySeances.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-xs font-semibold">
                    {language === 'fr' ? 'Aucun cours programmé pour aujourd\'hui.' : 'No sessions scheduled for today.'}
                  </div>
                ) : (
                  todaySeances.map((seance: any) => (
                    <div key={seance.id} className="flex items-center justify-between p-4 bg-[#fdfdfd] border border-neutral-100 rounded-xl hover:border-neutral-200 transition-colors">
                      <div>
                        <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider">
                          {seance.heure_debut.substring(0, 5)} - {seance.heure_fin.substring(0, 5)}
                        </span>
                        <p className="text-xs font-bold text-neutral-900 mt-1">
                          {seance.matiere_nom || seance.matiere?.nom || 'Cours'}
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          Classe : {seance.classe_nom || seance.classe?.nom}
                        </p>
                      </div>
                      <Button asChild size="sm" className="bg-black hover:bg-neutral-900 text-white font-bold rounded-xl text-xs px-4 py-2">
                        <Link to={`/teacher/attendance/${seance.id}`}>
                          {language === 'fr' ? 'Faire l\'appel' : 'Take Attendance'}
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Historical Sheets */}
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
              <CardHeader className="border-b border-neutral-50 pb-4">
                <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  {language === 'fr' ? 'Historique des autres jours' : ' Timetable Sessions History'}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6 space-y-4">
                {loadingSeances ? (
                  <div className="text-center py-6 text-xs text-neutral-400">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>
                ) : otherSeances.length === 0 ? (
                  <div className="text-center py-6 text-neutral-400 text-xs font-semibold">
                    {language === 'fr' ? 'Aucune autre séance configurée.' : 'No other sessions found.'}
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {otherSeances.map((seance: any) => (
                      <div key={seance.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-xs font-bold text-neutral-900">
                            {seance.jour} : {seance.heure_debut.substring(0, 5)} - {seance.heure_fin.substring(0, 5)}
                          </p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            {seance.matiere_nom} | Classe : {seance.classe_nom}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-[10px] font-bold h-8 border-neutral-200">
                          <Link to={`/teacher/attendance/${seance.id}`}>
                            {language === 'fr' ? 'Modifier la saisie' : 'Modify sheet'}
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Student Search Widget (Sidebar) */}
          <div className="space-y-6">
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                {language === 'fr' ? 'Historique par Élève' : 'Student Search History'}
              </h3>
              <form onSubmit={handleStudentSearch} className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder={language === 'fr' ? 'Saisir le matricule...' : 'Enter student ID/matricule...'}
                    value={studentSearchMatricule}
                    onChange={(e) => setStudentSearchMatricule(e.target.value)}
                    className="pl-9 rounded-xl h-9 text-xs border-neutral-200"
                  />
                </div>
                <Button type="submit" size="sm" className="w-full bg-black text-white font-bold rounded-xl text-xs">
                  {language === 'fr' ? 'Rechercher' : 'Search'}
                </Button>
              </form>

              {studentInfo && (
                <div className="border-t border-neutral-100 pt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-neutral-50 border border-neutral-100 rounded-full h-8 w-8 flex items-center justify-center text-neutral-500">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{studentInfo.prenom} {studentInfo.nom}</h4>
                      <p className="text-[9px] font-bold text-neutral-400">{studentInfo.matricule}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 block">Absences</span>
                      <span className="text-lg font-black text-red-950 mt-1 block">{getAbsenceCount()}</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 block">Retards</span>
                      <span className="text-lg font-black text-amber-950 mt-1 block">{getLateCount()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {loadingHistory ? (
                      <div className="text-center text-[10px] text-neutral-400">...</div>
                    ) : studentHistory.length === 0 ? (
                      <div className="text-center text-[10px] text-neutral-400">
                        {language === 'fr' ? 'Aucune absence enregistrée.' : 'Perfect attendance record.'}
                      </div>
                    ) : (
                      studentHistory.map((hist: any) => (
                        <div key={hist.id} className="flex items-center justify-between text-[10px] p-2 bg-neutral-50 rounded-lg">
                          <span className="font-semibold">{hist.date}</span>
                          <span className={`font-bold px-2 py-0.5 rounded-full uppercase ${
                            hist.statut === 'absent' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {hist.statut}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceDashboardPage
