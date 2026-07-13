import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { useChildBulletins, useChildren } from '@/application/useCases/useParentPortal'
import { ArrowLeft, FileText, Eye } from 'lucide-react'

export const ParentChildBulletinsPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>()
  const childIntId = parseInt(childId || '0', 10)

  const { data: children } = useChildren()
  const { data: bulletins, isLoading } = useChildBulletins(childIntId)

  const child = children?.find(c => c.id === childIntId)

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
            Academic Reports
          </span>
          <h1 className="text-xl font-extrabold tracking-tight">
            Bulletins & Report Cards — {child ? `${child.prenom} ${child.nom}` : 'Child'}
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bulletins && bulletins.length > 0 ? (
            bulletins.map((bulletin) => (
              <Card key={bulletin.id} className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-50 text-teal-650 rounded-xl">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold tracking-tight">
                      Period: {bulletin.periode}
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Academic Year: {bulletin.annee_scolaire} · Average: {bulletin.moyenne_generale !== null ? `${Number(bulletin.moyenne_generale).toFixed(2)}/20` : '—'}
                    </p>
                  </div>
                </div>
                <Link 
                  to={`/bulletins/${bulletin.id}`}
                  className="p-2 bg-neutral-900 hover:bg-black text-white hover:text-[#d0f137] rounded-xl transition shadow-sm flex items-center gap-1.5 text-[10px] font-bold"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Report
                </Link>
              </Card>
            ))
          ) : (
            <Card className="col-span-full bg-white border border-neutral-100 shadow-sm rounded-2xl p-12 text-center text-neutral-455">
              <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-xs font-semibold">No published bulletins available for this child.</p>
            </Card>
          )}
        </div>
      )}

    </div>
  )
}

export default ParentChildBulletinsPage
