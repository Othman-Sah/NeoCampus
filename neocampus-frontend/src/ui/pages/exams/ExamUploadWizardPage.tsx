import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuthStore } from '@/application/stores/authStore'
import { useExamen } from '@/application/useCases/useExamen'
import { 
  Download, 
  UploadCloud, 
  FileText, 
  Eye, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Trash2,
  AlertCircle
} from 'lucide-react'

export const ExamUploadWizardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { language } = useAuthStore()
  
  const examId = parseInt(id ?? '0')

  const { useExamenDetails, settings, uploadSujet, uploadingSujet } = useExamen()
  const { data: exam, isLoading: loadingExam } = useExamenDetails(examId)

  const [step, setStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Step 1: gabarit settings
  const hasTemplate = !!settings?.template_sujet_path

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      validateAndSetFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension === 'pdf' || extension === 'docx') {
      setSelectedFile(file)
      // Create local object URL for preview
      const objectUrl = URL.createObjectURL(file)
      setFilePreviewUrl(objectUrl)
    } else {
      alert(language === 'fr' ? 'Seuls les fichiers PDF et DOCX sont acceptés.' : 'Only PDF and DOCX files are allowed.')
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError(null)
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
  }

  const handleDownloadTemplate = () => {
    // Triggers direct browser download via the backend template route
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    window.open(`${baseURL}/parametres-examens/template`, '_blank')
  }

  const handleSubmitSujet = async () => {
    if (!selectedFile) return
    setError(null)
    try {
      await uploadSujet({
        id: examId,
        file: selectedFile,
      })
      setStep(4) // Move to confirmation
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.message || 'Failed to upload the subject file.')
    }
  }

  return (
    <div className="space-y-6 max-w-[800px] mx-auto animate-fade-in py-4 text-neutral-900">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {language === 'fr' ? 'Téléversement du Sujet' : 'Exam Subject Upload'}
        </h1>
        <p className="text-xs text-neutral-400 font-medium">
          {loadingExam ? 'Examen...' : `${exam?.intitule || 'Examen'} — Classe ${exam?.classe?.nom || ''}`}
        </p>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="flex items-center justify-between bg-white border border-neutral-100 p-4 rounded-2xl shadow-sm">
        {[
          { num: 1, label: language === 'fr' ? 'Modèle' : 'Template' },
          { num: 2, label: language === 'fr' ? 'Téléversement' : 'Upload' },
          { num: 3, label: language === 'fr' ? 'Aperçu' : 'Preview' },
          { num: 4, label: language === 'fr' ? 'Soumission' : 'Submit' },
        ].map((item, index) => (
          <React.Fragment key={item.num}>
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= item.num 
                  ? 'bg-black text-white' 
                  : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
              }`}>
                {item.num}
              </span>
              <span className={`text-xs font-extrabold ${step >= item.num ? 'text-black' : 'text-neutral-400'}`}>
                {item.label}
              </span>
            </div>
            {index < 3 && <div className={`flex-1 h-0.5 mx-4 ${step > item.num ? 'bg-black' : 'bg-neutral-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 min-h-[300px] flex flex-col justify-between">
        <CardContent className="p-0">
          
          {/* STEP 1: Downloade Template */}
          {step === 1 && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <h3 className="font-extrabold text-sm">{language === 'fr' ? 'Étape 1 : Récupérer le Gabarit Officiel' : 'Step 1: Get School Template'}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                  {language === 'fr'
                    ? "Veuillez formater votre sujet en utilisant le document modèle officiel de l'établissement."
                    : 'Download the official word template file to structure your exam subject.'}
                </p>
              </div>

              {hasTemplate ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-xs text-emerald-950">{language === 'fr' ? 'Gabarit de l\'école disponible' : 'School Template Available'}</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Format: Word (.docx)</p>
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleDownloadTemplate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    {language === 'fr' ? 'Télécharger le modèle' : 'Download Template'}
                  </Button>
                </div>
              ) : (
                <Alert className="rounded-xl bg-neutral-50 border-neutral-200">
                  <FileText className="h-4 w-4 text-neutral-400" />
                  <AlertTitle className="text-xs font-bold">{language === 'fr' ? 'Aucun gabarit officiel' : 'No Official Template'}</AlertTitle>
                  <AlertDescription className="text-[10px] text-neutral-400 mt-1">
                    {language === 'fr' 
                      ? "L'administration n'a téléversé aucun modèle. Vous pouvez téléverser votre sujet au format libre (PDF/DOCX)."
                      : 'No document template was set up. You can proceed with custom format.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* STEP 2: Dropzone File Upload */}
          {step === 2 && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <h3 className="font-extrabold text-sm">{language === 'fr' ? 'Étape 2 : Déposer le fichier' : 'Step 2: Upload File'}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                  {language === 'fr' ? 'Sélectionnez ou glissez-déposez le sujet rédigé.' : 'Select or drag and drop your drafted subject copy.'}
                </p>
              </div>

              {!selectedFile ? (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    dragActive 
                      ? 'border-black bg-neutral-50/50' 
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload-input"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className="h-10 w-10 text-neutral-400 mb-3" />
                    <span className="text-xs font-extrabold">{language === 'fr' ? 'Glissez-déposez ou Parcourez' : 'Drag & Drop or Browse'}</span>
                    <span className="text-[10px] text-neutral-400 mt-1.5 font-medium">PDF or DOCX (Max: 10MB)</span>
                  </label>
                </div>
              ) : (
                <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-black/5 p-2 rounded-lg text-black">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-black truncate max-w-[300px]">{selectedFile.name}</p>
                      <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button type="button" onClick={handleRemoveFile} variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Preview subject */}
          {step === 3 && (
            <div className="space-y-4 py-2 flex-1 flex flex-col">
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm">{language === 'fr' ? 'Étape 3 : Aperçu du Document' : 'Step 3: Document Preview'}</h3>
                <p className="text-xs text-neutral-400 font-medium">
                  {language === 'fr' ? 'Vérifiez la mise en page avant d\'envoyer.' : 'Ensure formatting is correct before final validation.'}
                </p>
              </div>

              {selectedFile?.type.includes('pdf') && filePreviewUrl ? (
                <div className="border border-neutral-200 rounded-2xl overflow-hidden h-[400px] bg-neutral-100">
                  <object
                    data={filePreviewUrl}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                  >
                    <iframe src={filePreviewUrl} width="100%" height="100%" title="Preview PDF" />
                  </object>
                </div>
              ) : (
                <div className="border border-neutral-200 border-dashed rounded-2xl p-12 text-center text-xs font-bold text-neutral-400 bg-neutral-50">
                  <Eye className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                  {language === 'fr' 
                    ? 'Aperçu non disponible pour Word (.docx). Vous pouvez valider directement.' 
                    : 'Preview unavailable for Word (.docx). You can submit directly.'}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Confirmation */}
          {step === 4 && (
            <div className="text-center py-12 space-y-4">
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
              <h3 className="font-extrabold text-xl">{language === 'fr' ? 'Sujet Soumis avec Succès !' : 'Subject Submitted Successfully!'}</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed font-medium">
                {language === 'fr'
                  ? 'Le sujet de votre examen a été téléversé et sera examiné par l\'administration.'
                  : 'Your exam paper has been uploaded and will be verified by the admin.'}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              {error}
            </div>
          )}

        </CardContent>

        {/* Wizard Footer Controls */}
        <div className="border-t border-neutral-100 pt-4 flex items-center justify-between mt-6">
          {step < 4 ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={step === 1}
                onClick={() => {
                  setError(null)
                  setStep(prev => prev - 1)
                }}
                className="rounded-xl font-bold text-xs gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                {language === 'fr' ? 'Retour' : 'Back'}
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  disabled={step === 2 && !selectedFile}
                  onClick={() => setStep(prev => prev + 1)}
                  className="bg-black hover:bg-neutral-900 text-white font-bold rounded-xl text-xs gap-1 px-5"
                >
                  {language === 'fr' ? 'Suivant' : 'Next'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={uploadingSujet}
                  onClick={handleSubmitSujet}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs gap-1.5 px-6 py-2"
                >
                  {uploadingSujet && <Loader2 className="h-4 w-4 animate-spin" />}
                  {language === 'fr' ? 'Soumettre au Secrétariat' : 'Submit Subject'}
                </Button>
              )}
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-black hover:bg-neutral-900 text-white font-bold rounded-xl text-xs px-6 py-2"
              >
                {language === 'fr' ? 'Retour au tableau de bord' : 'Back to Dashboard'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ExamUploadWizardPage
