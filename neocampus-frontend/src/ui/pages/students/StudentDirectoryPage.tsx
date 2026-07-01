import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudent } from '@/application/useCases/useStudent'
import { Student } from '@/domain/ports/IStudentService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  UserPlus, 
  Eye, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  FilterX,
  UploadCloud
} from 'lucide-react'

export const StudentDirectoryPage: React.FC = () => {
  const navigate = useNavigate()

  // 1. Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 2. Delete Confirmation dialog states
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null)
  const [importAlertOpen, setImportAlertOpen] = useState(false)

  // 3. Search debouncing logic (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1) // Reset page on new search
    }, 300)

    return () => clearTimeout(handler)
  }, [searchTerm])

  // 4. Fetch students data using Custom Hook with filters
  const filters: Record<string, string> = {}
  if (debouncedSearch) filters.search = debouncedSearch
  if (selectedClass) filters.classe_id = selectedClass
  if (selectedSection) filters.section = selectedSection
  if (selectedStatus) filters.status = selectedStatus

  const { 
    students, 
    loading, 
    deleting, 
    deleteStudent 
  } = useStudent(filters)

  // 5. Pagination calculation
  const itemsPerPage = 10
  const totalItems = students.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  const paginatedStudents = students.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  // 6. Action Handlers
  const handleNewEnrollment = () => {
    navigate('/admin/students/create')
  }

  const handleViewProfile = (id: number) => {
    navigate(`/admin/students/${id}`)
  }

  const handleEditProfile = (id: number) => {
    navigate(`/admin/students/${id}/edit`)
  }

  const triggerDelete = (id: number) => {
    setDeletingStudentId(id)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deletingStudentId) {
      try {
        await deleteStudent(deletingStudentId)
        setDeleteOpen(false)
        setDeletingStudentId(null)
        if (paginatedStudents.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1)
        }
      } catch (err) {
        console.error('Failed to delete student:', err)
      }
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedClass('')
    setSelectedSection('')
    setSelectedStatus('')
    setCurrentPage(1)
  }

  const mockClasses = [
    { id: 1, name: 'Grade 6-A' },
    { id: 2, name: 'Grade 5-B' },
    { id: 3, name: 'Grade 3-A' },
    { id: 4, name: 'Grade 6-C' },
    { id: 5, name: 'Grade 5-A' },
  ]

  return (
    <div className="space-y-5 animate-fade-in text-neutral-900">
      
      {/* Top Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900">
            Student Directory
          </h1>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
            Consult and manage school student enrollment records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setImportAlertOpen(true)}
            variant="outline"
            className="bg-white hover:bg-neutral-50 text-black border border-[#e5e7eb] font-bold text-xs rounded-lg h-9 px-4 flex items-center shadow-sm cursor-pointer"
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>

          <Button
            onClick={handleNewEnrollment}
            className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-4 flex items-center shadow-sm border-none cursor-pointer"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            New Enrollment
          </Button>
        </div>
      </div>

      {/* Filters Bar - Figma Inspired Minimalist */}
      <Card className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search a student..."
              className="bg-white border border-[#e5e7eb] text-neutral-900 pl-9 pr-4 h-9 rounded-lg text-xs placeholder-neutral-400 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Section filter */}
            <select
              value={selectedSection}
              onChange={(e) => { setSelectedSection(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 px-3 outline-none cursor-pointer focus:border-black"
            >
              <option value="">Section (All)</option>
              <option value="Primary">Primary</option>
              <option value="College">College</option>
            </select>

            {/* Class filter */}
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 px-3 outline-none cursor-pointer focus:border-black"
            >
              <option value="">Class (All)</option>
              {mockClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 px-3 outline-none cursor-pointer focus:border-black"
            >
              <option value="">Status (All)</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>

            {/* Clear Filters Button */}
            {(searchTerm || selectedClass || selectedSection || selectedStatus) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-neutral-400 hover:text-black text-xs font-bold rounded-lg h-9 border-none cursor-pointer"
              >
                <FilterX className="h-3.5 w-3.5 mr-1.5" />
                Clear
              </Button>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Main Table / Directory List */}
      <Card className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-7 w-7 text-black animate-spin" />
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Fetching directory entries...
            </p>
          </div>
        ) : paginatedStudents.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <FilterX className="h-8 w-8 text-neutral-300 mx-auto" />
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              No Students Found
            </h3>
            <p className="text-[11px] text-neutral-400 font-semibold max-w-xs mx-auto leading-relaxed">
              No directory profiles match the keywords or filters you set.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#f9f9f9] border-b border-[#e5e7eb]">
                <TableRow className="border-b border-[#e5e7eb] hover:bg-transparent">
                  <TableHead className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase pl-6 py-3.5">
                    Photo
                  </TableHead>
                  <TableHead className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase py-3.5">
                    Matricule
                  </TableHead>
                  <TableHead className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase py-3.5">
                    Full Name
                  </TableHead>
                  <TableHead className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase py-3.5">
                    Class
                  </TableHead>
                  <TableHead className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase py-3.5">
                    Section
                  </TableHead>
                  <TableHead className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase py-3.5">
                    Status
                  </TableHead>
                  <TableHead className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase pr-6 py-3.5 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student: Student) => {
                  const studentClassNom = mockClasses.find(c => c.id === student.classe_id)?.name ?? student.classe_nom ?? 'N/A'
                  const isPrimary = student.classe_id === 5
                  const sectionName = isPrimary ? 'Primary' : 'College'

                  return (
                    <TableRow 
                      key={student.id} 
                      className="border-b border-[#e5e7eb]/80 hover:bg-neutral-50/50 transition-colors"
                    >
                      {/* Avatar */}
                      <TableCell className="pl-6 py-3">
                        <Avatar className="h-8 w-8 ring-1 ring-neutral-200">
                          {student.avatar && (
                            <AvatarImage
                              src={student.avatar}
                              alt={`${student.prenom} ${student.nom}`}
                            />
                          )}
                          <AvatarFallback className="bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase">
                            {student.prenom.charAt(0)}{student.nom.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>

                      {/* Matricule */}
                      <TableCell className="font-mono text-[11px] font-bold text-neutral-700 uppercase tracking-tight">
                        {student.matricule}
                      </TableCell>

                      {/* Full Name */}
                      <TableCell className="text-xs font-bold text-neutral-900 capitalize">
                        {student.prenom} {student.nom}
                      </TableCell>

                      {/* Class */}
                      <TableCell className="text-xs font-semibold text-neutral-600">
                        {studentClassNom}
                      </TableCell>

                      {/* Section */}
                      <TableCell className="text-xs font-semibold text-neutral-400">
                        {sectionName}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] font-bold rounded-full px-2.5 py-0.5 border ${
                            student.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}
                        >
                          {student.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Profile */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleViewProfile(student.id)}
                            className="h-7 w-7 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg cursor-pointer border-none"
                            title="View Profile"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {/* Edit Student */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditProfile(student.id)}
                            className="h-7 w-7 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg cursor-pointer border-none"
                            title="Edit Student"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete student */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => triggerDelete(student.id)}
                            className="h-7 w-7 text-red-500 hover:text-red-650 hover:bg-red-50 rounded-lg cursor-pointer border-none"
                            title="Delete Student"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>

                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="px-6 py-3.5 flex items-center justify-between border-t border-[#e5e7eb]">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                {`${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} students`}
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="h-7 w-7 bg-white border border-[#e5e7eb] text-neutral-700 rounded-lg disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs font-bold px-2 text-neutral-900">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="h-7 w-7 bg-white border border-[#e5e7eb] text-neutral-700 rounded-lg disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-white border border-[#e5e7eb] text-neutral-900 max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 font-semibold leading-relaxed pt-2">
              Are you sure you want to delete this student? This action cannot be undone and will delete their access credentials.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 flex items-center justify-end">
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
              className="text-neutral-500 hover:text-black rounded-lg text-xs font-bold border-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg px-4 py-2 flex items-center border-none cursor-pointer disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bulk Import Redirection Warning Modal */}
      <Dialog open={importAlertOpen} onOpenChange={setImportAlertOpen}>
        <DialogContent className="bg-white border border-[#e5e7eb] text-neutral-900 max-w-md rounded-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-neutral-600" />
              Bulk Import Wizard
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 font-semibold leading-relaxed pt-2">
              You are about to be redirected to the standalone Bulk Import Wizard. Before uploading, you will see a detailed layout guide outlining the required CSV file columns to ensure seamless profile generation. Do you wish to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 flex items-center justify-end">
            <Button
              variant="ghost"
              onClick={() => setImportAlertOpen(false)}
              className="text-neutral-500 hover:text-black rounded-lg text-xs font-bold border-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setImportAlertOpen(false)
                navigate('/admin/students/import')
              }}
              className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg px-4 py-2 border-none cursor-pointer"
            >
              Proceed to Wizard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default StudentDirectoryPage
