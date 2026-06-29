import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Clock, 
  GraduationCap, 
  CircleDollarSign 
} from 'lucide-react'

interface ParentDashboardProps {
  language: 'fr' | 'en';
  MiniCalendar: React.ComponentType;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ language, MiniCalendar }) => {
  return (
    <div className="space-y-8 animate-fade-in text-neutral-900">
      {/* Selector Kid */}
      <div className="flex items-center gap-4 bg-white border border-neutral-100 p-4 rounded-2xl shadow-sm">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          {language === 'fr' ? 'Enfant sélectionné :' : 'Selected Child :'}
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-xl bg-black text-white text-xs font-bold shadow-sm">
            Amine Hariri (3ème C)
          </button>
          <button className="px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-semibold hover:bg-neutral-200 transition">
            Sarah Hariri (CE1)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Assiduité Enfant' : 'Child Attendance'}
            </span>
            <Clock className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">97.0%</h2>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-black h-1.5 rounded-full" style={{ width: '97%' }} />
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Moyenne Générale' : 'Overall GPA'}
            </span>
            <GraduationCap className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">15.4 / 20</h2>
          <div className="text-[10px] text-teal-600 font-semibold mt-2">
            Rang : 3ème de la classe
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Solde Scolarité' : 'School Fee Balance'}
            </span>
            <CircleDollarSign className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-teal-600 tracking-tight">0 MAD</h2>
          <div className="text-[10px] text-neutral-400 font-semibold mt-2">
            Payé le 02/06/2024
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Alertes Académiques' : 'Academic Alerts'}
            </span>
            <div className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">OK</div>
          </div>
          <p className="text-xs font-semibold text-neutral-850 mt-2">
            Aucun incident disciplinaire signalé.
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* School homework checklist */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4">
              <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                {language === 'fr' ? 'Dernières Notes Reçues' : 'Latest Grades'}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                <div>
                  <p className="text-xs font-bold text-neutral-850">Mathématiques - Contrôle Continu 3</p>
                  <p className="text-[10px] text-neutral-400">Publié hier par M. Benali</p>
                </div>
                <span className="text-xs font-bold text-teal-600">16 / 20</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                <div>
                  <p className="text-xs font-bold text-neutral-850">Physique-Chimie - Examen Trimestriel</p>
                  <p className="text-[10px] text-neutral-400">Publié le 10/06/2024</p>
                </div>
                <span className="text-xs font-bold text-teal-600">14.5 / 20</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <MiniCalendar />
        </div>
      </div>
    </div>
  )
}
export default ParentDashboard
