import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter 
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Student } from '@/domain/ports/IStudentService'
import { Loader2, ArrowLeft, ArrowRight, UserPlus, Save } from 'lucide-react'

// Leniency schema to prevent blocking the form when leaving optional fields blank
const parentSchema = z.object({
  nom: z.string().optional().or(z.literal('')),
  relation: z.string().optional().or(z.literal('')),
  telephone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
})

const studentSchema = z.object({
  nom: z.string().min(1, 'Last Name is required'),
  prenom: z.string().min(1, 'First Name is required'),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  matricule: z.string().min(1, 'Matricule is required'),
  sexe: z.enum(['Male', 'Female', 'Other']),
  date_naissance: z.string().min(1, 'Birth Date is required'),
  classe_id: z.string().min(1, 'Class selection is required'),
  status: z.enum(['Active', 'Suspended']),
  scolarite_anterieure: z.string().optional().or(z.literal('')),
  parent_contact: parentSchema.optional(),
})

type StudentFormValues = z.infer<typeof studentSchema>

interface StudentDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Student, 'id' | 'classe_nom' | 'etablissement_id'>) => Promise<void>;
  student?: Student | null;
  saving: boolean;
}

export const StudentDrawer: React.FC<StudentDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  student,
  saving,
}) => {
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      matricule: '',
      sexe: 'Male',
      date_naissance: '',
      classe_id: '',
      status: 'Active',
      scolarite_anterieure: '',
      parent_contact: { nom: '', relation: 'Father', telephone: '', email: '' },
    },
  })

  // Pre-fill form when editing an existing student folder
  useEffect(() => {
    if (student) {
      reset({
        nom: student.nom,
        prenom: student.prenom,
        email: student.email || '',
        matricule: student.matricule,
        sexe: (student.sexe as 'Male' | 'Female' | 'Other') || 'Male',
        date_naissance: student.date_naissance ? student.date_naissance.substring(0, 10) : '',
        classe_id: student.classe_id ? String(student.classe_id) : '',
        status: (student.status as 'Active' | 'Suspended') || 'Active',
        scolarite_anterieure: student.scolarite_anterieure || '',
        parent_contact: {
          nom: student.parent_contact?.nom || '',
          relation: student.parent_contact?.relation || 'Father',
          telephone: student.parent_contact?.telephone || '',
          email: student.parent_contact?.email || '',
        },
      })
      setStep(1)
    } else {
      reset({
        nom: '',
        prenom: '',
        email: '',
        matricule: '',
        sexe: 'Male',
        date_naissance: '',
        classe_id: '',
        status: 'Active',
        scolarite_anterieure: '',
        parent_contact: { nom: '', relation: 'Father', telephone: '', email: '' },
      })
      setStep(1)
    }
  }, [student, reset, open])

  const nextStep = async () => {
    let fieldsToValidate: any[] = []
    if (step === 1) {
      fieldsToValidate = ['nom', 'prenom', 'email', 'matricule', 'sexe', 'date_naissance']
    } else if (step === 2) {
      fieldsToValidate = ['classe_id', 'status']
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleFormSubmit = async (values: StudentFormValues) => {
    const formattedData = {
      ...values,
      classe_id: values.classe_id ? parseInt(values.classe_id) : null,
      parent_contact: values.parent_contact || null,
      documents: student?.documents || {
        birth_certificate: true,
        previous_transcript: true,
        photos: true,
      },
    }
    await onSubmit(formattedData)
    onClose()
  }

  const mockClasses = [
    { id: 1, name: 'Grade 6-A' },
    { id: 2, name: 'Grade 5-B' },
    { id: 3, name: 'Grade 3-A' },
    { id: 4, name: 'Grade 6-C' },
    { id: 5, name: 'Grade 5-A' },
  ]

  const currentClassId = watch('classe_id')

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[550px] bg-white border-l border-[#e5e7eb] text-neutral-900 flex flex-col h-full p-0 shadow-xl">
        
        {/* Drawer Header */}
        <SheetHeader className="px-6 py-6 border-b border-[#e5e7eb] shrink-0 bg-[#f9f9f9]">
          <SheetTitle className="text-base font-bold text-neutral-900 uppercase tracking-wider">
            {student ? 'Edit Student Profile' : 'New Enrollment'}
          </SheetTitle>
          <SheetDescription className="text-[11px] text-neutral-400 font-semibold uppercase">
            {student ? 'Modify the selected student folder details' : 'Register and enroll a new student profile'}
          </SheetDescription>

          {/* Steps Progress Stepper (Figma Design Inspired) */}
          <div className="flex items-center justify-between mt-5 relative w-full pt-1.5">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-black -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />

            {[1, 2, 3].map((num) => {
              const active = step >= num
              const current = step === num
              return (
                <div key={num} className="flex flex-col items-center z-10 bg-[#f9f9f9] px-2.5">
                  <div 
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-200 ${
                      current 
                        ? 'bg-black text-white border-black scale-105'
                        : active
                          ? 'bg-neutral-850 text-white border-neutral-850'
                          : 'bg-white text-neutral-400 border-[#e5e7eb]'
                    }`}
                  >
                    {num}
                  </div>
                  <span className={`text-[8.5px] font-black uppercase mt-1 tracking-wider ${
                    current ? 'text-black' : 'text-neutral-400'
                  }`}>
                    {num === 1 ? 'Personal Info' : num === 2 ? 'School Info' : 'Parents & Docs'}
                  </span>
                </div>
              )
            })}
          </div>
        </SheetHeader>

        {/* Drawer Body - Scrollable Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              
              {/* Photo placeholder inspired by Figma */}
              <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
                <div className="size-20 border-2 border-dashed border-[#e5e7eb] rounded-lg bg-[#f9f9f9] flex flex-col items-center justify-center text-[10px] font-bold text-neutral-400 select-none">
                  PHOTO
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-neutral-800">Student Avatar</p>
                  <p className="text-[9px] font-semibold text-neutral-400 uppercase">Optional upload placeholder</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nom" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                    Last Name
                  </Label>
                  <Input 
                    id="nom" 
                    {...register('nom')} 
                    placeholder="e.g. Diallo"
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black" 
                  />
                  {errors.nom && <p className="text-[10px] text-red-500 font-semibold">{errors.nom.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prenom" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                    First Name
                  </Label>
                  <Input 
                    id="prenom" 
                    {...register('prenom')} 
                    placeholder="e.g. Abdoulaye"
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black" 
                  />
                  {errors.prenom && <p className="text-[10px] text-red-500 font-semibold">{errors.prenom.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="matricule" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  Matricule
                </Label>
                <Input 
                  id="matricule" 
                  {...register('matricule')} 
                  placeholder="e.g. MAT-2026-001"
                  className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black" 
                />
                {errors.matricule && <p className="text-[10px] text-red-500 font-semibold">{errors.matricule.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  {...register('email')} 
                  placeholder="e.g. student@neocampus.com"
                  className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black" 
                />
                {errors.email && <p className="text-[10px] text-red-500 font-semibold">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sexe" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                    Gender
                  </Label>
                  <select 
                    id="sexe"
                    {...register('sexe')}
                    className="w-full bg-white border border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 px-3 outline-none cursor-pointer focus:border-black"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date_naissance" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                    Birth Date
                  </Label>
                  <Input 
                    id="date_naissance" 
                    type="date"
                    {...register('date_naissance')} 
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black" 
                  />
                  {errors.date_naissance && <p className="text-[10px] text-red-500 font-semibold">{errors.date_naissance.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: School Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="classe_id" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  Class
                </Label>
                <select 
                  id="classe_id"
                  {...register('classe_id')}
                  className="w-full bg-white border border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 px-3 outline-none cursor-pointer focus:border-black"
                >
                  <option value="">Select class...</option>
                  {mockClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                {errors.classe_id && <p className="text-[10px] text-red-500 font-semibold">{errors.classe_id.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  Section
                </Label>
                <Input 
                  value={
                    currentClassId === '5' 
                      ? 'Primary' 
                      : currentClassId 
                        ? 'College' 
                        : ''
                  }
                  disabled 
                  placeholder="Auto-assigned by class"
                  className="bg-[#f9f9f9] border-[#e5e7eb] text-neutral-400 rounded-lg text-xs h-9 select-none" 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  Status
                </Label>
                <select 
                  id="status"
                  {...register('status')}
                  className="w-full bg-white border border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 px-3 outline-none cursor-pointer focus:border-black"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="scolarite_anterieure" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  Previous Schooling
                </Label>
                <Input 
                  id="scolarite_anterieure" 
                  {...register('scolarite_anterieure')} 
                  placeholder="e.g. Al Jabr School"
                  className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black" 
                />
              </div>
            </div>
          )}

          {/* STEP 3: Parent & Documents */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-4 border-b border-[#e5e7eb] pb-4">
                <h4 className="text-xs font-bold text-black uppercase tracking-wider">
                  Legal Guardian / Parent Info
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="parent_nom" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                      Parent Name
                    </Label>
                    <Input 
                      id="parent_nom" 
                      {...register('parent_contact.nom')} 
                      placeholder="e.g. Hassan Diallo"
                      className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="parent_relation" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                      Relation
                    </Label>
                    <select 
                      id="parent_relation"
                      {...register('parent_contact.relation')}
                      className="w-full bg-white border border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 px-3 outline-none focus:border-black"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="parent_phone" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                      Phone Number
                    </Label>
                    <Input 
                      id="parent_phone" 
                      {...register('parent_contact.telephone')} 
                      placeholder="e.g. +212 600 000 000"
                      className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="parent_email" className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                      Email
                    </Label>
                    <Input 
                      id="parent_email" 
                      type="email"
                      {...register('parent_contact.email')} 
                      placeholder="e.g. parent@email.com"
                      className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black" 
                    />
                    {errors.parent_contact?.email && <p className="text-[10px] text-red-500 font-semibold">{errors.parent_contact.email.message}</p>}
                  </div>
                </div>
              </div>

              {/* Uploads Placeholder */}
              <div className="space-y-3">
                <h4 className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  Dossier Attachments
                </h4>
                <div className="p-4 bg-[#f9f9f9] border border-[#e5e7eb] rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="doc_birth" defaultChecked className="rounded border-[#e5e7eb] bg-white text-black focus:ring-0" />
                    <Label htmlFor="doc_birth" className="text-xs font-bold text-neutral-700 cursor-pointer">
                      Birth Certificate
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="doc_grades" defaultChecked className="rounded border-[#e5e7eb] bg-white text-black focus:ring-0" />
                    <Label htmlFor="doc_grades" className="text-xs font-bold text-neutral-700 cursor-pointer">
                      Previous Transcript Report
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="doc_photos" defaultChecked className="rounded border-[#e5e7eb] bg-white text-black focus:ring-0" />
                    <Label htmlFor="doc_photos" className="text-xs font-bold text-neutral-700 cursor-pointer">
                      Passport Photos (x4)
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Drawer Footer Actions */}
        <SheetFooter className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between shrink-0 bg-[#f9f9f9] gap-4">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="bg-white border border-[#e5e7eb] text-black hover:bg-neutral-50 rounded-lg px-4 py-2 font-bold text-xs cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg px-4 py-2 flex items-center cursor-pointer border-none"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit(handleFormSubmit)}
              disabled={saving}
              className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg px-5 py-2.5 flex items-center cursor-pointer disabled:opacity-50 border-none"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  {student ? <Save className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  {student ? 'Save Changes' : 'Confirm Enrollment'}
                </>
              )}
            </Button>
          )}
        </SheetFooter>

      </SheetContent>
    </Sheet>
  )
}

export default StudentDrawer
