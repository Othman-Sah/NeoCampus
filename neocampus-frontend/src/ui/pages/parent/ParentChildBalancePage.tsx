import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { useChildBalance, useChildren } from '@/application/useCases/useParentPortal'
import { ArrowLeft, CreditCard, Receipt, Coins } from 'lucide-react'

export const ParentChildBalancePage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>()
  const childIntId = parseInt(childId || '0', 10)

  const { data: children } = useChildren()
  const { data: balance, isLoading } = useChildBalance(childIntId)

  const child = children?.find(c => c.id === childIntId)

  const totalDue = balance?.solde?.montant_du ? parseFloat(balance.solde.montant_du as any) : 0
  const totalPaid = balance?.solde?.montant_paye ? parseFloat(balance.solde.montant_paye as any) : 0
  const remaining = totalDue - totalPaid

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900">
      
      {/* Header & Back Action */}
      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard" 
          className="p-2 bg-white border border-neutral-100 hover:bg-neutral-50 text-neutral-600 rounded-xl transition shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Finance & Payments
          </span>
          <h1 className="text-xl font-extrabold tracking-tight">
            Financial Balance — {child ? `${child.prenom} ${child.nom}` : 'Child'}
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Due</p>
              <h2 className="text-2xl font-extrabold mt-1 text-neutral-800">{totalDue.toLocaleString()} MAD</h2>
            </Card>
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Paid</p>
              <h2 className="text-2xl font-extrabold mt-1 text-teal-650">{totalPaid.toLocaleString()} MAD</h2>
            </Card>
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Remaining Balance</p>
              <h2 className={`text-2xl font-extrabold mt-1 ${remaining > 0 ? 'text-red-500' : 'text-teal-600'}`}>
                {remaining.toLocaleString()} MAD
              </h2>
            </Card>
          </div>

          {/* Progress Bar Card */}
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6">
            <div className="flex justify-between text-xs font-bold mb-3">
              <span>Overall Payment Progress</span>
              <span>{totalDue > 0 ? (totalPaid / totalDue * 100).toFixed(0) : 0}% Completed</span>
            </div>
            <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-teal-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${totalDue > 0 ? (totalPaid / totalDue * 100) : 0}%` }}
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Fee Items List */}
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-50 flex items-center gap-2">
                <Coins className="h-4 w-4 text-neutral-450" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Fee Schedule</h3>
              </div>
              <div className="p-6 divide-y divide-neutral-50">
                {balance?.frais && balance.frais.length > 0 ? (
                  balance.frais.map((f, idx) => {
                    const statusClass = f.statut === 'paye'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : f.statut === 'en_retard'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-yellow-50 text-yellow-750 border-yellow-250'

                    const statusText = f.statut === 'paye'
                      ? 'Paid'
                      : f.statut === 'en_retard'
                        ? 'Overdue'
                        : 'Pending'

                    return (
                      <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                        <div>
                          <p className="text-xs font-bold text-neutral-850">
                            {f.type_frais?.libelle || 'School Fee'}
                          </p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Due Date: {f.date_echeance}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-neutral-800">
                            {parseFloat(f.montant as any).toLocaleString()} MAD
                          </span>
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${statusClass}`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-neutral-450 py-4 text-center">No fees assigned.</p>
                )}
              </div>
            </Card>

            {/* Payment History */}
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-50 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-neutral-450" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Recent Payments</h3>
              </div>
              <div className="p-6 divide-y divide-neutral-50">
                {balance?.recent_payments && balance.recent_payments.length > 0 ? (
                  balance.recent_payments.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                      <div>
                        <p className="text-xs font-bold text-neutral-850">
                          Payment via {p.mode.toUpperCase()}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          Date: {p.date_paiement} {p.reference ? `· Ref: ${p.reference}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-teal-650">
                        +{parseFloat(p.montant_paye as any).toLocaleString()} MAD
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-450 py-4 text-center">No payment history recorded.</p>
                )}
              </div>
            </Card>

          </div>
        </>
      )}

    </div>
  )
}

export default ParentChildBalancePage
