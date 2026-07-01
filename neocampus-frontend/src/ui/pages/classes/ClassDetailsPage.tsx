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
import { 
  ArrowLeft, 
  Users, 
  GraduationCap, 
  Search,
  Eye,
  Edit3,
  Sparkles
} from 'lucide-react'

export const ClassDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const classId = parseInt(id || '0')

  const { useClassDetails } = useClass()
  const { data: classe, isLoading: loadingClass } = useClassDetails(classId)

  const [searchTerm, setSearchTerm] = useState('')
  const { students, loading: loadingStudents } = useStudent({ classe_id: classId.toString() })
  
  const { teachers, loadingTeachers } = useTeacher()

  const filteredStudents = students.filter(s => 
    s.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.prenom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const assignedTeachers = teachers.filter(t => 
    t.classes?.some(c => c.classe_id === classId)
  )

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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {assignedTeachers.length} Faculty
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

        {/* Right Side: Pedagogic Team */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d0f137]" />
            Pedagogic Team
          </h3>

          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden p-4 space-y-4">
            {loadingTeachers ? (
              <div className="text-center py-6 text-neutral-450 text-xs font-bold uppercase tracking-widest">
                Loading...
              </div>
            ) : assignedTeachers.length > 0 ? (
              assignedTeachers.map((t) => {
                const classAssignment = t.classes?.find(c => c.classe_id === classId)
                return (
                  <div key={t.id} className="flex items-center justify-between pb-3 border-b border-neutral-50 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 border border-neutral-100">
                        <AvatarFallback className="bg-neutral-900 text-white text-[10px] font-black uppercase">
                          {t.user?.nom.charAt(0)}{t.user?.prenom.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-xs font-extrabold text-neutral-800 uppercase leading-none mb-1">
                          {t.user?.prenom} {t.user?.nom}
                        </p>
                        <p className="text-[9px] font-black text-[#d0f137] bg-black uppercase tracking-widest rounded px-1.5 py-0.5 inline-block leading-none border-none">
                          {classAssignment?.matiere_nom || t.specialite}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate('/admin/teachers')}
                      variant="ghost"
                      className="h-7 text-[10px] font-black uppercase text-neutral-400 hover:text-black tracking-wider leading-none p-2 hover:bg-neutral-50 cursor-pointer"
                    >
                      Manage
                    </Button>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                No teachers assigned
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}

export default ClassDetailsPage;
