import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/application/stores/authStore'
import { useExamen } from '@/application/useCases/useExamen'
import { useGrade } from '@/application/useCases/useGrade'
import { Link } from 'react-router-dom'
import { FileSpreadsheet, Lock, Unlock, HelpCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'

export const GradesDashboardPage: React.FC = () => {
  const { language } = useAuthStore()
  const { teacherExams, settings, loadingTeacherExams } = useExamen()
  const { pendingExceptions } = useGrade()

  // Find if a teacher can edit an exam based on settings window
  const isWithinWindow = () => {
    if (!settings) return false
    const now = new Date()
    const start = new Date(settings.periode_saisie_notes_debut)
    const end = new Date(settings.periode_saisie_notes_fin)
    return now >= start && now <= end
  }

  const windowOpened = isWithinWindow()

  // Format dates
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6 max-w-[1024px] mx-auto animate-fade-in py-4 text-neutral-900">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {language === 'fr' ? 'Saisie des Notes' : 'Grades Management'}
        </h1>
        <p className="text-xs text-neutral-400 font-medium">
          {language === 'fr' ? 'Saisissez les notes de vos classes et suivez les périodes de saisie.' : 'Submit exam grades for your classes and monitor open deadlines.'}
        </p>
      </div>

      {/* Window alert banner */}
      {settings && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          windowOpened 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-xs font-bold">
                {language === 'fr' ? 'Période Officielle de Saisie' : 'Official Entry Window'}
              </p>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                {language === 'fr'
                  ? `Du ${formatDate(settings.periode_saisie_notes_debut)} au ${formatDate(settings.periode_saisie_notes_fin)}`
                  : `From ${formatDate(settings.periode_saisie_notes_debut)} to ${formatDate(settings.periode_saisie_notes_fin)}`}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            windowOpened 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}>
            {windowOpened ? (language === 'fr' ? 'Ouverte' : 'Open') : (language === 'fr' ? 'Verrouillée' : 'Locked')}
          </span>
        </div>
      )}

      {/* Main Workspace grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Exams List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4">
              <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                {language === 'fr' ? 'Mes Évaluations' : 'My Exams'}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              {loadingTeacherExams ? (
                <div className="text-center py-6 text-xs text-neutral-400">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>
              ) : teacherExams.length === 0 ? (
                <div className="text-center py-6 text-neutral-400 text-xs font-semibold">
                  {language === 'fr' ? 'Aucun examen actif disponible.' : 'No active exams found.'}
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {teacherExams.map((exam: any) => (
                    <div key={exam.id} className="flex items-center justify-between py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block bg-neutral-100 text-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {exam.classe?.nom}
                          </span>
                          <span className="text-xs text-neutral-500 font-semibold">
                            {exam.matiere?.nom}
                          </span>
                        </div>
                        <p className="text-xs font-extrabold text-black mt-1">{exam.intitule}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5 font-medium">
                          Statut : <span className="capitalize font-bold">{exam.status}</span>
                        </p>
                      </div>

                      <Button asChild size="sm" className="bg-black hover:bg-neutral-900 text-white font-bold rounded-xl text-xs px-4 py-2">
                        <Link to={`/teacher/grades/${exam.id}`}>
                          {windowOpened || exam.status === 'completed' ? (
                            language === 'fr' ? 'Saisir les Notes' : 'Enter Grades'
                          ) : (
                            language === 'fr' ? 'Voir la Grille' : 'View Grid'
                          )}
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Exception Status widget */}
        <div className="space-y-6">
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              {language === 'fr' ? 'Demandes de Dérogation' : 'Access Exceptions Requests'}
            </h3>
            <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold">
              {language === 'fr'
                ? "Statut de vos demandes de dérogation pour saisir les notes hors période officielle :"
                : "Status of your exceptions requests to submit grades outside the deadline window:"}
            </p>

            <div className="space-y-3 pt-2">
              {pendingExceptions.length === 0 ? (
                <div className="text-center text-[10px] text-neutral-400 py-4 font-semibold">
                  {language === 'fr' ? 'Aucune demande active.' : 'No active requests.'}
                </div>
              ) : (
                pendingExceptions.map((exc: any) => (
                  <div key={exc.id} className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold">{exc.examen?.intitule}</span>
                      
                      {exc.statut === 'pending' && (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[9px]">
                          <HelpCircle className="h-3 w-3 text-amber-500" />
                          En attente
                        </span>
                      )}
                      {exc.statut === 'approved' && (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[9px]">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          Approuvé
                        </span>
                      )}
                      {exc.statut === 'rejected' && (
                        <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[9px]">
                          <XCircle className="h-3 w-3 text-red-500" />
                          Refusé
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-neutral-500 truncate">{exc.motif}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

      </div>

    </div>
  )
}

export default GradesDashboardPage
