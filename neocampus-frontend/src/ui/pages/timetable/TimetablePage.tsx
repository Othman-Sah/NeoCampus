import React, { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useAuthStore } from '@/application/stores/authStore'
import { useSeance } from '@/application/useCases/useSeance'
import { useClass } from '@/application/useCases/useClass'
import { useTeacher } from '@/application/useCases/useTeacher'
import { useStudent } from '@/application/useCases/useStudent'
import { Seance } from '@/domain/entities/Seance'
import { Class } from '@/domain/entities/Class'
import { Teacher } from '@/domain/entities/Teacher'
import { TimetableGrid, DAYS } from '@/ui/components/timetable/TimetableGrid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Calendar, 
  User, 
  School, 
  Loader2, 
  AlertCircle,
  X,
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react'

const FORM_TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
]

export const TimetablePage: React.FC = () => {
  const { user } = useAuthStore()
  
  // Custom API Hooks
  const { classes, loadingClasses } = useClass()
  const { teachers, loadingTeachers, subjects, loadingSubjects } = useTeacher()
  const { students } = useStudent()
  
  const { 
    useClassTimetable, 
    useTeacherTimetable, 
    createSeance, 
    updateSeance, 
    deleteSeance 
  } = useSeance()

  // State Variables
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class')
  const [selectedClassId, setSelectedClassId] = useState<number>(0)
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(0)
  
  // Profile lookup states for student/parent/teacher
  const [parentChildren, setParentChildren] = useState<any[]>([])
  
  // Dialog (Modal) states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Seance | null>(null)
  
  // Modal Form State
  const [activeSeance, setActiveSeance] = useState<Seance | null>(null)
  const [formClassId, setFormClassId] = useState<string>('')
  const [formTeacherId, setFormTeacherId] = useState<string>('')
  const [formMatiereId, setFormMatiereId] = useState<string>('')
  const [formDay, setFormDay] = useState<string>('Lundi')
  const [formStartTime, setFormStartTime] = useState<string>('08:00')
  const [formEndTime, setFormEndTime] = useState<string>('09:00')
  
  // Error / Success notification states
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Configure Sensors for DnD-Kit (prevents clicks from acting like drag starts)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require dragging at least 8px before activation
      },
    })
  )

  const isAdmin = user?.role === 'admin'

  // 1. Resolve logged in user context
  useEffect(() => {
    if (!user) return

    if (user.role === 'enseignant') {
      setViewMode('teacher')
      // Find the teacher record matching logged in user ID
      const matchingTeacher = teachers.find((t: Teacher) => t.user?.id === user.id || t.user_id === user.id)
      if (matchingTeacher) {
        setSelectedTeacherId(matchingTeacher.id)
      }
    } else if (user.role === 'eleve') {
      setViewMode('class')
      // Find student matching logged in email/id
      const matchingStudent = students.find(s => s.user_id === user.id || s.email === user.email)
      if (matchingStudent && matchingStudent.classe_id) {
        setSelectedClassId(matchingStudent.classe_id)
      }
    } else if (user.role === 'parent') {
      setViewMode('class')
      // Parents see their children's classes
      const children = students.filter(s => s.parent_contact?.email === user.email)
      setParentChildren(children)
      if (children.length > 0 && children[0].classe_id) {
        setSelectedClassId(children[0].classe_id)
      }
    } else if (user.role === 'admin') {
      // Default selections for admin
      if (classes.length > 0 && selectedClassId === 0) {
        setSelectedClassId(classes[0].id)
      }
      if (teachers.length > 0 && selectedTeacherId === 0) {
        setSelectedTeacherId(teachers[0].id)
      }
    }
  }, [user, teachers, students, classes])

  // Automatically set default select options if admin changes list
  useEffect(() => {
    if (user?.role === 'admin') {
      if (classes.length > 0 && selectedClassId === 0) {
        setSelectedClassId(classes[0].id)
      }
      if (teachers.length > 0 && selectedTeacherId === 0) {
        setSelectedTeacherId(teachers[0].id)
      }
    }
  }, [classes, teachers, user])

  // 2. Fetch Sessions
  const classTimetableQuery = useClassTimetable(viewMode === 'class' ? selectedClassId : 0)
  const teacherTimetableQuery = useTeacherTimetable(viewMode === 'teacher' ? selectedTeacherId : 0)

  const activeSessions = viewMode === 'class' 
    ? (classTimetableQuery.data ?? []) 
    : (teacherTimetableQuery.data ?? [])

  const isLoadingTimetable = viewMode === 'class' 
    ? classTimetableQuery.isLoading 
    : teacherTimetableQuery.isLoading

  // Helpers for time arithmetic
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
  }

  const minutesToTime = (mins: number): string => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  // 3. Handle Drag and Drop Rescheduling
  const handleDragStart = (event: any) => {
    const seanceId = parseInt(event.active.id.toString().replace('seance-', ''))
    const seance = activeSessions.find(s => s.id === seanceId)
    if (seance) {
      setActiveSeance(seance)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveSeance(null)
    const { active, over } = event
    if (!over || !isAdmin) return

    const seanceId = parseInt(active.id.toString().replace('seance-', ''))
    const [targetDay, targetHour] = over.id.toString().split('_')

    const seance = activeSessions.find(s => s.id === seanceId)
    if (!seance) return

    // Calculate duration in minutes
    const startMin = timeToMinutes(seance.heure_debut)
    const endMin = timeToMinutes(seance.heure_fin)
    const duration = endMin - startMin

    const newStartMin = timeToMinutes(targetHour)
    const newEndMin = newStartMin + duration

    const formattedStart = minutesToTime(newStartMin)
    const formattedEnd = minutesToTime(newEndMin)

    if (newEndMin > timeToMinutes('18:00')) {
      triggerToast('error', 'Rescheduling failed: Sessions cannot end after 18:00.')
      return
    }

    try {
      await updateSeance({
        id: seanceId,
        data: {
          jour: targetDay as any,
          heure_debut: formattedStart,
          heure_fin: formattedEnd,
          classe_id: seance.classe_id,
          enseignant_id: seance.enseignant_id,
          matiere_id: seance.matiere_id
        }
      })
      triggerToast('success', 'Timetable rescheduled successfully!')
    } catch (err: any) {
      const errorMsg = err?.response?.data?.errors?.conflict?.[0] || err?.response?.data?.message || 'Timetable scheduling conflict detected.'
      triggerToast('error', errorMsg)
    }
  }

  // 4. Modal actions (Create/Edit Dialog)
  const openCreateModal = (day: string, hour: string) => {
    if (!isAdmin) return
    setErrorMsg(null)
    setEditingSession(null)
    
    // Autofill defaults
    setFormClassId(selectedClassId > 0 ? selectedClassId.toString() : (classes[0]?.id.toString() || ''))
    setFormTeacherId(selectedTeacherId > 0 ? selectedTeacherId.toString() : (teachers[0]?.id.toString() || ''))
    setFormMatiereId(subjects[0]?.id.toString() || '')
    setFormDay(day)
    setFormStartTime(hour)
    
    const startMin = timeToMinutes(hour)
    const nextMin = startMin + 60 // default 1 hour session
    const nextHour = minutesToTime(nextMin <= timeToMinutes('18:00') ? nextMin : startMin + 30)
    setFormEndTime(nextHour)
    
    setIsModalOpen(true)
  }

  const openEditModal = (seance: Seance) => {
    setErrorMsg(null)
    setEditingSession(seance)
    
    setFormClassId(seance.classe_id.toString())
    setFormTeacherId(seance.enseignant_id.toString())
    setFormMatiereId(seance.matiere_id.toString())
    setFormDay(seance.jour)
    setFormStartTime(seance.heure_debut)
    setFormEndTime(seance.heure_fin)
    
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const payload = {
      jour: formDay as any,
      heure_debut: formStartTime,
      heure_fin: formEndTime,
      classe_id: parseInt(formClassId),
      enseignant_id: parseInt(formTeacherId),
      matiere_id: parseInt(formMatiereId)
    }

    try {
      if (editingSession) {
        await updateSeance({ id: editingSession.id, data: payload })
        triggerToast('success', 'Timetable session updated successfully!')
      } else {
        await createSeance(payload)
        triggerToast('success', 'Timetable session created successfully!')
      }
      setIsModalOpen(false)
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.conflict?.[0] || err?.response?.data?.message || 'Validation error: Scheduling overlap conflict detected.'
      setErrorMsg(msg)
    }
  }

  const handleDelete = async () => {
    if (!editingSession) return
    if (!window.confirm('Are you sure you want to delete this session?')) return

    try {
      await deleteSeance(editingSession.id)
      triggerToast('success', 'Timetable session deleted successfully!')
      setIsModalOpen(false)
    } catch (err: any) {
      setErrorMsg('Failed to delete session.')
    }
  }

  // Auto-toast trigger
  const triggerToast = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccessMsg(message)
      setTimeout(() => setSuccessMsg(null), 5000)
    } else {
      setErrorMsg(message)
    }
  }

  return (
    <div className="space-y-6 text-neutral-900 pb-10">
      
      {/* Toast Banner Notifications */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-[100] bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-400 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="ml-2 hover:opacity-85">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-5 right-5 z-[100] bg-rose-500 text-white px-4 py-3 rounded-xl shadow-lg border border-rose-400 flex items-center gap-2 animate-pulse">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-2 hover:opacity-85">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-950 to-neutral-700 bg-clip-text text-transparent">
            Weekly Timetable
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Manage, schedule, and view weekly time slots for teachers and classes.
          </p>
        </div>

        {/* Action Button for Admin */}
        {isAdmin && (
          <Button 
            onClick={() => openCreateModal('Lundi', '08:00')}
            className="rounded-xl shadow-sm bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-950 hover:to-neutral-900 text-white font-semibold cursor-pointer border border-neutral-800 transition-all flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Session
          </Button>
        )}
      </div>

      {/* Dynamic View Filters */}
      <Card className="bg-white/80 backdrop-blur border border-neutral-100 shadow-sm rounded-2xl overflow-visible">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Timetable Controls
          </CardTitle>
          <CardDescription>
            {user?.role === 'admin' ? 'Select a class or teacher to manage their grid.' : 'Select filters to view the schedule.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            {/* View Mode Toggle (Admins only) */}
            {user?.role === 'admin' && (
              <div className="flex bg-neutral-100 p-1.5 rounded-xl border border-neutral-200 self-start">
                <button
                  onClick={() => setViewMode('class')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    viewMode === 'class' 
                      ? "bg-white text-neutral-950 shadow-sm" 
                      : "text-neutral-500 hover:text-neutral-800"
                  )}
                >
                  View by Class
                </button>
                <button
                  onClick={() => setViewMode('teacher')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    viewMode === 'teacher' 
                      ? "bg-white text-neutral-950 shadow-sm" 
                      : "text-neutral-500 hover:text-neutral-800"
                  )}
                >
                  View by Teacher
                </button>
              </div>
            )}

            {/* Parent View Child Selector */}
            {user?.role === 'parent' && parentChildren.length > 0 && (
              <div className="flex items-center gap-3">
                <Label className="text-xs font-bold text-neutral-500">Child:</Label>
                <Select
                  value={selectedClassId.toString()}
                  onValueChange={(val) => setSelectedClassId(parseInt(val || '0'))}
                >
                  <SelectTrigger className="w-[180px] rounded-xl bg-white border-neutral-200">
                    <SelectValue placeholder="Select child">
                      {parentChildren.find(c => c.classe_id === selectedClassId) 
                        ? `${parentChildren.find(c => c.classe_id === selectedClassId).prenom} ${parentChildren.find(c => c.classe_id === selectedClassId).nom}` 
                        : ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-neutral-200">
                    {parentChildren.map(c => (
                      <SelectItem key={c.id} value={c.classe_id.toString()}>
                        {c.prenom} {c.nom} ({c.classe_nom})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Selector Dropdown based on viewMode */}
            {viewMode === 'class' && (user?.role === 'admin') && (
              <div className="flex items-center gap-3 flex-1 max-w-[320px]">
                <Label className="text-xs font-bold text-neutral-500 shrink-0">Class:</Label>
                {loadingClasses ? (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                ) : (
                  <Select
                    value={selectedClassId.toString()}
                    onValueChange={(val) => setSelectedClassId(parseInt(val || '0'))}
                  >
                    <SelectTrigger className="rounded-xl bg-white border-neutral-200 shadow-sm">
                      <SelectValue placeholder="Choose a class">
                        {classes.find((c: Class) => c.id === selectedClassId)?.nom || ''}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-neutral-200 shadow-lg">
                      {classes.map((c: Class) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {viewMode === 'teacher' && (user?.role === 'admin') && (
              <div className="flex items-center gap-3 flex-1 max-w-[320px]">
                <Label className="text-xs font-bold text-neutral-500 shrink-0">Teacher:</Label>
                {loadingTeachers ? (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                ) : (
                  <Select
                    value={selectedTeacherId.toString()}
                    onValueChange={(val) => setSelectedTeacherId(parseInt(val || '0'))}
                  >
                    <SelectTrigger className="rounded-xl bg-white border-neutral-200 shadow-sm">
                      <SelectValue placeholder="Choose a teacher">
                        {teachers.find((t: Teacher) => t.id === selectedTeacherId)
                          ? `${teachers.find((t: Teacher) => t.id === selectedTeacherId)?.user?.prenom} ${teachers.find((t: Teacher) => t.id === selectedTeacherId)?.user?.nom}`
                          : ''}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-neutral-200 shadow-lg">
                      {teachers.map((t: Teacher) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.user?.prenom} {t.user?.nom} ({t.specialite})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Read-Only Banner descriptors */}
            {user?.role === 'eleve' && (
              <Badge variant="outline" className="px-3 py-1.5 bg-neutral-50 text-neutral-700 font-bold border-neutral-200 rounded-xl flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-indigo-500" />
                Viewing Timetable for my class (Class ID: {selectedClassId})
              </Badge>
            )}

            {user?.role === 'enseignant' && (
              <Badge variant="outline" className="px-3 py-1.5 bg-neutral-50 text-neutral-700 font-bold border-neutral-200 rounded-xl flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                Viewing my auto-populated weekly teacher schedule
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid Container */}
      <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-4 md:p-6 overflow-visible relative">
        {isLoadingTimetable ? (
          <div className="min-h-[350px] flex flex-col items-center justify-center text-neutral-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-semibold">Loading weekly timetable...</p>
          </div>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <TimetableGrid 
              sessions={activeSessions} 
              activeSeance={activeSeance}
              isAdmin={isAdmin}
              onEditSession={isAdmin ? openEditModal : () => {}} 
              onCreateSession={openCreateModal}
            />
          </DndContext>
        )}
      </Card>

      {/* Admin Scheduling / Edit Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[420px] rounded-2xl bg-white border border-neutral-200 p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-neutral-900">
              {editingSession ? 'Edit Timetable Session' : 'Schedule Timetable Session'}
            </DialogTitle>
            <DialogDescription>
              Provide subject, teacher, class, and scheduling times.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2 text-rose-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Subject Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500">Subject</Label>
              {loadingSubjects ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
              ) : (
                <Select value={formMatiereId} onValueChange={(val) => setFormMatiereId(val || '')}>
                  <SelectTrigger className="rounded-xl border-neutral-200">
                    <SelectValue placeholder="Choose a subject">
                      {subjects.find(s => s.id.toString() === formMatiereId) 
                        ? `${subjects.find(s => s.id.toString() === formMatiereId).intitule || subjects.find(s => s.id.toString() === formMatiereId).nom} [${subjects.find(s => s.id.toString() === formMatiereId).code}]` 
                        : ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-neutral-200">
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.intitule || s.nom} [{s.code}]
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Teacher Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500">Teacher</Label>
              <Select value={formTeacherId} onValueChange={(val) => setFormTeacherId(val || '')}>
                <SelectTrigger className="rounded-xl border-neutral-200">
                  <SelectValue placeholder="Choose a teacher">
                    {teachers.find(t => t.id.toString() === formTeacherId)
                      ? `${teachers.find(t => t.id.toString() === formTeacherId)?.user?.prenom} ${teachers.find(t => t.id.toString() === formTeacherId)?.user?.nom}`
                      : ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-neutral-200">
                  {teachers.map((t: Teacher) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.user?.prenom} {t.user?.nom} ({t.specialite})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500">Class Group</Label>
              <Select value={formClassId} onValueChange={(val) => setFormClassId(val || '')}>
                <SelectTrigger className="rounded-xl border-neutral-200">
                  <SelectValue placeholder="Choose a class">
                    {classes.find(c => c.id.toString() === formClassId)?.nom || ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-neutral-200">
                  {classes.map((c: Class) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Day Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500">Day</Label>
              <Select value={formDay} onValueChange={(val) => setFormDay(val || 'Lundi')}>
                <SelectTrigger className="rounded-xl border-neutral-200">
                  <SelectValue placeholder="Choose a day">
                    {formDay}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-neutral-200">
                  {DAYS.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Slots (Duration customizable) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-neutral-500">Starts At</Label>
                <Select 
                  value={formStartTime} 
                  onValueChange={(val) => {
                    const startVal = val || '08:00'
                    setFormStartTime(startVal)
                    const startMin = timeToMinutes(startVal)
                    const nextMin = startMin + 60
                    const nextHour = minutesToTime(nextMin <= timeToMinutes('18:00') ? nextMin : startMin + 30)
                    setFormEndTime(nextHour)
                  }}
                >
                  <SelectTrigger className="rounded-xl border-neutral-200">
                    <SelectValue placeholder="Start">
                      {formStartTime}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-neutral-200">
                    {FORM_TIME_SLOTS.filter(t => t !== '18:00').map(hour => (
                      <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-neutral-500">Ends At</Label>
                <Select 
                  value={formEndTime} 
                  onValueChange={(val) => setFormEndTime(val || '')}
                >
                  <SelectTrigger className="rounded-xl border-neutral-200">
                    <SelectValue placeholder="End">
                      {formEndTime}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-neutral-200">
                    {FORM_TIME_SLOTS.filter(t => timeToMinutes(t) > timeToMinutes(formStartTime)).map(hour => (
                      <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-between sm:justify-between w-full">
              {editingSession ? (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleDelete}
                    className="rounded-xl border-rose-200 hover:bg-rose-50 hover:text-rose-600 text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                  </Button>
                  <Button 
                    type="submit" 
                    className="rounded-xl bg-black hover:bg-neutral-850 text-white cursor-pointer ml-auto"
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border-neutral-200 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="rounded-xl bg-black hover:bg-neutral-850 text-white cursor-pointer"
                  >
                    Create Session
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
