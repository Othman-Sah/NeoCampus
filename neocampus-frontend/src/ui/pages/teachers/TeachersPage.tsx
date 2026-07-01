import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTeacher } from '@/application/useCases/useTeacher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  UserPlus, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  FilterX,
  Mail,
  DollarSign,
  GraduationCap
} from 'lucide-react'

export const TeachersPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingTeacherId, setDeletingTeacherId] = useState<number | null>(null)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Get data
  const filters: Record<string, string> = {}
  if (debouncedSearch) filters.search = debouncedSearch
  if (selectedSpecialty) filters.specialite = selectedSpecialty

  const { teachers, loadingTeachers, deleteTeacher, subjects } = useTeacher(filters)

  // Pagination
  const itemsPerPage = 6
  const totalItems = teachers.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedTeachers = teachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  const handleEdit = (id: number) => {
    navigate(`/admin/teachers/${id}/edit`)
  }

  const triggerDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingTeacherId(id)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deletingTeacherId) {
      try {
        await deleteTeacher(deletingTeacherId)
        setDeleteOpen(false)
        setDeletingTeacherId(null)
      } catch (err) {
        console.error('Failed to delete teacher', err)
      }
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedSpecialty('')
    setCurrentPage(1)
  }

  const avatarColors = [
    'bg-indigo-600',
    'bg-emerald-600',
    'bg-rose-600',
    'bg-amber-600',
  ]

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900">
            Teachers Directory
          </h1>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
            Manage teacher profiles, assign subjects, classes and configure payroll details
          </p>
        </div>

        <Button
          onClick={() => navigate('/admin/teachers/create')}
          className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-4 flex items-center shadow-sm border-none cursor-pointer"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Teacher
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-450" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by teacher name..."
              className="bg-white border border-[#E5E7EB] text-neutral-900 pl-9 pr-4 h-9 rounded-lg text-xs placeholder-neutral-400 focus-visible:ring-1 focus-visible:ring-black"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <select
              value={selectedSpecialty}
              onChange={(e) => { setSelectedSpecialty(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-[#e5e7eb] text-neutral-850 rounded-lg h-9 text-xs px-3 outline-none min-w-44 focus:border-black"
            >
              <option value="">All Specialties</option>
              {subjects.map(s => (
                <option key={s.id} value={s.nom}>{s.nom}</option>
              ))}
            </select>

            {(searchTerm || selectedSpecialty) && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                className="h-9 px-3 text-neutral-500 hover:text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer"
              >
                <FilterX className="h-4 w-4 mr-1.5" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card Grid of Teachers */}
      {loadingTeachers ? (
        <div className="flex items-center justify-center py-20 text-xs font-bold uppercase tracking-wider text-neutral-400 gap-2">
          <Loader2 className="animate-spin h-5 w-5 text-black" />
          Loading Teachers...
        </div>
      ) : paginatedTeachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTeachers.map((t) => {
            const initials = `${t.user?.nom?.charAt(0) || ''}${t.user?.prenom?.charAt(0) || ''}`
            const colorClass = avatarColors[t.id % avatarColors.length]
            return (
              <Card 
                key={t.id} 
                className="bg-white border border-[#E5E7EB] hover:border-black rounded-2xl shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden group"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  
                  {/* Top: Avatar, name, specialty badge */}
                  <div className="flex items-start gap-4">
                    {t.user?.avatar ? (
                      <img 
                        src={t.user.avatar} 
                        alt="Teacher Avatar" 
                        className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0 border border-neutral-200" 
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-black uppercase shadow-inner shrink-0 ${colorClass}`}>
                        {initials}
                      </div>
                    )}

                    <div className="text-left space-y-1">
                      <h3 className="text-sm font-extrabold text-neutral-850 uppercase leading-snug">
                        {t.user?.prenom} {t.user?.nom}
                      </h3>
                      <span className="inline-block text-[9px] font-black text-black bg-[#d0f137] px-2 py-0.5 rounded uppercase tracking-wider">
                        {t.specialite}
                      </span>
                    </div>
                  </div>

                  {/* Mid: Email & Salary info */}
                  <div className="space-y-1.5 text-xs text-neutral-500 font-semibold border-t border-neutral-50 pt-3">
                    <div className="flex items-center gap-2 text-left">
                      <Mail className="h-3.5 w-3.5 text-neutral-450 shrink-0" />
                      <span className="truncate">{t.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-left">
                      <DollarSign className="h-3.5 w-3.5 text-neutral-450 shrink-0" />
                      <span>Base Salary: <span className="font-extrabold text-neutral-800">{(t.salaire_de_base || 0).toLocaleString()} DH</span></span>
                    </div>
                  </div>

                  {/* Bottom: Class Assignments tags */}
                  <div className="space-y-1.5 border-t border-neutral-50 pt-3">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block text-left">
                      Assigned Classes
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {t.classes && t.classes.length > 0 ? (
                        t.classes.map((c, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary"
                            className="bg-neutral-50 text-neutral-600 border border-neutral-200 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded"
                          >
                            {c.classe_nom}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-400 uppercase italic">None</span>
                      )}
                    </div>
                  </div>

                  {/* Absolute Edit/Delete Overlays */}
                  <div className="flex justify-end gap-1.5 pt-3 border-t border-neutral-50">
                    <Button
                      onClick={() => handleEdit(t.id)}
                      variant="ghost"
                      className="h-8 px-3 text-[10px] font-black uppercase text-neutral-500 hover:text-black tracking-wider flex items-center gap-1 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      onClick={(e) => triggerDelete(t.id, e)}
                      variant="ghost"
                      className="h-8 px-3 text-[10px] font-black uppercase text-red-500 hover:text-red-750 hover:bg-red-50 tracking-wider flex items-center gap-1 rounded-lg border border-neutral-100 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>

                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
          <GraduationCap className="h-12 w-12 text-neutral-350 mx-auto mb-4 animate-bounce" />
          <h3 className="text-sm font-black uppercase text-neutral-850 tracking-wider">No Teachers Found</h3>
          <p className="text-xs text-neutral-400 mt-1">Try resetting your search parameters or register a new teacher profile</p>
        </Card>
      )}

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#f9f9f9] border border-[#e5e7eb] rounded-xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Page {currentPage} of {totalPages} ({totalItems} Teachers)
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              variant="outline"
              className="bg-white border border-[#e5e7eb] h-8 w-8 p-0 rounded-lg flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
              className="bg-white border border-[#e5e7eb] h-8 w-8 p-0 rounded-lg flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-white max-w-sm rounded-xl p-5 text-neutral-900 border border-neutral-100">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Delete Teacher Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Are you sure you want to delete this teacher? This action will permanently remove their user credentials and class assignments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex sm:justify-end gap-2">
            <Button
              onClick={() => setDeleteOpen(false)}
              variant="outline"
              className="bg-white border border-[#E5E7EB] text-black font-bold text-xs h-9 rounded-lg cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-750 text-white font-bold text-xs h-9 rounded-lg border-none cursor-pointer"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default TeachersPage;
