import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/application/useCases/useTranslation'
import { useLibraryStats } from '@/application/useCases/library/useLibraryStats'
import { useLoans } from '@/application/useCases/library/useLoans'
import { useBooks } from '@/application/useCases/library/useBooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  BookOpen, 
  BookMarked, 
  AlertTriangle, 
  Search, 
  ArrowRight, 
  User, 
  Calendar,
  Sparkles
} from 'lucide-react'

export const LibraryDashboard: React.FC = () => {
  const { t } = useTranslation()
  const { stats, loading: statsLoading } = useLibraryStats()
  
  // Fetch recent loans (limit 5)
  const { loans, loading: loansLoading } = useLoans({ per_page: 5 })
  const { searchMembers } = useLoans()
  const { books: searchBooksList } = useBooks() // fallback books for search helper

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchResults, setSearchResults] = useState<{
    books: any[]
    members: any[]
  }>({ books: [], members: [] })
  const [searching, setSearching] = useState(false)

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Run search when debounced value updates and is >= 2 chars
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.trim().length < 2) {
        setSearchResults({ books: [], members: [] })
        return
      }

      setSearching(true)
      try {
        // Query members from API
        const membersRes = await searchMembers(debouncedSearch)
        
        // Filter some books locally or fetch from API
        const booksFiltered = searchBooksList.filter((b: any) => 
          b.titre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          b.auteur.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          b.isbn.includes(debouncedSearch)
        ).slice(0, 5)

        setSearchResults({
          books: booksFiltered,
          members: membersRes || []
        })
      } catch (err) {
        console.error(err)
      } finally {
        setSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearch, searchBooksList])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-neo-accent animate-pulse" />
            {t('submenu_library')} — {t('library_dashboard')}
          </h1>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">
            Manage your book catalog and track student loans.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/library/books">
            <Button className="cursor-pointer bg-black text-white hover:bg-neutral-800 font-bold text-xs uppercase rounded-xl py-5">
              {t('library_books')}
            </Button>
          </Link>
          <Link to="/library/loans">
            <Button className="cursor-pointer bg-white text-black hover:bg-neutral-50 border border-neutral-200 font-bold text-xs uppercase rounded-xl py-5">
              {t('library_loans')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Overdue Alert banner */}
      {!statsLoading && stats.overdue_loans > 0 && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-950 rounded-2xl p-4 shadow-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <AlertTitle className="text-sm font-extrabold uppercase tracking-wide">
              {t('alerts')}
            </AlertTitle>
            <AlertDescription className="text-xs font-semibold mt-1">
              {t('overdue_alert_banner').replace('{count}', String(stats.overdue_loans))}
            </AlertDescription>
          </div>
          <Link to="/library/loans?tab=overdue" className="text-xs font-extrabold uppercase text-red-650 hover:underline shrink-0 flex items-center gap-1">
            View Overdue Loans <ArrowRight className="h-3 w-3" />
          </Link>
        </Alert>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Books */}
        <Card className="rounded-[24px] border border-neutral-100 shadow-sm overflow-hidden bg-white hover:scale-[1.02] transition-transform duration-250">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider leading-none">
                {t('total_books')}
              </p>
              {statsLoading ? (
                <Skeleton className="h-8 w-20 mt-2" />
              ) : (
                <h3 className="text-2xl font-black text-neutral-900 mt-1">
                  {stats.total_books}
                </h3>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Loans */}
        <Card className="rounded-[24px] border border-neutral-100 shadow-sm overflow-hidden bg-white hover:scale-[1.02] transition-transform duration-250">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BookMarked className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider leading-none">
                {t('active_loans')}
              </p>
              {statsLoading ? (
                <Skeleton className="h-8 w-20 mt-2" />
              ) : (
                <h3 className="text-2xl font-black text-neutral-900 mt-1">
                  {stats.active_loans}
                </h3>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Loans */}
        <Card className={`rounded-[24px] border shadow-sm overflow-hidden bg-white hover:scale-[1.02] transition-transform duration-250 ${stats.overdue_loans > 0 ? 'border-red-100 bg-red-50/10' : 'border-neutral-100'}`}>
          <CardContent className="p-6 flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stats.overdue_loans > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-neutral-50 text-neutral-400'}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider leading-none">
                {t('overdue_loans')}
              </p>
              {statsLoading ? (
                <Skeleton className="h-8 w-20 mt-2" />
              ) : (
                <h3 className={`text-2xl font-black mt-1 ${stats.overdue_loans > 0 ? 'text-red-650' : 'text-neutral-900'}`}>
                  {stats.overdue_loans}
                </h3>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Search and Recent Loans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Search */}
        <Card className="rounded-[24px] border border-neutral-100 shadow-sm bg-white lg:col-span-1">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-wide">
              {t('quick_search')}
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-neutral-400">
              Rechercher instantanément des livres et des adhérents de la bibliothèque.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder={t('search_books_members')}
                className="pl-10 rounded-xl bg-neutral-50 border-neutral-200 text-xs font-semibold py-5 focus-visible:ring-1 focus-visible:ring-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Results */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {searching && (
                <div className="flex items-center justify-center py-6 text-xs font-bold text-neutral-400 uppercase animate-pulse">
                  Recherche en cours...
                </div>
              )}

              {!searching && searchQuery.trim().length >= 2 && searchResults.books.length === 0 && searchResults.members.length === 0 && (
                <div className="text-center py-6 text-xs text-neutral-400 font-bold uppercase">
                  Aucun résultat trouvé
                </div>
              )}

              {!searching && searchQuery.trim().length < 2 && (
                <div className="text-center py-10 text-xs text-neutral-400 font-bold uppercase border-2 border-dashed border-neutral-100 rounded-2xl">
                  Saisir au moins 2 caractères
                </div>
              )}

              {/* Books results */}
              {searchResults.books.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-2">
                    Livres ({searchResults.books.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.books.map((b) => (
                      <div key={b.id} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-start gap-3">
                        <BookOpen className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 truncate leading-snug">{b.titre}</p>
                          <p className="text-[10px] font-semibold text-neutral-450 truncate">{b.auteur}</p>
                          <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md mt-1 ${b.disponible ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {b.disponible ? 'Disponible' : 'Épuisé'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members results */}
              {searchResults.members.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-2">
                    Membres ({searchResults.members.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.members.map((m) => (
                      <div key={m.id} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-start gap-3">
                        <User className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 truncate leading-snug">{m.full_name}</p>
                          <span className="inline-block text-[9px] font-bold uppercase bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md mt-1">
                            {m.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Loans */}
        <Card className="rounded-[24px] border border-neutral-100 shadow-sm bg-white lg:col-span-2">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-wide">
              {t('recent_loans_title')}
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-neutral-400">
              {t('recent_loans_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {loansLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : loans.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-450 font-bold uppercase border-2 border-dashed border-neutral-100 rounded-2xl">
                Aucun emprunt récent enregistré
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="text-[9px] font-black text-neutral-400 uppercase pb-3 tracking-wider">{t('member_column')}</th>
                      <th className="text-[9px] font-black text-neutral-400 uppercase pb-3 tracking-wider">{t('book_column')}</th>
                      <th className="text-[9px] font-black text-neutral-400 uppercase pb-3 tracking-wider">{t('due_date_column')}</th>
                      <th className="text-[9px] font-black text-neutral-400 uppercase pb-3 tracking-wider">{t('status_column')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {loans.map((loan: any) => {
                      const isOverdue = loan.statut === 'en_retard'
                      const isReturned = loan.statut === 'rendu'

                      return (
                        <tr key={loan.id} className="hover:bg-neutral-50/50 transition duration-150">
                          <td className="py-3.5 pr-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {loan.adherent?.full_name?.charAt(0) || 'M'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-neutral-900 truncate max-w-[120px]">{loan.adherent?.full_name}</p>
                                <span className="text-[9px] text-neutral-400 font-extrabold uppercase">{loan.adherent?.type}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 pr-2 max-w-[200px]">
                            <p className="text-xs font-bold text-neutral-900 truncate leading-snug">{loan.book?.titre}</p>
                            <p className="text-[9px] font-semibold text-neutral-400 truncate">{loan.book?.auteur}</p>
                          </td>
                          <td className="py-3.5 pr-2 text-xs font-semibold text-neutral-800">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-neutral-450 shrink-0" />
                              <span>{loan.date_retour_prevue}</span>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isReturned 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : isOverdue 
                                  ? 'bg-red-50 text-red-700 animate-pulse' 
                                  : 'bg-blue-50 text-blue-700'
                            }`}>
                              {isReturned ? t('status_rendu') : isOverdue ? t('status_en_retard') : t('status_en_cours')}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LibraryDashboard;
