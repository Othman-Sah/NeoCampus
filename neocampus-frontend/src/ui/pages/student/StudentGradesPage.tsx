import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { useMyGrades } from '@/application/useCases/useStudentPortal'
import { ArrowLeft, GraduationCap } from 'lucide-react'

export const StudentGradesPage: React.FC = () => {
  const { data: grades, isLoading } = useMyGrades()

  // Group grades by subject
  const groupedGrades = useMemo(() => {
    if (!grades) return {}
    const groups: { [key: string]: typeof grades } = {}
    grades.forEach(g => {
      if (!groups[g.matiere]) {
        groups[g.matiere] = []
      }
      groups[g.matiere].push(g)
    })
    return groups
  }, [grades])

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
            Academic Performance
          </span>
          <h1 className="text-xl font-extrabold tracking-tight">
            My Grades
          </h1>
        </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(groupedGrades).length > 0 ? (
          Object.entries(groupedGrades).map(([subject, subjectGrades]) => {
            const gradedCount = subjectGrades.filter(g => g.valeur !== null).length
            const average = gradedCount > 0 
              ? (subjectGrades.reduce((sum, g) => sum + (g.valeur ?? 0), 0) / subjectGrades.length).toFixed(2)
              : null

            return (
              <Card key={subject} className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-start pb-3 border-b border-neutral-50">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-850">{subject}</h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{subjectGrades.length} exam(s) recorded</p>
                  </div>
                  {average !== null && (
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase">Average</p>
                      <span className="text-xs font-extrabold text-teal-650">{average} / 20</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3.5 pt-1">
                  {subjectGrades.map((grade, idx) => {
                    const val = grade.valeur
                    const colorClass = val === null 
                      ? 'bg-neutral-50 text-neutral-500 border-neutral-200'
                      : val >= 14 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : val >= 10 
                          ? 'bg-yellow-50 text-yellow-750 border-yellow-250' 
                          : 'bg-red-50 text-red-700 border-red-200'

                    return (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-neutral-800">{grade.examen}</p>
                          <p className="text-[10px] text-neutral-400">
                            Date: {grade.date} · Coeff: {grade.coefficient}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {grade.classe_average !== undefined && (
                            <span className="text-[9px] text-neutral-400 font-semibold">
                              Class Avg: {grade.classe_average}/20
                            </span>
                          )}
                          <span className={`font-extrabold px-2.5 py-1 rounded-lg border text-[11px] ${colorClass}`}>
                            {grade.valeur !== null ? `${grade.valeur} / 20` : 'Absent'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })
        ) : (
          <Card className="col-span-full bg-white border border-neutral-100 shadow-sm rounded-2xl p-8 text-center text-neutral-450">
            <GraduationCap className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-xs font-semibold">No grades recorded yet.</p>
          </Card>
        )}
      </div>

    </div>
  )
}

export default StudentGradesPage
