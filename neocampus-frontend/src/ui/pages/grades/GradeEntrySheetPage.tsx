import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/application/stores/authStore'
import { useExamen } from '@/application/useCases/useExamen'
import { useGrade } from '@/application/useCases/useGrade'
import { studentApiService } from '@/infrastructure/api/studentApiService'
import { Student } from '@/domain/ports/IStudentService'
import { Lock, Unlock, AlertTriangle, AlertCircle, Save, X } from 'lucide-react'

export const GradeEntrySheetPage: React.FC = () => {
  const { examenId } = useParams<{ examenId: string }>()
  const navigate = useNavigate()
  const { language } = useAuthStore()
  
  const examId = parseInt(examenId ?? '0')

  const { useExamenDetails } = useExamen()
  const { data: exam, isLoading: loadingExam } = useExamenDetails(examId)

  const { useCheckGradingWindow, useExamenGrades, submitBulk, submittingBulk, requestException, requestingException } = useGrade()
  const { data: windowStatus, isLoading: loadingWindow } = useCheckGradingWindow(examId)
  const { data: existingGrades = [], isLoading: loadingGrades } = useExamenGrades(examId)

  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  // Grades entry state: key is studentId
  // value: { value: string, isAbsent: boolean }
  const [grades, setGrades] = useState<Record<number, { value: string; isAbsent: boolean }>>({})
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})

  // Exception modal state
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false)
  const [justification, setJustification] = useState('')
  const [exceptionRequestSent, setExceptionRequestSent] = useState(false)

  const canEdit = windowStatus?.can_enter_grades ?? false

  // 1. Fetch class students
  useEffect(() => {
    if (exam?.classe_id) {
      setLoadingStudents(true)
      studentApiService.findAllByClasse(exam.classe_id)
        .then((data) => {
          setStudents(data)
          // Initialize grades map
          const initialGrades: typeof grades = {}
          data.forEach((s) => {
            const match = existingGrades.find((g: any) => g.eleve_id === s.id)
            if (match) {
              initialGrades[s.id] = {
                value: match.valeur.toString(),
                isAbsent: false,
              }
            } else {
              initialGrades[s.id] = {
                value: '',
                isAbsent: false,
              }
            }
          })
          setGrades(initialGrades)
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingStudents(false))
    }
  }, [exam?.classe_id, existingGrades])

  const handleGradeChange = (studentId: number, rawVal: string) => {
    // Basic validation
    const num = parseFloat(rawVal)
    let error = ''
    if (rawVal !== '' && (isNaN(num) || num < 0 || num > 20)) {
      error = language === 'fr' ? 'Note requise entre 0 et 20' : 'Grade must be between 0 and 20'
    }

    setValidationErrors((prev) => ({
      ...prev,
      [studentId]: error,
    }))

    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        value: rawVal,
        isAbsent: false,
      },
    }))
  }

  const handleAbsentChange = (studentId: number, isChecked: boolean) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        value: isChecked ? '' : prev[studentId]?.value || '',
        isAbsent: isChecked,
      },
    }))

    // Clear validation error when absent is checked
    if (isChecked) {
      setValidationErrors((prev) => {
        const copy = { ...prev }
        delete copy[studentId]
        return copy
      })
    }
  }

  const handleSaveGrades = async () => {
    // Double check validation errors
    const hasErrors = Object.values(validationErrors).some((err) => err !== '')
    if (hasErrors) return

    const payload = Object.entries(grades)
      .filter(([_, data]) => !data.isAbsent && data.value !== '')
      .map(([studentId, data]) => ({
        eleve_id: parseInt(studentId),
        valeur: parseFloat(data.value),
      }))

    try {
      await submitBulk({
        examenId: examId,
        grades: payload,
      })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    }
  }

  const handleRequestExceptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!justification) return
    try {
      await requestException({
        examenId: examId,
        motif: justification,
      })
      setExceptionRequestSent(true)
      setJustification('')
      // Close modal after a delay
      setTimeout(() => {
        setIsExceptionModalOpen(false)
        setExceptionRequestSent(false)
      }, 2000)
    } catch (err) {
      console.error(err)
    }
  }

  // Appreciation helper
  const getAppreciation = (studentId: number) => {
    const record = grades[studentId]
    if (!record) return 'En attente'
    if (record.isAbsent) return 'Non noté'
    if (record.value === '') return 'En attente'

    const val = parseFloat(record.value)
    if (isNaN(val)) return 'En attente'

    if (val >= 16) return 'Très Bien'
    if (val >= 14) return 'Bien'
    if (val >= 12) return 'Assez Bien'
    if (val >= 10) return 'Passable'
    return 'Insuffisant'
  }

  // Stats calculation
  const enteredGrades = Object.values(grades)
    .filter(g => !g.isAbsent && g.value !== '')
    .map(g => parseFloat(g.value))
    .filter(v => !isNaN(v))

  const countEntered = enteredGrades.length
  const totalCount = students.length

  const averageVal = countEntered > 0 ? (enteredGrades.reduce((sum, v) => sum + v, 0) / countEntered) : 0
  const maxVal = countEntered > 0 ? Math.max(...enteredGrades) : 0
  const minVal = countEntered > 0 ? Math.min(...enteredGrades) : 0

  return (
    <div className="space-y-6 max-w-[1024px] mx-auto animate-fade-in py-4 text-neutral-900">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {language === 'fr' ? 'Saisie des Notes' : 'Grades Entry Sheet'}
        </h1>
        <div className="border-b border-neutral-100 flex gap-6 pb-px mt-2">
          <button className="border-b-2 border-black font-semibold text-sm pb-2.5">
            {language === 'fr' ? 'Saisie des Notes' : 'Notes Record'}
          </button>
        </div>
      </div>

      {/* Lock Banner / Notification */}
      {!loadingWindow && (
        <Alert className={`rounded-2xl p-4 flex items-center justify-between gap-4 border ${
          canEdit 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center gap-3">
            {canEdit ? (
              <Unlock className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <Lock className="h-5 w-5 text-amber-600 shrink-0" />
            )}
            <div>
              <AlertTitle className="font-extrabold text-sm">
                {canEdit 
                  ? (language === 'fr' ? 'Saisie déverrouillée' : 'Grading Unlocked') 
                  : (language === 'fr' ? 'Saisie verrouillée (Période dépassée)' : 'Grading Locked (Entry Window Closed)')}
              </AlertTitle>
              <AlertDescription className="text-xs text-neutral-500 mt-0.5">
                {canEdit 
                  ? (language === 'fr' ? 'Vous pouvez saisir et modifier les notes pour cet examen.' : 'You can enter and update notes.') 
                  : (language === 'fr' 
                      ? 'La grille de saisie est en lecture seule. Vous pouvez demander une exception d\'accès à l\'administrateur.' 
                      : 'The grades list is read-only. You can request a grading exception from the admin.')}
              </AlertDescription>
            </div>
          </div>

          {!canEdit && (
            <Dialog open={isExceptionModalOpen} onOpenChange={setIsModalOpen => {
              setIsExceptionModalOpen(setIsModalOpen)
              if (!setIsModalOpen) setExceptionRequestSent(false)
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs px-4 py-2 shrink-0">
                  {language === 'fr' ? 'Demander une exception' : 'Request Exception'}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white rounded-2xl border border-neutral-100 p-6 max-w-md">
                {exceptionRequestSent ? (
                  <div className="text-center py-6 space-y-3">
                    <AlertCircle className="h-12 w-12 text-emerald-500 mx-auto" />
                    <h3 className="font-extrabold text-base">{language === 'fr' ? 'Demande envoyée' : 'Request Sent'}</h3>
                    <p className="text-xs text-neutral-400">
                      {language === 'fr' 
                        ? 'Votre demande d\'exception a été transmise à l\'administration.' 
                        : 'Your exception request has been submitted to the admin.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRequestExceptionSubmit} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle className="font-extrabold text-lg">
                        {language === 'fr' ? 'Demander une dérogation de saisie' : 'Request Grade Edit Exception'}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-neutral-400">
                        {language === 'fr' 
                          ? 'Veuillez motiver votre demande d\'ouverture temporaire de saisie pour cet examen.' 
                          : 'Provide a reason to request temporary grading access.'}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-1">
                      <Label htmlFor="justification-text" className="text-xs font-bold">{language === 'fr' ? 'Justification' : 'Justification'}</Label>
                      <Textarea
                        id="justification-text"
                        placeholder="Ex: Absence maladie de l'enseignant durant la saisie..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        required
                        className="rounded-xl min-h-[100px]"
                      />
                    </div>

                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsExceptionModalOpen(false)} className="rounded-xl font-bold">
                        {language === 'fr' ? 'Annuler' : 'Cancel'}
                      </Button>
                      <Button type="submit" disabled={requestingException} className="bg-black text-white font-bold rounded-xl hover:bg-neutral-900">
                        {language === 'fr' ? 'Envoyer' : 'Send'}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          )}
        </Alert>
      )}

      {/* Main Form Sheet */}
      <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-[#e5e7eb] p-6">
          <CardTitle className="font-extrabold text-base">
            {loadingExam ? 'Mathématiques...' : `${exam?.intitule || 'Examen'} — Classe ${exam?.classe?.nom || ''}`}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {loadingStudents || loadingGrades || loadingExam ? (
            <div className="text-center py-12 text-xs text-neutral-400">
              {language === 'fr' ? 'Chargement de la grille des notes...' : 'Loading grades list...'}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs font-semibold">
              {language === 'fr' ? 'Aucun élève inscrit.' : 'No students found.'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-[#e5e7eb] text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                  <th className="p-4 pl-6 w-[60px]">#</th>
                  <th className="p-4">{language === 'fr' ? 'Élève' : 'Student'}</th>
                  <th className="p-4 w-[140px]">{language === 'fr' ? 'Note /20' : 'Grade /20'}</th>
                  <th className="p-4 w-[110px] text-center">{language === 'fr' ? 'Absent' : 'Absent'}</th>
                  <th className="p-4 pr-6 w-[200px]">{language === 'fr' ? 'Appréciation' : 'Appreciation'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {students.map((student, idx) => {
                  const record = grades[student.id] || { value: '', isAbsent: false }
                  const hasErr = !!validationErrors[student.id]
                  const appreciation = getAppreciation(student.id)

                  return (
                    <tr key={student.id} className={`transition-colors ${
                      record.isAbsent ? 'bg-neutral-50/40 opacity-70' : 'hover:bg-neutral-50/30'
                    }`}>
                      <td className="p-4 pl-6 font-mono text-neutral-400 text-xs">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-black">{student.nom} {student.prenom}</div>
                        <span className="text-[9px] font-bold text-neutral-400 mt-0.5 inline-block">
                          {student.matricule}
                        </span>
                      </td>
                      <td className="p-4">
                        {record.isAbsent ? (
                          <div className="text-xs font-extrabold text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-lg border border-transparent w-[60px] text-center">
                            ABS
                          </div>
                        ) : (
                          <div className="relative w-[60px]">
                            <Input
                              type="text"
                              disabled={!canEdit}
                              value={record.value}
                              onChange={(e) => handleGradeChange(student.id, e.target.value)}
                              className={`h-9 font-mono font-bold text-center rounded-lg shadow-sm border ${
                                hasErr 
                                  ? 'border-red-500 bg-red-50/50 focus-visible:ring-red-500 text-red-700' 
                                  : 'border-neutral-200 focus-visible:ring-black'
                              }`}
                            />
                            {hasErr && (
                              <div className="absolute left-0 -bottom-5 w-[200px] text-[9px] font-bold text-red-600">
                                {validationErrors[student.id]}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <Checkbox
                          disabled={!canEdit}
                          checked={record.isAbsent}
                          onCheckedChange={(checked) => handleAbsentChange(student.id, !!checked)}
                          className="rounded border-neutral-300 focus-visible:ring-black"
                        />
                      </td>
                      <td className={`p-4 pr-6 font-semibold text-xs ${
                        appreciation === 'Insuffisant' ? 'text-red-600' : 
                        appreciation === 'Très Bien' ? 'text-emerald-600' : 'text-neutral-500'
                      }`}>
                        {appreciation}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>

        {/* Live average Stats footer */}
        <div className="bg-neutral-50 border-t border-neutral-100 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-4 text-xs font-extrabold text-neutral-700">
            <div>
              {language === 'fr' ? 'Moyenne Class' : 'Class Avg'} : <span className="text-black">{averageVal.toFixed(2)}</span>
            </div>
            <div className="text-neutral-200">|</div>
            <div>
              {language === 'fr' ? 'Note Max' : 'Max Grade'} : <span className="text-emerald-600">{maxVal.toFixed(2)}</span>
            </div>
            <div className="text-neutral-200">|</div>
            <div>
              {language === 'fr' ? 'Note Min' : 'Min Grade'} : <span className="text-red-600">{minVal.toFixed(2)}</span>
            </div>
          </div>
          <div className="text-xs text-neutral-400 font-bold">
            {countEntered} / {totalCount} {language === 'fr' ? 'saisis' : 'graded'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-neutral-100 p-4 bg-neutral-50/30 flex items-center justify-between">
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
            disabled={submittingBulk || !canEdit || countEntered === 0}
            onClick={handleSaveGrades}
            className="bg-black hover:bg-neutral-900 text-white font-bold rounded-xl text-xs px-6 py-2 gap-1.5"
          >
            <Save className="h-4 w-4" />
            {language === 'fr' ? 'Valider les Notes' : 'Save Grades'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default GradeEntrySheetPage
