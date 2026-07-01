import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClass } from '@/application/useCases/useClass'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  GraduationCap, 
  Users, 
  BookMarked,
  ChevronRight,
  FolderOpen
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'

const classFormSchema = zod.object({
  nom: zod.string().min(2, 'Class name must be at least 2 characters'),
  niveau: zod.string().min(1, 'Level is required'),
  section_id: zod.string().min(1, 'Section is required'),
  annee_scolaire_id: zod.string().min(1, 'Academic year is required'),
})

type ClassFormValues = zod.infer<typeof classFormSchema>

export const ClassesPage: React.FC = () => {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { classes, sections, years, createClass, creatingClass } = useClass()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      nom: '',
      niveau: '',
      section_id: '',
      annee_scolaire_id: '',
    }
  })

  const onSubmit = async (values: ClassFormValues) => {
    try {
      await createClass({
        nom: values.nom,
        niveau: values.niveau,
        section_id: parseInt(values.section_id),
        annee_scolaire_id: parseInt(values.annee_scolaire_id),
      })
      reset()
      setDrawerOpen(false)
    } catch (err) {
      console.error('Failed to create class', err)
    }
  }

  const handleCardClick = (classId: number) => {
    navigate(`/admin/classes/${classId}`)
  }

  const getClassesForSection = (sectionId: number) => {
    return classes.filter(c => c.section_id === sectionId)
  }

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900">
            Classes Management
          </h1>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
            Organize study groups, sections, and track overall student distribution
          </p>
        </div>

        <Button
          onClick={() => {
            if (years.length > 0) {
              reset({
                nom: '',
                niveau: '',
                section_id: sections[0]?.id?.toString() || '',
                annee_scolaire_id: years[0]?.id?.toString() || '',
              })
            }
            setDrawerOpen(true)
          }}
          className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-4 flex items-center shadow-sm border-none cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Kanban Board Grid Grouped by Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const sectionClasses = getClassesForSection(section.id)
          return (
            <div key={section.id} className="flex flex-col bg-[#F3F4F6]/50 rounded-2xl p-4 border border-neutral-100 min-h-[60vh]">
              
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d0f137]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                    {section.nom}
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-white text-neutral-500 border border-neutral-200 rounded-full px-2.5 py-0.5 shadow-sm">
                  {sectionClasses.length} class{sectionClasses.length > 1 ? 'es' : 'e'}
                </span>
              </div>

              {/* Class Cards list */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {sectionClasses.length > 0 ? (
                  sectionClasses.map((c) => (
                    <Card 
                      key={c.id} 
                      onClick={() => handleCardClick(c.id)}
                      className="bg-white border border-[#E5E7EB] hover:border-black rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer group"
                    >
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-extrabold text-neutral-900 group-hover:text-black uppercase">
                              {c.nom}
                            </h4>
                            <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wide bg-neutral-50 border border-neutral-100 rounded px-1.5 py-0.5">
                              Level: {c.niveau || 'N/A'}
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-[#d0f137]/20 group-hover:text-black transition">
                            <BookMarked className="h-4 w-4" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-50">
                          {/* Student Counter */}
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-neutral-400" />
                            <div className="text-left">
                              <p className="text-[9px] font-bold text-neutral-450 uppercase leading-none">Students</p>
                              <p className="text-xs font-black text-neutral-800 leading-tight">{c.students_count ?? 0}</p>
                            </div>
                          </div>

                          {/* Teacher Counter */}
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-neutral-400" />
                            <div className="text-left">
                              <p className="text-[9px] font-bold text-neutral-450 uppercase leading-none">Teachers</p>
                              <p className="text-xs font-black text-neutral-800 leading-tight">{c.teachers_count ?? 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* View Action hint */}
                        <div className="flex items-center justify-end text-[10px] font-black uppercase text-neutral-400 group-hover:text-black transition tracking-wider pt-1 leading-none gap-0.5">
                          View details <ChevronRight className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-neutral-200 bg-white text-center">
                    <FolderOpen className="h-8 w-8 text-neutral-350 mb-2.5" />
                    <p className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider">
                      No Classes
                    </p>
                    <p className="text-[9px] font-medium text-neutral-400 mt-0.5">
                      Add a class to start this section
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Drawer Sheet to Add Class */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="bg-white border-l border-neutral-100 w-full sm:max-w-md p-6 flex flex-col text-neutral-900">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base font-bold uppercase tracking-wider text-neutral-900">
              Create Class
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-450">
              Fill in the parameters below to add a class to your organization.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Class Name */}
              <div className="space-y-1">
                <Label htmlFor="nom" className="text-xs font-bold uppercase text-neutral-600">Class Name</Label>
                <Input 
                  id="nom"
                  placeholder="e.g. Grade 6-A, CM2-B"
                  className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black"
                  {...register('nom')}
                />
                {errors.nom && <span className="text-[10px] text-red-500 font-bold">{errors.nom.message}</span>}
              </div>

              {/* Level / Niveau */}
              <div className="space-y-1">
                <Label htmlFor="niveau" className="text-xs font-bold uppercase text-neutral-600">Level (e.g. Grade 6, CM2)</Label>
                <Input 
                  id="niveau"
                  placeholder="e.g. Grade 6, CM2, Lycee"
                  className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black"
                  {...register('niveau')}
                />
                {errors.niveau && <span className="text-[10px] text-red-500 font-bold">{errors.niveau.message}</span>}
              </div>

              {/* Section selector */}
              <div className="space-y-1">
                <Label htmlFor="section_id" className="text-xs font-bold uppercase text-neutral-600">Section</Label>
                <select
                  id="section_id"
                  className="w-full bg-white border border-[#E5E7EB] text-neutral-900 rounded-lg h-9 text-xs px-2.5 outline-none focus:border-black"
                  {...register('section_id')}
                >
                  <option value="">Choose a section...</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
                {errors.section_id && <span className="text-[10px] text-red-500 font-bold">{errors.section_id.message}</span>}
              </div>

              {/* Academic Year selector */}
              <div className="space-y-1">
                <Label htmlFor="annee_scolaire_id" className="text-xs font-bold uppercase text-neutral-600">Academic Year</Label>
                <select
                  id="annee_scolaire_id"
                  className="w-full bg-white border border-[#E5E7EB] text-neutral-900 rounded-lg h-9 text-xs px-2.5 outline-none focus:border-black"
                  {...register('annee_scolaire_id')}
                >
                  <option value="">Choose a year...</option>
                  {years.map(y => (
                    <option key={y.id} value={y.id}>{y.libelle}</option>
                  ))}
                </select>
                {errors.annee_scolaire_id && <span className="text-[10px] text-red-500 font-bold">{errors.annee_scolaire_id.message}</span>}
              </div>

            </div>

            <SheetFooter className="mt-8 border-t border-neutral-50 pt-4 flex sm:justify-end gap-2 shrink-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDrawerOpen(false)}
                className="bg-white border border-[#E5E7EB] hover:bg-neutral-50 text-black font-bold text-xs h-9 rounded-lg cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={creatingClass}
                className="bg-black hover:bg-neutral-800 text-white font-bold text-xs h-9 rounded-lg border-none cursor-pointer flex items-center justify-center min-w-24"
              >
                {creatingClass ? 'Creating...' : 'Create Class'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

    </div>
  )
}

export default ClassesPage
