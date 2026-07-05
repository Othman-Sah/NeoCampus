import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from '@/application/useCases/useTranslation'
import { useLibrarySettings } from '@/application/useCases/library/useLibrarySettings'
import { LibrarySubNav } from './LibrarySubNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Settings, 
  Sparkles, 
  X, 
  ShieldCheck, 
  HelpCircle
} from 'lucide-react'

const settingsSchema = z.object({
  max_loans_per_member: z.coerce.number().int().min(1, 'Must be at least 1 book'),
  loan_duration_days: z.coerce.number().int().min(1, 'Must be at least 1 day'),
  fine_per_day_mad: z.coerce.number().min(0, 'Must be a positive fine rate value')
})

type SettingsFormData = z.infer<typeof settingsSchema>

export const LibrarySettings: React.FC = () => {
  const { t } = useTranslation()
  const { settings, loading, updateSettings, updating } = useLibrarySettings()

  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      max_loans_per_member: 5,
      loan_duration_days: 14,
      fine_per_day_mad: 5
    }
  })

  // Prefill settings
  useEffect(() => {
    if (settings) {
      setValue('max_loans_per_member', settings.max_loans_per_member)
      setValue('loan_duration_days', settings.loan_duration_days)
      setValue('fine_per_day_mad', settings.fine_per_day_mad)
    }
  }, [settings, setValue])

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateSettings(data)
      setToastMsg({ type: 'success', text: 'Library configuration saved successfully.' })
    } catch (err) {
      setToastMsg({ type: 'error', text: 'Failed to save settings. Please try again.' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-[100] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border animate-bounce ${
          toastMsg.type === 'success' ? 'bg-black text-white border-neutral-850' : 'bg-red-500 text-white border-red-400'
        }`}>
          <Sparkles className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-tight">{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 hover:opacity-85">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
            <Settings className="h-5 w-5 text-neo-accent" />
            {t('library_settings')}
          </h1>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">
            Configure system borrowing policies, loan durations, and overdue fines.
          </p>
        </div>
      </div>

      <LibrarySubNav />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings form container */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-neutral-100 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="text-xs font-black uppercase text-neutral-800 tracking-wider">System Rules & Policies</h2>
            <p className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">These rules apply to all active adherents in this establishment.</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Max Loans */}
              <div className="space-y-1.5">
                <Label htmlFor="max-loans" className="text-[10px] font-black text-neutral-550 uppercase tracking-wider">
                  Max Active Loans per Member
                </Label>
                <Input
                  id="max-loans"
                  type="number"
                  className="rounded-xl border border-neutral-200 text-xs font-semibold py-3 px-4 focus:border-black focus:ring-1 focus:ring-black outline-none bg-neutral-50 h-11"
                  placeholder="5"
                  {...register('max_loans_per_member')}
                />
                {errors.max_loans_per_member && (
                  <p className="text-[10px] font-bold text-red-500 uppercase">{errors.max_loans_per_member.message as string}</p>
                )}
                <span className="block text-[9px] text-neutral-400 font-semibold uppercase">The maximum amount of checkout books a member can hold simultaneously.</span>
              </div>

              {/* Loan Duration */}
              <div className="space-y-1.5">
                <Label htmlFor="loan-duration" className="text-[10px] font-black text-neutral-550 uppercase tracking-wider">
                  Loan Duration Period (Days)
                </Label>
                <Input
                  id="loan-duration"
                  type="number"
                  className="rounded-xl border border-neutral-200 text-xs font-semibold py-3 px-4 focus:border-black focus:ring-1 focus:ring-black outline-none bg-neutral-50 h-11"
                  placeholder="14"
                  {...register('loan_duration_days')}
                />
                {errors.loan_duration_days && (
                  <p className="text-[10px] font-bold text-red-500 uppercase">{errors.loan_duration_days.message as string}</p>
                )}
                <span className="block text-[9px] text-neutral-400 font-semibold uppercase">Default checkout duration period in days allowed for a standard book loan.</span>
              </div>

              {/* Fine Per Day */}
              <div className="space-y-1.5">
                <Label htmlFor="fine-rate" className="text-[10px] font-black text-neutral-550 uppercase tracking-wider">
                  Daily Fine Rate Penalty (MAD/Day)
                </Label>
                <Input
                  id="fine-rate"
                  type="number"
                  step="0.01"
                  className="rounded-xl border border-neutral-200 text-xs font-semibold py-3 px-4 focus:border-black focus:ring-1 focus:ring-black outline-none bg-neutral-50 h-11"
                  placeholder="5"
                  {...register('fine_per_day_mad')}
                />
                {errors.fine_per_day_mad && (
                  <p className="text-[10px] font-bold text-red-500 uppercase">{errors.fine_per_day_mad.message as string}</p>
                )}
                <span className="block text-[9px] text-neutral-400 font-semibold uppercase">Fine amount added to late returns per overdue day.</span>
              </div>

              <div className="pt-6 border-t border-neutral-100 flex justify-end">
                <Button
                  type="submit"
                  disabled={updating}
                  className="cursor-pointer bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold uppercase py-5 border-none h-11 px-6"
                >
                  {updating ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>

            </form>
          )}
        </div>

        {/* Side Tip Information */}
        <div className="bg-neutral-50 p-6 rounded-[24px] border border-neutral-100 space-y-4 self-start">
          <h3 className="text-xs font-black uppercase text-neutral-800 tracking-wider flex items-center gap-1">
            <HelpCircle className="h-4 w-4 text-neutral-500" />
            Policy Rules Information
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
            Adjusting these values updates the rules instantly for all active members. Existing loan due dates will remain unchanged, but new checkout entries will automatically receive the updated durations and fine penalties.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-450 uppercase border-t border-neutral-200 pt-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Tenant Sandbox Secure
          </div>
        </div>
      </div>
    </div>
  )
}

export default LibrarySettings;
