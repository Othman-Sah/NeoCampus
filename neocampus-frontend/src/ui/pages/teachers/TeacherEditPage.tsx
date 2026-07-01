import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTeacher } from '@/application/useCases/useTeacher'
import { useClass } from '@/application/useCases/useClass'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { ArrowLeft, DollarSign, Loader2 } from 'lucide-react'

const teacherFormSchema = zod.object({
  nom: zod.string().min(2, 'Last name must be at least 2 characters'),
  prenom: zod.string().min(2, 'First name must be at least 2 characters'),
  email: zod.string().email('Invalid email address'),
  password: zod.string().optional(),
  password_confirmation: zod.string().optional(),
  specialite: zod.string().min(1, 'Principal subject is required'),
  salaire_de_base: zod.string().min(1, 'Base salary is required'),
  classes: zod.array(zod.string()).optional(),
  avatar: zod.string().optional(),
}).refine((data) => {
  if (data.password || data.password_confirmation) {
    return data.password === data.password_confirmation;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
})

type TeacherFormValues = zod.infer<typeof teacherFormSchema>

export const TeacherEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const teacherId = parseInt(id || '0')

  const { useTeacherDetails, updateTeacher, subjects, revealPassword, uploadAvatar } = useTeacher()
  const { data: teacher, isLoading: loadingDetails } = useTeacherDetails(teacherId)
  const { classes } = useClass()

  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Reveal and Reset password state
  const [revealModalOpen, setRevealModalOpen] = React.useState(false)
  const [adminPasswordInput, setAdminPasswordInput] = React.useState('')
  const [revealedPassword, setRevealedPassword] = React.useState<string | null>(null)
  const [revealError, setRevealError] = React.useState<string | null>(null)
  const [confirmAction, setConfirmAction] = React.useState<'reveal' | 'reset-password' | null>(null)
  const [pendingFormValues, setPendingFormValues] = React.useState<TeacherFormValues | null>(null)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      password_confirmation: '',
      specialite: '',
      salaire_de_base: '0',
      classes: [],
      avatar: '',
    }
  })

  useEffect(() => {
    register('avatar')
  }, [register])

  // Prefill form when data is loaded
  useEffect(() => {
    if (teacher) {
      reset({
        nom: teacher.user?.nom || '',
        prenom: teacher.user?.prenom || '',
        email: teacher.user?.email || '',
        password: '',
        password_confirmation: '',
        specialite: teacher.specialite,
        salaire_de_base: (teacher.salaire_de_base || 0).toString(),
        classes: teacher.classes?.map(c => c.classe_id.toString()) || [],
        avatar: teacher.user?.avatar || '',
      })
      if (teacher.user?.avatar) {
        setAvatarPreview(teacher.user.avatar)
      }
    }
  }, [teacher, reset])

  const selectedClasses = watch('classes') || []

  const handleClassCheckboxChange = (classId: string, checked: boolean) => {
    const current = [...selectedClasses]
    if (checked) {
      current.push(classId)
    } else {
      const idx = current.indexOf(classId)
      if (idx !== -1) current.splice(idx, 1)
    }
    setValue('classes', current)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Show local preview immediately
      const localUrl = URL.createObjectURL(file)
      setAvatarPreview(localUrl)
    }
  }

  const handleRevealConfirm = async () => {
    setRevealError(null)
    try {
      if (confirmAction === 'reveal') {
        const pwd = await revealPassword(teacherId, adminPasswordInput)
        setRevealedPassword(pwd)
        setAdminPasswordInput('')
      } else if (confirmAction === 'reset-password') {
        // Verify the admin password by calling revealPassword (which validates admin credentials)
        await revealPassword(teacherId, adminPasswordInput)
        
        // Admin verified! Now perform the update with pending values
        if (pendingFormValues) {
          await updateTeacher({
            id: teacherId,
            data: {
              nom: pendingFormValues.nom,
              prenom: pendingFormValues.prenom,
              email: pendingFormValues.email,
              password: pendingFormValues.password || undefined,
              specialite: pendingFormValues.specialite,
              salaire_de_base: parseFloat(pendingFormValues.salaire_de_base),
              classes: pendingFormValues.classes?.map(id => parseInt(id)) || [],
            }
          })
          // Upload avatar separately if a file was selected
          if (selectedFile) {
            await uploadAvatar(teacherId, selectedFile)
            setSelectedFile(null)
          }
        }
        
        handleRevealClose()
        navigate('/admin/teachers')
      }
    } catch (err: any) {
      setRevealError(err.response?.data?.message || err.message || 'Invalid administrator password.')
    }
  }

  const handleRevealClose = () => {
    setRevealModalOpen(false)
    setRevealedPassword(null)
    setAdminPasswordInput('')
    setRevealError(null)
    setConfirmAction(null)
    setPendingFormValues(null)
  }

  const onSubmit = async (values: TeacherFormValues) => {
    if (values.password && values.password.trim() !== '') {
      // Password change requested: prompt admin password confirmation first
      setPendingFormValues(values)
      setConfirmAction('reset-password')
      setRevealModalOpen(true)
    } else {
      // Normal update profile changes
      try {
        await updateTeacher({
          id: teacherId,
          data: {
            nom: values.nom,
            prenom: values.prenom,
            email: values.email,
            password: undefined,
            specialite: values.specialite,
            salaire_de_base: parseFloat(values.salaire_de_base),
            classes: values.classes?.map(id => parseInt(id)) || [],
          }
        })
        // Upload avatar separately if a new file was selected
        if (selectedFile) {
          await uploadAvatar(teacherId, selectedFile)
          setSelectedFile(null)
        }
        navigate('/admin/teachers')
      } catch (err) {
        console.error('Failed to update teacher', err)
      }
    }
  }


  if (loadingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-500 text-xs font-bold uppercase tracking-widest">
        <Loader2 className="animate-spin h-6 w-6 border-b-2 border-black mb-4 text-black" />
        Loading Teacher Details...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900 pb-12">
      {/* Header and Back Button */}
      <div className="flex items-center gap-3">
        <Link 
          to="/admin/teachers"
          className="w-9 h-9 border border-[#E5E7EB] hover:bg-neutral-50 rounded-lg flex items-center justify-center text-neutral-500 hover:text-black transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900">
            Edit Teacher Profile
          </h1>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
            Modify credentials, assign or unassign classes, and adjust monthly base salary
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Profile Photo & Salary Details */}
        <div className="space-y-6">
          <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-6 text-center space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 text-left border-b border-neutral-50 pb-2">
                1. Profile Picture
              </h3>

              {/* Selected Avatar Preview */}
              <div className="flex justify-center">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Teacher Profile" 
                    className="w-24 h-24 rounded-full object-cover shadow-md border border-neutral-200" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-black uppercase shadow-md bg-neutral-950">
                    {teacher?.user?.nom?.charAt(0)}{teacher?.user?.prenom?.charAt(0)}
                  </div>
                )}
              </div>

              {/* Upload Input trigger */}
              <div className="space-y-2">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full bg-white border border-[#E5E7EB] hover:bg-neutral-50 text-neutral-800 font-bold text-xs h-9 rounded-lg cursor-pointer"
                >
                  Upload Photo
                </Button>
                <p className="text-[9px] text-neutral-450 font-medium">PNG, JPG or GIF up to 5MB</p>
              </div>
            </CardContent>
          </Card>

          {/* Salary Settings Card */}
          <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 border-b border-neutral-50 pb-2 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-neutral-500" />
                2. Salary Settings
              </h3>

              <div className="space-y-1">
                <Label htmlFor="salaire_de_base" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">
                  Base Salary (DH)
                </Label>
                <div className="relative">
                  <Input 
                    id="salaire_de_base"
                    type="number"
                    placeholder="e.g. 7500"
                    className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black pl-8"
                    {...register('salaire_de_base')}
                  />
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-neutral-450">DH</div>
                </div>
                {errors.salaire_de_base && <span className="text-[10px] text-red-500 font-bold">{errors.salaire_de_base.message}</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Credentials & Class Assignments (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 border-b border-neutral-50 pb-2">
                3. Personal Credentials & Class Assignments
              </h3>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1">
                  <Label htmlFor="prenom" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">First Name</Label>
                  <Input 
                    id="prenom"
                    placeholder="First Name"
                    className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                    {...register('prenom')}
                  />
                  {errors.prenom && <span className="text-[10px] text-red-500 font-bold">{errors.prenom.message}</span>}
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <Label htmlFor="nom" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">Last Name</Label>
                  <Input 
                    id="nom"
                    placeholder="Last Name"
                    className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                    {...register('nom')}
                  />
                  {errors.nom && <span className="text-[10px] text-red-500 font-bold">{errors.nom.message}</span>}
                </div>

                {/* Email Address */}
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="email" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="name.surname@neocampus.com"
                    className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                    {...register('email')}
                  />
                  {errors.email && <span className="text-[10px] text-red-500 font-bold">{errors.email.message}</span>}
                </div>

                {/* Password Fields */}
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">New Password (Optional)</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="Leave blank to keep current"
                    className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                    {...register('password')}
                  />
                  {errors.password && <span className="text-[10px] text-red-500 font-bold">{errors.password.message}</span>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password_confirmation" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">Confirm New Password</Label>
                  <Input 
                    id="password_confirmation"
                    type="password"
                    placeholder="Retype new password"
                    className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                    {...register('password_confirmation')}
                  />
                  {errors.password_confirmation && <span className="text-[10px] text-red-500 font-bold">{errors.password_confirmation.message}</span>}
                </div>

                {/* Reveal current password secure button */}
                <div className="md:col-span-2 pt-1 pb-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setConfirmAction('reveal')
                      setRevealModalOpen(true)
                    }}
                    className="bg-neutral-950 hover:bg-neutral-850 text-[#d0f137] font-bold text-[10px] uppercase tracking-wider h-8 px-4 rounded-lg border-none cursor-pointer flex items-center gap-1.5"
                  >
                    Reveal Saved Password
                  </Button>
                </div>

                {/* Subject Specialty */}
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="specialite" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">Principal Specialty / Subject</Label>
                  <select
                    id="specialite"
                    className="w-full bg-white border border-[#E5E7EB] text-neutral-900 rounded-lg h-9 text-xs px-2.5 outline-none focus:border-black"
                    {...register('specialite')}
                  >
                    <option value="">Choose a subject...</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.nom}>{s.nom}</option>
                    ))}
                  </select>
                  {errors.specialite && <span className="text-[10px] text-red-500 font-bold">{errors.specialite.message}</span>}
                </div>
              </div>

              {/* Class Checklist */}
              <div className="space-y-2">
                <Label className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">Assign Classes</Label>
                <div className="border border-neutral-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-50/50 max-h-56 overflow-y-auto">
                  {classes.map((c) => {
                    const isChecked = selectedClasses.includes(c.id.toString())
                    return (
                      <div key={c.id} className="flex items-center space-x-2.5">
                        <Checkbox 
                          id={`class-chk-${c.id}`} 
                          checked={isChecked}
                          onCheckedChange={(checked) => handleClassCheckboxChange(c.id.toString(), checked === true)}
                        />
                        <label 
                          htmlFor={`class-chk-${c.id}`} 
                          className="text-xs font-semibold text-neutral-700 uppercase cursor-pointer select-none"
                        >
                          {c.nom} ({c.niveau})
                        </label>
                      </div>
                    )
                  })}
                  {classes.length === 0 && (
                    <span className="text-[10px] font-bold text-neutral-450 italic">No classes available to assign</span>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Action Row */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/teachers')}
              className="bg-white border border-[#E5E7EB] hover:bg-neutral-50 text-black font-bold text-xs h-9 rounded-lg cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black hover:bg-neutral-800 text-white font-bold text-xs h-9 rounded-lg border-none cursor-pointer flex items-center justify-center min-w-32"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

      </form>

      {/* Reveal Password Dialog */}
      <Dialog open={revealModalOpen} onOpenChange={(open) => !open && handleRevealClose()}>
        <DialogContent className="bg-white max-w-sm rounded-2xl p-6 text-neutral-900 border border-neutral-100 shadow-xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-sm font-black uppercase tracking-wider text-neutral-900">
              {confirmAction === 'reveal' ? 'Confirm Admin Credentials' : 'Authorize Password Reset'}
            </DialogTitle>
            <p className="text-[10px] text-neutral-450 uppercase font-bold">
              {confirmAction === 'reveal' 
                ? "Enter your administrator password to reveal this teacher's password" 
                : "Enter your administrator password to authorize resetting this teacher's credentials"}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {revealedPassword ? (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-center space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-450 block">Saved Password</span>
                <span className="text-sm font-black text-neutral-900 select-all tracking-wider">{revealedPassword}</span>
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="admin_password" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">
                  Admin Password
                </Label>
                <Input
                  id="admin_password"
                  type="password"
                  placeholder="Enter your password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                />
              </div>
            )}

            {revealError && (
              <p className="text-[10px] text-red-500 font-bold uppercase">{revealError}</p>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              onClick={handleRevealClose}
              variant="outline"
              className="bg-white border border-[#E5E7EB] text-black font-bold text-xs h-9 rounded-lg cursor-pointer flex-1"
            >
              Cancel
            </Button>
            {!revealedPassword && (
              <Button
                type="button"
                onClick={handleRevealConfirm}
                className="bg-black hover:bg-neutral-800 text-white font-bold text-xs h-9 rounded-lg border-none cursor-pointer flex-1"
              >
                Confirm
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default TeacherEditPage;
