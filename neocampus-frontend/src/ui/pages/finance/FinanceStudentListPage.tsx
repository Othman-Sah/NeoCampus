import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '@/application/useCases/useStudent';
import { useFinance } from '@/application/useCases/useFinance';
import { useClass } from '@/application/useCases/useClass';
import { Search, ChevronRight, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/ui/components/EmptyState';

export const FinanceStudentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { students, loading: loadingStudents } = useStudent();
  const { fees } = useFinance();
  const { classes } = useClass();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>(''); // '', 'paid', 'unpaid', 'late'

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

  const getStudentMetrics = (studentId: number) => {
    const studentFees = fees.filter(f => f.eleve_id === studentId);
    const totalDue = studentFees.reduce((sum, f) => sum + Number(f.net_amount ?? f.montant ?? 0), 0);
    const totalPaid = studentFees.reduce((sum, f) => {
      const pSum = f.paiements?.reduce((s, p) => s + Number(p.montant_paye ?? 0), 0) || 0;
      return sum + pSum;
    }, 0);
    const remaining = totalDue - totalPaid;
    const hasLate = studentFees.some(f => f.statut === 'en_retard');

    return {
      totalDue,
      totalPaid,
      remaining,
      hasLate
    };
  };

  // Filter students
  const filteredStudents = students.filter((s: any) => {
    // 1. Search term
    const searchString = `${s.prenom} ${s.nom} ${s.matricule}`.toLowerCase();
    if (searchTerm && !searchString.includes(searchTerm.toLowerCase())) {
      return false;
    }

    // 2. Class filter
    if (selectedClassId && s.classe_id !== parseInt(selectedClassId)) {
      return false;
    }

    // 3. Payment status filter
    const { totalDue, remaining, hasLate } = getStudentMetrics(s.id);
    if (paymentStatusFilter === 'paid') {
      return totalDue > 0 && remaining === 0;
    }
    if (paymentStatusFilter === 'unpaid') {
      return remaining > 0;
    }
    if (paymentStatusFilter === 'late') {
      return hasLate;
    }

    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-gray-800 animate-fade-in">
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

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Student Tuition & Accounts</h1>
          <p className="text-neutral-500 text-sm">Manage invoices, record payments, and track individual school balances.</p>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search student by name or matricule..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
          />
          <Search className="absolute left-3.5 top-3.5 text-neutral-400 w-4 h-4" />
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
            Filter by Class
          </label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:outline-none text-sm"
          >
            <option value="">All Classes</option>
            {classes?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
            Payment Status
          </label>
          <select
            value={paymentStatusFilter}
            onChange={e => setPaymentStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:outline-none text-sm"
          >
            <option value="">All Balances</option>
            <option value="paid">Fully Settled</option>
            <option value="unpaid">Outstanding Balance</option>
            <option value="late">Overdue Payments</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        {loadingStudents ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold text-xs uppercase border-b border-neutral-100">
                  <th className="p-4 pl-6">Student</th>
                  <th className="p-4">Matricule</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Total Fee</th>
                  <th className="p-4">Total Paid</th>
                  <th className="p-4">Balance Due</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="p-4 pl-6"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="p-4 pr-6 text-center"><Skeleton className="h-8 w-24 rounded-lg mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            title="No Students Found"
            description="No directory profiles match the keywords or filters you set."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold text-xs uppercase border-b border-neutral-100">
                  <th className="p-4 pl-6">Student</th>
                  <th className="p-4">Matricule</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Total Fee</th>
                  <th className="p-4">Total Paid</th>
                  <th className="p-4">Balance Due</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {filteredStudents.map((s: any) => {
                  const { totalDue, totalPaid, remaining, hasLate } = getStudentMetrics(s.id);
                  return (
                    <tr key={s.id} className="hover:bg-neutral-50/50 transition-all">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-neutral-900">{s.prenom} {s.nom}</div>
                      </td>
                      <td className="p-4 font-mono font-medium text-neutral-500">{s.matricule}</td>
                      <td className="p-4 text-neutral-700">{s.classe_nom || 'No Class'}</td>
                      <td className="p-4 font-medium text-neutral-900">{totalDue.toLocaleString()} MAD</td>
                      <td className="p-4 text-teal-650 font-semibold">{totalPaid.toLocaleString()} MAD</td>
                      <td className={`p-4 font-bold ${remaining > 0 ? 'text-rose-600' : 'text-teal-600'}`}>
                        {remaining.toLocaleString()} MAD
                      </td>
                      <td className="p-4">
                        {hasLate ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Overdue
                          </span>
                        ) : remaining === 0 && totalDue > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Settled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            <CreditCard className="w-3.5 h-3.5" />
                            Up to date
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center pr-6">
                        <button
                          onClick={() => navigate(`/finance/students/${s.id}/balance`)}
                          className="inline-flex items-center gap-1 bg-black text-white hover:bg-neutral-850 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Manage
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceStudentListPage;
