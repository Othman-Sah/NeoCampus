import React from 'react'
import { useTranslation } from '@/application/useCases/useTranslation'
import { useLibraryAnalytics } from '@/application/useCases/library/useLibraryAnalytics'
import { LibrarySubNav } from './LibrarySubNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Coins, 
  AlertTriangle,
  Award,
  CalendarDays
} from 'lucide-react'

export const LibraryAnalytics: React.FC = () => {
  const { t } = useTranslation()
  const { analytics, loading } = useLibraryAnalytics()

  const kpis = analytics.kpis || {
    overdue_rate: 0,
    active_borrowers: 0,
    total_outstanding_fines: 0,
    total_collected_fines: 0,
  }

  const topBooks = analytics.top_books || []
  const topGenres = analytics.top_genres || []
  const monthlyTrends = analytics.monthly_trends || []

  // Max borrowing count for scale calculation
  const maxBookCount = topBooks.length > 0 ? Math.max(...topBooks.map((b: any) => b.borrow_count)) : 1
  const maxGenreCount = topGenres.length > 0 ? Math.max(...topGenres.map((g: any) => g.borrow_count)) : 1
  const maxTrendCount = monthlyTrends.length > 0 ? Math.max(...monthlyTrends.map((t: any) => t.borrow_count)) : 1

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-neo-accent" />
            {t('library_analytics')}
          </h1>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">
            Data insights, borrowing activity trends, and inventory performance.
          </p>
        </div>
      </div>

      <LibrarySubNav />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6">
          <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">
                Overdue Rate
              </CardDescription>
              <CardTitle className="text-2xl font-black text-neutral-900 mt-1">
                {loading ? <Skeleton className="h-7 w-20" /> : `${kpis.overdue_rate}%`}
              </CardTitle>
            </div>
            <div className="p-2 bg-red-50 rounded-xl text-red-650">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardHeader>
        </Card>

        {/* KPI 2 */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6">
          <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-[9px] font-black uppercase text-neutral-455 tracking-wider">
                Active Readers
              </CardDescription>
              <CardTitle className="text-2xl font-black text-neutral-900 mt-1">
                {loading ? <Skeleton className="h-7 w-20" /> : kpis.active_borrowers}
              </CardTitle>
            </div>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-650">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
        </Card>

        {/* KPI 3 */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6">
          <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-[9px] font-black uppercase text-neutral-450 tracking-wider">
                Collected Fines
              </CardDescription>
              <CardTitle className="text-2xl font-black text-neutral-900 mt-1">
                {loading ? <Skeleton className="h-7 w-24" /> : `${Math.abs(kpis.total_collected_fines)} MAD`}
              </CardTitle>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-650">
              <Coins className="h-5 w-5" />
            </div>
          </CardHeader>
        </Card>

        {/* KPI 4 */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6">
          <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-[9px] font-black uppercase text-neutral-450 tracking-wider">
                Unpaid Balances
              </CardDescription>
              <CardTitle className="text-2xl font-black text-red-600 mt-1">
                {loading ? <Skeleton className="h-7 w-24" /> : `${Math.abs(kpis.total_outstanding_fines)} MAD`}
              </CardTitle>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-650">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Popular Books Chart */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-neo-accent" />
              Top 5 Borrowed Books
            </CardTitle>
            <CardDescription className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              Most requested book collections this year.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3.5 w-full rounded-full" />
                </div>
              ))
            ) : topBooks.length === 0 ? (
              <p className="text-center py-6 text-xs font-bold text-neutral-400 uppercase">No borrowing records yet.</p>
            ) : (
              topBooks.map((book: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-end text-xs font-bold text-neutral-800">
                    <span className="truncate max-w-[280px]">{book.titre}</span>
                    <span className="shrink-0 text-neutral-900 font-black">{book.borrow_count} loans</span>
                  </div>
                  <div className="w-full bg-neutral-50 border border-neutral-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-black h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(book.borrow_count / maxBookCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Popular Genres Chart */}
        <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-neo-accent" />
              Popular Genres
            </CardTitle>
            <CardDescription className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              Distribution of reading preferences by genre.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3.5 w-full rounded-full" />
                </div>
              ))
            ) : topGenres.length === 0 ? (
              <p className="text-center py-6 text-xs font-bold text-neutral-400 uppercase">No genres data available.</p>
            ) : (
              topGenres.map((genre: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-end text-xs font-bold text-neutral-800">
                    <span>{genre.genre || 'Unspecified'}</span>
                    <span className="text-neutral-900 font-black">{genre.borrow_count} loans</span>
                  </div>
                  <div className="w-full bg-neutral-50 border border-neutral-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-black h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(genre.borrow_count / maxGenreCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>

      {/* Monthly Trends */}
      <Card className="rounded-[24px] border border-neutral-100 bg-white shadow-sm p-6 space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
            <CalendarDays className="h-4.5 w-4.5 text-neo-accent" />
            Monthly Borrowing Activity
          </CardTitle>
          <CardDescription className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
            Total checkout entries registered month-over-month.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : monthlyTrends.length === 0 ? (
            <p className="text-center py-6 text-xs font-bold text-neutral-400 uppercase">No monthly data available.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pt-4 min-h-[160px]">
              {monthlyTrends.map((trend: any, idx: number) => {
                const heightPercentage = Math.round((trend.borrow_count / maxTrendCount) * 100)
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 w-full">
                    <span className="text-[10px] font-black text-neutral-900">{trend.borrow_count}</span>
                    <div className="w-full bg-neutral-50 border border-neutral-100 rounded-t-lg h-28 flex items-end">
                      <div 
                        className="bg-black hover:bg-neutral-800 transition-all duration-300 w-full rounded-t-lg" 
                        style={{ height: `${heightPercentage}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-black text-neutral-400 uppercase">{trend.month}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LibraryAnalytics;
