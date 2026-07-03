import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/application/useCases/useFinance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CircleDollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Settings,
  CreditCard,
  ChevronRight
} from 'lucide-react';

interface FinanceDashboardProps {
  language: 'fr' | 'en';
  MiniCalendar: React.ComponentType;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ MiniCalendar }) => {
  const navigate = useNavigate();
  const { summary, loadingSummary, transactions, loadingTransactions } = useFinance();

  // Pick the top 5 recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // Load unread student alerts
  const [alerts, setAlerts] = useState<any[]>(() => {
    const data = localStorage.getItem('neocampus_finance_alerts');
    return data ? JSON.parse(data).filter((a: any) => !a.read) : [];
  });

  const markAlertAsRead = (alertId: number) => {
    const data = localStorage.getItem('neocampus_finance_alerts');
    if (data) {
      const allAlerts = JSON.parse(data).map((a: any) => {
        if (a.id === alertId) return { ...a, read: true };
        return a;
      });
      localStorage.setItem('neocampus_finance_alerts', JSON.stringify(allAlerts));
      setAlerts(allAlerts.filter((a: any) => !a.read));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-neutral-900">
      {/* Alerts notification bar */}
      {alerts.map((a: any) => (
        <div
          key={a.id}
          className="bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-semibold shadow-sm"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-teal-600 animate-bounce" />
            <span>{a.message}</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                markAlertAsRead(a.id);
                navigate(`/finance/students/${a.studentId}/balance`);
              }}
              className="bg-black text-white px-3.5 py-1.5 rounded-lg hover:bg-neutral-850 transition-all font-bold"
            >
              Configure profile
            </button>
            <button
              onClick={() => markAlertAsRead(a.id)}
              className="text-neutral-500 hover:text-neutral-700 px-2 py-1.5 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}

      {/* Welcome Banner */}
      <div className="bg-black text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Finance Management Space</h1>
          <p className="text-neutral-400 text-xs mt-1">Configure student invoices, record payouts, and track internal cashflows.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('/finance/fees')}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            Rates Config
          </button>
          <button
            onClick={() => navigate('/finance/payments')}
            className="flex items-center gap-1.5 bg-white text-black hover:bg-neutral-100 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Record Payment
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              Total Collections
            </span>
            <CircleDollarSign className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            {loadingSummary ? '...' : (summary?.total_encaisse?.toLocaleString() || '0')} MAD
          </h2>
          <div className="text-[10px] text-teal-650 font-bold mt-2 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3 text-teal-600" />
            ↗ +4.5% vs last month
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              Tuition Outstanding
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-rose-600 tracking-tight">
            {loadingSummary ? '...' : (summary?.soldes_impayes?.toLocaleString() || '0')} MAD
          </h2>
          <div className="text-[10px] text-rose-500 font-bold mt-2">
            Requires active collection
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              Today's Collections
            </span>
            <TrendingUp className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            {loadingSummary ? '...' : (summary?.paiements_aujourd_hui || '0')} transaction(s)
          </h2>
          <div className="text-[10px] text-teal-650 font-bold mt-2">
            Active cash register operations
          </div>
        </Card>

        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              Masse Salariale / Payroll
            </span>
            <Users className="h-4 w-4 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            {loadingSummary ? '...' : (summary?.masse_salariale?.toLocaleString() || '0')} MAD
          </h2>
          <div className="text-[10px] text-neutral-450 font-bold mt-2">
            Synchronized with staff module
          </div>
        </Card>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2">
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl h-full flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-neutral-50 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Recent Collections Log
                </CardTitle>
                <button
                  onClick={() => navigate('/finance/reports')}
                  className="text-xs text-neutral-900 hover:text-black font-bold flex items-center gap-0.5"
                >
                  View full log
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </CardHeader>
              <CardContent className="py-4 space-y-4">
                {loadingTransactions ? (
                  <div className="text-center text-neutral-500 py-6">Loading transaction records...</div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-center text-neutral-400 py-6">No recent transactions recorded.</div>
                ) : (
                  recentTransactions.map((tx: any) => (
                    <div key={tx.id} className="flex justify-between items-center py-2.5 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/30 px-2 rounded-lg transition-all">
                      <div>
                        <p className="text-xs font-bold text-neutral-800">
                          {tx.type_frais_libelle || 'Tuition'} — {tx.eleve_prenom} {tx.eleve_nom}
                        </p>
                        <p className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                          <span>{tx.date_paiement}</span>
                          <span>•</span>
                          <span className="uppercase font-semibold text-neutral-500">{tx.mode}</span>
                          {tx.reference && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-neutral-400">{tx.reference}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-teal-650">+{tx.montant_paye?.toLocaleString()} MAD</span>
                    </div>
                  ))
                )}
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Calendar Column */}
        <div className="space-y-6">
          <MiniCalendar />
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
