import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useStudent } from '@/application/useCases/useStudent'
import { useTransport } from '@/application/useCases/useTransport'
import { StudentTransportMap } from '@/ui/components/StudentTransportMap'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowLeft, ArrowRight, UserPlus, Check, Upload, X, RefreshCw, Eye, EyeOff, AlertCircle } from 'lucide-react'

const signupSchema = z.object({
  nom: z.string().min(1, 'Last Name is required'),
  prenom: z.string().min(1, 'First Name is required'),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  sexe: z.enum(['Male', 'Female', 'Other']),
  date_naissance: z.string().min(1, 'Birth Date is required'),
  adresse: z.string().optional().or(z.literal('')),
  telephone: z.string().optional().or(z.literal('')),
  parent_nom: z.string().optional().or(z.literal('')),
  parent_relation: z.string().optional().or(z.literal('')),
  parent_phone: z.string().optional().or(z.literal('')),
  parent_email: z.string().email('Invalid email').or(z.literal('')).optional(),
  medical_details: z.string().optional().or(z.literal('')),
  birth_certificate: z.boolean(),
  previous_transcript: z.boolean(),
  photos: z.boolean(),
  classe_id: z.string().min(1, 'Class is required'),
  status: z.enum(['Active', 'Suspended']),
  scolarite_anterieure: z.string().optional().or(z.literal('')),
  password: z.string().max(8, 'Password must be 8 characters max').optional().or(z.literal('')),
})

type SignupFormValues = z.infer<typeof signupSchema>

