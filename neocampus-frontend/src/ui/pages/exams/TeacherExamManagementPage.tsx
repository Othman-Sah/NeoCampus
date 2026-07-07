import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/application/stores/authStore'
import { useExamen } from '@/application/useCases/useExamen'
import { useTeacher } from '@/application/useCases/useTeacher'
import { useClass } from '@/application/useCases/useClass'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  UploadCloud, 
  AlertTriangle,
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react'

export const TeacherExamManagementPage: React.FC = () => {
  const { language } = useAuthStore()
  const { user } = useAuthStore()
  const { settings, teacherExams, loadingTeacherExams, proposeSchedule, proposingSchedule } = useExamen()
  const { teachers, subjects } = useTeacher()
  const { classes } = useClass()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newExamTitle, setNewExamTitle] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [proposedDate, setProposedDate] = useState('')

  if (!user) return null

  // Resolve current teacher
  const teacher = teachers.find((t: any) => t.user_id === user.id || t.user?.email === user.email)
  const teacherId = teacher?.id ?? 0

  // Filter exams that are approved/active or completed
  const activeExams = teacherExams.filter((e: any) => e.status === 'approved' || e.status === 'completed')
  
  // Filter proposed/draft exams
  const proposedExams = teacherExams.filter((e: any) => 
    e.status === 'pending_approval' || e.status === 'draft' || e.status === 'rejected'
  )

  // Count missing subject uploads
  const requireUpload = settings?.require_sujet_upload ?? true
  const missingUploadsCount = requireUpload
    ? teacherExams.filter((e: any) => !e.fichier_sujet && e.status === 'approved').length
    : 0

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

  // Format Date Helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-fade-in py-4 text-neutral-900 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-neutral-900">
            {language === 'fr' ? 'Gestion des Évaluations' : 'Exams & Evaluations'}
          </h1>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            {language === 'fr'
              ? 'Proposez des dates d\'examen, téléversez les sujets d\'épreuve et saisissez les notes'
              : 'Propose exam schedules, upload exam subject files, and record grades'}
          </p>
        </div>

        {/* Propose Schedule dialog button */}
        {settings && !settings.force_admin_schedule && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0A0A0A] hover:bg-neutral-800 text-[#d0f137] font-bold rounded-xl text-xs gap-1.5 px-4 h-9">
                <Plus className="h-4 w-4" />
                {language === 'fr' ? 'Planifier un Examen' : 'Schedule New Exam'}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-2xl border border-neutral-100 p-6 max-w-md text-neutral-900">
              <form onSubmit={handleProposeSchedule} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="font-black uppercase text-sm tracking-wider">
                    {language === 'fr' ? 'Proposer une date d\'examen' : 'Propose Exam Date'}
                  </DialogTitle>
                  <DialogDescription className="text-[10px] uppercase font-bold text-neutral-400">
                    {language === 'fr' 
                      ? 'L\'épreuve sera ajoutée à l\'emploi du temps après validation de l\'administration.' 
                      : 'The exam will be scheduled after administration approval.'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="exam-title" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">
                      {language === 'fr' ? 'Intitulé de l\'examen' : 'Exam Title'}
                    </Label>
                    <Input
                      id="exam-title"
                      value={newExamTitle}
                      onChange={(e) => setNewExamTitle(e.target.value)}
                      placeholder="e.g. Contrôle 3 Algèbre"
                      className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="exam-class" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">Classe</Label>
                    <select
                      id="exam-class"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black text-neutral-900"
                      required
                    >
                      <option value="">{language === 'fr' ? '-- Choisir une classe --' : '-- Choose Class --'}</option>
                      {teacher?.classes?.map((c: any) => (
                        <option key={c.classe_id} value={c.classe_id}>{c.classe_nom}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="exam-subject" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">
                      {language === 'fr' ? 'Matière' : 'Subject'}
                    </Label>
                    <select
                      id="exam-subject"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black text-neutral-900"
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
                    <Label htmlFor="exam-date" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">
                      {language === 'fr' ? 'Date & Heure proposées' : 'Proposed Date & Time'}
                    </Label>
                    <Input
                      id="exam-date"
                      type="datetime-local"
                      value={proposedDate}
                      onChange={(e) => setProposedDate(e.target.value)}
                      className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                      required
                    />
                  </div>
                </div>

                <DialogFooter className="pt-2 gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold text-xs h-9">
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                  <Button type="submit" disabled={proposingSchedule} className="bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-xs h-9">
                    {language === 'fr' ? 'Soumettre' : 'Submit proposal'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Quick KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Examens Planifiés' : 'Scheduled Exams'}
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
            {activeExams.length}
          </h2>
          <p className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider mt-1">
            {language === 'fr' ? 'Approuvés et actifs' : 'Approved and active'}
          </p>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Propositions en Attente' : 'Pending Proposals'}
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
            {proposedExams.filter((e: any) => e.status === 'pending_approval').length}
          </h2>
          <p className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider mt-1">
            {language === 'fr' ? 'En attente de validation admin' : 'Awaiting admin validation'}
          </p>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Sujets Manquants' : 'Missing Subjects'}
            </span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
            {missingUploadsCount}
          </h2>
          <p className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider mt-1">
            {language === 'fr' ? 'Téléversements requis' : 'Uploads required'}
          </p>
        </Card>
      </div>

      {/* Main Grid: Left is Scheduled Exams, Right is proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Scheduled Exams */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4">
              <CardTitle className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                {language === 'fr' ? 'Liste des Examens Actifs' : 'Active Exams'}
              </CardTitle>
              <CardDescription className="text-[10px] text-neutral-450 uppercase font-bold">
                {language === 'fr'
                  ? 'Évaluations approuvées par l\'administration. Téléversez le sujet d\'épreuve si requis.'
                  : 'Approved evaluations. Upload the official copy or enter grades when the period opens.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              {loadingTeacherExams ? (
                <div className="text-center py-8 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                  {language === 'fr' ? 'Chargement...' : 'Loading Exams...'}
                </div>
              ) : activeExams.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                  {language === 'fr' ? 'Aucun examen actif disponible.' : 'No active exams found.'}
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {activeExams.map((exam: any) => {
                    const hasSubject = !!exam.fichier_sujet
                    return (
                      <div key={exam.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[9px] font-black uppercase bg-neutral-50 text-neutral-800">
                              {exam.classe?.nom}
                            </Badge>
                            <span className="text-[11px] text-neutral-500 font-bold">
                              {exam.matiere?.nom}
                            </span>
                          </div>
                          <p className="text-xs font-black text-neutral-900">{exam.intitule}</p>
                          <p className="text-[10px] text-neutral-450 font-bold uppercase">
                            Date: <span className="text-neutral-700">{formatDate(exam.date)}</span>
                          </p>
                          
                          {/* Subject upload status */}
                          {requireUpload && (
                            <div className="pt-1">
                              {hasSubject ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                  <FileText className="h-3 w-3" />
                                  {language === 'fr' ? 'Sujet téléversé' : 'Subject uploaded'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 animate-pulse">
                                  <AlertTriangle className="h-3 w-3" />
                                  {language === 'fr' ? 'Sujet requis' : 'Subject missing'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {requireUpload && !hasSubject && (
                            <Button asChild size="sm" className="bg-[#0A0A0A] hover:bg-neutral-800 text-white font-bold rounded-xl text-xs gap-1.5 px-3 h-8">
                              <Link to={`/teacher/exams/upload/${exam.id}`}>
                                <UploadCloud className="h-3.5 w-3.5" />
                                {language === 'fr' ? 'Téléverser' : 'Upload File'}
                              </Link>
                            </Button>
                          )}
                          
                          <Button asChild size="sm" variant="outline" className="border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-bold rounded-xl text-xs px-3 h-8">
                            <Link to={`/teacher/grades/${exam.id}`}>
                              <GraduationCap className="h-3.5 w-3.5 mr-1" />
                              {language === 'fr' ? 'Notes' : 'Grades'}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Proposals List (Right Sidebar column) */}
        <div className="space-y-6">
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4">
              <CardTitle className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                {language === 'fr' ? 'Demandes de Planification' : 'Schedule Proposals'}
              </CardTitle>
              <CardDescription className="text-[10px] text-neutral-450 uppercase font-bold">
                {language === 'fr'
                  ? 'Historique de vos propositions et leur statut de validation.'
                  : 'History of your submitted proposals and their administrative status.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6 space-y-4">
              {loadingTeacherExams ? (
                <div className="text-center py-6 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                  {language === 'fr' ? 'Chargement...' : 'Loading...'}
                </div>
              ) : proposedExams.length === 0 ? (
                <div className="text-center py-6 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                  {language === 'fr' ? 'Aucune proposition en cours.' : 'No proposals found.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {proposedExams.map((prop: any) => (
                    <div key={prop.id} className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl space-y-2">
                      <div>
                        <p className="text-xs font-bold text-neutral-950">{prop.intitule}</p>
                        <p className="text-[9px] font-extrabold uppercase text-neutral-400 mt-0.5">
                          Classe: {prop.classe?.nom}
                        </p>
                        <p className="text-[9px] font-extrabold uppercase text-neutral-400">
                          Date: {formatDate(prop.date_proposee || prop.date)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-100/50 pt-2">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase">Statut:</span>
                        
                        {(prop.status === 'pending_approval' || prop.status === 'draft') && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                            <HelpCircle className="h-3 w-3 text-amber-500" />
                            {language === 'fr' ? 'En attente' : 'Pending'}
                          </span>
                        )}
                        {prop.status === 'rejected' && (
                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                              <XCircle className="h-3 w-3 text-red-500" />
                              {language === 'fr' ? 'Refusé' : 'Rejected'}
                            </span>
                            {prop.commentaire_admin && (
                              <p className="text-[8px] font-extrabold text-red-900 bg-red-50/50 p-1.5 rounded border border-red-100 max-w-[180px] italic leading-tight">
                                "{prop.commentaire_admin}"
                              </p>
                            )}
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

      </div>

    </div>
  )
}

export default TeacherExamManagementPage
