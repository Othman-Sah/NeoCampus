import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Clock, 
  GraduationCap, 
  BookOpen 
} from 'lucide-react'

interface StudentDashboardProps {
  language: 'fr' | 'en';
  MiniCalendar: React.ComponentType;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ language, MiniCalendar }) => {
  return (
    <div className="space-y-8 animate-fade-in text-neutral-900">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Mon Assiduité' : 'My Attendance'}
            </span>
            <Clock className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">95.5%</h2>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-black h-1.5 rounded-full" style={{ width: '95.5%' }} />
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Ma Moyenne' : 'My GPA'}
            </span>
            <GraduationCap className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">14.8 / 20</h2>
          <div className="text-[10px] text-teal-600 font-semibold mt-2">
            Objectif trimestre atteint
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Livres Empruntés' : 'Books Borrowed'}
            </span>
            <BookOpen className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">2</h2>
          <div className="text-[10px] text-neutral-400 font-semibold mt-2">
            À rendre d'ici 3 jours
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Devoirs à faire' : 'Pending Tasks'}
            </span>
            <div className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">3</div>
          </div>
          <p className="text-xs font-semibold text-neutral-800 mt-2">
            Exercices de Mathématiques, Chapitre 4.
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Courses / homework task details */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4">
              <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                {language === 'fr' ? 'Mes Devoirs à Rendre' : 'Homework Task List'}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                <div>
                  <p className="text-xs font-bold text-neutral-850">Exercices d'Algèbre matricielle</p>
                  <p className="text-[10px] text-neutral-400">Cours : Mathématiques | Pour le : 14/06/2024</p>
                </div>
                <span className="text-xs font-bold text-red-600">Urgent</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="text-xs font-bold text-neutral-850">Rapport de lecture "Le Cid"</p>
                  <p className="text-[10px] text-neutral-400">Cours : Français | Pour le : 18/06/2024</p>
                </div>
                <span className="text-xs font-bold text-neutral-400">Normal</span>
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
export default StudentDashboard