/** Generate a random 8-character password */
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pwd = ''
  for (let i = 0; i < 8; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

export const StudentCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [errorMsg, setErrorMsg] = useState('')
  const { students, createStudent, creating, uploadAvatar } = useStudent()
  const { saveStudentRoute } = useTransport()

  // Transport states
  const [transportRequired, setTransportRequired] = useState(false)
  const [routeId, setRouteId] = useState<number | null>(null)
  const [pointRamassage, setPointRamassage] = useState('Home Pickup')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Password visibility
  const [showPassword, setShowPassword] = useState(true)

  const mockClasses = React.useMemo(() => {
    const defaultClasses = ['Grade 6-A', 'Grade 5-B', 'Grade 3-A', 'Grade 6-C', 'Grade 5-A']
    const allClassNames = Array.from(new Set([
      ...defaultClasses,
      ...students.map(s => s.classe_nom).filter(Boolean)
    ]))
    return allClassNames.map((name, idx) => ({
      id: idx + 1,
      name
    }))
  }, [students])

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      sexe: 'Male',
      date_naissance: '',
      adresse: '',
      telephone: '',
      parent_nom: '',
      parent_relation: 'Father',
      parent_phone: '',
      parent_email: '',
      medical_details: '',
      birth_certificate: true,
      previous_transcript: true,
      photos: true,
      classe_id: '',
      status: 'Active',
      scolarite_anterieure: '',
      password: generatePassword(),
    },
  })

  const formValues = watch()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const handleGeneratePassword = () => {
    setValue('password', generatePassword())
  }

  const nextStep = async () => {
    let fieldsToValidate: any[] = []
    if (step === 1) {
      fieldsToValidate = ['nom', 'prenom', 'email', 'sexe', 'date_naissance', 'adresse', 'telephone']
    } else if (step === 2) {
      fieldsToValidate = ['parent_nom', 'parent_relation', 'parent_phone', 'parent_email']
    } else if (step === 3) {
      fieldsToValidate = ['medical_details']
    } else if (step === 4) {
      fieldsToValidate = ['birth_certificate', 'previous_transcript', 'photos']
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleFormSubmit = async (values: SignupFormValues) => {
    const selectedClassId = values.classe_id ? parseInt(values.classe_id) : null
    const selectedClassNom = mockClasses.find(c => c.id === selectedClassId)?.name ?? null

    const formattedData = {
      nom: values.nom,
      prenom: values.prenom,
      email: values.email || null,
      sexe: values.sexe,
      date_naissance: values.date_naissance,
      classe_id: selectedClassId,
      classe_nom: selectedClassNom,
      status: values.status,
      scolarite_anterieure: values.scolarite_anterieure || null,
      password: values.password || undefined,
      parent_contact: {
        nom: values.parent_nom || '',
        relation: values.parent_relation || 'Father',
        telephone: values.parent_phone || '',
        email: values.parent_email || '',
      },
      documents: {
        birth_certificate: values.birth_certificate,
        previous_transcript: values.previous_transcript,
        photos: values.photos,
      },
      matricule: '', // Auto-generated by backend
    }

    try {
      setErrorMsg('')
      const newStudent = await createStudent(formattedData)

      // Save notification alert for Comptable/Admin to configure fee profile
      if (newStudent && newStudent.id) {
        const alerts = JSON.parse(localStorage.getItem('neocampus_finance_alerts') || '[]');
        alerts.push({
          id: Date.now(),
          studentId: newStudent.id,
          studentName: `${newStudent.prenom || values.prenom} ${newStudent.nom || values.nom}`,
          className: selectedClassNom || 'N/A',
          message: `New student ${newStudent.prenom || values.prenom} ${newStudent.nom || values.nom} registered. Click here to configure their fee profile.`,
          created_at: new Date().toISOString(),
          read: false
        });
        localStorage.setItem('neocampus_finance_alerts', JSON.stringify(alerts));
      }

      // Save transport assignment if required
      if (newStudent?.id && transportRequired) {
        try {
          await saveStudentRoute({
            studentId: newStudent.id,
            data: {
              itineraire_id: routeId,
              point_ramassage: pointRamassage,
              latitude,
              longitude
            }
          })
        } catch (transportErr) {
          console.warn('Transport assignment failed, but student was created:', transportErr)
        }
      }

      // Upload avatar if a photo was selected
      if (photoFile && newStudent?.id) {
        try {
          await uploadAvatar(newStudent.id, photoFile)
        } catch (avatarErr) {
          console.warn('Avatar upload failed, but student was created:', avatarErr)
        }
      }

      navigate('/admin/students')
    } catch (err: any) {
      console.error('Failed to create student:', err)
      const details = err.response?.data?.message || err.message || ''
      const validationDetails = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : ''
      setErrorMsg(`Failed to create student: ${details}${validationDetails ? ' (' + validationDetails + ')' : ''}`)
    }
  }



  return (
    <div className="space-y-6 animate-fade-in text-neutral-900 pb-12">
      
      {/* Breadcrumbs matching Figma breadcrumbs */}
      <div className="flex gap-2 items-center text-xs text-neutral-400 font-semibold uppercase tracking-wider">
        <Link to="/admin/students" className="hover:text-black transition-colors">
          Students
        </Link>
        <span>/</span>
        <span className="text-black">New Enrollment</span>
      </div>

      {/* Stepper Container matching Figma Step indicator */}
      <div className="flex items-center justify-between max-w-[768px] mx-auto relative pt-4 pb-6">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-black -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${((step - 1) / 4) * 100}%` }}
        />

        {[1, 2, 3, 4, 5].map((num) => {
          const current = step === num
          const completed = step > num
          return (
            <div key={num} className="flex flex-col items-center z-10 bg-[#f9f9f9] px-3 select-none">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-all duration-200 ${
                  current 
                    ? 'bg-black text-white border-black scale-105'
                    : completed
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-400 border-[#e5e7eb]'
                }`}
              >
                {completed ? <Check className="h-4 w-4" /> : num}
              </div>
              <span className={`text-[9px] font-black uppercase mt-1.5 tracking-wider ${
                current ? 'text-black' : 'text-neutral-400'
              }`}>
                {num === 1 ? 'Infos' : num === 2 ? 'Parents' : num === 3 ? 'Medical' : num === 4 ? 'Docs' : 'Confirm'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Form Card Container matching Figma */}
      <Card className="bg-white border border-[#e5e7eb] rounded-xl max-w-[896px] mx-auto shadow-sm">
        <CardContent className="p-8 space-y-6">
          
          {/* Header Title Section */}
          <div className="border-b border-[#e5e7eb] pb-4">
            <h2 className="text-lg font-bold text-neutral-900 uppercase tracking-wider">
              {step === 1 && 'Personal Info'}
              {step === 2 && 'Parent / Legal Guardian'}
              {step === 3 && 'Medical Profile'}
              {step === 4 && 'Dossier Documents'}
              {step === 5 && 'Confirm Enrollment'}
            </h2>
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
              Step {step} of 5 — {step === 5 ? 'Review and submit profile' : 'Please fill all required inputs'}
            </p>
          </div>

          {/* STEP 1: INFOS */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Real Photo Upload Block */}
              <div className="flex items-center gap-5 border-b border-neutral-100 pb-5">
                {/* Avatar preview */}
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="relative size-20 rounded-xl border-2 border-dashed border-[#e5e7eb] bg-[#f9f9f9] overflow-hidden flex flex-col items-center justify-center cursor-pointer group hover:border-black transition-colors"
                >
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="Avatar preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-neutral-300 mb-1 group-hover:text-neutral-500 transition-colors" />
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Photo</span>
                    </>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <p className="text-xs font-bold text-neutral-800">Student Avatar</p>
                  <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
                    JPG, PNG, WebP — max 5 MB
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => photoInputRef.current?.click()}
                      className="h-7 px-3 text-[10px] font-bold border-[#e5e7eb] text-neutral-600 hover:text-black rounded-lg cursor-pointer"
                    >
                      {photoPreview ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {photoPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={removePhoto}
                        className="h-7 px-2 text-[10px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="nom" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Last Name
                  </Label>
                  <Input 
                    id="nom" 
                    {...register('nom')} 
                    placeholder="e.g. Dupont"
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black" 
                  />
                  {errors.nom && <p className="text-[10px] text-red-500 font-semibold">{errors.nom.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prenom" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    First Name
                  </Label>
                  <Input 
                    id="prenom" 
                    {...register('prenom')} 
                    placeholder="e.g. Jean"
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black" 
                  />
                  {errors.prenom && <p className="text-[10px] text-red-500 font-semibold">{errors.prenom.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date_naissance" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Birth Date
                  </Label>
                  <Input 
                    id="date_naissance" 
                    type="date"
                    {...register('date_naissance')} 
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black" 
                  />
                  {errors.date_naissance && <p className="text-[10px] text-red-500 font-semibold">{errors.date_naissance.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sexe" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
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

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="email" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    {...register('email')} 
                    placeholder="e.g. jean.dupont@neocampus.com"
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black" 
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-semibold">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="adresse" className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">
                    Home Address
                  </Label>
                  <Input 
                    id="adresse" 
                    {...register('adresse')} 
                    placeholder="e.g. 123 Rue de l'Ecole, Casablanca"
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black" 
                  />
                </div>

                <div className="md:col-span-2">
                  <StudentTransportMap
                    transportRequired={transportRequired}
                    onChangeTransportRequired={setTransportRequired}
                    routeId={routeId}
                    onChangeRouteId={setRouteId}
                    pointRamassage={pointRamassage}
                    onChangePointRamassage={setPointRamassage}
                    latitude={latitude}
                    longitude={longitude}
                    onChangeCoordinates={(lat, lng) => {
                      setLatitude(lat);
                      setLongitude(lng);
                    }}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="telephone" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Phone Number
                  </Label>
                  <Input 
                    id="telephone" 
                    {...register('telephone')} 
                    placeholder="e.g. +212 600 000 000"
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black" 
                  />
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: PARENTS */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="parent_nom" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Parent / Guardian Full Name
                  </Label>
                  <Input 
                    id="parent_nom" 
                    {...register('parent_nom')} 
                    placeholder="e.g. Robert Dupont"
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="parent_relation" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Relation
                  </Label>
                  <select 
                    id="parent_relation"
                    {...register('parent_relation')}
                    className="w-full bg-white border border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 px-3 outline-none cursor-pointer focus:border-black"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="parent_phone" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Phone Number
                  </Label>
                  <Input 
                    id="parent_phone" 
                    {...register('parent_phone')} 
                    placeholder="e.g. +212 655 555 555"
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black" 
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="parent_email" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Email Address
                  </Label>
                  <Input 
                    id="parent_email" 
                    type="email"
                    {...register('parent_email')} 
                    placeholder="e.g. parent.dupont@example.com"
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black" 
                  />
                  {errors.parent_email && <p className="text-[10px] text-red-500 font-semibold">{errors.parent_email.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MEDICAL */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="medical_details" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Allergies, Medical Notes or Chronic Conditions
                </Label>
                <textarea
                  id="medical_details"
                  rows={4}
                  {...register('medical_details')}
                  placeholder="e.g. Severe peanut allergy. Carries an Epipen."
                  className="w-full bg-white border border-[#e5e7eb] text-neutral-900 rounded-lg text-xs p-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          )}

          {/* STEP 4: DOCS */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500 font-semibold">
                Please check the dossier documents that have been verified and submitted:
              </p>
              <div className="p-4 bg-[#f9f9f9] border border-[#e5e7eb] rounded-xl flex flex-col gap-3.5">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="birth_certificate" {...register('birth_certificate')} className="rounded border-[#e5e7eb] bg-white text-black focus:ring-0" />
                  <Label htmlFor="birth_certificate" className="text-xs font-bold text-neutral-700 cursor-pointer">
                    Birth Certificate
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="previous_transcript" {...register('previous_transcript')} className="rounded border-[#e5e7eb] bg-white text-black focus:ring-0" />
                  <Label htmlFor="previous_transcript" className="text-xs font-bold text-neutral-700 cursor-pointer">
                    Previous Transcript Report
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="photos" {...register('photos')} className="rounded border-[#e5e7eb] bg-white text-black focus:ring-0" />
                  <Label htmlFor="photos" className="text-xs font-bold text-neutral-700 cursor-pointer">
                    Passport Photos (x4)
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRM */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div className="space-y-1.5">
                  <Label htmlFor="classe_id" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Class Enrollment
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
                  <Label htmlFor="status" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Initial Status
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

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="scolarite_anterieure" className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Previous School Name
                  </Label>
                  <Input 
                    id="scolarite_anterieure" 
                    {...register('scolarite_anterieure')} 
                    placeholder="e.g. Al Jabr School"
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black" 
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="border border-[#e5e7eb] rounded-xl p-4 space-y-3 bg-[#fafafa]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-neutral-800">Student Portal Password</p>
                    <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mt-0.5">
                      Max 8 characters — student will use this to log in
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                    className="h-7 px-3 text-[10px] font-bold border-[#e5e7eb] text-neutral-600 hover:text-black rounded-lg cursor-pointer gap-1.5"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    maxLength={8}
                    {...register('password')}
                    className="bg-white border-[#e5e7eb] text-neutral-900 rounded-lg text-xs h-9 focus-visible:ring-1 focus-visible:ring-black font-mono pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-semibold">{errors.password.message}</p>}
                <p className="text-[9px] text-neutral-400 font-medium">
                  This password will be saved and the student can log in with it. You can change it later from the student edit page (admin authentication required).
                </p>
              </div>

              {/* Review summary box */}
              <div className="bg-[#f9f9f9] border border-[#e5e7eb] p-4 rounded-xl space-y-2 text-xs">
                <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[9px] mb-2 text-neutral-400">Review Information Summary</h4>
                <p><span className="text-neutral-500 font-medium">Student Name:</span> <span className="font-bold">{formValues.prenom} {formValues.nom}</span></p>
                <p><span className="text-neutral-500 font-medium">Gender / Birth:</span> <span className="font-bold">{formValues.sexe} (born {formValues.date_naissance})</span></p>
                <p><span className="text-neutral-500 font-medium">Guardian Name:</span> <span className="font-bold">{formValues.parent_nom || 'N/A'} ({formValues.parent_relation})</span></p>
                {photoPreview && (
                  <p><span className="text-neutral-500 font-medium">Avatar:</span> <span className="font-bold text-green-600">✓ Photo selected</span></p>
                )}
              </div>
            </div>
          )}

        </CardContent>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-8 mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-xs font-semibold leading-relaxed">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Footer Actions Container matching Figma */}
        <div className="border-t border-[#e5e7eb] bg-[#f9f9f9] px-8 py-5 flex items-center justify-between rounded-b-xl gap-4">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="bg-white border border-[#e5e7eb] text-black hover:bg-neutral-50 rounded-lg h-9 px-4 font-bold text-xs cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/students')}
              className="text-neutral-500 hover:text-black rounded-lg h-9 text-xs font-bold border-none cursor-pointer"
            >
              Cancel
            </Button>
          )}

          {step < 5 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-5 flex items-center cursor-pointer border-none"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit(handleFormSubmit)}
              disabled={creating}
              className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-6 flex items-center cursor-pointer disabled:opacity-50 border-none"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Confirm Enrollment
                </>
              )}
            </Button>
          )}
        </div>

      </Card>
    </div>
  )
}

export default StudentCreatePage
