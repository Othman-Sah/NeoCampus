import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookMarked, 
  Clock, 
  FileSpreadsheet, 
  Calendar as CalendarIcon 
} from 'lucide-react'

interface TeacherDashboardProps {
  language: 'fr' | 'en';
  MiniCalendar: React.ComponentType;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ language, MiniCalendar }) => {
  return (
    <div className="space-y-8 animate-fade-in text-neutral-900">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Mes Classes' : 'My Classes'}
            </span>
            <BookMarked className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">3</h2>
          <div className="text-[10px] text-neutral-400 font-semibold mt-2">
            3ème C, 2nde B, Terminale A
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
              {language === 'fr' ? 'Devoirs en attente' : 'Pending Homework'}
            </span>
            <FileSpreadsheet className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-red-600 tracking-tight">2</h2>
          <div className="text-[10px] text-red-500 font-semibold mt-2">
            {language === 'fr' ? "Corriger l'examen d'Algèbre de 3ème C" : 'Grade Algebra exam for 3rd C'}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Classroom schedule for today */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4">
              <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                {language === 'fr' ? 'Cours du Jour' : 'Classes Today'}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6 space-y-4">
              <div className="flex items-start justify-between p-3 bg-[#fdfdfd] border border-neutral-100 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-teal-600 uppercase">08:30 - 10:00</span>
                  <p className="text-xs font-bold text-neutral-900">Mathématiques - Algèbre</p>
                  <p className="text-[10px] text-neutral-500">Classe : 3ème C | Salle : 104</p>
                </div>
                <span className="text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded">TERMINÉ</span>
              </div>
              <div className="flex items-start justify-between p-3 bg-[#fdfdfd] border border-neutral-100 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-teal-600 uppercase">10:30 - 12:00</span>
                  <p className="text-xs font-bold text-neutral-900">Mathématiques - Géométrie</p>
                  <p className="text-[10px] text-neutral-500">Classe : 2nde B | Salle : 108</p>
                </div>
                <span className="text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded">TERMINÉ</span>
              </div>
              <div className="flex items-start justify-between p-3 bg-[#fdfdfd] border border-neutral-100 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-black uppercase">14:00 - 15:30</span>
                  <p className="text-xs font-bold text-neutral-900">Mathématiques - Analyse</p>
                  <p className="text-[10px] text-neutral-500">Classe : Terminale A | Salle : 202</p>
                </div>
                <span className="text-xs font-bold bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded">EN ATTENTE</span>
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
export default TeacherDashboard
