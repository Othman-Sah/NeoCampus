import React, { useState } from 'react';
import { useSalary } from '@/application/useCases/useSalary';
import { useTeacher } from '@/application/useCases/useTeacher';
import { useFinance } from '@/application/useCases/useFinance';
import {
  Plus,
  Trash2,
  Edit2,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  X,
  User,
  Zap
} from 'lucide-react';

export const PayoutsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payroll' | 'expenses'>('payroll');

  // Load backend teacher salaries
  const { salaries, createSalary, updateSalary, deleteSalary, loadingSalaries } = useSalary();
  const { teachers } = useTeacher();

  // Load backend accounting (receipts & expenses)
  const {
    accountingEntries,
    createAccounting,
    updateAccounting,
    deleteAccounting,
    loadingAccounting
  } = useFinance({ type: 'depense' }); // Filter by expenses only

  // Modal / Form States
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [editingPayoutId, setEditingPayoutId] = useState<number | null>(null);
  const [editingSalaryId, setEditingSalaryId] = useState<number | null>(null);

  // Unified Payout Form States (For Utilities & General Expenses)
  const [payoutLibelle, setPayoutLibelle] = useState('');
  const [payoutMontant, setPayoutMontant] = useState('');
  const [payoutCategory, setPayoutCategory] = useState('');
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [payoutJustificatif, setPayoutJustificatif] = useState('');

  // Salary Form States (For Teacher / Staff Payroll)
  const [salaryTeacherId, setSalaryTeacherId] = useState('');
  const [salaryMonth, setSalaryMonth] = useState('2026-06');
  const [salaryBase, setSalaryBase] = useState('');
  const [salaryPrimes, setSalaryPrimes] = useState('0');
  const [salaryRetenues, setSalaryRetenues] = useState('0');
  const [salaryStatus, setSalaryStatus] = useState<'Paid' | 'Draft'>('Paid');
  const [salaryNotes, setSalaryNotes] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Auto-fill teacher base salary when selected
  const handleTeacherChange = (teacherId: string) => {
    setSalaryTeacherId(teacherId);
    const teacher = teachers.find(t => t.id.toString() === teacherId);
    if (teacher && teacher.salaire_de_base !== undefined) {
      setSalaryBase(teacher.salaire_de_base.toString());
    }
  };

  // Salary Form Submit handler
  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryTeacherId || !salaryBase || !salaryMonth) return;

    try {
      const data = {
        enseignant_id: parseInt(salaryTeacherId),
        mois: salaryMonth,
        salaire_de_base: parseFloat(salaryBase),
        primes: parseFloat(salaryPrimes || '0'),
        indemnites: 0,
        retenues: parseFloat(salaryRetenues || '0'),
        statut: salaryStatus,
        notes: salaryNotes
      };

      if (editingSalaryId) {
        await updateSalary({ id: editingSalaryId, data });
        showStatus('Payroll payout updated successfully.');
      } else {
        await createSalary(data);
        showStatus('Payroll payout recorded successfully.');
      }

      setSalaryTeacherId('');
      setSalaryBase('');
      setSalaryPrimes('0');
      setSalaryRetenues('0');
      setSalaryNotes('');
      setEditingSalaryId(null);
      setShowSalaryModal(false);
    } catch (err: any) {
      const errMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || err.message || 'Error occurred during payroll validation.';
      showStatus(errMsg, 'error');
    }
  };

  // Expense Payout Form Submit handler
  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutLibelle || !payoutMontant || !payoutDate) return;

    try {
      const data = {
        libelle: payoutLibelle,
        montant: parseFloat(payoutMontant),
        type: 'depense' as const,
        categorie: payoutCategory || 'Utility',
        date: payoutDate,
        justificatif: payoutJustificatif
      };

      if (editingPayoutId) {
        await updateAccounting({ id: editingPayoutId, data });
        showStatus('Expense payout updated successfully.');
      } else {
        await createAccounting(data);
        showStatus('Expense payout recorded successfully.');
      }

      setPayoutLibelle('');
      setPayoutMontant('');
      setPayoutCategory('');
      setPayoutJustificatif('');
      setEditingPayoutId(null);
      setShowPayoutModal(false);
    } catch (err: any) {
      const errMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || err.message || 'Error recording expense payout.';
      showStatus(errMsg, 'error');
    }
  };

  const handleEditSalary = (s: any) => {
    setEditingSalaryId(s.id);
    setSalaryTeacherId(s.enseignant_id.toString());
    setSalaryMonth(s.mois);
    setSalaryBase(s.salaire_de_base.toString());
    setSalaryPrimes(s.primes.toString());
    setSalaryRetenues(s.retenues.toString());
    setSalaryStatus(s.statut);
    setSalaryNotes(s.notes || '');
    setShowSalaryModal(true);
  };

  const handleDeleteSalary = async (id: number) => {
    if (confirm('Delete this payroll payout record?')) {
      try {
        await deleteSalary(id);
        showStatus('Payroll payout record deleted.');
      } catch (err: any) {
        showStatus(err.message || 'Error deleting payroll record.', 'error');
      }
    }
  };

  const handleEditPayout = (p: any) => {
    setEditingPayoutId(p.id);
    setPayoutLibelle(p.libelle);
    setPayoutMontant(p.montant.toString());
    setPayoutCategory(p.categorie || '');
    setPayoutDate(p.date);
    setPayoutJustificatif(p.justificatif || '');
    setShowPayoutModal(true);
  };

  const handleDeletePayout = async (id: number) => {
    if (confirm('Remove this expense payout record?')) {
      try {
        await deleteAccounting(id);
        showStatus('Expense payout record removed.');
      } catch (err: any) {
        showStatus(err.message || 'Error removing expense record.', 'error');
      }
    }
  };

  // Calculate totals
  const totalPayroll = salaries.reduce((sum, s) => sum + s.salaire_net, 0);
  const totalExpenses = accountingEntries.reduce((sum, e) => sum + e.montant, 0);
  const combinedPayouts = totalPayroll + totalExpenses;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-gray-800 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Payouts & Expenses</h1>
          <p className="text-neutral-500 text-sm">Issue teacher payrolls, track administrative staff payments, and pay utility bills in a single view.</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'payroll' ? (
            <button
              onClick={() => {
                setEditingSalaryId(null);
                setSalaryTeacherId(teachers[0]?.id?.toString() || '');
                setSalaryBase(teachers[0]?.salaire_de_base?.toString() || '');
                setSalaryPrimes('0');
                setSalaryRetenues('0');
                setSalaryNotes('');
                setShowSalaryModal(true);
              }}
              className="flex items-center gap-2 bg-black text-white hover:bg-neutral-850 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Issue Payroll
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingPayoutId(null);
                setPayoutLibelle('');
                setPayoutMontant('');
                setPayoutCategory('');
                setPayoutJustificatif('');
                setShowPayoutModal(true);
              }}
              className="flex items-center gap-2 bg-black text-white hover:bg-neutral-850 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Record Expense
            </button>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Payroll Outflow</div>
            <div className="text-2xl font-black text-neutral-900 mt-1">{totalPayroll.toLocaleString()} MAD</div>
          </div>
          <div className="bg-teal-50 text-teal-600 p-2.5 rounded-xl">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Utilities & Expenses</div>
            <div className="text-2xl font-black text-neutral-900 mt-1">{totalExpenses.toLocaleString()} MAD</div>
          </div>
          <div className="bg-teal-50 text-teal-600 p-2.5 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Combined Payouts</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{combinedPayouts.toLocaleString()} MAD</div>
          </div>
          <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            statusMsg.type === 'success' ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-teal-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span className="font-medium text-sm">{statusMsg.text}</span>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex border-b border-neutral-200 bg-neutral-50/50 p-1.5 rounded-xl gap-2 max-w-md">
        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'payroll'
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50'
          }`}
        >
          <User className="w-4 h-4" />
          Payroll (Teachers & Staff)
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'expenses'
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50'
          }`}
        >
          <Zap className="w-4 h-4" />
          Utilities & Operations
        </button>
      </div>

      {/* Table Data */}
      {activeTab === 'payroll' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/40">
            <h3 className="font-bold text-neutral-900">Salaries & Payroll List</h3>
            <p className="text-xs text-neutral-500">Overview of academic salaries and payout transactions.</p>
          </div>

          {loadingSalaries ? (
            <div className="p-12 text-center text-neutral-500">Loading payroll history...</div>
          ) : salaries.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">No salaries payouts recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 font-bold text-xs uppercase border-b border-neutral-100">
                    <th className="p-4 pl-6">Beneficiary</th>
                    <th className="p-4">Month</th>
                    <th className="p-4">Base Salary</th>
                    <th className="p-4">Bonuses / Retenues</th>
                    <th className="p-4">Net Salary</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {salaries.map((s: any) => {
                    const teacher = teachers.find(t => t.id === s.enseignant_id);
                    const name = teacher ? `${teacher.user?.prenom} ${teacher.user?.nom}` : 'Staff Member';
                    return (
                      <tr key={s.id} className="hover:bg-neutral-50/50 transition-all">
                        <td className="p-4 pl-6 font-bold text-neutral-900">{name}</td>
                        <td className="p-4 text-neutral-500">{s.mois}</td>
                        <td className="p-4 text-neutral-600">{s.salaire_de_base.toLocaleString()} MAD</td>
                        <td className="p-4 space-y-1">
                          {s.primes > 0 && <div className="text-xs text-teal-600">+{s.primes} MAD (Bonus)</div>}
                          {s.retenues > 0 && <div className="text-xs text-rose-600">-{s.retenues} MAD (Tax)</div>}
                          {s.primes === 0 && s.retenues === 0 && <span className="text-neutral-400">-</span>}
                        </td>
                        <td className="p-4 font-bold text-teal-600">{s.salaire_net.toLocaleString()} MAD</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            s.statut === 'Paid' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {s.statut}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6 space-x-2">
                          <button
                            onClick={() => handleEditSalary(s)}
                            className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-teal-600 rounded-md transition-all inline-flex"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSalary(s.id)}
                            className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-rose-600 rounded-md transition-all inline-flex"
                          >
                            <Trash2 className="w-4 h-4" />
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
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/40">
            <h3 className="font-bold text-neutral-900">Utilities, Rent & Administrative Bills</h3>
            <p className="text-xs text-neutral-500">Record cash outflows for internet, power, supplies, etc.</p>
          </div>

          {loadingAccounting ? (
            <div className="p-12 text-center text-neutral-500">Loading operational expenses...</div>
          ) : accountingEntries.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">No operational expenses registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 font-bold text-xs uppercase border-b border-neutral-100">
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Label</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Amount Paid</th>
                    <th className="p-4">Invoice / Receipt</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {accountingEntries.map((e: any) => (
                    <tr key={e.id} className="hover:bg-neutral-50/50 transition-all">
                      <td className="p-4 pl-6 text-neutral-500">{e.date}</td>
                      <td className="p-4 font-bold text-neutral-900">{e.libelle}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                          {e.categorie || 'General'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-rose-600">-{e.montant.toLocaleString()} MAD</td>
                      <td className="p-4 text-neutral-500 italic truncate max-w-xs">{e.justificatif || '-'}</td>
                      <td className="p-4 text-right pr-6 space-x-2">
                        <button
                          onClick={() => handleEditPayout(e)}
                          className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-teal-600 rounded-md transition-all inline-flex"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePayout(e.id)}
                          className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-rose-600 rounded-md transition-all inline-flex"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- SALARY MODAL --- */}
      {showSalaryModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">
                {editingSalaryId ? 'Edit Payroll Payout' : 'Issue Payroll Payout'}
              </h3>
              <button onClick={() => setShowSalaryModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSalarySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Teacher / Beneficiary *
                </label>
                <select
                  required
                  value={salaryTeacherId}
                  onChange={e => handleTeacherChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                >
                  <option value="" disabled>Select teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.user?.prenom} {t.user?.nom}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Payroll Month *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="YYYY-MM"
                    value={salaryMonth}
                    onChange={e => setSalaryMonth(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Base Salary *
                  </label>
                  <input
                    type="number"
                    required
                    value={salaryBase}
                    onChange={e => setSalaryBase(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Bonuses / Primes
                  </label>
                  <input
                    type="number"
                    value={salaryPrimes}
                    onChange={e => setSalaryPrimes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Tax / Retenues
                  </label>
                  <input
                    type="number"
                    value={salaryRetenues}
                    onChange={e => setSalaryRetenues(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Payout Status *
                </label>
                <select
                  value={salaryStatus}
                  onChange={e => setSalaryStatus(e.target.value as 'Paid' | 'Draft')}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm"
                >
                  <option value="Paid">Paid</option>
                  <option value="Draft">Draft (Pending)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Internal Notes
                </label>
                <textarea
                  value={salaryNotes}
                  onChange={e => setSalaryNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSalaryModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-neutral-850 transition-all shadow-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EXPENSE MODAL --- */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">
                {editingPayoutId ? 'Edit Operational Expense' : 'Record Operational Expense'}
              </h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePayoutSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Internet bill June, Library computer maintenance"
                  value={payoutLibelle}
                  onChange={e => setPayoutLibelle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Amount Paid (MAD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={payoutMontant}
                    onChange={e => setPayoutMontant(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={payoutDate}
                    onChange={e => setPayoutDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Expense Category
                </label>
                <input
                  type="text"
                  placeholder="Ex: Power, Supplies, Rent, IT"
                  value={payoutCategory}
                  onChange={e => setPayoutCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Receipt / Invoice Reference
                </label>
                <input
                  type="text"
                  placeholder="Ex: Invoice #VT-192"
                  value={payoutJustificatif}
                  onChange={e => setPayoutJustificatif(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-neutral-850 transition-all shadow-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutsPage;
