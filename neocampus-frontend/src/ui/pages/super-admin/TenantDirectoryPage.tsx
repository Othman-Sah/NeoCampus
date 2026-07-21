import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpDown, Building2, ChevronLeft, ChevronRight, CreditCard, Eye, Lock, Plus, Search, ShieldAlert, Sliders, UserSquare2 } from 'lucide-react'
import { useAuthStore } from '@/application/stores/authStore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  ImpersonatePayload,
  ImpersonateResponse,
  LimitPayload,
  OnboardTenantPayload,
  PlanPayload,
  PlanTier,
  SubscriptionStatus,
  Tenant,
  TenantFilters,
  superAdminApi,
} from '@/infrastructure/api/superAdminApiService'
import { User } from '@/domain/entities/User'
import { EmptyState, PlanBadge, StatusBadge } from '@/ui/pages/super-admin/SuperAdminShared'
import { formatDate, planPrice, exportToCSV } from '@/ui/pages/super-admin/SuperAdminUtils'

type Toast = { type: 'success' | 'error'; text: string } | null

const emptyOnboardForm: OnboardTenantPayload = {
  establishment_nom: '',
  establishment_adresse: '',
  plan_tier: 'basic',
  branch_nom: 'Primary Branch',
  owner_nom: '',
  owner_prenom: '',
  owner_email: '',
  owner_password: '',
}

