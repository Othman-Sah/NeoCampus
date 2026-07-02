import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  BookMarked, 
  Clock, 
  FileSpreadsheet, 
  Calendar as CalendarIcon,
  AlertTriangle,
  Plus,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react'
import { useAuthStore } from '@/application/stores/authStore'
import { useTeacher } from '@/application/useCases/useTeacher'
import { useSeance } from '@/application/useCases/useSeance'
import { useExamen } from '@/application/useCases/useExamen'
import { Link } from 'react-router-dom'

interface TeacherDashboardProps {
  language: 'fr' | 'en';
  MiniCalendar: React.ComponentType;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ language, MiniCalendar }) => {
  const { user } = useAuthStore()
  const { teachers, subjects } = useTeacher()
  const { useTeacherTimetable } = useSeance()
  const { settings, teacherExams, proposeSchedule, proposingSchedule } = useExamen()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newExamTitle, setNewExamTitle] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [proposedDate, setProposedDate] = useState('')

  if (!user) return null

  // 1. Resolve logged in teacher
  const teacher = teachers.find((t: any) => t.user_id === user.id || t.user?.email === user.email)
  const teacherId = teacher?.id ?? 0

  // 2. Fetch teacher's timetable
  const { data: seances = [], isLoading: loadingSeances } = useTeacherTimetable(teacherId)

  // 3. Filter today's classes
  const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const todayJour = daysOfWeek[new Date().getDay()] // e.g. 'Lundi', 'Mardi' etc.
  const todaySeances = seances.filter((s: any) => s.jour === todayJour)

  // 4. Check for missing exam uploads (if require_sujet_upload = true)
  const requireUpload = settings?.require_sujet_upload ?? true
  const examsNeedingUpload = requireUpload
    ? teacherExams.filter((e: any) => !e.fichier_sujet && e.status !== 'rejected')
    : []

  // 5. Filter scheduling requests/proposals for teacher widget
  // A teacher's proposed exams can be tracked through their exams list.
  // In the seeder, some exams are in 'draft', 'pending_approval', etc.
  const examProposals = teacherExams.filter((e: any) => 
    e.status === 'pending_approval' || e.status === 'rejected' || (e.status === 'approved' && e.date)
  )

  const handleProposeSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExamTitle || !selectedClass || !selectedSubject || !proposedDate) return

    try {
      await proposeSchedule({
        intitule: newExamTitle,
        classe_id: parseInt(selectedClass),
        matiere_id: parseInt(selectedSubject),
        date_proposee: proposedDate,
      })
      setIsModalOpen(false)
      setNewExamTitle('')
      setSelectedClass('')
      setSelectedSubject('')
      setProposedDate('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in text-neutral-900">
      
      {/* 1. Alerts Section */}
      {examsNeedingUpload.length > 0 && (
        <div className="space-y-3">
          {examsNeedingUpload.map((exam: any) => (
            <Alert key={exam.id} variant="destructive" className="bg-red-50 border-red-200 text-red-900 rounded-2xl p-4 flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <AlertTitle className="font-extrabold text-sm text-red-950">
                  {language === 'fr' ? 'Action Requise : Sujet d\'examen manquant' : 'Action Required: Missing Exam Subject'}
                </AlertTitle>
                <AlertDescription className="text-xs text-red-800 mt-1">
                  {language === 'fr' 
                    ? `L'administration exige le téléversement de l'épreuve pour l'examen "${exam.intitule}" de la classe ${exam.classe?.nom || 'chargée'}.`
                    : `The administration requires the exam copy upload for "${exam.intitule}" of class ${exam.classe?.nom || ''}.`}
                </AlertDescription>
              </div>
              <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs px-4 py-2 shrink-0">
                <Link to={`/teacher/exams/upload/${exam.id}`}>
                  {language === 'fr' ? 'Téléverser' : 'Upload'}
                </Link>
              </Button>
            </Alert>
          ))}
        </div>
      )}

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Mes Classes' : 'My Classes'}
            </span>
            <BookMarked className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            {teacher?.classes?.length ?? 3}
          </h2>
          <div className="text-[10px] text-neutral-400 font-semibold mt-2 truncate">
            {teacher?.classes?.map((c: any) => c.classe_nom).join(', ') || '3ème C, 2nde B, Terminale A'}
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? "Assiduité Moyenne" : 'Average Attendance'}
            </span>
            <Clock className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">96.4%</h2>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-black h-1.5 rounded-full" style={{ width: '96.4%' }} />
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Évaluations actives' : 'Active Exams'}
            </span>
            <FileSpreadsheet className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            {teacherExams.length}
          </h2>
          <div className="text-[10px] text-neutral-400 font-semibold mt-2">
            {language === 'fr' ? `${examsNeedingUpload.length} en attente de sujet` : `${examsNeedingUpload.length} pending file`}
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Heures de cours / semaine' : 'Teaching Hours / week'}
            </span>
            <CalendarIcon className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">18h</h2>
          <div className="text-[10px] text-neutral-400 font-semibold mt-2">
            Volume horaire statutaire
          </div>
        </Card>
      </div>

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Classes */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4">
              <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                {language === 'fr' ? `Cours du Jour (${todayJour})` : `Classes Today (${todayJour})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6 space-y-4">
              {loadingSeances ? (
                <div className="text-center py-6 text-xs text-neutral-400">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>
              ) : todaySeances.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs font-semibold">
                  {language === 'fr' ? 'Aucun cours programmé pour aujourd\'hui.' : 'No classes scheduled for today.'}
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
                        {language === 'fr' ? 'Saisir Présences' : 'Take Attendance'}
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Exam Scheduling Widget */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                {language === 'fr' ? 'Planification des Examens' : 'Exam Scheduling'}
              </CardTitle>
              {settings && !settings.force_admin_schedule && (
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      {language === 'fr' ? 'Planifier un Examen' : 'Schedule Exam'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white rounded-2xl border border-neutral-100 p-6 max-w-md">
                    <form onSubmit={handleProposeSchedule} className="space-y-4">
                      <DialogHeader>
                        <DialogTitle className="font-extrabold text-lg">
                          {language === 'fr' ? 'Proposer une date d\'examen' : 'Propose Exam Date'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-400">
                          {language === 'fr' 
                            ? 'L\'épreuve sera ajoutée à l\'emploi du temps après validation de l\'administration.' 
                            : 'The exam will be scheduled after administration approval.'}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="exam-title" className="text-xs font-bold">
                            {language === 'fr' ? 'Intitulé de l\'examen' : 'Exam Title'}
                          </Label>
                          <Input
                            id="exam-title"
                            value={newExamTitle}
                            onChange={(e) => setNewExamTitle(e.target.value)}
                            placeholder="e.g. Contrôle 3 Algèbre"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="exam-class" className="text-xs font-bold">Classe</Label>
                          <select
                            id="exam-class"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                          >
                            <option value="">{language === 'fr' ? '-- Choisir une classe --' : '-- Choose Class --'}</option>
                            {teacher?.classes?.map((c: any) => (
                              <option key={c.classe_id} value={c.classe_id}>{c.classe_nom}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="exam-subject" className="text-xs font-bold">{language === 'fr' ? 'Matière' : 'Subject'}</Label>
                          <select
                            id="exam-subject"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                          >
                            <option value="">{language === 'fr' ? '-- Choisir une matière --' : '-- Choose Subject --'}</option>
                            {teacher?.matieres?.map((m: any) => (
                              <option key={m.id} value={m.id}>{m.nom}</option>
                            )) || subjects.map((m: any) => (
                              <option key={m.id} value={m.id}>{m.nom}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="exam-date" className="text-xs font-bold">{language === 'fr' ? 'Date & Heure proposées' : 'Proposed Date & Time'}</Label>
                          <Input
                            id="exam-date"
                            type="datetime-local"
                            value={proposedDate}
                            onChange={(e) => setProposedDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">
                          {language === 'fr' ? 'Annuler' : 'Cancel'}
                        </Button>
                        <Button type="submit" disabled={proposingSchedule} className="bg-black text-white font-bold rounded-xl hover:bg-neutral-900">
                          {language === 'fr' ? 'Soumettre' : 'Submit'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="py-6 space-y-4">
              {examProposals.length === 0 ? (
                <div className="text-center py-6 text-neutral-400 text-xs font-semibold">
                  {language === 'fr' ? 'Aucune demande de planification en cours.' : 'No schedule proposals in progress.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {examProposals.map((prop: any) => (
                    <div key={prop.id} className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                      <div>
                        <p className="text-xs font-bold">{prop.intitule}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          Classe : {prop.classe?.nom} | Date : {prop.date ? new Date(prop.date).toLocaleString('fr-FR') : 'Non définie'}
                        </p>
                      </div>
                      
                      {/* Real-time status display */}
                      <div className="flex items-center gap-1.5">
                        {prop.status === 'pending_approval' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                            <HelpCircle className="h-3 w-3 shrink-0 text-amber-500" />
                            {language === 'fr' ? 'En attente' : 'Pending'}
                          </span>
                        )}
                        {prop.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                            {language === 'fr' ? 'Approuvé' : 'Approved'}
                          </span>
                        )}
                        {prop.status === 'rejected' && (
                          <div className="flex flex-col items-end">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full">
                              <XCircle className="h-3 w-3 shrink-0 text-red-500" />
                              {language === 'fr' ? 'Refusé' : 'Rejected'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <MiniCalendar />
          
          {/* Quick grade entry sheet link */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              {language === 'fr' ? 'Saisie des Notes' : 'Grades Entry'}
            </h3>
            <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">
              {language === 'fr' 
                ? 'Sélectionnez un examen ci-dessous pour ouvrir la grille de saisie des notes :'
                : 'Select an exam below to open the grades entry sheet:'}
            </p>
            <div className="space-y-2">
              {teacherExams.filter((e: any) => e.status === 'approved' || e.status === 'completed').map((exam: any) => (
                <Button key={exam.id} asChild variant="outline" className="w-full justify-start rounded-xl text-xs py-2 h-auto text-left font-semibold">
                  <Link to={`/teacher/grades/${exam.id}`}>
                    {exam.intitule} ({exam.classe?.nom})
                  </Link>
                </Button>
              ))}
              {teacherExams.length === 0 && (
                <div className="text-center text-[10px] text-neutral-400 py-2">
                  {language === 'fr' ? 'Aucun examen actif disponible.' : 'No active exams available.'}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
export default TeacherDashboard
