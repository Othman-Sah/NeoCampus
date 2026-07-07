import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useClass } from '@/application/useCases/useClass'
import { useStudent } from '@/application/useCases/useStudent'
import { useTeacher } from '@/application/useCases/useTeacher'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft, 
  Users, 
  GraduationCap, 
  Search,
  Eye,
  Edit3,
  Sparkles,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'

export const ClassDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const classId = parseInt(id || '0')

  const { 
    useClassDetails, 
    useClassMatieres, 
    addMatiere, 
    removeMatiere, 
    assignTeacher, 
    setCoefficient 
  } = useClass()

  const { data: classe, isLoading: loadingClass } = useClassDetails(classId)
  const { data: classMatieres, isLoading: loadingMatieres } = useClassMatieres(classId)

  const [searchTerm, setSearchTerm] = useState('')
  const { students, loading: loadingStudents } = useStudent({ classe_id: classId.toString() })
  const { teachers, subjects } = useTeacher()

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<any>(null)
  
  const [editTeacherId, setEditTeacherId] = useState('')
  const [editCoef, setEditCoef] = useState('')
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Clear messages automatically
  React.useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  React.useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMsg])

  const filteredStudents = students.filter(s => 
    s.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.prenom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const unassignedSubjects = subjects.filter(sub => 
    !classMatieres?.some((cm: any) => cm.matiere_id === sub.id)
  )

  const handleAddSubject = async (matiereId: number) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      await addMatiere({ classeId: classId, matiereId })
      setSuccessMsg("Subject added to class successfully.")
      setIsAddOpen(false)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to add subject.")
    }
  }

  const handleSaveEdit = async () => {
    if (!editingSubject) return
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const promises = []
      if (editTeacherId && editTeacherId !== 'none') {
        promises.push(assignTeacher({
          classeId: classId,
          matiereId: editingSubject.matiere_id,
          enseignantId: Number(editTeacherId)
        }))
      }
      if (editCoef !== '') {
        promises.push(setCoefficient({
          classeId: classId,
          matiereId: editingSubject.matiere_id,
          coefficient: Number(editCoef)
        }))
      }
      await Promise.all(promises)
      setSuccessMsg("Subject configuration updated successfully.")
      setIsEditOpen(false)
      setEditingSubject(null)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save configuration.")
    }
  }

  const handleDeleteSubject = async (matiereId: number) => {
    if (!window.confirm("Are you sure you want to remove this subject from this class? This will delete teacher workload and per-class coefficients.")) return
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      await removeMatiere({ classeId: classId, matiereId })
      setSuccessMsg("Subject removed from class successfully.")
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to remove subject.")
    }
  }

  if (loadingClass) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-500 text-xs font-bold uppercase tracking-widest">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mb-4" />
        Loading class details...
      </div>
    )
  }

  if (!classe) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100 p-8">
        <p className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">Class not found</p>
        <Button onClick={() => navigate('/admin/classes')} className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-4">
          Back to Classes
        </Button>
      </div>
    )
  }

  const totalStudents = students.length
  const boysCount = students.filter(s => s.sexe === 'Male').length
  const girlsCount = students.filter(s => s.sexe === 'Female').length
  const boysPercent = totalStudents > 0 ? Math.round((boysCount / totalStudents) * 100) : 0
  const girlsPercent = totalStudents > 0 ? Math.round((girlsCount / totalStudents) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/classes"
            className="w-9 h-9 border border-[#E5E7EB] hover:bg-neutral-50 rounded-lg flex items-center justify-center text-neutral-500 hover:text-black transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900 flex items-center gap-2">
              Class : {classe.nom}
              <Badge className="bg-[#d0f137] text-black hover:bg-[#d0f137] text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 border-none rounded">
                {classe.niveau}
              </Badge>
            </h1>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
              Detailed profile and enrolled student directory
            </p>
          </div>
        </div>
      </div>

      {/* Success / Error alerts */}
      {successMsg && (
        <Alert className="border-green-200 bg-green-50 text-green-800 rounded-xl">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-xs font-black uppercase tracking-wider text-green-900">Success</AlertTitle>
          <AlertDescription className="text-xs text-neutral-600 mt-0.5">{successMsg}</AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 rounded-xl">
          <AlertTriangle className="h-4 w-4 text-red-650" />
          <AlertTitle className="text-xs font-black uppercase tracking-wider text-red-950">Error</AlertTitle>
          <AlertDescription className="text-xs text-red-700 mt-0.5">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Enrolled Students KPI */}
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider leading-none mb-1">
                Total Enrolled
              </p>
              <p className="text-xl font-black text-neutral-900 leading-tight">
                {totalStudents} Students
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gender Breakdown KPI */}
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider leading-none mb-1.5">
                Gender Breakdown
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-neutral-800 leading-none mb-1">
                <span>Boys: {boysCount} ({boysPercent}%)</span>
                <span>Girls: {girlsCount} ({girlsPercent}%)</span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden flex">
                <div style={{ width: `${boysPercent}%` }} className="h-full bg-neutral-900" />
                <div style={{ width: `${girlsPercent}%` }} className="h-full bg-[#d0f137]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Teachers KPI */}
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider leading-none mb-1">
                Assigned Teachers
              </p>
              <p className="text-xl font-black text-neutral-900 leading-tight">
                {classMatieres?.filter(cm => cm.enseignant).length ?? 0} Faculty
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Assigned KPI */}
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider leading-none mb-1">
                Subjects Assigned
              </p>
              <p className="text-xl font-black text-neutral-900 leading-tight">
                {classMatieres?.length ?? 0} Subjects
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Students List */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-black" />
              Class Students
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="bg-white border border-[#E5E7EB] text-neutral-900 pl-9 h-8 rounded-lg text-xs placeholder-neutral-400 focus-visible:ring-1 focus-visible:ring-black"
              />
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-50/50">
                <TableRow className="border-b border-[#E5E7EB] hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 h-9">Full Name</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 h-9">Registration ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 h-9">Gender</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 h-9">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 h-9 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingStudents ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                      Loading roster...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <TableRow key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50/20">
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 border border-neutral-100">
                            <AvatarFallback className="bg-neutral-950 text-white text-[10px] font-black uppercase">
                              {s.nom.charAt(0)}{s.prenom.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-extrabold text-neutral-800 uppercase">
                            {s.prenom} {s.nom}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 text-xs font-bold text-neutral-500 uppercase">
                        {s.matricule}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs font-semibold text-neutral-500">
                        {s.sexe === 'Male' ? 'Boy' : 'Girl'}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge 
                          className={`text-[9px] font-black uppercase tracking-wider rounded-md border-none px-2 py-0.5 ${
                            s.status === 'Active' 
                              ? 'bg-green-50 text-green-700 hover:bg-green-50' 
                              : 'bg-red-50 text-red-700 hover:bg-red-50'
                          }`}
                        >
                          {s.status === 'Active' ? 'Active' : 'Suspended'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            onClick={() => navigate(`/admin/students/${s.id}`)}
                            variant="ghost"
                            className="h-7 w-7 p-0 rounded-md hover:bg-neutral-100 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-neutral-500" />
                          </Button>
                          <Button
                            onClick={() => navigate(`/admin/students/${s.id}/edit`)}
                            variant="ghost"
                            className="h-7 w-7 p-0 rounded-md hover:bg-neutral-100 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-neutral-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-neutral-450 text-xs font-bold uppercase tracking-wider">
                      No students found in this class
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Side: Subjects & Teaching Assignments */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d0f137]" />
              Subjects & Assignments
            </h3>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="bg-black hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg h-7 px-3 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              Add Subject
            </Button>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden p-4 space-y-4">
            {loadingMatieres ? (
              <div className="text-center py-6 text-neutral-450 text-xs font-bold uppercase tracking-widest animate-pulse">
                Loading...
              </div>
            ) : classMatieres && classMatieres.length > 0 ? (
              <div className="space-y-3">
                {classMatieres.map((item) => (
                  <div key={item.matiere_id} className="flex items-center justify-between pb-3 border-b border-neutral-100 last:border-b-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-neutral-800 uppercase leading-none">
                        {item.nom} <span className="text-neutral-450 font-bold text-[9px]">({item.code})</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-black text-black bg-[#d0f137] uppercase tracking-widest rounded px-1.5 py-0.5 leading-none">
                          Coef: {item.coefficient_classe !== null ? item.coefficient_classe : item.coefficient_global}
                        </span>
                        {item.coefficient_classe !== null && (
                          <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">
                            (Global: {item.coefficient_global})
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5">
                        {item.enseignant ? (
                          <span className="text-[10px] font-bold text-neutral-500 uppercase">
                            Teacher: {item.enseignant.prenom} {item.enseignant.nom}
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-600" />
                            No teacher
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingSubject(item)
                          setEditTeacherId(item.enseignant?.id.toString() || '')
                          setEditCoef(item.coefficient_classe !== null ? item.coefficient_classe.toString() : '')
                          setIsEditOpen(true)
                        }}
                        className="h-7 w-7 p-0 rounded-md hover:bg-neutral-50 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-neutral-400 hover:text-black" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSubject(item.matiere_id)}
                        className="h-7 w-7 p-0 rounded-md hover:bg-neutral-50 cursor-pointer text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-neutral-400 hover:text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-450 text-xs font-bold uppercase tracking-wider">
                No subjects assigned
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add Subject Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-white text-neutral-900 border border-neutral-100">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xs font-black uppercase tracking-wider">Add Subject to Class</DialogTitle>
            <DialogDescription className="text-xs text-neutral-400">Select a subject to link to {classe.nom}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450 block">Subject</label>
              <Select onValueChange={(val) => handleAddSubject(Number(val))}>
                <SelectTrigger className="bg-white border-neutral-200 text-xs h-9">
                  <SelectValue placeholder="Select a subject..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-neutral-100 text-xs text-neutral-900">
                  {unassignedSubjects.map((sub: any) => (
                    <SelectItem key={sub.id} value={sub.id.toString()} className="hover:bg-neutral-50 focus:bg-neutral-50 text-neutral-900">
                      {sub.nom} ({sub.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="text-xs font-bold uppercase tracking-wider h-9">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white text-neutral-900 border border-neutral-100">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xs font-black uppercase tracking-wider">Configure Subject Assignment</DialogTitle>
            <DialogDescription className="text-xs text-neutral-400">Update teacher workload and coefficient override for {editingSubject?.nom}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-left">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450 block">Assign Teacher</label>
              <Select value={editTeacherId} onValueChange={(val) => setEditTeacherId(val)}>
                <SelectTrigger className="bg-white border-neutral-200 text-xs h-9">
                  <SelectValue placeholder="Select a teacher..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-neutral-100 text-xs text-neutral-900">
                  <SelectItem value="none" className="hover:bg-neutral-50 focus:bg-neutral-50 text-neutral-500 italic">No Teacher Assigned</SelectItem>
                  {teachers.map((t: any) => (
                    <SelectItem key={t.id} value={t.id.toString()} className="hover:bg-neutral-50 focus:bg-neutral-50 text-neutral-900">
                      {t.user?.prenom} {t.user?.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-450 block">Class Coefficient Override (Optional)</label>
              <Input
                type="number"
                step="0.1"
                placeholder={`Default: ${editingSubject?.coefficient_global}`}
                value={editCoef}
                onChange={(e) => setEditCoef(e.target.value)}
                className="bg-white border-neutral-200 text-xs h-9"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setIsEditOpen(false); setEditingSubject(null); }} className="text-xs font-bold uppercase tracking-wider h-9">
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-black hover:bg-neutral-800 text-white font-bold text-xs h-9 px-4 rounded-lg"
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default ClassDetailsPage;
