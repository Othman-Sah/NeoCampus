import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { useMySupports } from '@/application/useCases/useStudentPortal'
import { 
  ArrowLeft, 
  FileText, 
  Video, 
  Link as LinkIcon, 
  Image, 
  Download, 
  BookMarked
} from 'lucide-react'

export const StudentSupportsPage: React.FC = () => {
  const { data: supports, isLoading } = useMySupports()

  // Group materials by subject (matiere_nom)
  const groupedSupports = useMemo(() => {
    if (!supports) return {}
    const groups: { [key: string]: typeof supports } = {}
    supports.forEach(s => {
      if (!groups[s.matiere_nom]) {
        groups[s.matiere_nom] = []
      }
      groups[s.matiere_nom].push(s)
    })
    return groups
  }, [supports])

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
            Course Materials & Resources
          </h1>
        </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(groupedSupports).length > 0 ? (
          Object.entries(groupedSupports).map(([subject, subjectSupports]) => (
            <Card key={subject} className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 space-y-4">
              <div className="border-b border-neutral-50 pb-3">
                <h3 className="text-sm font-bold text-neutral-850">{subject}</h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">{subjectSupports.length} document(s) shared</p>
              </div>

              <div className="space-y-3.5 pt-1">
                {subjectSupports.map((sup) => {
                  // Determine icon by type
                  const TypeIcon = sup.type === 'video'
                    ? Video
                    : sup.type === 'link'
                      ? LinkIcon
                      : sup.type === 'image'
                        ? Image
                        : FileText

                  const typeColor = sup.type === 'video'
                    ? 'bg-red-50 text-red-650'
                    : sup.type === 'link'
                      ? 'bg-blue-50 text-blue-650'
                      : sup.type === 'image'
                        ? 'bg-purple-50 text-purple-650'
                        : 'bg-teal-50 text-teal-650'

                  return (
                    <div key={sup.id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl shrink-0 ${typeColor}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-neutral-850 truncate max-w-xs" title={sup.titre}>
                            {sup.titre}
                          </h4>
                          <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                            Shared by {sup.enseignant_nom} · {sup.created_at.substring(0, 10)}
                          </p>
                          {sup.description && (
                            <p className="text-[10px] text-neutral-450 mt-1 italic line-clamp-1">
                              {sup.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {sup.fichier_url && (
                        <a 
                          href={sup.fichier_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-xl transition"
                          title="Open Link/File"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full bg-white border border-neutral-100 shadow-sm rounded-2xl p-8 text-center text-neutral-450">
            <BookMarked className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-xs font-semibold">No course materials shared yet.</p>
          </Card>
        )}
      </div>

    </div>
  )
}

export default StudentSupportsPage
