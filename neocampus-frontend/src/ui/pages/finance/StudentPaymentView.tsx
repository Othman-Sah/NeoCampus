import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '@/application/useCases/useFinance';
import {
  ArrowLeft,
  DollarSign,
  Percent,
  AlertOctagon,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Tag,
  User,
  X,
  Plus
} from 'lucide-react';

export const StudentPaymentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = parseInt(id || '0');

  const {
    useStudentBalance,
    recordPayment,
    recordingPayment,
    applyRemise,
    applyingRemise,
    applyPenalite,
    applyingPenalite,
    types,
    assignFees
  } = useFinance();

  const { data: balanceData, isLoading, refetch } = useStudentBalance(studentId);

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRemiseModal, setShowRemiseModal] = useState(false);
  const [showPenaliteModal, setShowPenaliteModal] = useState(false);
  const [showCustomFeeModal, setShowCustomFeeModal] = useState(false);

  const [selectedFeeId, setSelectedFeeId] = useState<number | null>(null);

  // Form states
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMode, setPayMode] = useState<'cash' | 'virement' | 'cheque'>('cash');
  const [payReference, setPayReference] = useState('');

  const [remisePercent, setRemisePercent] = useState('');
  const [remiseMotif, setRemiseMotif] = useState('');

  const [penaliteAmount, setPenaliteAmount] = useState('');
  const [penaliteMotif, setPenaliteMotif] = useState('');

  // Custom Fee Form States
  const [customFeeTypeId, setCustomFeeTypeId] = useState('');
  const [customFeeAmount, setCustomFeeAmount] = useState('');
  const [customFeeDueDate, setCustomFeeDueDate] = useState('');
  const [customFeeYear, setCustomFeeYear] = useState('2025-2026');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleFeeTypeChange = (typeId: string) => {
    setCustomFeeTypeId(typeId);
    const selected = types.find(t => t.id.toString() === typeId);
    if (selected) {
      setCustomFeeAmount(selected.montant_par_defaut.toString());
    }
  };

  const handleCustomFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFeeTypeId || !customFeeAmount || !customFeeDueDate) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }

    try {
      // We call assignFees which supports custom amounts in backend
      await assignFees({
        type_frais_ids: [parseInt(customFeeTypeId)],
        eleve_id: studentId,
        classe_id: null,
        date_echeance: customFeeDueDate,
        annee_scolaire: customFeeYear,
        custom_amount: parseFloat(customFeeAmount) // We support overriding the standard fee amount
      });

      showStatus('Fee assigned to student with customized rate.');
      setShowCustomFeeModal(false);
      setCustomFeeTypeId('');
      setCustomFeeAmount('');
      setCustomFeeDueDate('');
      refetch();
    } catch (err: any) {
      showStatus(err.message || 'Error configuring student fee profile.', 'error');
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-neutral-500">Loading student financial ledger...</div>;
  }

  if (!balanceData) {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-500 mb-4">Could not retrieve student financial profile.</p>
        <button onClick={() => navigate('/finance/payments')} className="text-teal-600 font-bold hover:underline">
          Return to student list
        </button>
      </div>
    );
  }

  const { student, fees: studentFees, solde } = balanceData;

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeId || !payAmount) return;

    try {
      await recordPayment({
        frais_id: selectedFeeId,
        montant_paye: parseFloat(payAmount),
        date_paiement: payDate,
        mode: payMode,
        reference: payReference
      });
      showStatus('Payment successfully recorded.');
      setShowPaymentModal(false);
      setPayAmount('');
      setPayReference('');
      refetch();
    } catch (err: any) {
      showStatus(err.message || 'Error saving payment.', 'error');
    }
  };

  const handleApplyRemiseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeId || !remisePercent) return;

    try {
      await applyRemise({
        feeId: selectedFeeId,
        pourcentage: parseFloat(remisePercent),
        motif: remiseMotif
      });
      showStatus('Discount applied successfully.');
      setShowRemiseModal(false);
      setRemisePercent('');
      setRemiseMotif('');
      refetch();
    } catch (err: any) {
      showStatus(err.message || 'Error applying discount.', 'error');
    }
  };

  const handleApplyPenaliteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeId || !penaliteAmount) return;

    try {
      await applyPenalite({
        feeId: selectedFeeId,
        montant: parseFloat(penaliteAmount),
        motif: penaliteMotif
      });
      showStatus('Penalty successfully added.');
      setShowPenaliteModal(false);
      setPenaliteAmount('');
      setPenaliteMotif('');
      refetch();
    } catch (err: any) {
      showStatus(err.message || 'Error applying penalty.', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-gray-800 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate('/finance/payments')}
        className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-800 transition-all font-bold text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Student Registry
      </button>

      {/* Profile & KPI Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex justify-between items-center lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="bg-neutral-50 p-3 rounded-xl text-neutral-900 border border-neutral-100">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Student Profile</div>
              <h2 className="text-xl font-bold text-neutral-900">{student.prenom} {student.nom}</h2>
              <div className="text-xs text-neutral-500 mt-0.5">Matricule: <span className="font-mono">{student.matricule}</span></div>
            </div>
          </div>
          <button
            onClick={() => {
              setCustomFeeTypeId('');
              setCustomFeeAmount('');
              setCustomFeeDueDate('');
              setShowCustomFeeModal(true);
            }}
            className="flex items-center gap-1 bg-black text-white hover:bg-neutral-850 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            title="Configure customized tuition rate"
          >
            <Plus className="w-3.5 h-3.5" />
            Setup Fee
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex justify-between items-center lg:col-span-1">
          <div>
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Tuition Billed</div>
            <div className="text-2xl font-black text-neutral-900 mt-1">{solde.montant_du.toLocaleString()} MAD</div>
          </div>
          <div className="bg-neutral-50 text-neutral-900 p-2.5 rounded-xl border border-neutral-100">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex justify-between items-center lg:col-span-1">
          <div>
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Tuition Balance Due</div>
            <div className={`text-2xl font-black mt-1 ${solde.montant_restant > 0 ? 'text-rose-600' : 'text-teal-605'}`}>
              {solde.montant_restant.toLocaleString()} MAD
            </div>
          </div>
          <div className={`p-2.5 rounded-xl border ${solde.montant_restant > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Messages */}
      {statusMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            statusMsg.type === 'success' ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-teal-600" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-rose-600" />
          )}
          <span className="font-semibold text-sm">{statusMsg.text}</span>
        </div>
      )}

      {/* Fees List */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 bg-neutral-50/40">
          <h3 className="font-bold text-neutral-900">Assigned Fees & Billing Timeline</h3>
          <p className="text-xs text-neutral-500">Record payments, manage discounts, and issue delayed payment penalties.</p>
        </div>

        {studentFees.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">No fees assigned to this student. Click "Setup Fee" above to allocate school charges.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold text-xs uppercase border-b border-neutral-100">
                  <th className="p-4 pl-6">Label</th>
                  <th className="p-4">Base Rate</th>
                  <th className="p-4">Discounts / Penalties</th>
                  <th className="p-4">Net Balance</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {studentFees.map((f: any) => {
                  const remSum = f.remises?.reduce((sum: number, r: any) => sum + (Number(f.montant) * (Number(r.pourcentage) / 100)), 0) || 0;
                  const penSum = f.penalites?.reduce((sum: number, p: any) => sum + Number(p.montant), 0) || 0;
                  const paySum = f.paiements?.reduce((sum: number, p: any) => sum + Number(p.montant_paye), 0) || 0;
                  const remaining = Math.max(0, Number(f.montant) - remSum + penSum - paySum);

                  return (
                    <tr key={f.id} className="hover:bg-neutral-50/50 transition-all">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-neutral-900">{f.type_frais?.libelle || 'Tuition Fee'}</div>
                        <div className="text-xs text-neutral-400 mt-0.5">Year: {f.annee_scolaire}</div>
                      </td>
                      <td className="p-4 font-medium text-neutral-700">{f.montant} MAD</td>
                      <td className="p-4 space-y-1">
                        {f.remises && f.remises.length > 0 && (
                          <div className="text-xs text-teal-600 font-bold flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Discount: -{f.remises[0].pourcentage}%
                          </div>
                        )}
                        {f.penalites && f.penalites.length > 0 && (
                          <div className="text-xs text-rose-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Penalty: +{f.penalites[0].montant} MAD
                          </div>
                        )}
                        {(!f.remises || f.remises.length === 0) && (!f.penalites || f.penalites.length === 0) && (
                          <span className="text-xs text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-teal-650">{remaining} MAD</td>
                      <td className="p-4 text-neutral-500 font-semibold">{f.date_echeance}</td>
                      <td className="p-4">
                        {f.statut === 'paye' || remaining === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            Settled
                          </span>
                        ) : f.statut === 'en_retard' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6 space-x-1">
                        {remaining > 0 ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedFeeId(f.id);
                                setPayAmount(remaining.toString());
                                setShowPaymentModal(true);
                              }}
                              className="text-xs bg-black hover:bg-neutral-850 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                            >
                              Collect
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFeeId(f.id);
                                setShowRemiseModal(true);
                              }}
                              title="Apply Discount"
                              className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-teal-600 rounded-lg transition-all inline-flex"
                            >
                              <Percent className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFeeId(f.id);
                                setShowPenaliteModal(true);
                              }}
                              title="Add Late Penalty"
                              className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-rose-600 rounded-lg transition-all inline-flex"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-teal-600 font-bold">Paid Off</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- SETUP CUSTOM FEE PROFILE MODAL --- */}
      {showCustomFeeModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">Configure Student Fee Profile</h3>
              <button onClick={() => setShowCustomFeeModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCustomFeeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Fee Type *
                </label>
                <select
                  required
                  value={customFeeTypeId}
                  onChange={e => handleFeeTypeChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                >
                  <option value="" disabled>Select fee type</option>
                  {types.map(t => (
                    <option key={t.id} value={t.id}>{t.libelle} (Def: {t.montant_par_defaut} MAD)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Customized Price / Rate (MAD) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 750 or 1000"
                  value={customFeeAmount}
                  onChange={e => setCustomFeeAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-bold text-neutral-900"
                />
                <p className="text-[10px] text-neutral-450 mt-1">Specify custom tuition price (e.g. 750 for junior classes, 1000 for senior classes, or custom discount).</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    required
                    value={customFeeYear}
                    onChange={e => setCustomFeeYear(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={customFeeDueDate}
                    onChange={e => setCustomFeeDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomFeeModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-neutral-850 transition-all shadow-sm"
                >
                  Configure Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PAYMENT MODAL --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">Collect Tuition Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Amount to Pay (MAD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-bold text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Payment Method *
                  </label>
                  <select
                    value={payMode}
                    onChange={e => setPayMode(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="virement">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Reference / Check / Transfer number
                </label>
                <input
                  type="text"
                  placeholder="Ex: Bank Ref #TX-8822"
                  value={payReference}
                  onChange={e => setPayReference(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-neutral-850 transition-all disabled:opacity-50"
                >
                  {recordingPayment ? 'Processing...' : 'Confirm Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REMISE MODAL --- */}
      {showRemiseModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">Apply Fee Discount</h3>
              <button onClick={() => setShowRemiseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleApplyRemiseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Discount Percentage (%) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 10, 25"
                  value={remisePercent}
                  onChange={e => setRemisePercent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Discount Reason / Justification *
                </label>
                <textarea
                  required
                  placeholder="Ex: Sibling discount, Academic scholarship"
                  value={remiseMotif}
                  onChange={e => setRemiseMotif(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRemiseModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyingRemise}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-neutral-850 transition-all disabled:opacity-50"
                >
                  {applyingRemise ? 'Applying...' : 'Apply Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PENALITE MODAL --- */}
      {showPenaliteModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">Apply Late Payment Penalty</h3>
              <button onClick={() => setShowPenaliteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleApplyPenaliteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Penalty Amount (MAD) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 50, 100"
                  value={penaliteAmount}
                  onChange={e => setPenaliteAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Penalty Reason *
                </label>
                <textarea
                  required
                  placeholder="Ex: Tuition payment delay 15 days"
                  value={penaliteMotif}
                  onChange={e => setPenaliteMotif(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPenaliteModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyingPenalite}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-neutral-850 transition-all disabled:opacity-50"
                >
                  {applyingPenalite ? 'Applying...' : 'Apply Penalty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPaymentView;
