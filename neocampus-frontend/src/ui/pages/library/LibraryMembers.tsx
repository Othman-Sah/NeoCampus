import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from '@/application/useCases/useTranslation'
import { useLibraryMembers, useMemberHistory } from '@/application/useCases/library/useLibraryMembers'
import { LibrarySubNav } from './LibrarySubNav'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet'
import { 
  Search, 
  Users, 
  History, 
  BookMarked,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export const LibraryMembers: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const per_page = 10

  const { members, meta, loading } = useLibraryMembers({ q, page, per_page })

  // Drawer state for history
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [selectedMemberName, setSelectedMemberName] = useState<string>('')
  const { history, loading: historyLoading } = useMemberHistory(selectedMemberId ?? undefined)

  const handleSearchChange = (val: string) => {
    setSearchParams(prev => {
      if (val) prev.set('q', val);
      else prev.delete('q');
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

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
            <Users className="h-5 w-5 text-neo-accent" />
            {t('library_members')}
          </h1>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">
            Track student and teacher borrowing stats and history.
          </p>
        </div>
      </div>

      <LibrarySubNav />

      {/* Search Input */}
      <div className="bg-white p-4 rounded-[20px] border border-neutral-100 shadow-sm flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search members by name..."
            className="pl-9 rounded-xl border border-neutral-200 text-xs font-semibold h-11 focus:border-black focus:ring-1 focus:ring-black outline-none bg-neutral-50"
            value={q}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider">Member Name</th>
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider">Role Type</th>
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider text-center">Active Loans</th>
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider text-center">Overdue Loans</th>
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider text-center">Total Fines</th>
                <th className="p-4 text-[10px] font-black text-neutral-450 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-neutral-50">
                    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-4 w-12 mx-auto" /></td>
                    <td className="p-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs font-bold text-neutral-400 uppercase">
                    No members found.
                  </td>
                </tr>
              ) : (
                members.map((m: any) => (
                  <tr key={m.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4 text-xs font-bold text-neutral-900">{m.full_name}</td>
                    <td className="p-4 text-xs font-extrabold uppercase">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] ${
                        m.type === 'Enseignant' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {m.type === 'Enseignant' ? 'Teacher' : 'Student'}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-black text-center text-neutral-900">{m.active_loans_count}</td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-black ${m.overdue_loans_count > 0 ? 'text-red-600' : 'text-neutral-400'}`}>
                        {m.overdue_loans_count}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-black ${m.total_unpaid_fines > 0 ? 'text-amber-600' : 'text-neutral-400'}`}>
                        {m.total_unpaid_fines} MAD
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        onClick={() => {
                          setSelectedMemberId(m.id)
                          setSelectedMemberName(m.full_name)
                        }}
                        variant="outline"
                        className="cursor-pointer border border-neutral-200 rounded-xl text-[10px] font-black uppercase h-9 px-3 hover:bg-neutral-50"
                      >
                        <History className="h-3.5 w-3.5 mr-1" />
                        Loan History
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">
              Page {meta.current_page} of {meta.last_page} ({meta.total} members)
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

      {/* History Drawer */}
      <Sheet open={!!selectedMemberId} onOpenChange={(open) => { if (!open) setSelectedMemberId(null); }}>
        <SheetContent className="bg-white text-neutral-900 border-l border-neutral-200 sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-6 border-b border-neutral-100">
            <SheetTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-neo-accent" />
              Loan History
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-400 font-bold uppercase tracking-wide">
              Showing borrowing record for {selectedMemberName}
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 px-6 space-y-4">
            {historyLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-3 border border-neutral-100 rounded-xl space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : history.length === 0 ? (
              <p className="text-center py-8 text-xs font-bold text-neutral-400 uppercase">
                No borrowing history found.
              </p>
            ) : (
              history.map((loan: any) => (
                <div key={loan.id} className="p-3 border border-neutral-100 rounded-xl hover:border-neutral-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-neutral-900">{loan.book.titre}</p>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      loan.statut === 'rendu' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : loan.statut === 'en_retard'
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {loan.statut === 'rendu' ? 'Returned' : loan.statut === 'en_retard' ? 'Overdue' : 'Active'}
                    </span>
                  </div>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase mt-1">Author: {loan.book.auteur}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-neutral-50 text-[10px] font-semibold text-neutral-500">
                    <div>
                      <span className="block text-[8px] font-bold uppercase text-neutral-400">Borrowed:</span>
                      {loan.date_emprunt}
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold uppercase text-neutral-400">Due Date:</span>
                      {loan.date_retour_prevue}
                    </div>
                  </div>

                  {loan.date_retour_effective && (
                    <div className="mt-2 text-[10px] font-semibold text-neutral-500 bg-neutral-50 p-1.5 rounded-lg">
                      <span className="block text-[8px] font-bold uppercase text-neutral-400">Returned Date:</span>
                      {loan.date_retour_effective}
                    </div>
                  )}

                  {loan.statut === 'en_retard' && loan.amende > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 p-2 rounded-lg">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>ACCUMULATED FINE: {loan.amende} MAD</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-6 border-t border-neutral-100 flex flex-row items-center justify-end px-6 pb-6">
            <Button
              onClick={() => setSelectedMemberId(null)}
              className="cursor-pointer bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold uppercase py-5 w-full h-11 border-none"
            >
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default LibraryMembers;
