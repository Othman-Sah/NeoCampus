import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/application/stores/authStore'
import { useTeacher } from '@/application/useCases/useTeacher'
import { useSeance } from '@/application/useCases/useSeance'
import { usePresence } from '@/application/useCases/usePresence'
import { studentApiService } from '@/infrastructure/api/studentApiService'
import { Check, User, AlertCircle } from 'lucide-react'
import { Student } from '@/domain/ports/IStudentService'

export const AttendanceSheetPage: React.FC = () => {
  const { seanceId } = useParams<{ seanceId: string }>()
  const navigate = useNavigate()
  const { language } = useAuthStore()
  const { teachers } = useTeacher()
  const { useTeacherTimetable } = useSeance()
  const { useClassPresences, submitBulk, submittingBulk } = usePresence()

  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [attendance, setAttendance] = useState<Record<number, { statut: 'present' | 'absent' | 'retard'; motif: string }>>({})

  const sId = parseInt(seanceId ?? '0')

  // Get current user and teacher ID
  const { user } = useAuthStore()
  const teacher = teachers.find((t: any) => t.user_id === user?.id || t.user?.email === user?.email)
  const teacherId = teacher?.id ?? 0

  // Fetch seances list to find current seance details
  const { data: seances = [] } = useTeacherTimetable(teacherId)
  const currentSeance = seances.find((s: any) => s.id === sId)
  const classId = currentSeance?.classe_id ?? 0
  const className = currentSeance?.classe_nom || currentSeance?.classe?.nom || 'Classe'
  const subjectName = currentSeance?.matiere_nom || currentSeance?.matiere?.nom || 'Matière'
  const timeRange = currentSeance ? `${currentSeance.heure_debut.substring(0, 5)}–${currentSeance.heure_fin.substring(0, 5)}` : '08:00-10:00'
  const todayDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Fetch existing presences for today if already entered
  const { data: existingPresences = [], isLoading: loadingPresences } = useClassPresences(classId, todayDate)

  // 1. Fetch class students list
  useEffect(() => {
    if (classId) {
      setLoadingStudents(true)
      studentApiService.findAllByClasse(classId)
        .then((data) => {
          setStudents(data)
          // Initialize attendance record map
          const initialMap: typeof attendance = {}
          data.forEach((s) => {
            // Check if there is an existing presence record
            const match = existingPresences.find((p: any) => p.eleve_id === s.id && p.seance_id === sId)
            initialMap[s.id] = {
              statut: match ? match.statut : 'present', // Default to present
              motif: match?.motif || '',
            }
          })
          setAttendance(initialMap)
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingStudents(false))
    }
  }, [classId, existingPresences, sId])

  const handleStatusChange = (studentId: number, statut: 'present' | 'absent' | 'retard') => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        statut,
        // clear motif if marking present
        motif: statut === 'present' ? '' : prev[studentId]?.motif || '',
      },
    }))
  }

  const handleMotifChange = (studentId: number, motif: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        motif,
      },
    }))
  }

  const handleMarkAllPresent = () => {
    const updated = { ...attendance }
    students.forEach((s) => {
      updated[s.id] = {
        statut: 'present',
        motif: '',
      }
    })
    setAttendance(updated)
  }

  const handleSaveAttendance = async () => {
    const payload = Object.entries(attendance).map(([studentId, data]) => ({
      eleve_id: parseInt(studentId),
      statut: data.statut,
      motif: data.motif,
    }))

    try {
      await submitBulk({
        seanceId: sId,
        date: todayDate,
        presences: payload,
      })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    }
  }

  // Attendance metrics
  const totalStudents = students.length
  const presentCount = Object.values(attendance).filter(a => a.statut === 'present').length
  const absentCount = Object.values(attendance).filter(a => a.statut === 'absent').length
  const retardCount = Object.values(attendance).filter(a => a.statut === 'retard').length

  const formatDateFrench = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <div className="space-y-6 max-w-[1024px] mx-auto animate-fade-in py-4 text-neutral-900">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {language === 'fr' ? 'Absences & Présences' : 'Attendance Sheets'}
        </h1>
        <div className="border-b border-neutral-100 flex gap-6 pb-px mt-2">
          <button className="border-b-2 border-black font-semibold text-sm pb-2.5">
            {language === 'fr' ? 'Saisie Journalière' : 'Daily Record'}
          </button>
        </div>
      </div>

      {/* Filter Information Row */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="bg-white border border-neutral-200 px-4 py-2 rounded-xl text-xs font-bold text-neutral-800 shadow-sm">
          Classe : <span className="text-neutral-600 font-medium">{className}</span>
        </div>
        <div className="bg-white border border-neutral-200 px-4 py-2 rounded-xl text-xs font-bold text-neutral-800 shadow-sm">
          Date : <span className="text-neutral-600 font-medium">{formatDateFrench(todayDate)}</span>
        </div>
        <div className="bg-white border border-neutral-200 px-4 py-2 rounded-xl text-xs font-bold text-neutral-800 shadow-sm">
          Créneau : <span className="text-neutral-600 font-medium">{timeRange} ({subjectName})</span>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-neutral-50 pb-5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-neutral-900">
              {className} — {formatDateFrench(todayDate)} — {timeRange}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllPresent}
              className="rounded-xl text-[10px] font-extrabold tracking-wider border-neutral-200 h-8 gap-1"
            >
              <Check className="h-3.5 w-3.5 text-teal-600" />
              {language === 'fr' ? 'TOUT MARQUER PRÉSENT' : 'MARK ALL PRESENT'}
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="flex bg-neutral-50 border border-neutral-100 rounded-full px-4 py-1.5 text-xs text-neutral-700 font-medium gap-3">
            <div>
              {language === 'fr' ? 'Présents' : 'Present'} : <span className="font-extrabold text-black">{presentCount}</span>
            </div>
            <div className="text-neutral-200">|</div>
            <div className="text-red-600">
              {language === 'fr' ? 'Absents' : 'Absent'} : <span className="font-extrabold">{absentCount}</span>
            </div>
            <div className="text-neutral-200">|</div>
            <div className="text-amber-600">
              {language === 'fr' ? 'Retards' : 'Late'} : <span className="font-extrabold">{retardCount}</span>
            </div>
            <div className="text-neutral-200">|</div>
            <div className="text-neutral-400">
              Total : <span className="font-extrabold text-neutral-500">{totalStudents}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loadingStudents || loadingPresences ? (
            <div className="text-center py-12 text-xs text-neutral-400">
              {language === 'fr' ? 'Chargement de la liste des élèves...' : 'Loading students list...'}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs font-semibold">
              {language === 'fr' ? 'Aucun élève inscrit dans cette classe.' : 'No students registered in this class.'}
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {students.map((student) => {
                const currentRecord = attendance[student.id] || { statut: 'present', motif: '' }
                return (
                  <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                    
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <div className="bg-neutral-100 rounded-full h-9 w-9 flex items-center justify-center border border-neutral-200 text-neutral-500">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-black">{student.nom} {student.prenom}</p>
                        <span className="inline-block bg-neutral-100 text-neutral-500 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5">
                          {student.matricule}
                        </span>
                      </div>
                    </div>

                    {/* Controls & Motif */}
                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      
                      {/* Motif Input: appears inline when NOT present */}
                      {currentRecord.statut !== 'present' && (
                        <div className="w-full sm:w-auto min-w-[200px]">
                          <Input
                            placeholder={language === 'fr' ? 'Motif de l\'absence...' : 'Reason for absence...'}
                            value={currentRecord.motif}
                            onChange={(e) => handleMotifChange(student.id, e.target.value)}
                            className="h-8 text-xs rounded-xl"
                          />
                        </div>
                      )}

                      {/* Status Button Group */}
                      <div className="flex border border-neutral-200 rounded-xl overflow-hidden p-0.5 bg-neutral-100 shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                            currentRecord.statut === 'present'
                              ? 'bg-black text-white'
                              : 'text-neutral-400 hover:text-neutral-600'
                          }`}
                        >
                          {language === 'fr' ? 'Présent' : 'Present'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                            currentRecord.statut === 'absent'
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'text-neutral-400 hover:text-neutral-600'
                          }`}
                        >
                          {language === 'fr' ? 'Absent' : 'Absent'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'retard')}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                            currentRecord.statut === 'retard'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-neutral-400 hover:text-neutral-600'
                          }`}
                        >
                          {language === 'fr' ? 'Retard' : 'Late'}
                        </button>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>

        {/* CTA Footer */}
        <div className="bg-neutral-50 border-t border-neutral-100 p-4 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="rounded-xl font-bold text-xs"
          >
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          <Button
            type="button"
            disabled={submittingBulk || students.length === 0}
            onClick={handleSaveAttendance}
            className="bg-black hover:bg-neutral-900 text-white font-bold rounded-xl text-xs px-6 py-2 gap-2"
          >
            {submittingBulk && <span className="animate-spin text-white">...</span>}
            {language === 'fr' ? 'Valider la Saisie' : 'Submit Attendance'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default AttendanceSheetPage
