import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import { ArrowLeft, DollarSign } from 'lucide-react'

const teacherFormSchema = zod.object({
  nom: zod.string().min(2, 'Last name must be at least 2 characters'),
  prenom: zod.string().min(2, 'First name must be at least 2 characters'),
  email: zod.string().email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
  password_confirmation: zod.string().min(6, 'Password confirmation must be at least 6 characters'),
  specialite: zod.string().min(1, 'Principal subject is required'),
  salaire_de_base: zod.string().min(1, 'Base salary is required'),
  classes: zod.array(zod.string()).optional(),
  avatar: zod.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
})

type TeacherFormValues = zod.infer<typeof teacherFormSchema>

export const TeacherCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const { createTeacher, subjects, uploadAvatar } = useTeacher()
  const { classes } = useClass()

  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      password_confirmation: '',
      specialite: '',
      salaire_de_base: '6000',
      classes: [],
      avatar: '',
    }
  })

  React.useEffect(() => {
    register('avatar')
  }, [register])

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

  const onSubmit = async (values: TeacherFormValues) => {
    try {
      const newTeacher = await createTeacher({
        nom: values.nom,
        prenom: values.prenom,
        email: values.email,
        password: values.password,
        specialite: values.specialite,
        salaire_de_base: parseFloat(values.salaire_de_base),
        classes: values.classes?.map(id => parseInt(id)) || [],
      })
      // Upload avatar if a file was selected
      if (selectedFile && newTeacher?.id) {
        await uploadAvatar(newTeacher.id, selectedFile)
      }
      navigate('/admin/teachers')
    } catch (err) {
      console.error('Failed to create teacher', err)
    }
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
            Create Teacher Profile
          </h1>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
            Add a new teacher, assign classes, and set their base monthly salary
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
                    alt="Teacher Preview" 
                    className="w-24 h-24 rounded-full object-cover shadow-md border border-neutral-200" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-black uppercase shadow-md bg-neutral-950">
                    T
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

                {/* Password */}
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="Min 6 characters"
                    className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                    {...register('password')}
                  />
                  {errors.password && <span className="text-[10px] text-red-500 font-bold">{errors.password.message}</span>}
                </div>

                {/* Retype Password */}
                <div className="space-y-1">
                  <Label htmlFor="password_confirmation" className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">Retype Password</Label>
                  <Input 
                    id="password_confirmation"
                    type="password"
                    placeholder="Retype password"
                    className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                    {...register('password_confirmation')}
                  />
                  {errors.password_confirmation && <span className="text-[10px] text-red-500 font-bold">{errors.password_confirmation.message}</span>}
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
              {isSubmitting ? 'Creating...' : 'Create Teacher'}
            </Button>
          </div>
        </div>

      </form>

    </div>
  )
}

export default TeacherCreatePage;
