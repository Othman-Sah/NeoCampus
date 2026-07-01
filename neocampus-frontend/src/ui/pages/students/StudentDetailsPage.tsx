import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useStudent } from '@/application/useCases/useStudent'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Loader2, 
  Edit3, 
  Printer, 
  UserX, 
  UserCheck
} from 'lucide-react'

export const StudentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const studentId = id ? parseInt(id) : 0
  const [activeTab, setActiveTab] = useState<'info' | 'academic' | 'absences' | 'finances' | 'docs'>('info')

  const { useStudentDetails, updateStudent, updating } = useStudent()
  const { data: student, isLoading: loadingStudent } = useStudentDetails(studentId)

  const toggleStatus = async () => {
    if (!student) return
    const newStatus = student.status === 'Active' ? 'Suspended' : 'Active'
    try {
      await updateStudent({ id: student.id, data: { status: newStatus } })
    } catch (err) {
      console.error('Failed to toggle status:', err)
    }
  }

  const mockClasses = [
    { id: 1, name: 'Grade 6-A' },
    { id: 2, name: 'Grade 5-B' },
    { id: 3, name: 'Grade 3-A' },
    { id: 4, name: 'Grade 6-C' },
    { id: 5, name: 'Grade 5-A' },
  ]

  if (loadingStudent) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="h-8 w-8 text-black animate-spin" />
        <p className="text-xs font-bold text-neutral-450 uppercase tracking-widest">
          Loading student profile...
        </p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-sm font-semibold text-neutral-500">Student not found.</p>
        <Button onClick={() => navigate('/admin/students')} className="bg-black text-white text-xs rounded-lg">
          Back to Directory
        </Button>
      </div>
    )
  }

  const studentClassNom = mockClasses.find(c => c.id === student.classe_id)?.name ?? student.classe_nom ?? 'N/A'
  const isPrimary = student.classe_id === 5
  const sectionName = isPrimary ? 'Primary' : 'College'

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900 pb-12">
      
      {/* Breadcrumbs */}
      <div className="flex gap-2 items-center text-xs text-neutral-400 font-semibold uppercase tracking-wider">
        <Link to="/admin/students" className="hover:text-black transition-colors">
          Students
        </Link>
        <span>/</span>
        <span className="text-black">Student Profile</span>
      </div>

      {/* Main Container */}
      <Card className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm max-w-[960px] mx-auto">
        
        {/* Header Hero Widget */}
        <div className="bg-[#f9f9f9] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#e5e7eb]">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-black">
              {student.avatar && (
                <AvatarImage
                  src={student.avatar}
                  alt={`${student.prenom} ${student.nom}`}
                  className="object-cover w-full h-full"
                />
              )}
              <AvatarFallback className="bg-white text-black text-xl font-black uppercase border border-[#e5e7eb]">
                {student.prenom.charAt(0)}{student.nom.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-neutral-900 capitalize">
                {student.prenom} {student.nom}
              </h3>
              <div className="font-mono text-xs text-neutral-400 uppercase font-semibold">
                {student.matricule}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="outline" className="text-[10px] font-bold bg-white text-neutral-700 border-[#e5e7eb] uppercase">
                  Class: {studentClassNom}
                </Badge>
                <Badge variant="outline" className={`text-[10px] font-bold border uppercase ${
                  student.status === 'Active' ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]' : 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'
                }`}>
                  {student.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/students/${student.id}/edit`)}
              className="bg-white hover:bg-neutral-50 text-black border border-[#e5e7eb] font-bold text-xs h-9 rounded-lg px-4 cursor-pointer"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="bg-white hover:bg-neutral-50 text-black border border-[#e5e7eb] font-bold text-xs h-9 rounded-lg px-4 cursor-pointer"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Folder
            </Button>
            <Button
              variant="outline"
              onClick={toggleStatus}
              disabled={updating}
              className={`font-bold text-xs h-9 rounded-lg px-4 cursor-pointer border ${
                student.status === 'Active'
                  ? 'bg-white hover:bg-red-50 text-red-650 border-[#e5e7eb]'
                  : 'bg-white hover:bg-emerald-50 text-emerald-700 border-[#e5e7eb]'
              }`}
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : student.status === 'Active' ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tab Menu bar */}
        <div className="flex items-center border-b border-[#e5e7eb] px-6 bg-white overflow-x-auto gap-5 py-3.5">
          <button
            onClick={() => setActiveTab('info')}
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors outline-none border-none bg-transparent cursor-pointer ${
              activeTab === 'info' ? 'text-black border-b-2 border-black pb-1.5' : 'text-neutral-400 hover:text-black pb-1.5'
            }`}
          >
            Information
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors outline-none border-none bg-transparent cursor-pointer ${
              activeTab === 'academic' ? 'text-black border-b-2 border-black pb-1.5' : 'text-neutral-400 hover:text-black pb-1.5'
            }`}
          >
            Academic & Grades
          </button>
          <button
            onClick={() => setActiveTab('absences')}
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors outline-none border-none bg-transparent cursor-pointer ${
              activeTab === 'absences' ? 'text-black border-b-2 border-black pb-1.5' : 'text-neutral-400 hover:text-black pb-1.5'
            }`}
          >
            Absences
          </button>
          <button
            onClick={() => setActiveTab('finances')}
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors outline-none border-none bg-transparent cursor-pointer ${
              activeTab === 'finances' ? 'text-black border-b-2 border-black pb-1.5' : 'text-neutral-400 hover:text-black pb-1.5'
            }`}
          >
            Finances
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors outline-none border-none bg-transparent cursor-pointer ${
              activeTab === 'docs' ? 'text-black border-b-2 border-black pb-1.5' : 'text-neutral-400 hover:text-black pb-1.5'
            }`}
          >
            Documents
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 bg-white min-h-[300px]">
          {activeTab === 'info' && (
            <div className="space-y-6">
              
              {/* Civil Identity Details */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                  Identity Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 bg-[#f9f9f9] p-5 rounded-xl border border-[#e5e7eb]">
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Last Name</div>
                    <div className="text-xs font-semibold text-neutral-800 capitalize">{student.nom}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">First Name</div>
                    <div className="text-xs font-semibold text-neutral-800 capitalize">{student.prenom}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Gender</div>
                    <div className="text-xs font-semibold text-neutral-800">{student.sexe || 'N/A'}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Birth Date</div>
                    <div className="text-xs font-semibold text-neutral-800">{student.date_naissance ? student.date_naissance.substring(0, 10) : 'N/A'}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Home Address</div>
                    <div className="text-xs font-semibold text-neutral-800">Casablanca, Morocco</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Email</div>
                    <div className="text-xs font-semibold text-neutral-800">{student.email || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Legal Guardian Contact */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                  Legal Guardian / Parent Info
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 bg-[#f9f9f9] p-5 rounded-xl border border-[#e5e7eb]">
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Guardian Name</div>
                    <div className="text-xs font-semibold text-neutral-800">{student.parent_contact?.nom || 'N/A'}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Relation</div>
                    <div className="text-xs font-semibold text-neutral-800">{student.parent_contact?.relation || 'N/A'}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Phone Number</div>
                    <div className="text-xs font-semibold text-neutral-800">{student.parent_contact?.telephone || 'N/A'}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Email</div>
                    <div className="text-xs font-semibold text-neutral-800">{student.parent_contact?.email || 'N/A'}</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                Academic Folders & Schooling
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 bg-[#f9f9f9] p-5 rounded-xl border border-[#e5e7eb]">
                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Section</div>
                  <div className="text-xs font-semibold text-neutral-800">{sectionName}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Class Enrollment</div>
                  <div className="text-xs font-semibold text-neutral-800">{studentClassNom}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Previous Schooling</div>
                  <div className="text-xs font-semibold text-neutral-800">{student.scolarite_anterieure || 'N/A'}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Academic Year</div>
                  <div className="text-xs font-semibold text-neutral-800">2025/2026</div>
                </div>
              </div>
              <div className="p-4 border border-[#e5e7eb] rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Cumulative GPA (Current Term)</span>
                <span className="text-sm font-black text-neutral-900 bg-neutral-50 px-3 py-1 rounded-lg border border-[#e5e7eb]">
                  15.42 / 20
                </span>
              </div>
            </div>
          )}

          {activeTab === 'absences' && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                Absences Log (Current Term)
              </h4>
              <div className="p-5 border border-[#e5e7eb] rounded-xl space-y-3 bg-[#f9f9f9]">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-neutral-500 uppercase tracking-wider text-[9px]">Excused Absences</span>
                  <span className="text-neutral-900 bg-white px-2.5 py-0.5 rounded border border-[#e5e7eb]">2 Hours</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-neutral-500 uppercase tracking-wider text-[9px]">Unexcused Absences</span>
                  <span className="text-red-650 bg-red-50/50 px-2.5 py-0.5 rounded border border-red-100 font-bold">0 Hours</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finances' && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                Tuition & Collections Status
              </h4>
              <div className="p-5 border border-[#e5e7eb] rounded-xl space-y-3 bg-[#f9f9f9]">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-500">Annual Tuition Balance</span>
                  <span className="text-neutral-900 font-bold">45,000 MAD</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-500">Total Paid (to date)</span>
                  <span className="text-emerald-700 font-bold">30,000 MAD</span>
                </div>
                <div className="flex justify-between text-xs font-semibold border-t border-[#e5e7eb] pt-3">
                  <span className="text-neutral-900 font-black">Remaining Balance Due</span>
                  <span className="text-red-650 font-black text-sm bg-white px-3 py-0.5 rounded border border-[#e5e7eb]">
                    15,000 MAD
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                Verification of Dossier Documents
              </h4>
              <div className="space-y-3 bg-[#f9f9f9] p-5 rounded-xl border border-[#e5e7eb]">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                  <span>Birth Certificate</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold">Verified</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                  <span>Previous Transcript Report</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold">Verified</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                  <span>Passport Photos (x4)</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold">Verified</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </Card>
    </div>
  )
}

export default StudentDetailsPage
