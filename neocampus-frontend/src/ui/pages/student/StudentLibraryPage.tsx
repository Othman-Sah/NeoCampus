import React, { useState } from 'react'
import { useMyLoans } from '@/application/useCases/useStudentPortal'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Search, 
  Loader2, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react'

export const StudentLibraryPage: React.FC = () => {
  const { data: loans = [], isLoading } = useMyLoans()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLoans = loans.filter((loan: any) => 
    loan.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.book_author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.book_isbn.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rendu':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> Returned
          </Badge>
        )
      case 'en_retard':
        return (
          <Badge className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1 w-fit animate-pulse">
            <AlertCircle className="w-3 h-3" /> Overdue
          </Badge>
        )
      default:
        return (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Active Loan
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900">
          Library Board
        </h1>
        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
          View books checked out and active loans from the media library
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Filter and Books List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-visible">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  My Borrowed Books
                </CardTitle>
                <CardDescription>List of all resources checked out under your student profile</CardDescription>
              </div>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search book or author..."
                  className="bg-white border border-neutral-200 text-neutral-900 pl-9 pr-4 h-9 rounded-xl text-xs focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-7 w-7 text-black animate-spin" />
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Fetching library account...
                  </p>
                </div>
              ) : filteredLoans.length === 0 ? (
                <div className="text-center py-16 space-y-2 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                  <BookOpen className="h-8 w-8 text-neutral-350 mx-auto" />
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    No Checked Out Books
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-semibold max-w-xs mx-auto leading-relaxed">
                    You currently have no borrowed books or no records match your search filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredLoans.map((loan: any) => (
                    <div 
                      key={loan.id}
                      className="border border-neutral-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-neutral-200 transition-all bg-white"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                          {loan.book_title}
                        </h4>
                        <p className="text-[10px] text-neutral-500 font-semibold">
                          by {loan.book_author} &middot; <span className="font-mono text-neutral-400">ISBN: {loan.book_isbn}</span>
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-neutral-500 font-medium">
                          <span className="flex items-center gap-1 bg-neutral-50 border border-neutral-100 rounded-lg px-2 py-0.5">
                            <Calendar className="w-3 h-3 text-neutral-400" />
                            Borrowed: {loan.date_emprunt}
                          </span>
                          <span className="flex items-center gap-1 bg-neutral-50 border border-neutral-100 rounded-lg px-2 py-0.5">
                            <Calendar className="w-3 h-3 text-neutral-400" />
                            Due: {loan.date_retour_prevue}
                          </span>
                          {loan.date_retour_effective && (
                            <span className="flex items-center gap-1 bg-emerald-50/50 border border-emerald-100 text-emerald-700 rounded-lg px-2 py-0.5">
                              <Calendar className="w-3 h-3 text-emerald-400" />
                              Returned: {loan.date_retour_effective}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col sm:items-end justify-between items-center shrink-0">
                        {getStatusBadge(loan.statut)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Media Library Rules / Info */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-neutral-900 to-neutral-850 text-white rounded-2xl shadow-md border border-neutral-800 p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
              Library Card Info
            </h3>
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <span className="text-[11px] text-neutral-400 font-medium">Total Books Checked Out</span>
                <span className="text-xs font-bold font-mono">{loans.length}</span>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <span className="text-[11px] text-neutral-400 font-medium">Active Borrowings</span>
                <span className="text-xs font-bold font-mono text-indigo-400">
                  {loans.filter((l: any) => l.statut === 'en_cours').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-medium">Overdue Books</span>
                <span className="text-xs font-bold font-mono text-rose-400">
                  {loans.filter((l: any) => l.statut === 'en_retard').length}
                </span>
              </div>
            </div>
          </Card>

          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Library Instructions
            </h3>
            <ul className="space-y-2.5 text-[11px] text-neutral-500 font-medium leading-relaxed list-disc list-inside">
              <li>Standard borrow period is <strong className="text-neutral-800">14 days</strong> unless specified otherwise.</li>
              <li>Late returns are subject to a suspension of checkout privileges.</li>
              <li>Report lost or damaged items immediately to the librarian.</li>
              <li>Extend items before due date directly at the counter.</li>
            </ul>
          </Card>
        </div>

      </div>
    </div>
  )
}

export default StudentLibraryPage;
