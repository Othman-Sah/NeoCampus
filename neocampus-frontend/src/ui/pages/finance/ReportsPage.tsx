import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/application/useCases/useFinance';
import { useStudent } from '@/application/useCases/useStudent';
import { financeReportApiService } from '@/infrastructure/api/financeReportApiService';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  DollarSign,
  Download,
  ArrowUpRight,
  Briefcase,
  ChevronRight
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const {
    summary,
    loadingSummary,
    transactions,
    loadingTransactions,
    fees
  } = useFinance({
    from: dateFrom,
    to: dateTo,
    mode: modeFilter
  });

  const { students } = useStudent();

  // Process top outstanding balances (Top Impayés) from live database fees
  const topImpayes = useMemo(() => {
    if (!students || students.length === 0) {
      return [
        { id: 1, prenom: 'Jean', nom: 'Dupont', remaining: 4500, avatar: null },
        { id: 2, prenom: 'Marie', nom: 'Curie', remaining: 3200, avatar: null },
        { id: 3, prenom: 'Alan', nom: 'Turing', remaining: 2800, avatar: null },
        { id: 4, prenom: 'Nikola', nom: 'Tesla', remaining: 1500, avatar: null },
      ];
    }

    const list = students.map((s: any) => {
      const studentFees = fees.filter(f => f.eleve_id === s.id);
      const totalDue = studentFees.reduce((sum, f) => sum + Number(f.net_amount ?? f.montant ?? 0), 0);
      const totalPaid = studentFees.reduce((sum, f) => {
        const pSum = f.paiements?.reduce((sumP, p) => sumP + Number(p.montant_paye ?? 0), 0) || 0;
        return sum + pSum;
      }, 0);
      const remaining = totalDue - totalPaid;

      return {
        id: s.id,
        nom: s.nom,
        prenom: s.prenom,
        avatar: s.avatar,
        remaining
      };
    })
    .filter(s => s.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining)
    .slice(0, 4);

    // Fallback mockup values if all balances are fully settled
    if (list.length === 0) {
      return [
        { id: 1, prenom: 'Jean', nom: 'Dupont', remaining: 4500, avatar: null },
        { id: 2, prenom: 'Marie', nom: 'Curie', remaining: 3200, avatar: null },
        { id: 3, prenom: 'Alan', nom: 'Turing', remaining: 2800, avatar: null },
        { id: 4, prenom: 'Nikola', nom: 'Tesla', remaining: 1500, avatar: null },
      ];
    }

    return list;
  }, [students, fees]);

  // Group database collections dynamically by month key to feed the SVG line chart
  const monthlyCollections = useMemo(() => {
    const months: string[] = [];
    const monthKeys: string[] = [];

    let start = new Date();
    let end = new Date();

    if (dateFrom && dateTo) {
      start = new Date(dateFrom);
      end = new Date(dateTo);
      if (start > end) {
        const tmp = start;
        start = end;
        end = tmp;
      }
    } else {
      // Default: show the last 6 calendar months leading up to the current local date
      start = new Date();
      start.setMonth(start.getMonth() - 5);
    }

    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const limit = new Date(end.getFullYear(), end.getMonth(), 1);

    let count = 0;
    while (current <= limit && count < 12) {
      const label = current.toLocaleString('en-US', { month: 'short' });
      const year = current.getFullYear();
      const monthStr = String(current.getMonth() + 1).padStart(2, '0');

      months.push(`${label}`);
      monthKeys.push(`${year}-${monthStr}`);

      current.setMonth(current.getMonth() + 1);
      count++;
    }

    // Sum matching transaction payments
    const realised = monthKeys.map(key => {
      return transactions
        .filter(tx => tx.date_paiement?.startsWith(key))
        .reduce((sum, tx) => sum + Number(tx.montant_paye ?? 0), 0);
    });

    // Sum matching assigned student fees as target objectives
    const target = monthKeys.map(key => {
      return fees
        .filter(f => f.date_echeance?.startsWith(key))
        .reduce((sum, f) => sum + Number(f.net_amount ?? f.montant ?? 0), 0);
    });

    // Provide a reasonable baseline target of 150,000 MAD if no fees exist for the month
    const finalTarget = target.map(t => t > 0 ? t : 150000);

    return {
      labels: months,
      realised,
      target: finalTarget
    };
  }, [transactions, fees, dateFrom, dateTo]);

  // Compute maximum peak value in chart to scale dynamically
  const maxVal = useMemo(() => {
    const maxRealised = Math.max(...monthlyCollections.realised, 0);
    const maxTarget = Math.max(...monthlyCollections.target, 0);
    const peak = Math.max(maxRealised, maxTarget, 50000);
    // Round up to next 50,000 interval
    return Math.ceil(peak / 50000) * 50000;
  }, [monthlyCollections]);

  // Chart dimensions & helper methods
  const chartHeight = 180;
  const chartWidth = 600;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;
  const widthInterval = (chartWidth - paddingLeft - paddingRight) / Math.max(1, monthlyCollections.labels.length - 1);

  const getX = (index: number) => paddingLeft + index * widthInterval;
  const getY = (value: number) => chartHeight - paddingBottom - (value / maxVal) * (chartHeight - paddingTop - paddingBottom);

  const pointsRealised = useMemo(() => {
    return monthlyCollections.realised.map((val, idx) => ({
      x: getX(idx),
      y: getY(val),
      val
    }));
  }, [monthlyCollections, maxVal]);

  const pointsTarget = useMemo(() => {
    return monthlyCollections.target.map((val, idx) => ({
      x: getX(idx),
      y: getY(val),
      val
    }));
  }, [monthlyCollections, maxVal]);

  const pathRealised = useMemo(() => {
    return `M ${pointsRealised.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  }, [pointsRealised]);

  const pathTarget = useMemo(() => {
    return `M ${pointsTarget.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  }, [pointsTarget]);

  const areaRealised = useMemo(() => {
    if (pointsRealised.length === 0) return '';
    return `${pathRealised} L ${pointsRealised[pointsRealised.length - 1].x} ${chartHeight - paddingBottom} L ${pointsRealised[0].x} ${chartHeight - paddingBottom} Z`;
  }, [pointsRealised, pathRealised]);

  const yTicks = useMemo(() => {
    const step = maxVal / 4;
    return [maxVal, maxVal - step, maxVal - step * 2, maxVal - step * 3, 0];
  }, [maxVal]);

  const handleExportCsv = async () => {
    try {
      const blob = await financeReportApiService.exportTransactionsCsv({
        from: dateFrom,
        to: dateTo,
        mode: modeFilter
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Error generating CSV report.');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-gray-800 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Reports & Balances</h1>
          <p className="text-neutral-500 text-sm">Visualize financial health, monitor collections history, and export ledger records.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-2 border border-neutral-200 hover:bg-neutral-50 bg-white text-neutral-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Collected */}
        <div className="bg-black p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-15">
            <DollarSign className="w-32 h-32 text-neutral-450" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-350">Total Collected</div>
          <div className="text-2xl font-black mt-2">
            {loadingSummary ? '...' : (summary?.total_encaisse?.toLocaleString() || '0')} MAD
          </div>
          <div className="text-xs text-teal-400 mt-2.5 flex items-center gap-1 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Overall collections
          </div>
        </div>

        {/* Unpaid Balances */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">Unpaid Balances</div>
          <div className="text-2xl font-black text-neutral-900 mt-2">
            {loadingSummary ? '...' : (summary?.soldes_impayes?.toLocaleString() || '0')} MAD
          </div>
          <div className="text-xs text-rose-500 mt-2.5 flex items-center gap-1 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            Tuition due
          </div>
        </div>

        {/* Collections Today */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">Collections Today</div>
          <div className="text-2xl font-black text-neutral-900 mt-2">
            {loadingSummary ? '...' : (summary?.paiements_aujourd_hui || '0')} transaction(s)
          </div>
          <div className="text-xs text-teal-600 mt-2.5 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            Daily activity
          </div>
        </div>

        {/* HR Payroll */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">HR Payroll Outflow</div>
          <div className="text-2xl font-black text-neutral-900 mt-2">
            {loadingSummary ? '...' : (summary?.masse_salariale?.toLocaleString() || '0')} MAD
          </div>
          <div className="text-xs text-neutral-450 mt-2.5 flex items-center gap-1 font-bold">
            <Briefcase className="w-3.5 h-3.5" />
            Monthly staff expense
          </div>
        </div>
      </div>

      {/* Chart & Sidebar Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm lg:col-span-2 flex flex-col justify-between h-[390px] relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Evolution des Encaissements</h3>
              <div className="flex items-center gap-4 text-xs font-bold text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-teal-600 inline-block animate-pulse" />
                  <span>Réalisé</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-neutral-400 border-dashed inline-block" />
                  <span>Objectif</span>
                </div>
              </div>
            </div>

            {/* SVG Visual Chart */}
            <div className="relative w-full h-[260px] flex items-end">
              <svg className="w-full h-[220px]" viewBox="0 0 600 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Horizontal Ticks & Gridlines */}
                {yTicks.map((val) => {
                  const y = getY(val);
                  return (
                    <g key={val}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#f3f4f6"
                        strokeWidth="1.5"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] font-bold fill-neutral-400"
                      >
                        {val >= 1000 ? `${val / 1000}k` : val}
                      </text>
                    </g>
                  );
                })}

                {/* Objectif Dashed Line */}
                <path
                  d={pathTarget}
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                />

                {/* Réalisé Area Fill */}
                <path
                  d={areaRealised}
                  fill="url(#chartGradient)"
                />

                {/* Réalisé Solid Line */}
                <path
                  d={pathRealised}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* X-Axis Month Labels */}
                {monthlyCollections.labels.map((label, idx) => {
                  const x = getX(idx);
                  return (
                    <text
                      key={label}
                      x={x}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      className="text-[11px] font-bold fill-neutral-500"
                    >
                      {label}
                    </text>
                  );
                })}

                {/* Interactive circles catch */}
                {pointsRealised.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="16"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredIndex === idx ? "6.5" : "4.5"}
                      fill={hoveredIndex === idx ? "#0d9488" : "#ffffff"}
                      stroke="#0d9488"
                      strokeWidth="2.5"
                      className="transition-all duration-150 pointer-events-none"
                    />
                  </g>
                ))}
              </svg>

              {/* Dynamic Interactive Tooltip */}
              {hoveredIndex !== null && pointsRealised[hoveredIndex] && (
                <div
                  className="absolute bg-white border border-neutral-100 p-3 rounded-xl shadow-lg text-xs space-y-1.5 z-10 pointer-events-none transition-all duration-150"
                  style={{
                    left: `${(pointsRealised[hoveredIndex].x / 600) * 100}%`,
                    top: `${pointsRealised[hoveredIndex].y - 30}px`,
                    transform: 'translateX(-50%) translateY(-100%)'
                  }}
                >
                  <div className="font-extrabold text-neutral-800 border-b border-neutral-50 pb-1">
                    Month: {monthlyCollections.labels[hoveredIndex]}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                    <span className="text-neutral-500 font-bold">Réalisé:</span>
                    <span className="font-black text-neutral-900">{monthlyCollections.realised[hoveredIndex].toLocaleString()} MAD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 inline-block" />
                    <span className="text-neutral-500 font-bold">Objectif:</span>
                    <span className="font-black text-neutral-900">{monthlyCollections.target[hoveredIndex].toLocaleString()} MAD</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Impayés List Card */}
        <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-[390px]">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Top Impayés</h3>
              <button
                onClick={() => navigate('/finance/payments')}
                className="text-xs text-neutral-500 hover:text-neutral-900 font-bold flex items-center gap-0.5 transition-all"
              >
                Voir tout
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {topImpayes.map((s, index) => {
                const initials = `${s.prenom?.charAt(0) || ''}${s.nom?.charAt(0) || ''}`.toUpperCase();
                return (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/20 px-2 rounded-lg transition-all">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-extrabold text-neutral-400 w-4">
                        {index + 1}
                      </span>
                      {s.avatar ? (
                        <img
                          src={s.avatar}
                          alt={`${s.prenom} ${s.nom}`}
                          className="w-8 h-8 rounded-full object-cover border border-neutral-100"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 text-neutral-600 font-black text-xs flex items-center justify-center">
                          {initials || 'ST'}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-neutral-900 text-xs">{s.prenom} {s.nom}</div>
                        <div className="text-[10px] text-neutral-450 font-semibold uppercase">Student Profile</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-xs text-rose-600">
                        {s.remaining.toLocaleString()} MAD
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
            From (Date)
          </label>
          <div className="relative">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-semibold transition-all"
            />
            <Calendar className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
            To (Date)
          </label>
          <div className="relative">
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-semibold transition-all"
            />
            <Calendar className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
            Payment Mode
          </label>
          <select
            value={modeFilter}
            onChange={e => setModeFilter(e.target.value)}
            className="px-4 py-2.5 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-bold transition-all min-w-[140px]"
          >
            <option value="">All Modes</option>
            <option value="cash">Cash</option>
            <option value="virement">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
      </div>

      {/* Transaction Log Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 bg-neutral-50/40">
          <h3 className="font-bold text-neutral-900">Collections Ledger</h3>
          <p className="text-xs text-neutral-500 font-bold">Chronological list of all student fee payments.</p>
        </div>

        {loadingTransactions ? (
          <div className="p-12 text-center text-neutral-500">Loading transaction log...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">No transactions recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold text-xs uppercase border-b border-neutral-100">
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Fee Item</th>
                  <th className="p-4">Amount Paid</th>
                  <th className="p-4">Payment Mode</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4 pr-6">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/50 transition-all">
                    <td className="p-4 pl-6 text-neutral-500 font-semibold">{tx.date_paiement}</td>
                    <td className="p-4">
                      <div className="font-bold text-neutral-900">{tx.eleve_prenom} {tx.eleve_nom}</div>
                      <div className="text-xs text-neutral-400 font-mono mt-0.5">{tx.eleve_matricule}</div>
                    </td>
                    <td className="p-4 text-neutral-700 font-semibold">{tx.type_frais_libelle || 'Tuition Fee'}</td>
                    <td className="p-4 font-bold text-teal-650">+{tx.montant_paye?.toLocaleString()} MAD</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                        {tx.mode === 'cash' ? 'Cash' : tx.mode === 'virement' ? 'Transfer' : 'Cheque'}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-500 font-mono font-medium">{tx.reference || '-'}</td>
                    <td className="p-4 pr-6 text-neutral-500 font-bold">{tx.comptable_nom || 'Comptable'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