export const TenantDirectoryPage: React.FC = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { startImpersonation } = useAuthStore()
  const [filters, setFilters] = useState<TenantFilters>({
    search: '',
    plan_tier: 'all',
    subscription_status: 'all',
    sort_by: 'created_at',
    sort_direction: 'desc',
    page: 1,
    per_page: 10,
  })
  const [toast, setToast] = useState<Toast>(null)
  const [isOnboardOpen, setIsOnboardOpen] = useState(false)
  const [isLimitOpen, setIsLimitOpen] = useState(false)
  const [isPlanOpen, setIsPlanOpen] = useState(false)
  const [isImpersonateOpen, setIsImpersonateOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [onboardForm, setOnboardForm] = useState<OnboardTenantPayload>(emptyOnboardForm)
  const [limitsForm, setLimitsForm] = useState<LimitPayload>({ max_branches: 1, max_students: 200 })
  const [planForm, setPlanForm] = useState<PlanPayload>({ plan_tier: 'basic', subscription_status: 'trialing' })
  const [impersonateForm, setImpersonateForm] = useState<ImpersonatePayload>({ user_id: '', reason: '' })

  const tenantsQuery = useQuery({
    queryKey: ['super-admin-tenants', filters],
    queryFn: () => superAdminApi.tenants(filters),
  })

  const tenants = tenantsQuery.data?.data ?? []
  const selectedTenantId = selectedTenant?.id ?? 0

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    window.setTimeout(() => setToast(null), 3500)
  }

  const invalidateTenantQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['super-admin-tenants'] })
    queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] })
  }

  const onboardMutation = useMutation({
    mutationFn: superAdminApi.onboardTenant,
    onSuccess: () => {
      invalidateTenantQueries()
      setIsOnboardOpen(false)
      setOnboardForm(emptyOnboardForm)
      showToast('success', 'Tenant onboarded successfully.')
    },
    onError: () => showToast('error', 'Tenant onboarding failed. Check the required fields.'),
  })

  const updateLimitsMutation = useMutation({
    mutationFn: (payload: LimitPayload) => superAdminApi.updateLimits(selectedTenantId, payload),
    onSuccess: () => {
      invalidateTenantQueries()
      setIsLimitOpen(false)
      showToast('success', 'Tenant limits updated.')
    },
    onError: () => showToast('error', 'Could not update tenant limits.'),
  })

  const updatePlanMutation = useMutation({
    mutationFn: (payload: PlanPayload) => superAdminApi.updatePlan(selectedTenantId, payload),
    onSuccess: () => {
      invalidateTenantQueries()
      setIsPlanOpen(false)
      showToast('success', 'Subscription override applied.')
    },
    onError: () => showToast('error', 'Could not update the subscription.'),
  })

  const impersonateMutation = useMutation({
    mutationFn: superAdminApi.impersonate,
    onSuccess: (data: ImpersonateResponse) => {
      startImpersonation(data.user, data.token, data.original_user, data.original_token)
      setIsImpersonateOpen(false)
      navigate('/dashboard')
      window.location.reload()
    },
    onError: () => showToast('error', 'Impersonation failed. Verify the user id and reason.'),
  })

  const webhookMutation = useMutation({
    mutationFn: ({ tenant, status }: { tenant: Tenant; status: Extract<SubscriptionStatus, 'active' | 'past_due' | 'canceled'> }) =>
      superAdminApi.simulateWebhook(tenant, status),
    onSuccess: () => {
      invalidateTenantQueries()
      showToast('success', 'Webhook simulation completed.')
    },
    onError: () => showToast('error', 'Webhook simulation failed.'),
  })

  const updateFilter = <K extends keyof TenantFilters>(key: K, value: TenantFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? (value as number) : 1 }))
  }

  const openLimits = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setLimitsForm({ max_branches: tenant.succursales_count ?? 1, max_students: tenant.eleves_count ?? 200 })
    setIsLimitOpen(true)
  }

  const openPlan = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setPlanForm({ plan_tier: tenant.plan_tier, subscription_status: tenant.subscription_status })
    setIsPlanOpen(true)
  }

  const openImpersonate = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setImpersonateForm({ user_id: '', reason: `Support diagnostics for ${tenant.nom}` })
    setIsImpersonateOpen(true)
  }

  const sortLabel = useMemo(() => {
    const labels: Record<NonNullable<TenantFilters['sort_by']>, string> = {
      created_at: 'Created date',
      nom: 'Name',
      succursales_count: 'Branches',
      users_count: 'Users',
      eleves_count: 'Students',
    }
    return labels[filters.sort_by ?? 'created_at']
  }, [filters.sort_by])

  return (
    <div className="space-y-6 pb-10">
      {toast && (
        <div className={`fixed right-6 top-6 z-[10000] rounded-xl px-4 py-3 text-xs font-bold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
          {toast.text}
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Tenant Directory</h1>
          <p className="text-sm text-neutral-500">Search, filter, paginate, inspect, and operate every institution.</p>
        </div>
        <Button asChild className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c] gap-2 rounded-xl">
          <Link to="/super-admin/tenants/onboard">
            <Plus className="h-4 w-4" />
            New Tenant
          </Link>
        </Button>
      </div>

      <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
        <CardContent className="grid grid-cols-1 gap-3 pt-6 lg:grid-cols-[1.5fr_180px_180px_180px_130px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input className="pl-9" placeholder="Search by name or code" value={filters.search ?? ''} onChange={(e) => updateFilter('search', e.target.value)} />
          </div>
          <Select value={filters.plan_tier} onValueChange={(value) => updateFilter('plan_tier', value as TenantFilters['plan_tier'])}>
            <SelectTrigger><SelectValue placeholder="Plan" /></SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.subscription_status} onValueChange={(value) => updateFilter('subscription_status', value as TenantFilters['subscription_status'])}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
              <SelectItem value="past_due">Past due</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.sort_by} onValueChange={(value) => updateFilter('sort_by', value as TenantFilters['sort_by'])}>
            <SelectTrigger><SelectValue>{sortLabel}</SelectValue></SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="created_at">Created date</SelectItem>
              <SelectItem value="nom">Name</SelectItem>
              <SelectItem value="succursales_count">Branches</SelectItem>
              <SelectItem value="users_count">Users</SelectItem>
              <SelectItem value="eleves_count">Students</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={() => updateFilter('sort_direction', filters.sort_direction === 'asc' ? 'desc' : 'asc')}>
            <ArrowUpDown className="h-4 w-4" />
            {filters.sort_direction === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </CardContent>
      </Card>

      {tenantsQuery.isError && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Tenant data unavailable</AlertTitle>
          <AlertDescription>The tenant directory could not be loaded.</AlertDescription>
        </Alert>
      )}

      <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-black">Institutions</CardTitle>
            <CardDescription className="text-xs">{tenantsQuery.data?.total ?? 0} tenants match the current filters.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-xl"
            onClick={() => {
              const exportData = tenants.map((t) => ({
                ID: t.id,
                Name: t.nom,
                Code: t.code,
                Plan: t.plan_tier,
                Status: t.subscription_status,
                Branches: t.succursales_count ?? 0,
                Students: t.eleves_count ?? 0,
                Users: t.users_count ?? 0,
                Created: formatDate(t.created_at),
              }))
              exportToCSV(exportData, 'tenants_list.csv')
            }}
          >
            Export to CSV
          </Button>
        </CardHeader>
        <CardContent>
          {tenants.length ? (
            <Table>
              <TableHeader className="bg-neutral-50/50">
                <TableRow>
                  <TableHead className="text-xs font-extrabold">Institution</TableHead>
                  <TableHead className="text-xs font-extrabold">Plan</TableHead>
                  <TableHead className="text-xs font-extrabold">Status</TableHead>
                  <TableHead className="text-xs font-extrabold text-center">Branches</TableHead>
                  <TableHead className="text-xs font-extrabold text-center">Students</TableHead>
                  <TableHead className="text-xs font-extrabold text-center">Users</TableHead>
                  <TableHead className="text-xs font-extrabold text-right">MRR</TableHead>
                  <TableHead className="text-xs font-extrabold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id} className="hover:bg-neutral-50/40">
                    <TableCell>
                      <div>
                        <Link to={`/super-admin/tenants/${tenant.id}`} className="text-sm font-black text-neutral-900 hover:underline">{tenant.nom}</Link>
                        <p className="text-[10px] font-mono text-neutral-400">{tenant.code} · {formatDate(tenant.created_at)}</p>
                      </div>
                    </TableCell>
                    <TableCell><PlanBadge plan={tenant.plan_tier} /></TableCell>
                    <TableCell><StatusBadge status={tenant.subscription_status} /></TableCell>
                    <TableCell className="text-center text-sm font-bold">{tenant.succursales_count ?? 0}</TableCell>
                    <TableCell className="text-center text-sm font-bold">{tenant.eleves_count ?? 0}</TableCell>
                    <TableCell className="text-center text-sm font-bold">{tenant.users_count ?? 0}</TableCell>
                    <TableCell className="text-right text-sm font-black">{planPrice[tenant.plan_tier]} EUR</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button asChild size="sm" variant="outline" className="h-8 px-2"><Link to={`/super-admin/tenants/${tenant.id}`}><Eye className="h-3.5 w-3.5" /></Link></Button>
                        <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => openLimits(tenant)}><Sliders className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => openPlan(tenant)}><CreditCard className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" className="h-8 bg-black px-2 text-white hover:bg-neutral-900" onClick={() => openImpersonate(tenant)}><UserSquare2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No tenants found" description="Adjust search or filters to find institutions." />
          )}
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
            <p className="text-xs font-bold text-neutral-500">
              Page {tenantsQuery.data?.current_page ?? 1} of {tenantsQuery.data?.last_page ?? 1}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={(filters.page ?? 1) <= 1} onClick={() => updateFilter('page', (filters.page ?? 1) - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={(filters.page ?? 1) >= (tenantsQuery.data?.last_page ?? 1)} onClick={() => updateFilter('page', (filters.page ?? 1) + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-base font-black">Webhook Simulator</CardTitle>
          <CardDescription className="text-xs">Diagnostic billing status transitions for the selected tenant row.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Building2 className="h-4 w-4 text-neutral-500" />
          <span className="mr-auto text-xs font-bold text-neutral-500">{selectedTenant?.nom ?? 'Select a tenant by using an action button first'}</span>
          <Button size="sm" variant="outline" disabled={!selectedTenant || webhookMutation.isPending} onClick={() => selectedTenant && webhookMutation.mutate({ tenant: selectedTenant, status: 'past_due' })}>Set Past Due</Button>
          <Button size="sm" variant="outline" disabled={!selectedTenant || webhookMutation.isPending} onClick={() => selectedTenant && webhookMutation.mutate({ tenant: selectedTenant, status: 'canceled' })}>Cancel</Button>
          <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={!selectedTenant || webhookMutation.isPending} onClick={() => selectedTenant && webhookMutation.mutate({ tenant: selectedTenant, status: 'active' })}>Restore Active</Button>
        </CardContent>
      </Card>

      <Dialog open={isLimitOpen} onOpenChange={setIsLimitOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader><DialogTitle className="text-lg font-black">Adjust Limits</DialogTitle></DialogHeader>
          <Input type="number" value={limitsForm.max_branches} onChange={(e) => setLimitsForm({ ...limitsForm, max_branches: Number(e.target.value) })} />
          <Input type="number" value={limitsForm.max_students} onChange={(e) => setLimitsForm({ ...limitsForm, max_students: Number(e.target.value) })} />
          <Button className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c]" onClick={() => updateLimitsMutation.mutate(limitsForm)}>Save Limits</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isPlanOpen} onOpenChange={setIsPlanOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader><DialogTitle className="text-lg font-black">Subscription Override</DialogTitle></DialogHeader>
          <Select value={planForm.plan_tier} onValueChange={(value: PlanTier) => setPlanForm({ ...planForm, plan_tier: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planForm.subscription_status} onValueChange={(value: SubscriptionStatus) => setPlanForm({ ...planForm, subscription_status: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
              <SelectItem value="past_due">Past due</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c]" onClick={() => updatePlanMutation.mutate(planForm)}>Apply Override</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isImpersonateOpen} onOpenChange={setIsImpersonateOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black">
              <Lock className="h-5 w-5" />
              Impersonate User
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-neutral-500">Generate an impersonation session for {selectedTenant?.nom}. This action is privileged.</p>
          <Input placeholder="User ID" value={impersonateForm.user_id} onChange={(e) => setImpersonateForm({ ...impersonateForm, user_id: e.target.value })} />
          <Input placeholder="Reason" value={impersonateForm.reason} onChange={(e) => setImpersonateForm({ ...impersonateForm, reason: e.target.value })} />
          <Button className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c]" disabled={impersonateMutation.isPending} onClick={() => impersonateMutation.mutate(impersonateForm)}>
            {impersonateMutation.isPending ? 'Starting...' : 'Start Impersonation'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TenantDirectoryPage
