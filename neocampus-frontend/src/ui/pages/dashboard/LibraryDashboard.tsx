import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  Plus 
} from 'lucide-react'

interface LibraryDashboardProps {
  language: 'fr' | 'en';
  MiniCalendar: React.ComponentType;
}

export const LibraryDashboard: React.FC<LibraryDashboardProps> = ({ language, MiniCalendar }) => {
  return (
    <div className="space-y-8 animate-fade-in text-neutral-900">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Total Ouvrages' : 'Total Books'}
            </span>
            <BookOpen className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">4 250</h2>
          <div className="text-[10px] text-neutral-400 font-semibold mt-2">
            120 nouveaux livres ce mois
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Emprunts Actifs' : 'Active Loans'}
            </span>
            <Clock className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">84</h2>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-black h-1.5 rounded-full" style={{ width: '65%' }} />
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Ouvrages en retard' : 'Overdue Books'}
            </span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-red-600 tracking-tight">12</h2>
          <div className="text-[10px] text-red-500 font-semibold mt-2">
            Lettres de rappel prêtes
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Nouveautés cataloguées' : 'New Catalogued'}
            </span>
            <Plus className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">30</h2>
          <div className="text-[10px] text-teal-600 font-semibold mt-2">
            Mises à disposition aujourd'hui
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Overdue loans list */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4">
              <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                {language === 'fr' ? 'Emprunts en Retard' : 'Overdue Books Loans'}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                <div>
                  <p className="text-xs font-bold text-neutral-800">"Le Petit Prince" - Antoine de Saint-Exupéry</p>
                  <p className="text-[10px] text-neutral-400">Emprunté par : Amine Hariri (3ème C)</p>
                </div>
                <span className="text-xs font-bold text-red-600">7 jours de retard</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                <div>
                  <p className="text-xs font-bold text-neutral-800">"L'Étranger" - Albert Camus</p>
                  <p className="text-[10px] text-neutral-400">Emprunté par : Sarah Lahlou (CE1)</p>
                </div>
                <span className="text-xs font-bold text-red-600">3 jours de retard</span>
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
export default LibraryDashboard
