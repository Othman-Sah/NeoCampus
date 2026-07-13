import React from 'react'
import { motion } from 'framer-motion'
import { Construction, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DevelopmentPageProps {
  path?: string
}

export const DevelopmentPage: React.FC<DevelopmentPageProps> = ({ path }) => {
  const navigate = useNavigate()
  
  // Read custom settings from localStorage
  const settings = JSON.parse(localStorage.getItem('dev_mode_settings') || '{}')
  const progressPercent = settings.progressPercent !== undefined ? Number(settings.progressPercent) : 75
  const statusText = settings.statusText || 'Phase 3 : Tests de validation finale & QA'
  const customMessage = settings.customMessage || "Ce module est en cours de développement intensif dans le cadre de la phase de livraison actuelle de la plateforme NeoCampus. L'architecture hexagonale et les contrats d'API sont validés."
  
  // Default checklist for realistic representation
  const checklist = [
    { name: 'Modélisation du domaine & Couche Core', status: 'done' },
    { name: 'Contrats des API REST / GraphQL', status: 'done' },
    { name: 'Intégration UI & Responsive Design', status: 'done' },
    { name: 'Validation fonctionnelle & Tests unitaires', status: progressPercent >= 85 ? 'done' : 'progress' },
    { name: 'Optimisation des performances & Audit de sécurité', status: progressPercent >= 95 ? 'done' : 'pending' },
  ]

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime-400/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-teal-400/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl z-10"
      >
        <Card className="border-neutral-200/80 bg-white/70 backdrop-blur-xl shadow-xl overflow-hidden rounded-2xl">
          {/* Header Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-lime-400 via-teal-400 to-emerald-500 animate-pulse" />
          
          <CardContent className="p-8 flex flex-col items-center text-center">
            {/* Animated Icon */}
            <div className="w-16 h-16 rounded-full bg-lime-50 border border-lime-100 flex items-center justify-center mb-6 shadow-inner relative">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <Construction className="h-8 w-8 text-neutral-800" />
              </motion.div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-lime-400 rounded-full border-2 border-white animate-ping" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-lime-400 rounded-full border-2 border-white" />
            </div>

            {/* Title & Badge */}
            <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full bg-neutral-900 text-white mb-3">
              Module en Développement
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight mb-2">
              Fonctionnalité en cours de finalisation
            </h1>
            <p className="text-xs text-neutral-400 font-mono mb-6 bg-neutral-50 px-2 py-1 rounded">
              Route: {path || window.location.pathname}
            </p>

            {/* Custom Description */}
            <p className="text-sm text-neutral-600 max-w-lg mb-8 leading-relaxed">
              {customMessage}
            </p>

            {/* Progress Container */}
            <div className="w-full mb-8 bg-neutral-50 p-4 rounded-xl border border-neutral-100/50">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-800 mb-2">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                  Statut d'avancement
                </span>
                <span className="font-mono text-neutral-900 bg-lime-400 px-2 py-0.5 rounded text-[11px]">
                  {progressPercent}%
                </span>
              </div>
              
              {/* Shimmering Progress Bar */}
              <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-neutral-800 via-neutral-900 to-black relative"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_1s_linear_infinite]" />
                </motion.div>
              </div>

              <div className="mt-3 text-left text-xs font-medium text-neutral-500 italic flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin text-neutral-400 shrink-0" />
                <span>{statusText}</span>
              </div>
            </div>

            {/* Checklist / Deliverables */}
            <div className="w-full text-left space-y-2.5 max-w-md mx-auto mb-8 bg-white/50 p-4 rounded-xl border border-neutral-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">
                Liste des tâches de validation
              </h3>
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${item.status === 'done' ? 'text-neutral-500 line-through' : 'text-neutral-700'}`}>
                    {item.name}
                  </span>
                  <div>
                    {item.status === 'done' ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3" /> Validé
                      </span>
                    ) : item.status === 'progress' ? (
                      <span className="flex items-center gap-1 text-amber-600 font-bold text-[10px] uppercase bg-amber-50 px-2 py-0.5 rounded">
                        <Loader2 className="h-3 w-3 animate-spin" /> En cours
                      </span>
                    ) : (
                      <span className="text-neutral-400 font-bold text-[10px] uppercase bg-neutral-100 px-2 py-0.5 rounded">
                        Attente
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-2 inline" /> Retour au Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default DevelopmentPage
