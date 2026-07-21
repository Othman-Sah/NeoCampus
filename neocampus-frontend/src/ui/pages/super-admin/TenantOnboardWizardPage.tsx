import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Lock,
  Plus,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { OnboardTenantPayload, PlanTier, superAdminApi } from '@/infrastructure/api/superAdminApiService'

type Step = 1 | 2 | 3 | 4 | 5

export const TenantOnboardWizardPage: React.FC = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState<OnboardTenantPayload>({
    establishment_nom: '',
    establishment_adresse: '',
    plan_tier: 'basic',
    branch_nom: 'Succursale Principale',
    owner_nom: '',
    owner_prenom: '',
    owner_email: '',
    owner_password: '',
  })

  const [successResult, setSuccessResult] = useState<any>(null)

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    window.setTimeout(() => setToast(null), 3000)
  }

  const onboardMutation = useMutation({
    mutationFn: superAdminApi.onboardTenant,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-tenants'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] })
      setSuccessResult(data.etablissement)
      showToast('success', 'Establishment onboarded successfully.')
    },
    onError: () => {
      showToast('error', 'Onboarding failed. Ensure email is unique and all fields are valid.')
    },
  })

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-neutral-100' }
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[a-z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }

  const passStrength = getPasswordStrength(form.owner_password)

  const nextStep = () => {
    if (step === 1 && !form.establishment_nom.trim()) {
      showToast('error', 'Institution name is required.')
      return
    }
    if (step === 3 && !form.branch_nom.trim()) {
      showToast('error', 'Primary branch name is required.')
      return
    }
    if (step === 4) {
      if (!form.owner_prenom.trim() || !form.owner_nom.trim()) {
        showToast('error', 'Owner first and last names are required.')
        return
      }
      if (!form.owner_email.trim() || !form.owner_email.includes('@')) {
        showToast('error', 'Please enter a valid owner email.')
        return
      }
      if (form.owner_password.length < 8) {
        showToast('error', 'Password must be at least 8 characters long.')
        return
      }
    }
    setStep((s) => (s + 1) as Step)
  }

  const prevStep = () => {
    setStep((s) => (s - 1) as Step)
  }

  const handleSubmit = () => {
    onboardMutation.mutate(form)
  }

  if (successResult) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full border border-neutral-100 bg-white rounded-xl shadow-lg p-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-neutral-900">School Configured!</h2>
            <p className="text-sm text-neutral-500">
              <strong>{successResult.nom}</strong> has been successfully registered and provisioned on the platform.
            </p>
          </div>
          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-xs text-left font-mono space-y-2 text-neutral-700">
            <div><span className="font-bold text-neutral-400">Establishment Code:</span> {successResult.code}</div>
            <div><span className="font-bold text-neutral-400">Plan Tier:</span> <span className="uppercase font-black text-neutral-900">{successResult.plan_tier}</span></div>
            <div><span className="font-bold text-neutral-400">Owner User Account:</span> {form.owner_email}</div>
          </div>
          <div className="pt-2">
            <Button asChild className="w-full bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c] rounded-xl">
              <Link to="/super-admin/tenants">Go to Tenant Directory</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      {toast && (
        <div className={`fixed right-6 top-6 z-[10000] rounded-xl px-4 py-3 text-xs font-bold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
          {toast.text}
        </div>
      )}

      <div>
        <Button asChild variant="ghost" className="mb-2 gap-2 px-0 text-xs font-bold">
          <Link to="/super-admin/tenants">
            <ArrowLeft className="h-4 w-4" />
            Back to tenants
          </Link>
        </Button>
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">Tenant Onboarding Wizard</h1>
        <p className="text-sm text-neutral-500">Follow the steps below to atomically provision a school establishment, create the first campus branch, and configure the owner credentials.</p>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center bg-neutral-100 rounded-2xl p-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                step === s
                  ? 'bg-black text-[#d0f137] border-black'
                  : step > s
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-white text-neutral-400 border-neutral-200'
              }`}
            >
              {s}
            </div>
            <span
              className={`hidden sm:inline text-xs font-black uppercase ${
                step === s ? 'text-black' : 'text-neutral-400'
              }`}
            >
              {s === 1 && 'School Identity'}
              {s === 2 && 'Subscription'}
              {s === 3 && 'First Branch'}
              {s === 4 && 'Owner'}
              {s === 5 && 'Confirm'}
            </span>
            {s < 5 && <div className="hidden sm:block h-[1px] w-8 bg-neutral-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Forms Area */}
      <Card className="border border-neutral-100 bg-white rounded-2xl shadow-sm p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Step 1 — School Identity</h2>
            <p className="text-xs text-neutral-500">Provide the official institutional identity and operational address.</p>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase">Institution Name *</label>
                <Input
                  placeholder="e.g., EMSI Rabat"
                  value={form.establishment_nom}
                  onChange={(e) => setForm({ ...form, establishment_nom: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase">Physical Address</label>
                <Input
                  placeholder="e.g., Avenue Mohamed V, Rabat"
                  value={form.establishment_adresse}
                  onChange={(e) => setForm({ ...form, establishment_adresse: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Step 2 — Subscription Tier</h2>
            <p className="text-xs text-neutral-500">Choose the initial subscription plan for this school. Prices and limits are configured by the platform.</p>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
              {(['free', 'basic', 'premium', 'enterprise'] as PlanTier[]).map((tier) => (
                <div
                  key={tier}
                  onClick={() => setForm({ ...form, plan_tier: tier })}
                  className={`border rounded-xl p-4 cursor-pointer flex flex-col justify-between h-48 transition ${
                    form.plan_tier === tier
                      ? 'border-black bg-neutral-900 text-white shadow-md'
                      : 'border-neutral-100 bg-white hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">{tier}</h3>
                    <p className="text-2xl font-black mt-2">
                      {tier === 'free' ? '0' : tier === 'basic' ? '49' : tier === 'premium' ? '99' : '199'} EUR
                      <span className="text-[10px] font-bold text-neutral-400 block mt-0.5">/month</span>
                    </p>
                  </div>
                  <div className="text-[10px] space-y-1 pt-4 border-t border-dashed border-neutral-100/20 font-bold text-neutral-400">
                    <div>Limit: {tier === 'free' ? '1 Branch' : tier === 'basic' ? '1 Branch' : tier === 'premium' ? '5 Branches' : 'Unlimited'}</div>
                    <div>Students: {tier === 'free' ? '50 max' : tier === 'basic' ? '200 max' : tier === 'premium' ? '1,000 max' : 'Unlimited'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Step 3 — Primary Campus Setup</h2>
            <p className="text-xs text-neutral-500">Create the primary branch (succursale) to begin registering classes and students.</p>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase">Primary Branch Name *</label>
                <Input
                  placeholder="e.g., Campus Agdal"
                  value={form.branch_nom}
                  onChange={(e) => setForm({ ...form, branch_nom: e.target.value })}
                />
              </div>
              <p className="text-[10px] text-neutral-400 font-bold">
                The branch will inherit the establishment address by default on the backend. Additional branches can be registered inside the school panel.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Step 4 — Owner Credentials</h2>
            <p className="text-xs text-neutral-500">Configure the primary school owner user account. They will receive full admin access to the school dashboard.</p>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase">First Name *</label>
                <Input
                  placeholder="First name"
                  value={form.owner_prenom}
                  onChange={(e) => setForm({ ...form, owner_prenom: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase">Last Name *</label>
                <Input
                  placeholder="Last name"
                  value={form.owner_nom}
                  onChange={(e) => setForm({ ...form, owner_nom: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Email Address *</label>
                <Input
                  type="email"
                  placeholder="owner@example.com"
                  value={form.owner_email}
                  onChange={(e) => setForm({ ...form, owner_email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Temporary Password *</label>
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={form.owner_password}
                  onChange={(e) => setForm({ ...form, owner_password: e.target.value })}
                />
                {form.owner_password && (
                  <div className="flex items-center justify-between text-[10px] font-bold mt-1">
                    <span className="text-neutral-400">Strength: {passStrength.label}</span>
                    <div className="h-1.5 w-24 bg-neutral-100 overflow-hidden rounded-full flex">
                      <div className={`h-full ${passStrength.color}`} style={{ width: `${(passStrength.score / 5) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Step 5 — Review & Deploy</h2>
            <p className="text-xs text-neutral-500">Confirm all configurations before launching the atomic database provisioner.</p>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div className="bg-neutral-50 rounded-xl p-4 space-y-2 border border-neutral-100">
                <p className="text-xs font-black text-neutral-400 uppercase flex items-center gap-1.5"><Building2 className="h-4 w-4 text-neutral-500" /> Establishment</p>
                <p className="text-sm font-black text-neutral-800">{form.establishment_nom}</p>
                <p className="text-xs text-neutral-500">{form.establishment_adresse || 'No address'}</p>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 space-y-2 border border-neutral-100">
                <p className="text-xs font-black text-neutral-400 uppercase flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-neutral-500" /> Subscription Plan</p>
                <p className="text-sm font-black text-neutral-800 uppercase">{form.plan_tier}</p>
                <p className="text-xs text-neutral-500">Initial 14-day trialing status</p>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 space-y-2 border border-neutral-100">
                <p className="text-xs font-black text-neutral-400 uppercase flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-neutral-500" /> Primary Branch</p>
                <p className="text-sm font-black text-neutral-800">{form.branch_nom}</p>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 space-y-2 border border-neutral-100">
                <p className="text-xs font-black text-neutral-400 uppercase flex items-center gap-1.5"><Lock className="h-4 w-4 text-neutral-500" /> Owner User</p>
                <p className="text-sm font-black text-neutral-800">{form.owner_prenom} {form.owner_nom}</p>
                <p className="text-xs text-neutral-500">{form.owner_email}</p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-red-200 bg-red-50/20 p-4 text-[10px] text-red-700 font-bold leading-relaxed">
              WARNING: Deploying will write schemas, compile default settings models, create the school database instance scope, and bind the Sanctum owner user account in a single transaction database transaction.
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 flex justify-between border-t border-neutral-100 pt-6">
          <Button
            variant="outline"
            disabled={step === 1 || onboardMutation.isPending}
            onClick={prevStep}
            className="gap-1.5 rounded-xl font-bold"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {step < 5 ? (
            <Button
              onClick={nextStep}
              className="bg-black hover:bg-neutral-900 text-white gap-1.5 rounded-xl font-bold"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c] gap-1.5 rounded-xl"
              disabled={onboardMutation.isPending}
              onClick={handleSubmit}
            >
              {onboardMutation.isPending ? 'Provisioning...' : 'Deploy School Configuration'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

export default TenantOnboardWizardPage
