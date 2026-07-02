import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/application/stores/authStore'
import { useExamen } from '@/application/useCases/useExamen'
import { useGrade } from '@/application/useCases/useGrade'
import { 
  Settings, 
  Inbox, 
  Unlock, 
  Check, 
  X, 
  UploadCloud, 
  FileText,
  Clock,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react'

export const AdminExamManagementPage: React.FC = () => {
  const { language } = useAuthStore()
  const { 
    settings, 
    loadingSettings, 
    updateSettings, 
    updatingSettings, 
    pendingProposals, 
    loadingPendingProposals, 
    reviewSchedule, 
    reviewingSchedule 
  } = useExamen()
  
  const { 
    pendingExceptions, 
    loadingPendingExceptions, 
    approveException, 
    approvingException 
  } = useGrade()

  const [activeTab, setActiveTab] = useState<'settings' | 'inbox' | 'exceptions'>('settings')

  // Settings form states
  const [forceAdminSchedule, setForceAdminSchedule] = useState(settings?.force_admin_schedule ?? false)
  const [requireUpload, setRequireUpload] = useState(settings?.require_sujet_upload ?? true)
  const [notesStart, setNotesStart] = useState(settings?.periode_saisie_notes_debut?.split('T')[0] ?? '')
  const [notesEnd, setNotesEnd] = useState(settings?.periode_saisie_notes_fin?.split('T')[0] ?? '')
  const [selectedTemplate, setSelectedTemplate] = useState<File | null>(null)

  // Proposals review state
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false)
  const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null)
  const [declineComment, setDeclineComment] = useState('')

  // Sync settings when loaded
  React.useEffect(() => {
    if (settings) {
      setForceAdminSchedule(settings.force_admin_schedule)
      setRequireUpload(settings.require_sujet_upload)
      if (settings.periode_saisie_notes_debut) {
        setNotesStart(settings.periode_saisie_notes_debut.split('T')[0])
      }
      if (settings.periode_saisie_notes_fin) {
        setNotesEnd(settings.periode_saisie_notes_fin.split('T')[0])
      }
    }
  }, [settings])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    // Prepare data
    const data = {
      periode_saisie_notes_debut: notesStart + ' 00:00:00',
      periode_saisie_notes_fin: notesEnd + ' 23:59:59',
      force_admin_schedule: forceAdminSchedule,
      require_sujet_upload: requireUpload,
      template_sujet_path: selectedTemplate ? 'templates/exam_template_emsi.docx' : settings?.template_sujet_path,
    }

    try {
      await updateSettings(data)
      alert(language === 'fr' ? 'Configuration sauvegardée.' : 'Settings updated successfully.')
    } catch (err) {
      console.error(err)
    }
  }

  const handleApproveProposal = async (id: number) => {
    try {
      await reviewSchedule({ id, status: 'approved' })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeclineProposalClick = (id: number) => {
    setSelectedProposalId(id)
    setIsDeclineModalOpen(true)
  }

  const handleDeclineProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProposalId || !declineComment) return

    try {
      await reviewSchedule({
        id: selectedProposalId,
        status: 'rejected',
        comment: declineComment,
      })
      setIsDeclineModalOpen(false)
      setSelectedProposalId(null)
      setDeclineComment('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleApproveException = async (id: number) => {
    try {
      await approveException(id)
      alert(language === 'fr' ? 'Dérogation accordée avec succès.' : 'Exception approved successfully.')
    } catch (err) {
      console.error(err)
    }
  }

  const handleTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedTemplate(e.target.files[0])
    }
  }

  return (
    <div className="space-y-6 max-w-[1024px] mx-auto animate-fade-in py-4 text-neutral-900">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {language === 'fr' ? 'Gestion des Évaluations' : 'Exams & Grades Administration'}
        </h1>
        <p className="text-xs text-neutral-400 font-medium">
          {language === 'fr' ? 'Paramétrage global, validation des plannings et dérogations.' : 'Configure schedules, approve deadlines exceptions and upload templates.'}
        </p>
      </div>

      {/* Admin Tabs */}
      <div className="border-b border-neutral-100 flex gap-6 pb-px mt-2">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 font-bold text-xs pb-2.5 transition-colors border-b-2 ${
            activeTab === 'settings' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Settings className="h-4 w-4" />
          {language === 'fr' ? 'Configuration' : 'Settings'}
        </button>
        <button 
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-1.5 font-bold text-xs pb-2.5 transition-colors border-b-2 ${
            activeTab === 'inbox' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Inbox className="h-4 w-4" />
          {language === 'fr' ? 'Inbox Plannings' : 'Schedule Inbox'}
          {pendingProposals.length > 0 && (
            <span className="bg-red-500 text-white rounded-full text-[9px] px-1.5 py-0.5 shrink-0">
              {pendingProposals.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('exceptions')}
          className={`flex items-center gap-1.5 font-bold text-xs pb-2.5 transition-colors border-b-2 ${
            activeTab === 'exceptions' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Unlock className="h-4 w-4" />
          {language === 'fr' ? 'Dérogations Notes' : 'Grade Exceptions'}
          {pendingExceptions.length > 0 && (
            <span className="bg-red-500 text-white rounded-full text-[9px] px-1.5 py-0.5 shrink-0">
              {pendingExceptions.length}
            </span>
          )}
        </button>
      </div>

      {/* Content Canvas */}
      {/* TAB 1: Global Settings */}
      {activeTab === 'settings' && (
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6">
          <CardHeader className="p-0 pb-5 border-b border-neutral-50 mb-6">
            <CardTitle className="font-extrabold text-base">{language === 'fr' ? 'Paramètres Globaux' : 'Global Exam Settings'}</CardTitle>
            <CardDescription className="text-xs text-neutral-400 font-medium">
              {language === 'fr' ? 'Configurez la fenêtre de saisie et les obligations de planification.' : 'Define grade submission date windows and constraints.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingSettings ? (
              <div className="text-center py-6 text-neutral-400 text-xs">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* 1. Date Range picker */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="date-start" className="text-xs font-bold">{language === 'fr' ? 'Début de la période de saisie' : 'Submission Window Start'}</Label>
                    <Input
                      id="date-start"
                      type="date"
                      value={notesStart}
                      onChange={(e) => setNotesStart(e.target.value)}
                      required
                      className="rounded-xl h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="date-end" className="text-xs font-bold">{language === 'fr' ? 'Fin de la période de saisie' : 'Submission Window End'}</Label>
                    <Input
                      id="date-end"
                      type="date"
                      value={notesEnd}
                      onChange={(e) => setNotesEnd(e.target.value)}
                      required
                      className="rounded-xl h-9"
                    />
                  </div>
                </div>

                <div className="h-px bg-neutral-100 w-full" />

                {/* 2. Switch items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 max-w-[500px]">
                      <Label className="text-xs font-extrabold text-black">
                        {language === 'fr' ? 'Forcer la planification administrative' : 'Force Admin Scheduling'}
                      </Label>
                      <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                        {language === 'fr' 
                          ? 'Si activé, seuls les administrateurs peuvent fixer les dates. Les enseignants ne peuvent pas en proposer.'
                          : 'Only administrators can define dates. Proposals from teachers are forbidden.'}
                      </p>
                    </div>
                    <Switch
                      checked={forceAdminSchedule}
                      onCheckedChange={setForceAdminSchedule}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-4">
                    <div className="space-y-0.5 max-w-[500px]">
                      <Label className="text-xs font-extrabold text-black">
                        {language === 'fr' ? 'Exiger le dépôt des sujets d\'examen' : 'Demand Subject Copies Upload'}
                      </Label>
                      <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                        {language === 'fr' 
                          ? 'Affiche une alerte rouge sur le tableau de bord des enseignants s\'ils ne chargent pas leur sujet PDF/DOCX.'
                          : 'Triggers a red dashboard alert for teachers when no copy is uploaded for active exams.'}
                      </p>
                    </div>
                    <Switch
                      checked={requireUpload}
                      onCheckedChange={setRequireUpload}
                    />
                  </div>
                </div>

                <div className="h-px bg-neutral-100 w-full" />

                {/* 3. Word Template uploader */}
                <div className="space-y-3">
                  <Label className="text-xs font-extrabold text-black">
                    {language === 'fr' ? 'Gabarit de sujet officiel (.docx)' : 'Official Exam Document Template (.docx)'}
                  </Label>
                  <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                    {language === 'fr' 
                      ? 'Téléversez le modèle de document de l\'école. Les enseignants pourront le télécharger.'
                      : 'Upload the official word template file. It will be available for download.'}
                  </p>

                  <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" className="rounded-xl text-xs py-2 h-auto gap-1 border-dashed relative">
                      <UploadCloud className="h-4 w-4" />
                      {selectedTemplate ? selectedTemplate.name : (language === 'fr' ? 'Choisir un gabarit' : 'Choose File')}
                      <input 
                        type="file" 
                        accept=".docx"
                        onChange={handleTemplateFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </Button>
                    {settings?.template_sujet_path && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400">
                        <FileText className="h-3.5 w-3.5" />
                        exam_template_emsi.docx
                      </span>
                    )}
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updatingSettings}
                    className="bg-black hover:bg-neutral-900 text-white font-bold rounded-xl text-xs px-6 py-2"
                  >
                    {updatingSettings && '... '}
                    {language === 'fr' ? 'Enregistrer les Paramètres' : 'Save Configurations'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Scheduling Proposals Inbox */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {loadingPendingProposals ? (
            <div className="text-center py-12 text-neutral-400 text-xs">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>
          ) : pendingProposals.length === 0 ? (
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-12 text-center text-xs font-bold text-neutral-400">
              <Inbox className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
              {language === 'fr' ? 'Aucune proposition de planning d\'examen en attente.' : 'No pending exam schedule proposals.'}
            </Card>
          ) : (
            pendingProposals.map((prop: any) => (
              <Card key={prop.id} className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block bg-neutral-100 text-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {prop.examen?.classe?.nom}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">
                      {prop.examen?.matiere?.nom}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-black">{prop.examen?.intitule}</h3>
                  <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-semibold pt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Prof : {prop.enseignant?.user?.nom} {prop.enseignant?.user?.prenom}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(prop.date_proposee).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => handleApproveProposal(prop.id)}
                    disabled={reviewingSchedule}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-4 py-2 gap-1"
                  >
                    <Check className="h-4 w-4" />
                    {language === 'fr' ? 'Approuver' : 'Approve'}
                  </Button>
                  <Button 
                    onClick={() => handleDeclineProposalClick(prop.id)}
                    disabled={reviewingSchedule}
                    variant="outline"
                    className="border-neutral-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold rounded-xl text-xs px-4 py-2 gap-1"
                  >
                    <X className="h-4 w-4" />
                    {language === 'fr' ? 'Décliner' : 'Decline'}
                  </Button>
                </div>
              </Card>
            ))
          )}

          {/* Decline Comment Dialog */}
          <Dialog open={isDeclineModalOpen} onOpenChange={setIsDeclineModalOpen}>
            <DialogContent className="bg-white rounded-2xl border border-neutral-100 p-6 max-w-md">
              <form onSubmit={handleDeclineProposalSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="font-extrabold text-lg">
                    {language === 'fr' ? 'Justification du refus' : 'Decline Schedule Proposal'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-neutral-400">
                    {language === 'fr' 
                      ? 'Veuillez saisir un commentaire obligatoire expliquant le refus à l\'enseignant.' 
                      : 'Provide comments explaining why the schedule is declined.'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-1">
                  <Label htmlFor="decline-comment-text" className="text-xs font-bold">Commentaire</Label>
                  <Textarea
                    id="decline-comment-text"
                    placeholder="Ex: Conflit d'horaire avec une autre épreuve..."
                    value={declineComment}
                    onChange={(e) => setDeclineComment(e.target.value)}
                    required
                    className="rounded-xl min-h-[80px]"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDeclineModalOpen(false)} className="rounded-xl font-bold">
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">
                    {language === 'fr' ? 'Refuser le planning' : 'Decline Proposal'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* TAB 3: Grade Edit Exceptions requests */}
      {activeTab === 'exceptions' && (
        <div className="space-y-4">
          {loadingPendingExceptions ? (
            <div className="text-center py-12 text-neutral-400 text-xs">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>
          ) : pendingExceptions.length === 0 ? (
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-12 text-center text-xs font-bold text-neutral-400">
              <Unlock className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
              {language === 'fr' ? 'Aucune demande d\'exception en attente.' : 'No pending grade edit exceptions.'}
            </Card>
          ) : (
            pendingExceptions.map((exc: any) => (
              <Card key={exc.id} className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block bg-neutral-100 text-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {exc.examen?.classe?.nom}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">
                      Examen : {exc.examen?.intitule}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-black pt-1">
                    {language === 'fr' ? 'Motif de dérogation' : 'Justification'} : <span className="font-normal text-neutral-600">{exc.motif}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-semibold pt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Demande de : {exc.enseignant?.user?.nom} {exc.enseignant?.user?.prenom}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => handleApproveException(exc.id)}
                    disabled={approvingException}
                    className="bg-black hover:bg-neutral-900 text-white font-bold rounded-xl text-xs px-4 py-2 gap-1"
                  >
                    <Check className="h-4 w-4" />
                    {language === 'fr' ? 'Accorder l\'accès' : 'Approve Request'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

    </div>
  )
}

export default AdminExamManagementPage
