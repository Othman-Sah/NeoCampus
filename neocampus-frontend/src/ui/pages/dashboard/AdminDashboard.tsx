import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStudent } from '@/application/useCases/useStudent'
import { 
  Users, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CircleDollarSign, 
  ArrowRight 
} from 'lucide-react'

interface AdminDashboardProps {
  language: 'fr' | 'en';
  MiniCalendar: React.ComponentType;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ language, MiniCalendar }) => {
  const { students } = useStudent()

  return (
    <div className="space-y-8 animate-fade-in text-neutral-900">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link to="/admin/students" className="block group">
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:border-neutral-400 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase group-hover:text-black">
                {language === 'fr' ? 'Effectif Total' : 'Total Students'}
              </span>
              <Users className="h-4 w-4 text-neutral-400 group-hover:text-black transition-colors" />
            </div>
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">{students.length}</h2>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-teal-600 mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>{language === 'fr' ? '+12 ce mois' : '+12 this month'}</span>
            </div>
          </Card>
        </Link>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? "Taux d'assiduité" : 'Attendance Rate'}
            </span>
            <Clock className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">94.2%</h2>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-black h-1.5 rounded-full" style={{ width: '94.2%' }} />
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Encaissements — Juin' : 'Collections — June'}
            </span>
            <CircleDollarSign className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">148 500 MAD</h2>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-teal-600 mt-2">
            <TrendingUp className="h-3 w-3" />
            <span>+4.5%</span>
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Alertes Actives' : 'Active Alerts'}
            </span>
            <div className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">7</div>
          </div>
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span className="truncate">{language === 'fr' ? 'Absences répétées - Terminale B' : 'Overdue Absences - Grade 12'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span className="truncate">{language === 'fr' ? 'Retard paiement > 30j (x4)' : 'Overdue Payments > 30d (x4)'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Distribution by Level */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  {language === 'fr' ? 'Répartition par Niveau' : 'Distribution by Level'}
                </CardTitle>
                <button className="text-[10px] font-bold text-neutral-400 hover:text-black uppercase">
                  {language === 'fr' ? 'Filtrer' : 'Filter'}
                </button>
              </div>
            </CardHeader>
            <CardContent className="py-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                  <span>Maternelle</span>
                  <span>212</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-black h-2 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                  <span>Primaire</span>
                  <span>381</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-black h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                  <span>Collège</span>
                  <span>169</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-black h-2 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                  <span>Lycée</span>
                  <span>85</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-black h-2 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  {language === 'fr' ? 'Activité Récente' : 'Recent Activity'}
                </CardTitle>
                <a href="#" className="text-[10px] font-bold text-neutral-400 hover:text-black uppercase">
                  {language === 'fr' ? 'Voir tout' : 'View all'}
                </a>
              </div>
            </CardHeader>
            <CardContent className="py-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-lime-100 text-lime-700 font-bold text-xs flex items-center justify-center">
                  KB
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-950 truncate">
                    {language === 'fr' 
                      ? 'Karim Benali a ajouté une nouvelle classe 1A-Math'
                      : 'Karim Benali added a new class 1A-Math'}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    {language === 'fr' ? 'Il y a 10 min' : '10 min ago'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center">
                  <CircleDollarSign className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-950 truncate">
                    {language === 'fr'
                      ? 'Paiement reçu : Frais scolarité - Octobre (Lot #42)'
                      : 'Payment received: Tuition fees - October (Lot #42)'}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    {language === 'fr' ? 'Il y a 45 min' : '45 min ago'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                  SL
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-950 truncate">
                    {language === 'fr'
                      ? "Sarah L. a publié les notes de l'examen final (Histoire)"
                      : 'Sarah L. published final exam grades (History)'}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    {language === 'fr' ? 'Hier, 16:30' : 'Yesterday, 16:30'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Urgent Alerts */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4">
              <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span>{language === 'fr' ? 'Alertes' : 'Alerts'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6 space-y-4">
              <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">URGENT</span>
                  <span className="text-[9px] font-bold text-neutral-400">Capacité</span>
                </div>
                <p className="text-xs font-semibold text-neutral-800">
                  {language === 'fr' 
                    ? 'La classe 3ème C dépasse la limite de 30 élèves (31 actuels).'
                    : 'Class 3rd C exceeds the limit of 30 students (31 current).'}
                </p>
                <button className="text-[10px] font-bold text-black hover:underline flex items-center gap-0.5">
                  <span>{language === 'fr' ? 'TRAITER' : 'SOLVE'}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">INFO</span>
                  <span className="text-[9px] font-bold text-neutral-400">Serveur</span>
                </div>
                <p className="text-xs font-semibold text-neutral-800">
                  {language === 'fr'
                    ? "Latence élevée détectée sur l'envoi des notifications parents."
                    : 'High latency detected on parent notifications sending.'}
                </p>
                <button className="text-[10px] font-bold text-black hover:underline flex items-center gap-0.5">
                  <span>{language === 'fr' ? 'VOIR DÉTAILS' : 'VIEW DETAILS'}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </CardContent>
          </Card>

          <MiniCalendar />
        </div>
      </div>
    </div>
  )
}
export default AdminDashboard
