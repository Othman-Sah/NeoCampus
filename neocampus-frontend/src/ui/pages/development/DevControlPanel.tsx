import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Save, 
  RotateCcw, 
  Search, 
  Sliders, 
  Layers, 
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  HelpCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

interface DevPageConfig {
  name: string
  path: string
  category: 'admin' | 'pedagogy' | 'finance' | 'library' | 'portal' | 'transport'
}

const APP_PAGES: DevPageConfig[] = [
  // Admin Pages
  { name: 'Admin Dashboard', path: '/admin/dashboard', category: 'admin' },
  { name: 'Gestion des Utilisateurs', path: '/admin/users', category: 'admin' },
  { name: 'Répertoire des Élèves', path: '/admin/students', category: 'admin' },
  { name: 'Création Élève', path: '/admin/students/create', category: 'admin' },
  { name: 'Détails Élève', path: '/admin/students/:id', category: 'admin' },
  { name: 'Modification Élève', path: '/admin/students/:id/edit', category: 'admin' },
  { name: 'Import des Élèves', path: '/admin/students/import', category: 'admin' },
  { name: 'Gestion des Enseignants', path: '/admin/teachers', category: 'admin' },
  { name: 'Création Enseignant', path: '/admin/teachers/create', category: 'admin' },
  { name: 'Gestion des Comptables', path: '/admin/accountants', category: 'admin' },
  { name: 'Gestion des Parents', path: '/admin/parents', category: 'admin' },
  { name: 'Gestion des Classes', path: '/admin/classes', category: 'admin' },
  { name: 'Gestion des Examens (Admin)', path: '/admin/exams', category: 'admin' },

  // Pedagogy & General Pages
  { name: 'Tableau de bord principal', path: '/dashboard', category: 'pedagogy' },
  { name: 'Emploi du temps', path: '/timetable', category: 'pedagogy' },
  { name: 'Suivi des Absences', path: '/attendance', category: 'pedagogy' },
  { name: 'Portail des Notes', path: '/grades', category: 'pedagogy' },
  { name: 'Fil d\'annonces', path: '/announcements', category: 'pedagogy' },
  { name: 'Bulletins Scolaires', path: '/bulletins', category: 'pedagogy' },

  // Finance Pages
  { name: 'Salaires Enseignants', path: '/finance/salaires', category: 'finance' },
  { name: 'Configuration des Tarifs', path: '/finance/fees', category: 'finance' },
  { name: 'Paiements Scolarité', path: '/finance/payments', category: 'finance' },
  { name: 'Rapports Financiers', path: '/finance/reports', category: 'finance' },

  // Library Pages
  { name: 'Dashboard Bibliothèque', path: '/library/dashboard', category: 'library' },
  { name: 'Catalogue de Livres', path: '/library/books', category: 'library' },
  { name: 'Gestion des Emprunts', path: '/library/loans', category: 'library' },
  { name: 'Membres Bibliothèque', path: '/library/members', category: 'library' },
  { name: 'Amendes & Pénalités', path: '/library/fines', category: 'library' },
  { name: 'Analyses Bibliothèque', path: '/library/analytics', category: 'library' },
  { name: 'Paramètres Bibliothèque', path: '/library/settings', category: 'library' },

  // Portals Pages (Student / Parent / Teacher)
  { name: 'Notes Enfant (Parent)', path: '/parent/child/:childId/grades', category: 'portal' },
  { name: 'Absences Enfant (Parent)', path: '/parent/child/:childId/attendance', category: 'portal' },
  { name: 'Cahier de notes (Enseignant)', path: '/teacher/grades', category: 'portal' },
  { name: 'Examens (Enseignant)', path: '/teacher/exams', category: 'portal' },
  { name: 'Devoirs (Élève)', path: '/student/homework', category: 'portal' },
  { name: 'Cours & Supports (Élève)', path: '/student/supports', category: 'portal' },

  // Transport Pages
  { name: 'Suivi de Transport', path: '/transport', category: 'transport' },
  { name: 'Dashboard Chauffeur', path: '/driver/dashboard', category: 'transport' },
  { name: 'Suivi Plein Écran (Admin)', path: '/admin/transport/tracking', category: 'transport' },
]

