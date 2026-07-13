import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { useMyHomework } from '@/application/useCases/useStudentPortal'
import { ArrowLeft, BookOpen, Download, AlertTriangle } from 'lucide-react'

export const StudentHomeworkPage: React.FC = () => {
  const { data: homework, isLoading } = useMyHomework()
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'overdue'>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')

  // Derive unique subject list for dropdown
  const subjectsList = useMemo(() => {
    if (!homework) return []
    const unique = new Set(homework.map(h => h.matiere_nom))
    return Array.from(unique)
  }, [homework])

  // Filter homework
  const filteredHomework = useMemo(() => {
    if (!homework) return []
    return homework.filter(h => {
      // Subject filter
      if (subjectFilter !== 'all' && h.matiere_nom !== subjectFilter) {
        return false
      }
      // Status filter
      if (statusFilter === 'overdue' && !h.is_overdue) {
        return false
      }
      if (statusFilter === 'upcoming' && h.is_overdue) {
        return false
      }
      return true
    })
  }, [homework, statusFilter, subjectFilter])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

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
            Academics
          </span>
          <h1 className="text-xl font-extrabold tracking-tight">
            Homework & Assignments
          </h1>
        </div>
      </div>

      {/* Filters Row */}
      <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Status</span>
            <div className="flex bg-neutral-150 p-1 rounded-xl">
              {(['all', 'upcoming', 'overdue'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                    statusFilter === status 
                      ? 'bg-white text-black shadow-sm' 
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Subject</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-neutral-50 border border-neutral-150 rounded-xl focus:outline-none focus:border-black min-w-[150px]"
            >
              <option value="all">All Subjects</option>
              {subjectsList.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => { setStatusFilter('all'); setSubjectFilter('all'); }}
          className="text-xs font-bold text-neutral-450 hover:text-black mt-4 sm:mt-0"
        >
          Reset Filters
        </button>
      </Card>

      {/* Homework Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHomework.length > 0 ? (
          filteredHomework.map((hw) => {
            const remains = hw.days_remaining
            const isOverdue = hw.is_overdue

            const badgeColor = isOverdue
              ? 'bg-red-50 text-red-750 border-red-200'
              : remains <= 1
                ? 'bg-orange-50 text-orange-755 border-orange-200'
                : 'bg-green-50 text-green-700 border-green-200'

            return (
              <Card key={hw.id} className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-[9px] font-extrabold uppercase tracking-wider">
                      {hw.matiere_nom}
                    </span>
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${badgeColor}`}>
                      {isOverdue 
                        ? 'Overdue' 
                        : remains === 0 
                          ? 'Due Today' 
                          : remains === 1 
                            ? 'Due Tomorrow' 
                            : `${remains} days remaining`
                      }
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-neutral-850">{hw.titre}</h3>
                  
                  {hw.description && (
                    <p className="text-[11px] text-neutral-450 leading-relaxed">
                      {hw.description}
                    </p>
                  )}

                  <p className="text-[10px] text-neutral-400">
                    Teacher: <span className="font-semibold text-neutral-600">{hw.enseignant_nom}</span> · Due: {hw.date_echeance}
                  </p>
                </div>

                {hw.fichier_url && (
                  <div className="mt-5 pt-3 border-t border-neutral-50 flex justify-end">
                    <a
                      href={hw.fichier_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-xl transition flex items-center gap-1.5 text-[10px] font-bold"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Attachment
                    </a>
                  </div>
                )}
              </Card>
            )
          })
        ) : (
          <Card className="col-span-full bg-white border border-neutral-100 shadow-sm rounded-2xl p-12 text-center text-neutral-455">
            <BookOpen className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-xs font-semibold">No homework assignments match the criteria.</p>
          </Card>
        )}
      </div>

    </div>
  )
}

export default StudentHomeworkPage
