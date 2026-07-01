import React, { useState } from 'react'
import { useSalary } from '@/application/useCases/useSalary'
import { useTeacher } from '@/application/useCases/useTeacher'
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
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  FilterX, 
  CheckCircle2, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'

const salaryFormSchema = zod.object({
  enseignant_id: zod.string().min(1, 'Teacher is required'),
  mois: zod.string().regex(/^\d{4}-\d{2}$/, 'Format must be YYYY-MM (e.g. 2026-06)'),
  salaire_de_base: zod.string().min(1, 'Base salary is required'),
  primes: zod.string().optional(),
  indemnites: zod.string().optional(),
  retenues: zod.string().optional(),
  statut: zod.string().min(1, 'Status is required'),
  notes: zod.string().optional(),
})

type SalaryFormValues = zod.infer<typeof salaryFormSchema>

export const ComptableSalaryPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-06')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingSalaryId, setEditingSalaryId] = useState<number | null>(null)

  const filters: Record<string, string> = {}
  if (selectedMonth) filters.mois = selectedMonth
  if (selectedStatus) filters.statut = selectedStatus

  const { salaries, createSalary, updateSalary, deleteSalary } = useSalary(filters)
  const { teachers } = useTeacher()

  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: {
      enseignant_id: '',
      mois: '2026-06',
      salaire_de_base: '',
      primes: '0',
      indemnites: '0',
      retenues: '0',
      statut: 'Draft',
      notes: '',
    }
  })

  const selectedTeacherId = watch('enseignant_id')

  React.useEffect(() => {
    if (selectedTeacherId && !editingSalaryId) {
      const teacher = teachers.find(t => t.id.toString() === selectedTeacherId)
      if (teacher && teacher.salaire_de_base !== undefined) {
        setValue('salaire_de_base', teacher.salaire_de_base.toString())
      }
    }
  }, [selectedTeacherId, teachers, editingSalaryId, setValue])

  const totalPayroll = salaries.reduce((sum, s) => sum + s.salaire_net, 0)
  const totalPaid = salaries.filter(s => s.statut === 'Paid').reduce((sum, s) => sum + s.salaire_net, 0)
  const totalPending = salaries.filter(s => s.statut === 'Draft').reduce((sum, s) => sum + s.salaire_net, 0)
  const totalPrimes = salaries.reduce((sum, s) => sum + s.primes, 0)

  const onSubmit = async (values: SalaryFormValues) => {
    setApiError(null)
    try {
      const dataPayload = {
        enseignant_id: parseInt(values.enseignant_id),
        mois: values.mois,
        salaire_de_base: parseFloat(values.salaire_de_base),
        primes: parseFloat(values.primes || '0'),
        indemnites: parseFloat(values.indemnites || '0'),
        retenues: parseFloat(values.retenues || '0'),
        statut: values.statut as 'Draft' | 'Paid',
        notes: values.notes || '',
        date_paiement: values.statut === 'Paid' ? new Date().toISOString().split('T')[0] : null,
      }

      if (editingSalaryId) {
        await updateSalary({ id: editingSalaryId, data: dataPayload })
      } else {
        await createSalary(dataPayload)
      }

      setDrawerOpen(false)
      setEditingSalaryId(null)
      reset()
    } catch (err: any) {
      console.error('Failed to save salary record', err)
      const msg = err.response?.data?.message || err.message || 'Server error occurred.'
      setApiError(msg)
    }
  }

  const handleEdit = (id: number) => {
    const s = salaries.find(item => item.id === id)
    if (s) {
      setEditingSalaryId(id)
      reset({
        enseignant_id: s.enseignant_id.toString(),
        mois: s.mois,
        salaire_de_base: s.salaire_de_base.toString(),
        primes: s.primes.toString(),
        indemnites: s.indemnites.toString(),
        retenues: s.retenues.toString(),
        statut: s.statut,
        notes: s.notes || '',
      })
      setDrawerOpen(true)
    }
  }

  const handlePayDirect = async (id: number) => {
    try {
      await updateSalary({
        id,
        data: {
          statut: 'Paid',
          date_paiement: new Date().toISOString().split('T')[0]
        }
      })
    } catch (err) {
      console.error('Failed to validate payout', err)
    }
  }

  const handleNewRecord = () => {
    setEditingSalaryId(null)
    reset({
      enseignant_id: teachers[0]?.id?.toString() || '',
      mois: '2026-06',
      salaire_de_base: '6000',
      primes: '0',
      indemnites: '0',
      retenues: '0',
      statut: 'Draft',
      notes: '',
    })
    setDrawerOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Do you want to delete this payslip record?')) {
      try {
        await deleteSalary(id)
      } catch (err) {
        console.error('Failed to delete salary record', err)
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900">
            Payroll Management
          </h1>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
            Administer teacher salaries, bonuses, allowances, and payment validation states
          </p>
        </div>

        <Button
          onClick={handleNewRecord}
          className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-4 flex items-center shadow-sm border-none cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Payout
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Payroll Total */}
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider leading-none mb-1">
                Total Payroll
              </p>
              <p className="text-xl font-black text-neutral-900 leading-tight">
                {totalPayroll.toLocaleString('en-US')} DH
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Paid */}
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#d0f137]/10 border border-[#d0f137]/20 flex items-center justify-center text-black">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider leading-none mb-1">
                Paid Payroll
              </p>
              <p className="text-xl font-black text-[#d0f137] bg-black px-1.5 py-0.5 rounded leading-tight inline-block">
                {totalPaid.toLocaleString('en-US')} DH
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Pending */}
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider leading-none mb-1">
                Pending Payroll
              </p>
              <p className="text-xl font-black text-red-600 leading-tight">
                {totalPending.toLocaleString('en-US')} DH
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Primes */}
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider leading-none mb-1">
                Cumulative Bonuses
              </p>
              <p className="text-xl font-black text-blue-600 leading-tight">
                {totalPrimes.toLocaleString('en-US')} DH
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full">
            {/* Month selector */}
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider mb-1">Month</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-[#e5e7eb] text-neutral-850 rounded-lg h-9 text-xs px-3 py-1 outline-none min-w-36 focus:border-black"
              >
                <option value="2026-06">June 2026</option>
                <option value="2026-05">May 2026</option>
                <option value="2026-04">April 2026</option>
              </select>
            </div>

            {/* Status selector */}
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider mb-1">Status</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white border border-[#e5e7eb] text-neutral-850 rounded-lg h-9 text-xs px-3 py-1 outline-none min-w-36 focus:border-black"
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            {(selectedMonth !== '2026-06' || selectedStatus) && (
              <div className="flex items-end h-full pt-4">
                <Button
                  onClick={() => { setSelectedMonth('2026-06'); setSelectedStatus(''); }}
                  variant="ghost"
                  className="h-9 px-3 text-neutral-500 hover:text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer"
                >
                  <FilterX className="h-4 w-4 mr-1.5" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Salary Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#f9f9f9]">
            <TableRow className="border-b border-[#e5e7eb] hover:bg-transparent">
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10 pl-4">Teacher</TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10">Month</TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10">Base Salary</TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10">Bonuses</TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10">Net Salary</TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10">Status</TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaries.length > 0 ? (
              salaries.map((s) => (
                <TableRow key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50/20">
                  <TableCell className="py-3 pl-4">
                    <div className="text-left">
                      <p className="text-xs font-extrabold text-neutral-850 uppercase leading-none mb-1">
                        {s.enseignant?.prenom} {s.enseignant?.nom}
                      </p>
                      <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none">
                        {s.enseignant?.specialite || 'Teacher'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-semibold text-neutral-500 uppercase">
                    {s.mois}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-bold text-neutral-800">
                    {s.salaire_de_base.toLocaleString('en-US')} DH
                  </TableCell>
                  <TableCell className="py-3 text-xs font-bold text-blue-600">
                    +{s.primes.toLocaleString('en-US')} DH
                  </TableCell>
                  <TableCell className="py-3 text-xs font-black text-neutral-900">
                    {s.salaire_net.toLocaleString('en-US')} DH
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge 
                      className={`text-[9px] font-black uppercase tracking-wider rounded border-none px-2 py-0.5 ${
                        s.statut === 'Paid' 
                          ? 'bg-green-50 text-green-700 hover:bg-green-50' 
                          : 'bg-yellow-50 text-yellow-750 hover:bg-yellow-50'
                      }`}
                    >
                      {s.statut === 'Paid' ? 'Paid' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-right pr-4">
                    <div className="flex justify-end gap-1">
                      {s.statut === 'Draft' && (
                        <Button
                          onClick={() => handlePayDirect(s.id)}
                          variant="ghost"
                          title="Validate Payout"
                          className="h-8 w-8 p-0 hover:bg-green-50 rounded-lg cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleEdit(s.id)}
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-neutral-50 rounded-lg cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4 text-neutral-500" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(s.id)}
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-neutral-450 text-xs font-bold uppercase tracking-wider">
                  No payout records found for this period
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Slide Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="bg-white border-l border-neutral-100 w-full sm:max-w-md p-6 flex flex-col text-neutral-900">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base font-bold uppercase tracking-wider text-neutral-900">
              {editingSalaryId ? 'Edit Payslip Record' : 'Record Payout'}
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-450">
              Enter base salary, monthly bonuses, deductions and validate payment status.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Teacher selector */}
              <div className="space-y-1">
                <Label htmlFor="enseignant_id" className="text-xs font-bold uppercase text-neutral-600">Teacher</Label>
                <select
                  id="enseignant_id"
                  disabled={!!editingSalaryId}
                  className="w-full bg-white border border-[#E5E7EB] text-neutral-900 rounded-lg h-9 text-xs px-2.5 outline-none focus:border-black"
                  {...register('enseignant_id')}
                >
                  <option value="">Select teacher...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.user?.prenom} {t.user?.nom} ({t.specialite})</option>
                  ))}
                </select>
                {errors.enseignant_id && <span className="text-[10px] text-red-500 font-bold">{errors.enseignant_id.message}</span>}
              </div>

              {/* Month field */}
              <div className="space-y-1">
                <Label htmlFor="mois" className="text-xs font-bold uppercase text-neutral-600">Month (YYYY-MM)</Label>
                <Input 
                  id="mois"
                  placeholder="e.g. 2026-06"
                  className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                  {...register('mois')}
                />
                {errors.mois && <span className="text-[10px] text-red-500 font-bold">{errors.mois.message}</span>}
              </div>

              {/* Salaire de base */}
              <div className="space-y-1">
                <Label htmlFor="salaire_de_base" className="text-xs font-bold uppercase text-neutral-600">Base Salary (DH)</Label>
                <Input 
                  id="salaire_de_base"
                  type="number"
                  placeholder="e.g. 7000"
                  className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                  {...register('salaire_de_base')}
                />
                {errors.salaire_de_base && <span className="text-[10px] text-red-500 font-bold">{errors.salaire_de_base.message}</span>}
              </div>

              {/* Primes */}
              <div className="space-y-1">
                <Label htmlFor="primes" className="text-xs font-bold uppercase text-neutral-600">Bonuses / Primes (DH)</Label>
                <Input 
                  id="primes"
                  type="number"
                  placeholder="e.g. 500"
                  className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                  {...register('primes')}
                />
              </div>

              {/* Indemnités */}
              <div className="space-y-1">
                <Label htmlFor="indemnites" className="text-xs font-bold uppercase text-neutral-600">Allowances (DH)</Label>
                <Input 
                  id="indemnites"
                  type="number"
                  placeholder="e.g. 200"
                  className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                  {...register('indemnites')}
                />
              </div>

              {/* Retenues */}
              <div className="space-y-1">
                <Label htmlFor="retenues" className="text-xs font-bold uppercase text-neutral-600">Deductions / Taxes (DH)</Label>
                <Input 
                  id="retenues"
                  type="number"
                  placeholder="e.g. 100"
                  className="bg-white border border-[#E5E7EB] text-neutral-900 h-9 text-xs focus-visible:ring-1 focus-visible:ring-black"
                  {...register('retenues')}
                />
              </div>

              {/* Payout Status selector */}
              <div className="space-y-1">
                <Label htmlFor="statut" className="text-xs font-bold uppercase text-neutral-600">Payment Status</Label>
                <select
                  id="statut"
                  className="w-full bg-white border border-[#E5E7EB] text-neutral-900 rounded-lg h-9 text-xs px-2.5 outline-none focus:border-black"
                  {...register('statut')}
                >
                  <option value="Draft">Draft</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {/* Comments / Notes */}
              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs font-bold uppercase text-neutral-600">Comptroller's Comments / Notes</Label>
                <textarea
                  id="notes"
                  placeholder="Explain any adjustments, bonuses, or deductions..."
                  className="w-full bg-white border border-[#E5E7EB] text-neutral-900 rounded-lg h-20 text-xs p-2.5 outline-none focus:border-black resize-none"
                  {...register('notes')}
                />
              </div>

              {apiError && (
                <div className="p-2.5 bg-red-50 border border-red-150 text-red-650 text-[10px] font-bold rounded-lg text-left">
                  {apiError}
                </div>
              )}

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
                className="bg-black hover:bg-neutral-800 text-white font-bold text-xs h-9 rounded-lg border-none cursor-pointer flex items-center justify-center min-w-24"
              >
                Save Record
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

    </div>
  )
}

export default ComptableSalaryPage;