export const DevControlPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [passError, setPassError] = useState<string>('')
  
  // Custom states
  const [disabledPaths, setDisabledPaths] = useState<string[]>([])
  const [progressPercent, setProgressPercent] = useState<number>(75)
  const [statusText, setStatusText] = useState<string>('Phase 3 : Tests de validation finale & QA')
  const [customMessage, setCustomMessage] = useState<string>(
    "Ce module est en cours de développement intensif dans le cadre de la phase de livraison actuelle de la plateforme NeoCampus. L'architecture hexagonale et les contrats d'API sont validés."
  )
  
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')

  // Check session storage authentication on mount
  useEffect(() => {
    const devAuth = sessionStorage.getItem('dev_panel_auth')
    if (devAuth === 'true') {
      setIsAuthenticated(true)
    }

    // Load configurations
    const settings = JSON.parse(localStorage.getItem('dev_mode_settings') || '{}')
    const savedDisabledPaths = JSON.parse(localStorage.getItem('dev_disabled_paths') || '[]')
    
    setDisabledPaths(savedDisabledPaths)
    if (settings.progressPercent !== undefined) setProgressPercent(settings.progressPercent)
    if (settings.statusText !== undefined) setStatusText(settings.statusText)
    if (settings.customMessage !== undefined) setCustomMessage(settings.customMessage)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'emsi2026') {
      setIsAuthenticated(true)
      sessionStorage.setItem('dev_panel_auth', 'true')
      setPassError('')
    } else {
      setPassError('Mot de passe incorrect. Astuce : Regardez le plan de développement.')
    }
  }

  const handleSave = () => {
    localStorage.setItem('dev_disabled_paths', JSON.stringify(disabledPaths))
    localStorage.setItem(
      'dev_mode_settings',
      JSON.stringify({
        progressPercent,
        statusText,
        customMessage,
      })
    )
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const handleReset = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser toutes les pages (tout débloquer) ?')) {
      setDisabledPaths([])
      setProgressPercent(75)
      setStatusText('Phase 3 : Tests de validation finale & QA')
      setCustomMessage(
        "Ce module est en cours de développement intensif dans le cadre de la phase de livraison actuelle de la plateforme NeoCampus. L'architecture hexagonale et les contrats d'API sont validés."
      )
      localStorage.removeItem('dev_disabled_paths')
      localStorage.removeItem('dev_mode_settings')
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const togglePath = (path: string) => {
    if (disabledPaths.includes(path)) {
      setDisabledPaths(disabledPaths.filter(p => p !== path))
    } else {
      setDisabledPaths([...disabledPaths, path])
    }
  }

  const toggleAll = (action: 'lock' | 'unlock') => {
    if (action === 'lock') {
      setDisabledPaths(APP_PAGES.map(p => p.path))
    } else {
      setDisabledPaths([])
    }
  }

  const categories = [
    { id: 'all', label: 'Toutes les pages' },
    { id: 'admin', label: 'Administration' },
    { id: 'pedagogy', label: 'Pédagogie / Commun' },
    { id: 'finance', label: 'Finance' },
    { id: 'library', label: 'Bibliothèque' },
    { id: 'portal', label: 'Portails Rôles' },
    { id: 'transport', label: 'Transport' },
  ]

  const filteredPages = APP_PAGES.filter(page => {
    const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          page.path.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || page.category === activeCategory
    return matchesSearch && matchesCategory
  })

  // Password Gate Rendering
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] p-4 font-sans">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-400/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] bg-lime-400/5 rounded-full blur-[80px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md z-10"
        >
          <Card className="border-neutral-200/80 bg-white/70 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
            <div className="h-1.5 w-full bg-neutral-900" />
            <CardHeader className="text-center pt-8 pb-4">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 border border-neutral-200">
                <KeyRound className="h-5 w-5 text-neutral-800" />
              </div>
              <CardTitle className="text-xl font-black text-neutral-950 tracking-tight uppercase">
                Zone Sécurisée
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500 max-w-[280px] mx-auto mt-1">
                Entrez le code d'accès développeur pour configurer le filtre d'avancement des modules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordInput" className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
                    Code Développeur
                  </Label>
                  <div className="relative">
                    <Input
                      id="passwordInput"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 border-neutral-200 focus-visible:ring-neutral-900 focus-visible:border-neutral-950 h-10 text-sm font-semibold rounded-xl bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none border-none bg-transparent"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passError && (
                    <p className="text-[10px] font-semibold text-red-600 flex items-center gap-1 mt-1.5 bg-red-50 p-2 rounded-lg border border-red-100">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                      <span>{passError}</span>
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider h-10 rounded-xl cursor-pointer"
                >
                  Débloquer le Panneau
                </Button>
              </form>
            </CardContent>
            <CardFooter className="bg-neutral-50/50 border-t border-neutral-100 px-6 py-4 flex justify-between items-center text-[10px] text-neutral-400 font-medium">
              <span>PROJET NEOCAMPUS</span>
              <span>v1.0.4-DEV</span>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Authenticated Dashboard Rendering
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans text-neutral-900">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-lime-400 animate-pulse" />
            <h1 className="text-2xl font-black tracking-tight text-neutral-900 uppercase">
              Panneau de Contrôle Développement
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Configurez les pages qui doivent s'afficher comme "en cours de développement" pour ajuster la charge de travail visible.
          </p>
        </div>
        
        {/* Floating actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-black text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Réinitialiser
          </Button>

          <Button
            onClick={handleSave}
            className={`${
              saveStatus === 'saved' 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-neutral-950 hover:bg-neutral-800'
            } text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer px-4 flex items-center gap-1.5 transition-all`}
          >
            {saveStatus === 'saved' ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" /> Enregistré !
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Enregistrer les réglages
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Configuration settings panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-neutral-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 py-4">
              <div className="flex items-center gap-2 text-neutral-900">
                <Sliders className="h-4.5 w-4.5" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">
                  Personnalisation Template
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-neutral-500">
                Définissez l'apparence des pages "En cours de développement".
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-5 space-y-5">
              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-neutral-800">
                  <Label htmlFor="progressPercentInput">Pourcentage d'avancement</Label>
                  <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-800">
                    {progressPercent}%
                  </span>
                </div>
                <input
                  id="progressPercentInput"
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-950"
                />
                <p className="text-[10px] text-neutral-400">
                  Généralement, cibler 60%-80% montre que vous y travaillez activement.
                </p>
              </div>

              {/* Status text */}
              <div className="space-y-2">
                <Label htmlFor="statusTextInput" className="text-xs font-bold text-neutral-800">
                  Sous-titre d'avancement
                </Label>
                <Input
                  id="statusTextInput"
                  type="text"
                  placeholder="Phase 3 : Tests d'intégration & QA"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  className="border-neutral-200 focus-visible:ring-neutral-900 focus-visible:border-neutral-950 h-9 text-xs rounded-xl bg-white"
                />
              </div>

              {/* Custom message description */}
              <div className="space-y-2">
                <Label htmlFor="customMessageInput" className="text-xs font-bold text-neutral-800">
                  Message explicatif détaillé
                </Label>
                <textarea
                  id="customMessageInput"
                  rows={4}
                  placeholder="Écrivez le message de dev..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-3 text-xs border border-neutral-200 focus-visible:ring-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950 rounded-xl bg-white resize-none text-neutral-700"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border-neutral-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 py-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Actions Globales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex gap-3">
              <Button
                variant="outline"
                onClick={() => toggleAll('lock')}
                className="flex-1 border-neutral-200 text-neutral-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs font-bold uppercase tracking-wide rounded-xl cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5 mr-1" /> Bloquer Tout
              </Button>
              <Button
                variant="outline"
                onClick={() => toggleAll('unlock')}
                className="flex-1 border-neutral-200 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-xs font-bold uppercase tracking-wide rounded-xl cursor-pointer"
              >
                <Unlock className="h-3.5 w-3.5 mr-1" /> Débloquer Tout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Path configuration list panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-neutral-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
            {/* Header controls */}
            <CardContent className="p-0 border-b border-neutral-100">
              <div className="p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Filtrer par nom ou chemin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 border-neutral-200 focus-visible:ring-neutral-900 focus-visible:border-neutral-950 h-9 text-xs rounded-xl bg-white w-full"
                  />
                </div>
                
                {/* Active Pages Count */}
                <div className="text-xs font-bold text-neutral-500 bg-neutral-50 border border-neutral-100 px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Modules Bloqués : </span>
                  <Badge variant="secondary" className="bg-neutral-900 text-white rounded font-mono text-[10px] px-1.5 py-0.5">
                    {disabledPaths.length} / {APP_PAGES.length}
                  </Badge>
                </div>
              </div>

              {/* Category tabs */}
              <div className="px-5 pb-3 flex flex-wrap gap-1 border-t border-neutral-100/50 pt-3">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-neutral-950 border-neutral-950 text-white shadow-sm'
                        : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-black'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </CardContent>

            {/* List */}
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              <div className="divide-y divide-neutral-100">
                <AnimatePresence>
                  {filteredPages.length > 0 ? (
                    filteredPages.map(page => {
                      const isLocked = disabledPaths.includes(page.path)
                      return (
                        <motion.div
                          key={page.path}
                          layout
                          className={`p-4 flex items-center justify-between gap-4 transition-colors hover:bg-neutral-50/50 ${
                            isLocked ? 'bg-red-50/10' : ''
                          }`}
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-neutral-900 truncate">
                                {page.name}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wide leading-none ${
                                  page.category === 'admin' ? 'border-red-200 text-red-700 bg-red-50/30' :
                                  page.category === 'finance' ? 'border-amber-200 text-amber-700 bg-amber-50/30' :
                                  page.category === 'library' ? 'border-purple-200 text-purple-700 bg-purple-50/30' :
                                  page.category === 'pedagogy' ? 'border-blue-200 text-blue-700 bg-blue-50/30' :
                                  page.category === 'transport' ? 'border-teal-200 text-teal-700 bg-teal-50/30' :
                                  'border-neutral-200 text-neutral-600 bg-neutral-50'
                                }`}
                              >
                                {page.category}
                              </Badge>
                            </div>
                            <code className="text-[10px] text-neutral-400 font-mono block truncate">
                              {page.path}
                            </code>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              isLocked ? 'text-red-600 font-semibold' : 'text-neutral-400 font-medium'
                            }`}>
                              {isLocked ? 'Bloqué (En Dev)' : 'Actif (Fini)'}
                            </span>
                            <Switch
                              checked={isLocked}
                              onCheckedChange={() => togglePath(page.path)}
                              className="data-[state=checked]:bg-red-500"
                            />
                          </div>
                        </motion.div>
                      )
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-neutral-400 font-semibold uppercase">
                      Aucune page ne correspond à vos filtres
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}

export default DevControlPanel
