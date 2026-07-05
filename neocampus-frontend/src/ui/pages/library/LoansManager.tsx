import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from '@/application/useCases/useTranslation'
import { LibrarySubNav } from './LibrarySubNav'
import { useLoans } from '@/application/useCases/library/useLoans'
import { useOverdueLoans } from '@/application/useCases/library/useOverdueLoans'
import { libraryApiService } from '@/infrastructure/api/libraryApiService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Book } from '@/domain/entities/Book'
import { Loan } from '@/domain/entities/Loan'
import { Member } from '@/domain/entities/Member'
import { 
  Plus, 
  Search, 
  BookMarked, 
  Sparkles, 
  X, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react'

export const LoansManager: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Tab State: 'all' or 'overdue'
  const activeTab = searchParams.get('tab') || 'all'

  // Filters state from URL
  const statut = searchParams.get('statut') || 'all'
  const q = searchParams.get('q') || ''
  const date_debut = searchParams.get('date_debut') || ''
  const date_fin = searchParams.get('date_fin') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const per_page = 10

  // Hooks
  const { 
    loans, 
    meta, 
    loading: loansLoading, 
    createLoan, 
    returnLoan, 
    returning,
    searchMembers 
  } = useLoans({ 
    statut, 
    q, 
    date_debut, 
    date_fin, 
    page, 
    per_page 
  })

  // Overdue hook
  const { 
    loans: overdueLoans, 
    meta: overdueMeta, 
    loading: overdueLoading 
  } = useOverdueLoans({ 
    page, 
    per_page 
  })

  // Local UI State
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [returningLoanId, setReturningLoanId] = useState<number | null>(null)

  // Searchable Selectors State
  const [memberSearch, setMemberSearch] = useState('')
  const [memberResults, setMemberResults] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [searchingMembers, setSearchingMembers] = useState(false)

  const [bookSearch, setBookSearch] = useState('')
  const [bookResults, setBookResults] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [searchingBooks, setSearchingBooks] = useState(false)

  // Debounced search for Member Selector
  useEffect(() => {
    if (memberSearch.trim().length < 2) {
      setMemberResults([])
      return
    }
    const handler = setTimeout(async () => {
      setSearchingMembers(true)
      try {
        const results = await searchMembers(memberSearch)
        setMemberResults(results || [])
      } catch (err) {
        console.error(err)
      } finally {
        setSearchingMembers(false)
      }
    }, 450)
    return () => clearTimeout(handler)
  }, [memberSearch])

  // Debounced search for Book Selector
  useEffect(() => {
    if (bookSearch.trim().length < 2) {
      setBookResults([])
      return
    }
    const handler = setTimeout(async () => {
      setSearchingBooks(true)
      try {
        const res = await libraryApiService.getBooks({ q: bookSearch, disponible: true })
        setBookResults(res.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setSearchingBooks(false)
      }
    }, 450)
    return () => clearTimeout(handler)
  }, [bookSearch])

  // Trigger Toast Helper
  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text })
    setTimeout(() => setToastMsg(null), 4000)
  }

  // Update URL params helper
  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '' || val === 'all') {
        newParams.delete(key)
      } else {
        newParams.set(key, String(val))
      }
    })
    if (!updates.hasOwnProperty('page')) {
      newParams.delete('page')
    }
    setSearchParams(newParams)
  }

  // Reset Filters
  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  // Handle return book click
  const handleReturnClick = (id: number) => {
    setReturningLoanId(id)
    setIsReturnDialogOpen(true)
  }

  // Confirm return book action
  const confirmReturn = async () => {
    if (!returningLoanId) return
    try {
      await returnLoan(returningLoanId)
      triggerToast('success', t('toast_success_return_loan'))
      setIsReturnDialogOpen(false)
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || 'Error returning loan.'
      triggerToast('error', msg)
    }
  }

  // Create Loan Action
  const handleSaveLoan = async () => {
    if (!selectedMember || !selectedBook) {
      triggerToast('error', 'Please select a member and a book.')
      return
    }
    try {
      await createLoan({ livreId: selectedBook.id, adherentId: selectedMember.id })
      triggerToast('success', t('toast_success_create_loan'))
      setIsSheetOpen(false)
      // reset forms
      setSelectedMember(null)
      setSelectedBook(null)
      setMemberSearch('')
      setBookSearch('')
    } catch (err: any) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Error creating loan.'
      triggerToast('error', errorMsg)
    }
  }

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
            <BookMarked className="h-5 w-5 text-neo-accent" />
            {t('library_loans')}
          </h1>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">
            Record book loans and manage return status for students and teachers.
          </p>
        </div>
        <Button 
          onClick={() => setIsSheetOpen(true)}
          className="cursor-pointer bg-black text-white hover:bg-neutral-850 font-extrabold text-xs uppercase rounded-xl py-5 flex items-center gap-1.5 self-start md:self-auto border-none"
        >
          <Plus className="h-4 w-4" /> {t('new_loan_btn')}
        </Button>
      </div>

      <LibrarySubNav />

      {/* Tab Switcher */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => updateParams({ tab: 'all' })}
          className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === 'all' 
              ? 'border-black text-black' 
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          All Loans
        </button>
        <button
          onClick={() => updateParams({ tab: 'overdue' })}
          className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === 'overdue' 
              ? 'border-red-600 text-red-650' 
              : 'border-transparent text-neutral-400 hover:text-neutral-650'
          }`}
        >
          {t('overdue_tab')}
        </button>
      </div>

      {/* Filters Row (Visible only in 'all' tab) */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded-[20px] border border-neutral-100 shadow-sm">
          {/* Status Filter */}
          <div className="col-span-1">
            <Label className="text-[10px] font-black text-neutral-450 uppercase tracking-wider block mb-1">
              Status
            </Label>
            <select
              className="w-full rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold p-2.5 h-10 focus:outline-none focus:ring-1 focus:ring-black"
              value={statut}
              onChange={(e) => updateParams({ statut: e.target.value })}
            >
              <option value="all">{t('all_status')}</option>
              <option value="en_cours">{t('status_en_cours')}</option>
              <option value="rendu">{t('status_rendu')}</option>
              <option value="en_retard">{t('status_en_retard')}</option>
            </select>
          </div>

          {/* Quick Search */}
          <div className="col-span-1 md:col-span-2">
            <Label className="text-[10px] font-black text-neutral-450 uppercase tracking-wider block mb-1">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <Input
                placeholder="Search member or book..."
                className="pl-9 rounded-xl bg-neutral-50 border-neutral-200 text-xs font-semibold h-10 focus-visible:ring-1 focus-visible:ring-black"
                value={q}
                onChange={(e) => updateParams({ q: e.target.value })}
              />
            </div>
          </div>

          {/* Date Range Start */}
          <div className="col-span-1">
            <Label className="text-[10px] font-black text-neutral-450 uppercase tracking-wider block mb-1">
              Start Date
            </Label>
            <Input
              type="date"
              className="rounded-xl bg-neutral-50 border-neutral-200 text-xs font-semibold h-10"
              value={date_debut}
              onChange={(e) => updateParams({ date_debut: e.target.value })}
            />
          </div>

          {/* Date Range End */}
          <div className="col-span-1 flex items-end gap-2">
            <div className="flex-1">
              <Label className="text-[10px] font-black text-neutral-450 uppercase tracking-wider block mb-1">
                End Date
              </Label>
              <Input
                type="date"
                className="rounded-xl bg-neutral-50 border-neutral-200 text-xs font-semibold h-10"
                value={date_fin}
                onChange={(e) => updateParams({ date_fin: e.target.value })}
              />
            </div>
            {(statut !== 'all' || q !== '' || date_debut !== '' || date_fin !== '') && (
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="cursor-pointer border border-neutral-200 text-neutral-600 rounded-xl h-10 p-2.5"
                title="Clear Filters"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Loans Data Table Card */}
      <div className="bg-white rounded-[24px] border border-neutral-100 shadow-sm overflow-hidden p-6">
        {((activeTab === 'all' && loansLoading) || (activeTab === 'overdue' && overdueLoading)) ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : (activeTab === 'all' ? loans.length === 0 : overdueLoans.length === 0) ? (
          <div className="text-center py-20 text-xs text-neutral-450 font-bold uppercase border-2 border-dashed border-neutral-50 rounded-2xl">
            No loans found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-[9px] font-black text-neutral-400 uppercase pb-4 tracking-wider">{t('member_column')}</th>
                  <th className="text-[9px] font-black text-neutral-400 uppercase pb-4 tracking-wider">{t('book_column')}</th>
                  <th className="text-[9px] font-black text-neutral-400 uppercase pb-4 tracking-wider">{t('loan_date_column')}</th>
                  <th className="text-[9px] font-black text-neutral-400 uppercase pb-4 tracking-wider">{t('due_date_column')}</th>
                  {activeTab === 'all' ? (
                    <>
                      <th className="text-[9px] font-black text-neutral-400 uppercase pb-4 tracking-wider">{t('return_date_column')}</th>
                      <th className="text-[9px] font-black text-neutral-400 uppercase pb-4 tracking-wider">{t('status_column')}</th>
                    </>
                  ) : (
                    <>
                      <th className="text-[9px] font-black text-neutral-400 uppercase pb-4 tracking-wider">{t('overdue_days_column')}</th>
                      <th className="text-[9px] font-black text-neutral-400 uppercase pb-4 tracking-wider">{t('fine_column')}</th>
                    </>
                  )}
                  <th className="text-[9px] font-black text-neutral-400 uppercase pb-4 tracking-wider text-right">{t('actions_column')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {(activeTab === 'all' ? loans : overdueLoans).map((loan: Loan) => {
                  const isOverdue = loan.statut === 'en_retard'
                  const isReturned = loan.statut === 'rendu'

                  return (
                    <tr 
                      key={loan.id} 
                      className={`hover:bg-neutral-50/50 transition duration-150 ${
                        isOverdue ? 'bg-red-50/15' : ''
                      }`}
                    >
                      {/* Member */}
                      <td className="py-4 pr-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 ring-2 ring-neutral-100">
                            <AvatarFallback className="bg-neutral-900 text-white text-xs font-bold uppercase">
                              {loan.adherent.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-900 truncate leading-snug">{loan.adherent.full_name}</p>
                            <span className="text-[9px] text-neutral-400 font-extrabold uppercase bg-neutral-100 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">
                              {loan.adherent.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Book */}
                      <td className="py-4 pr-2 max-w-[200px]">
                        <p className="text-xs font-bold text-neutral-900 truncate leading-snug">{loan.book.titre}</p>
                        <p className="text-[9px] font-semibold text-neutral-450 truncate">By {loan.book.auteur}</p>
                      </td>

                      {/* Loan Date */}
                      <td className="py-4 pr-2 text-xs font-semibold text-neutral-800">
                        {loan.date_emprunt}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 pr-2 text-xs font-semibold text-neutral-850">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          <span>{loan.date_retour_prevue}</span>
                        </div>
                      </td>

                      {activeTab === 'all' ? (
                        <>
                          {/* Return Date */}
                          <td className="py-4 pr-2 text-xs font-semibold text-neutral-500">
                            {loan.date_retour_effective || '—'}
                          </td>

                          {/* Status */}
                          <td className="py-4 pr-2">
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              isReturned 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : isOverdue 
                                  ? 'bg-red-50 text-red-700 animate-pulse' 
                                  : 'bg-blue-50 text-blue-700'
                            }`}>
                              {isReturned ? t('status_rendu') : isOverdue ? t('status_en_retard') : t('status_en_cours')}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Days Overdue */}
                          <td className="py-4 pr-2 text-xs font-bold text-red-650">
                            {loan.jours_retard} days
                          </td>

                          {/* Fine */}
                          <td className="py-4 pr-2 text-xs font-black text-red-750">
                            {loan.amende} MAD
                          </td>
                        </>
                      )}

                      {/* Action: Return */}
                      <td className="py-4 text-right">
                        <Button
                          disabled={isReturned}
                          onClick={() => handleReturnClick(loan.id)}
                          className={`cursor-pointer text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-xl border border-neutral-200 leading-none h-auto bg-white text-black hover:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none`}
                        >
                          Return
                        </Button>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {((activeTab === 'all' && !loansLoading && meta.last_page > 1) || 
          (activeTab === 'overdue' && !overdueLoading && overdueMeta.last_page > 1)) && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <Button
              className="cursor-pointer bg-white text-black hover:bg-neutral-55 border border-neutral-200 w-8 h-8 rounded-lg p-0 flex items-center justify-center"
              disabled={page === 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: activeTab === 'all' ? meta.last_page : overdueMeta.last_page }, (_, idx) => idx + 1).map((p) => (
              <Button
                key={p}
                className={`cursor-pointer w-8 h-8 rounded-lg text-xs font-bold p-0 ${
                  page === p
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-800 hover:bg-neutral-50 border border-neutral-200'
                }`}
                onClick={() => updateParams({ page: String(p) })}
              >
                {p}
              </Button>
            ))}

            <Button
              className="cursor-pointer bg-white text-black hover:bg-neutral-55 border border-neutral-200 w-8 h-8 rounded-lg p-0 flex items-center justify-center"
              disabled={page === (activeTab === 'all' ? meta.last_page : overdueMeta.last_page)}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* New Loan Sheet Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-white text-neutral-900 border-l border-neutral-200 sm:max-w-md">
          <SheetHeader className="pb-6 border-b border-neutral-100">
            <SheetTitle className="text-base font-black uppercase tracking-wide">
              {t('new_loan_btn')}
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-400">
              {t('new_loan_desc')}
            </SheetDescription>
          </SheetHeader>

          {/* Form */}
          <div className="space-y-6 py-6 px-6">
            
            {/* Member Search Selector */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-neutral-550 uppercase tracking-wider">
                {t('select_member')}
              </Label>
              
              {selectedMember ? (
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{selectedMember.full_name}</p>
                      <span className="text-[9px] font-extrabold uppercase text-blue-700">{selectedMember.type}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedMember(null)
                      setMemberSearch('')
                    }}
                    variant="ghost"
                    className="p-1 h-auto text-neutral-450 hover:text-black hover:bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-1 relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <Input
                      placeholder={t('member_search_placeholder')}
                      className="pl-9 rounded-xl border border-neutral-200 text-xs font-semibold h-11 focus:border-black focus:ring-1 focus:ring-black outline-none bg-neutral-50"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                    />
                  </div>
                  
                  {/* Results Popover */}
                  {memberSearch.trim().length >= 2 && (
                    <div className="absolute left-0 right-0 z-30 max-h-[160px] overflow-y-auto bg-white border border-neutral-200 rounded-xl shadow-lg mt-1 p-1 space-y-1">
                      {searchingMembers && (
                        <p className="text-center py-4 text-[10px] font-bold text-neutral-400 uppercase animate-pulse">Searching...</p>
                      )}
                      {!searchingMembers && memberResults.length === 0 && (
                        <p className="text-center py-4 text-[10px] font-bold text-neutral-400 uppercase">No member found</p>
                      )}
                      {!searchingMembers && memberResults.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMember(m)}
                          className="w-full text-left p-2 hover:bg-neutral-50 rounded-lg text-xs font-bold flex items-center justify-between"
                        >
                          <span>{m.full_name}</span>
                          <span className="text-[9px] font-extrabold uppercase text-neutral-450">{m.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Book Search Selector */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-neutral-550 uppercase tracking-wider">
                {t('select_book')}
              </Label>
              
              {selectedBook ? (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-neutral-900" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{selectedBook.titre}</p>
                      <p className="text-[9px] font-extrabold uppercase text-neutral-450">By {selectedBook.auteur}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedBook(null)
                      setBookSearch('')
                    }}
                    variant="ghost"
                    className="p-1 h-auto text-neutral-450 hover:text-black hover:bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-1 relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <Input
                      placeholder={t('book_search_placeholder')}
                      className="pl-9 rounded-xl border border-neutral-200 text-xs font-semibold h-11 focus:border-black focus:ring-1 focus:ring-black outline-none bg-neutral-50"
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                    />
                  </div>

                  {/* Results Popover */}
                  {bookSearch.trim().length >= 2 && (
                    <div className="absolute left-0 right-0 z-30 max-h-[160px] overflow-y-auto bg-white border border-neutral-200 rounded-xl shadow-lg mt-1 p-1 space-y-1">
                      {searchingBooks && (
                        <p className="text-center py-4 text-[10px] font-bold text-neutral-400 uppercase animate-pulse">Searching...</p>
                      )}
                      {!searchingBooks && bookResults.length === 0 && (
                        <p className="text-center py-4 text-[10px] font-bold text-neutral-400 uppercase">No book found</p>
                      )}
                      {!searchingBooks && bookResults.map(b => (
                        <button
                          key={b.id}
                          onClick={() => setSelectedBook(b)}
                          className="w-full text-left p-2 hover:bg-neutral-50 rounded-lg text-xs font-bold flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <p className="truncate">{b.titre}</p>
                            <span className="text-[8px] text-neutral-400 font-semibold truncate block">ISBN: {b.isbn}</span>
                          </div>
                          <span className="text-[9px] font-black uppercase text-neutral-455 shrink-0">{b.quantite_stock} copies</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Inline Stock Check Feedback */}
              {selectedBook && (
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  selectedBook.quantite_stock > 1 
                    ? 'bg-emerald-50/50 border-emerald-150 text-emerald-800' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <AlertTriangle className={`h-4 w-4 shrink-0 ${
                    selectedBook.quantite_stock > 1 ? 'text-emerald-600' : 'text-amber-600'
                  }`} />
                  <p className="text-[10px] font-bold uppercase tracking-wide">
                    {t('stock_left')} : <span className="font-black">{selectedBook.quantite_stock}</span>.
                    {selectedBook.quantite_stock <= 0 && ` ${t('no_stock_alert')}`}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-neutral-100 flex flex-row items-center justify-end gap-3 w-full mt-6">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer border border-neutral-200 rounded-xl text-xs font-bold uppercase py-5 flex-1 h-11"
                onClick={() => {
                  setIsSheetOpen(false)
                  setSelectedMember(null)
                  setSelectedBook(null)
                }}
              >
                {t('cancel_btn')}
              </Button>
              <Button
                type="button"
                disabled={!selectedBook || !selectedMember || selectedBook.quantite_stock <= 0}
                onClick={handleSaveLoan}
                className="cursor-pointer bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold uppercase py-5 border-none disabled:opacity-50 flex-1 h-11"
              >
                Record Loan
              </Button>
            </div>

          </div>
        </SheetContent>
      </Sheet>

      {/* Return Confirmation Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="bg-white text-neutral-900 rounded-[24px] border border-neutral-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wide">
              {t('confirm_return_title')}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-450 font-semibold mt-2">
              {t('confirm_return_desc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              className="cursor-pointer border border-neutral-200 rounded-xl text-xs font-bold uppercase"
              onClick={() => setIsReturnDialogOpen(false)}
            >
              {t('cancel_btn')}
            </Button>
            <Button
              disabled={returning}
              className="cursor-pointer bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold uppercase border-none"
              onClick={confirmReturn}
            >
              {returning ? 'Processing...' : t('confirm_btn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default LoansManager;
