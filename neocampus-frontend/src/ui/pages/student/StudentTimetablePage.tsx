import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { useMyTimetable } from '@/application/useCases/useStudentPortal'
import { TimetableGrid } from '@/ui/components/timetable/TimetableGrid'
import { ArrowLeft, Calendar } from 'lucide-react'

export const StudentTimetablePage: React.FC = () => {
  const { data: timetable, isLoading } = useMyTimetable()

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
            Class Timetable
          </span>
          <h1 className="text-xl font-extrabold tracking-tight">
            My Timetable
          </h1>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <Card className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : timetable && timetable.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <TimetableGrid
                sessions={timetable}
                activeSeance={null}
                isAdmin={false}
                onEditSession={() => {}}
                onCreateSession={() => {}}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-neutral-405">
            <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-xs font-semibold">No timetable sessions scheduled for your class.</p>
          </div>
        )}
      </Card>

    </div>
  )
}

export default StudentTimetablePage
