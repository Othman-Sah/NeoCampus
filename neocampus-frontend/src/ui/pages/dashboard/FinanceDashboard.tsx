import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CircleDollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Users 
} from 'lucide-react'

interface FinanceDashboardProps {
  language: 'fr' | 'en';
  MiniCalendar: React.ComponentType;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ language, MiniCalendar }) => {
  return (
    <div className="space-y-8 animate-fade-in text-neutral-900">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Recouvrement Global' : 'Overall Recovery'}
            </span>
            <CircleDollarSign className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">89.5%</h2>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-black h-1.5 rounded-full" style={{ width: '89.5%' }} />
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Encaissements — Juin' : 'Collections — June'}
            </span>
            <TrendingUp className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">148 500 MAD</h2>
          <div className="text-[10px] text-teal-600 font-semibold mt-2">
            {language === 'fr' ? '↗ +4.5% vs mois précédent' : '↗ +4.5% vs last month'}
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Factures Impayées' : 'Unpaid Invoices'}
            </span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-red-600 tracking-tight">12</h2>
          <div className="text-[10px] text-red-500 font-semibold mt-2">
            {language === 'fr' ? 'Relances requises pour 4 parents' : 'Reminders required for 4 parents'}
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {language === 'fr' ? 'Total Échéances' : 'Total Due'}
            </span>
            <Users className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">340 000 MAD</h2>
          <div className="text-[10px] text-neutral-400 font-semibold mt-2">
            {language === 'fr' ? 'Scolarité annuelle' : 'Annual tuition fee'}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Recent Financial Transactions */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-neutral-50 pb-4">
              <CardTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                {language === 'fr' ? 'Transactions Récentes' : 'Recent Transactions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                <div>
                  <p className="text-xs font-bold text-neutral-800">Frais Scolarité - Amine Hariri (3ème B)</p>
                  <p className="text-[10px] text-neutral-400">Virement Bancaire - Il y a 2h</p>
                </div>
                <span className="text-xs font-bold text-teal-600">+3,500 MAD</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                <div>
                  <p className="text-xs font-bold text-neutral-800">Cantine Mensuelle - Sarah Lahlou (CE1)</p>
                  <p className="text-[10px] text-neutral-400">Espèces - Il y a 4h</p>
                </div>
                <span className="text-xs font-bold text-teal-600">+600 MAD</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="text-xs font-bold text-red-600">Retard de paiement - Ali Rami (Terminale A)</p>
                  <p className="text-[10px] text-neutral-400">Dû depuis 15 jours</p>
                </div>
                <span className="text-xs font-bold text-red-600">-3,500 MAD</span>
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
export default FinanceDashboard
