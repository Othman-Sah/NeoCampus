import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from '@/application/useCases/useTranslation'
import { useLibraryFines } from '@/application/useCases/library/useLibraryFines'
import { useLibraryAnalytics } from '@/application/useCases/library/useLibraryAnalytics'
import { LibrarySubNav } from './LibrarySubNav'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Coins, 
  Search, 
  Sparkles, 
  X, 
  Ban, 
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export const LibraryFines: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') || ''
  const status = searchParams.get('status') || 'unpaid' // default show unpaid
  const page = parseInt(searchParams.get('page') || '1', 10)
  const per_page = 10

  const { fines, meta, loading, payFine, waiveFine, refetch } = useLibraryFines({ q, status, page, per_page })
  const { analytics, loading: analyticsLoading, refetch: refetchAnalytics } = useLibraryAnalytics()

  // Confirm Actions State
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [actionDialog, setActionDialog] = useState<{ type: 'pay' | 'waive', id: number, memberName: string, amount: number } | null>(null)

  const handleSearchChange = (val: string) => {
    setSearchParams(prev => {
      if (val) prev.set('q', val);
      else prev.delete('q');
      prev.set('page', '1');
      return prev;
    })
  }

  const handleStatusFilter = (newStatus: string) => {
    setSearchParams(prev => {
      prev.set('status', newStatus);
      prev.set('page', '1');
      return prev;
    })
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    })
  }

  const handleActionConfirm = async () => {
    if (!actionDialog) return

    try {
      if (actionDialog.type === 'pay') {
        await payFine(actionDialog.id)
        setToastMsg({ type: 'success', text: `Fine successfully marked as paid for ${actionDialog.memberName}.` })
      } else {
        await waiveFine(actionDialog.id)
        setToastMsg({ type: 'success', text: `Fine successfully waived for ${actionDialog.memberName}.` })
      }
      refetch()
      refetchAnalytics()
    } catch (err) {
      setToastMsg({ type: 'error', text: 'Action failed. Please try again.' })
    } finally {
      setActionDialog(null)
    }
  }

  const kpis = analytics.kpis || { total_collected_fines: 0, total_outstanding_fines: 0 }

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-[100] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border animate-bounce ${
          toastMsg.type === 'success' ? 'bg-black text-white border-neutral-850' : 'bg-red-500 text-white border-red-400'
        }`}>
          <Sparkles className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-tight">{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 hover:opacity-85">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
            <Coins className="h-5 w-5 text-neo-accent" />
            {t('library_fines')}
          </h1>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">
            Collect fine fees or waive penalties for overdue book returns.
          </p>
        </div>
      </div>

      <LibrarySubNav />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6">
          <CardHeader className="p-0 pb-2">
            <CardDescription className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
              Total Fines Collected
            </CardDescription>
            <CardTitle className="text-2xl font-black text-neutral-900 mt-1">
              {analyticsLoading ? <Skeleton className="h-7 w-24" /> : `${Math.abs(kpis.total_collected_fines)} MAD`}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6">
          <CardHeader className="p-0 pb-2">
            <CardDescription className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">
              Total Outstanding Fines
            </CardDescription>
            <CardTitle className="text-2xl font-black text-red-600 mt-1">
              {analyticsLoading ? <Skeleton className="h-7 w-24" /> : `${Math.abs(kpis.total_outstanding_fines)} MAD`}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter and Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-[20px] border border-neutral-100 shadow-sm">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search fines by member name..."
            className="pl-9 rounded-xl border border-neutral-200 text-xs font-semibold h-11 focus:border-black focus:ring-1 focus:ring-black outline-none bg-neutral-50"
            value={q}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div>
          <select
            className="w-full rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold px-4 h-11 focus:outline-none focus:ring-1 focus:ring-black"
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="unpaid">Outstanding Fines</option>
            <option value="paid">Paid Fines</option>
            <option value="waived">Waived Fines</option>
            <option value="all">All Fines</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider">Member</th>
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider">Book Title</th>
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider">Due Date</th>
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider">Return Date</th>
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider text-center">Delay</th>
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider text-center">Fine</th>
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-neutral-50">
                    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-4 w-12 mx-auto" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-4 w-14 mx-auto" /></td>
                    <td className="p-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : fines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs font-bold text-neutral-400 uppercase">
                    No fines registered in this ledger state.
                  </td>
                </tr>
              ) : (
                fines.map((loan: any) => {
                  const calculatedFine = loan.amende || 0
                  
                  // Check status
                  let displayStatus = 'Outstanding'
                  let statusColor = 'bg-red-50 text-red-700 border-red-100'
                  if (loan.amende_payee) {
                    displayStatus = 'Paid'
                    statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  } else if (loan.amende_annulee) {
                    displayStatus = 'Waived'
                    statusColor = 'bg-neutral-100 text-neutral-600 border-neutral-200'
                  }

                  return (
                    <tr key={loan.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                      <td className="p-4 text-xs font-bold text-neutral-900">{loan.adherent.full_name}</td>
                      <td className="p-4 text-xs font-semibold text-neutral-600 truncate max-w-[150px]">{loan.book.titre}</td>
                      <td className="p-4 text-xs font-semibold text-neutral-500">{loan.date_retour_prevue}</td>
                      <td className="p-4 text-xs font-semibold text-neutral-500">{loan.date_retour_effective || 'Not returned'}</td>
                      <td className="p-4 text-xs font-black text-center text-red-500">{loan.jours_retard} days</td>
                      <td className="p-4 text-xs font-black text-center text-neutral-900">{Math.abs(calculatedFine)} MAD</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${statusColor}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {!loan.amende_payee && !loan.amende_annulee && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              onClick={() => setActionDialog({
                                type: 'pay',
                                id: loan.id,
                                memberName: loan.adherent.full_name,
                                amount: Math.abs(calculatedFine)
                              })}
                              className="cursor-pointer bg-black text-white hover:bg-neutral-800 text-[9px] font-bold uppercase rounded-lg h-8 px-2 border-none"
                            >
                              Pay
                            </Button>
                            <Button
                              onClick={() => setActionDialog({
                                type: 'waive',
                                id: loan.id,
                                memberName: loan.adherent.full_name,
                                amount: Math.abs(calculatedFine)
                              })}
                              variant="outline"
                              className="cursor-pointer border border-neutral-200 hover:bg-neutral-50 text-[9px] font-bold uppercase rounded-lg h-8 px-2"
                            >
                              Waive
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">
              Page {meta.current_page} of {meta.last_page} ({meta.total} fines)
            </span>
            <div className="flex items-center gap-1">
              <Button
                disabled={meta.current_page === 1}
                onClick={() => handlePageChange(meta.current_page - 1)}
                variant="outline"
                className="p-2 h-8 w-8 rounded-lg cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                disabled={meta.current_page === meta.last_page}
                onClick={() => handlePageChange(meta.current_page + 1)}
                variant="outline"
                className="p-2 h-8 w-8 rounded-lg cursor-pointer disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={(open) => { if (!open) setActionDialog(null); }}>
        <DialogContent className="bg-white text-neutral-900 border border-neutral-150 rounded-[24px] sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-tight flex items-center gap-1.5">
              {actionDialog?.type === 'pay' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Confirm Fine Payment
                </>
              ) : (
                <>
                  <Ban className="h-5 w-5 text-amber-600" />
                  Waive Fine Penalty
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-450 font-bold uppercase tracking-wide mt-1">
              {actionDialog?.type === 'pay' 
                ? `Confirm receiving fine payment of ${actionDialog.amount} MAD from ${actionDialog.memberName}.`
                : `Are you sure you want to cancel the fine of ${actionDialog?.amount} MAD for ${actionDialog?.memberName}?`
              }
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-row items-center gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer border border-neutral-200 rounded-xl text-xs font-bold uppercase py-5 flex-1 h-11"
              onClick={() => setActionDialog(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleActionConfirm}
              className="cursor-pointer bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold uppercase py-5 flex-1 h-11 border-none"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LibraryFines;
