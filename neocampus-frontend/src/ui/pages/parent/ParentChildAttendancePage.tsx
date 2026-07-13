import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { useChildAttendance, useChildren } from '@/application/useCases/useParentPortal'
import { ArrowLeft, CalendarDays, AlertTriangle } from 'lucide-react'

export const ParentChildAttendancePage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>()
  const childIntId = parseInt(childId || '0', 10)

  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data: children } = useChildren()
  const { data: attendance, isLoading } = useChildAttendance(childIntId, {
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  })

  const child = children?.find(c => c.id === childIntId)

  // Compute metrics
  const totalAbsences = attendance?.filter(a => a.statut === 'absent').length || 0
  const totalLates = attendance?.filter(a => a.statut === 'retard').length || 0
  const attendanceRate = attendance && attendance.length > 0
    ? ((attendance.length - totalAbsences) / attendance.length * 100).toFixed(1)
    : '100.0'

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
            Attendance Log
          </span>
          <h1 className="text-xl font-extrabold tracking-tight">
            Attendance Report — {child ? `${child.prenom} ${child.nom}` : 'Child'}
          </h1>
        </div>
      </div>

      {/* Date Filters Row */}
      <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">From Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-neutral-50 border border-neutral-150 rounded-xl focus:outline-none focus:border-black"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">To Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-neutral-50 border border-neutral-150 rounded-xl focus:outline-none focus:border-black"
            />
          </div>
        </div>
        <button 
          onClick={() => { setStartDate(''); setEndDate(''); }}
          className="text-xs font-bold text-neutral-450 hover:text-black mt-4 sm:mt-0"
        >
          Clear Filters
        </button>
      </Card>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white border border-neutral-100 rounded-2xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-neutral-400 uppercase">Attendance Rate</p>
          <h2 className="text-3xl font-extrabold text-teal-650 mt-1">{attendanceRate}%</h2>
        </div>
        <div className="p-5 bg-white border border-neutral-100 rounded-2xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Absences</p>
          <h2 className="text-3xl font-extrabold text-red-500 mt-1">{totalAbsences}</h2>
        </div>
        <div className="p-5 bg-white border border-neutral-100 rounded-2xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Lateness</p>
          <h2 className="text-3xl font-extrabold text-yellow-600 mt-1">{totalLates}</h2>
        </div>
      </div>

      {/* Attendance History Table */}
      <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-50">
          <h3 className="text-xs font-bold uppercase tracking-wider">
            History Log
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Time Slot</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5">Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 font-medium text-neutral-800">
                {attendance && attendance.length > 0 ? (
                  attendance.map((record, index) => {
                    const badgeColor = record.statut === 'absent' 
                      ? 'bg-red-50 text-red-700' 
                      : record.statut === 'present'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-750'

                    return (
                      <tr key={index} className="hover:bg-neutral-50/50">
                        <td className="px-6 py-4 font-bold">{record.date}</td>
                        <td className="px-6 py-4">{record.matiere_nom}</td>
                        <td className="px-6 py-4 text-neutral-450">{record.heure}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${badgeColor}`}>
                            {record.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-500 italic">{record.motif || '—'}</td>
                        <td className="px-6 py-4">
                          {record.statut !== 'present' && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                              record.justifie 
                                ? 'bg-teal-50 text-teal-700 border-teal-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {record.justifie ? 'Justified' : 'Unjustified'}
                            </span>
                          )}
                          {record.statut === 'present' && <span className="text-neutral-400">—</span>}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-450">
                      <CalendarDays className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  )
}

export default ParentChildAttendancePage
