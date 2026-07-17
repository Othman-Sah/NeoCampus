import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosClient } from '@/infrastructure/api/axiosClient'
import { useAuthStore } from '@/application/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity, 
  ShieldAlert, 
  UserSquare2, 
  Plus, 
  Sliders, 
  Lock, 
  ChevronRight, 
  FileLock2, 
  ArrowUpRight 
} from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

export const SuperAdminDashboard: React.FC = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { login } = useAuthStore()

  // State for modals
  const [isOnboardOpen, setIsOnboardOpen] = useState(false)
  const [isLimitOpen, setIsLimitOpen] = useState(false)
  const [isPlanOpen, setIsPlanOpen] = useState(false)
  const [isImpersonateOpen, setIsImpersonateOpen] = useState(false)
  
  // Active selected tenant/user state
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  
  // Onboarding Form State
  const [onboardForm, setOnboardForm] = useState({
    establishment_nom: '',
    establishment_adresse: '',
    plan_tier: 'basic',
    branch_nom: 'Primary Branch',
    owner_nom: '',
    owner_prenom: '',
    owner_email: '',
    owner_password: 'password123',
  })

  // Limits Form State
  const [limitsForm, setLimitsForm] = useState({
    max_branches: 1,
    max_students: 200,
  })

  // Plan Override Form State
  const [planForm, setPlanForm] = useState({
    plan_tier: 'basic',
    subscription_status: 'trialing',
  })

  // Impersonate Form State
  const [impersonateForm, setImpersonateForm] = useState({
    user_id: '',
    reason: '',
  })

  // Fetch super-admin metrics
  const { data: stats } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: async () => {
      const res = await axiosClient.get('/super-admin/stats')
      return res.data
    }
  })

  // Fetch establishments
  const { data: tenantsData } = useQuery({
    queryKey: ['super-admin-tenants'],
    queryFn: async () => {
      const res = await axiosClient.get('/super-admin/tenants')
      return res.data
    }
  })

  // Fetch audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ['super-admin-audit-logs'],
    queryFn: async () => {
      const res = await axiosClient.get('/super-admin/audit-logs')
      return res.data
    }
  })

  // Onboard Mutation
  const onboardMutation = useMutation({
    mutationFn: async (data: typeof onboardForm) => {
      const res = await axiosClient.post('/super-admin/tenants', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-tenants'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] })
      setIsOnboardOpen(false)
      setOnboardForm({
        establishment_nom: '',
        establishment_adresse: '',
        plan_tier: 'basic',
        branch_nom: 'Primary Branch',
        owner_nom: '',
        owner_prenom: '',
        owner_email: '',
        owner_password: 'password123',
      })
    }
  })

  // Update Limits Mutation
  const updateLimitsMutation = useMutation({
    mutationFn: async (data: typeof limitsForm) => {
      const res = await axiosClient.post(`/super-admin/tenants/${selectedTenant.id}/limits`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-tenants'] })
      setIsLimitOpen(false)
    }
  })

  // Update Subscription Plan Mutation
  const updatePlanMutation = useMutation({
    mutationFn: async (data: typeof planForm) => {
      const res = await axiosClient.post(`/super-admin/tenants/${selectedTenant.id}/subscription`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-tenants'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] })
      setIsPlanOpen(false)
    }
  })

  // Impersonate Mutation
  const impersonateMutation = useMutation({
    mutationFn: async (data: typeof impersonateForm) => {
      const res = await axiosClient.post('/super-admin/impersonate', data)
      return res.data
    },
    onSuccess: (data) => {
      // Save token and impersonated user in Zustand useAuthStore
      login(data.user, data.token)
      setIsImpersonateOpen(false)
      // Redirect to school dashboard workspace
      navigate('/dashboard')
      window.location.reload()
    }
  })

  // Handle open limits dialog
  const handleOpenLimits = (tenant: any) => {
    setSelectedTenant(tenant)
    setLimitsForm({
      max_branches: tenant.max_branches ?? 1,
      max_students: tenant.max_students ?? 200,
    })
    setIsLimitOpen(true)
  }

  // Handle open plan override dialog
  const handleOpenPlan = (tenant: any) => {
    setSelectedTenant(tenant)
    setPlanForm({
      plan_tier: tenant.plan_tier,
      subscription_status: tenant.subscription_status,
    })
    setIsPlanOpen(true)
  }

  // Handle open impersonate dialog
  const handleOpenImpersonate = (tenant: any) => {
    setSelectedTenant(tenant)
    setImpersonateForm({
      user_id: '',
      reason: 'Technical Support - Diagnostics session'
    })
    setIsImpersonateOpen(true)
  }

  // Hardcoded chart data matching professional MRR growth & registrations
  const revenueData = [
    { name: 'Jan', Basic: 400, Premium: 800, Enterprise: 1000 },
    { name: 'Feb', Basic: 600, Premium: 1200, Enterprise: 1500 },
    { name: 'Mar', Basic: 900, Premium: 1900, Enterprise: 2000 },
    { name: 'Apr', Basic: 1400, Premium: 2400, Enterprise: 3000 },
    { name: 'May', Basic: 2000, Premium: 3200, Enterprise: 4500 },
    { name: 'Jun', Basic: 2800, Premium: 4500, Enterprise: 6000 },
  ]

  const registrationData = [
    { name: 'Jan', schools: 2 },
    { name: 'Feb', schools: 4 },
    { name: 'Mar', schools: 5 },
    { name: 'Apr', schools: 8 },
    { name: 'May', schools: 12 },
    { name: 'Jun', schools: 18 },
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">SUPER ADMIN CONTROL CENTER</h1>
          <p className="text-neutral-500 text-sm">Multi-tenant management, global billing and platform audit feed.</p>
        </div>

        <Dialog open={isOnboardOpen} onOpenChange={setIsOnboardOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c] gap-2 rounded-xl cursor-pointer">
              <Plus className="h-4 w-4" />
              New Client (Onboarding)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">ATOMIC TENANT ONBOARDING</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500">Institution Name</label>
                <Input 
                  placeholder="e.g. EMSI Rabat" 
                  value={onboardForm.establishment_nom}
                  onChange={e => setOnboardForm({...onboardForm, establishment_nom: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500">Address</label>
                <Input 
                  placeholder="e.g. Agdal, Rabat" 
                  value={onboardForm.establishment_adresse}
                  onChange={e => setOnboardForm({...onboardForm, establishment_adresse: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500">Subscription Tier</label>
                <Select 
                  value={onboardForm.plan_tier} 
                  onValueChange={val => setOnboardForm({...onboardForm, plan_tier: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="free">Free Trial (Max 1 Branch, 50 Students)</SelectItem>
                    <SelectItem value="basic">Basic (Max 1 Branch, 200 Students)</SelectItem>
                    <SelectItem value="premium">Premium (Max 5 Branches, 1000 Students)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (Unlimited)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500">First Branch Name</label>
                <Input 
                  placeholder="e.g. Campus Agdal" 
                  value={onboardForm.branch_nom}
                  onChange={e => setOnboardForm({...onboardForm, branch_nom: e.target.value})}
                />
              </div>
              <div className="col-span-2 border-t border-neutral-100 my-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-450 mb-2">Owner Account (Admin)</h3>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500">First Name</label>
                <Input 
                  placeholder="Othman" 
                  value={onboardForm.owner_prenom}
                  onChange={e => setOnboardForm({...onboardForm, owner_prenom: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500">Last Name</label>
                <Input 
                  placeholder="Sahraoui" 
                  value={onboardForm.owner_nom}
                  onChange={e => setOnboardForm({...onboardForm, owner_nom: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-neutral-500">Administrative Email</label>
                <Input 
                  type="email" 
                  placeholder="admin@newschool.com" 
                  value={onboardForm.owner_email}
                  onChange={e => setOnboardForm({...onboardForm, owner_email: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-neutral-500">Temporary Password</label>
                <Input 
                  type="password" 
                  value={onboardForm.owner_password}
                  onChange={e => setOnboardForm({...onboardForm, owner_password: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsOnboardOpen(false)}>Cancel</Button>
              <Button 
                className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c]"
                onClick={() => onboardMutation.mutate(onboardForm)}
                disabled={onboardMutation.isPending}
              >
                {onboardMutation.isPending ? 'Creating...' : 'Launch Onboarding'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-neutral-100 rounded-2xl shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-neutral-450 uppercase tracking-wider">Institutions</p>
              <Building2 className="h-5 w-5 text-[#d0f137]" />
            </div>
            <p className="text-3xl font-black mt-2">{stats?.total_schools ?? 0}</p>
            <p className="text-[10px] text-neutral-400 mt-1">Number of active SaaS tenants</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-100 rounded-2xl shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-neutral-450 uppercase tracking-wider">Branches</p>
              <Sliders className="h-5 w-5 text-[#d0f137]" />
            </div>
            <p className="text-3xl font-black mt-2">{stats?.total_branches ?? 0}</p>
            <p className="text-[10px] text-neutral-400 mt-1">Physical school campuses managed</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-100 rounded-2xl shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-neutral-450 uppercase tracking-wider">Monthly Revenue (MRR)</p>
              <CreditCard className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black mt-2">{stats?.mrr ?? 0} €</p>
            <p className="text-[10px] text-neutral-400 mt-1">Recurring monthly subscription value</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-100 rounded-2xl shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-neutral-450 uppercase tracking-wider">Platform Load</p>
              <Activity className="h-5 w-5 text-cyan-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-black">{stats?.system_load?.cpu ?? 0}%</p>
              <span className="text-xs font-bold text-neutral-450">CPU</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">Database Volume: {stats?.system_load?.db_size_mb ?? 12.4} MB</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-neutral-100 rounded-2xl shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-black">REVENUE GROWTH BY TIER</CardTitle>
            <CardDescription className="text-xs">Estimated monthly SaaS income trends by tier.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorBasic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d0f137" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#d0f137" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Basic" stroke="#d0f137" fillOpacity={1} fill="url(#colorBasic)" strokeWidth={2} />
                <Area type="monotone" dataKey="Premium" stroke="#10b981" fillOpacity={1} fill="url(#colorPremium)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-neutral-100 rounded-2xl shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-black">TENANT ACQUISITIONS</CardTitle>
            <CardDescription className="text-xs">Total cumulative organization registrations.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="schools" fill="#0A0A0A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card className="border border-neutral-100 rounded-2xl shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-base font-black">LICENSING & CLIENT MANAGER</CardTitle>
          <CardDescription className="text-xs">Inspect client limits, suspend billing, or change subscription levels.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-neutral-50/50">
              <TableRow>
                <TableHead className="font-extrabold text-neutral-800 text-xs">Institution</TableHead>
                <TableHead className="font-extrabold text-neutral-800 text-xs">Unique Code</TableHead>
                <TableHead className="font-extrabold text-neutral-800 text-xs">Plan</TableHead>
                <TableHead className="font-extrabold text-neutral-800 text-xs">Status</TableHead>
                <TableHead className="font-extrabold text-neutral-800 text-xs text-center">Branches</TableHead>
                <TableHead className="font-extrabold text-neutral-800 text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenantsData?.data?.map((tenant: any) => (
                <TableRow key={tenant.id} className="hover:bg-neutral-50/40">
                  <TableCell className="font-bold text-sm text-neutral-900">{tenant.nom}</TableCell>
                  <TableCell className="font-mono text-xs">{tenant.code}</TableCell>
                  <TableCell>
                    <Badge className={`uppercase text-[10px] font-black tracking-tight ${
                      tenant.plan_tier === 'enterprise' 
                        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                        : tenant.plan_tier === 'premium'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {tenant.plan_tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`capitalize text-[10px] font-bold ${
                      tenant.subscription_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : tenant.subscription_status === 'trialing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.subscription_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold text-sm">{tenant.succursales_count ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs cursor-pointer"
                        onClick={() => handleOpenLimits(tenant)}
                      >
                        Limits
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs cursor-pointer"
                        onClick={() => handleOpenPlan(tenant)}
                      >
                        Plan
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-black text-white hover:bg-neutral-900 text-xs font-bold cursor-pointer"
                        onClick={() => handleOpenImpersonate(tenant)}
                      >
                        Impersonate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Log and Webhook Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Log Feed */}
        <Card className="lg:col-span-2 border border-neutral-100 rounded-2xl shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-black">AUDIT FEED & OVERRIDES LOG</CardTitle>
            <CardDescription className="text-xs">Monitoring of impersonated logins and license manipulations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogs?.map((log: any) => (
                <div key={log.id} className="flex gap-4 p-3.5 border border-neutral-100 rounded-xl hover:bg-neutral-50/50 transition">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-[#d0f137] flex items-center justify-center shrink-0">
                    <FileLock2 className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-extrabold text-neutral-800">{log.description}</p>
                      <span className="text-[10px] text-neutral-450">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-neutral-500 italic">" {log.reason} "</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Developer Webhook Simulator Widget */}
        <Card className="border border-neutral-100 rounded-2xl shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-black">STRIPE WEBHOOK SIMULATOR</CardTitle>
            <CardDescription className="text-xs">Diagnostic tool to simulate Stripe recurring payment alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-neutral-500 leading-relaxed">
              Select a target customer and trigger a mock Stripe alert to verify real-time routing restrictions and warning banners.
            </p>
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-450 uppercase">Target Client</label>
                <Select onValueChange={(val) => {
                  const selected = tenantsData?.data?.find((t: any) => t.id === parseInt(val))
                  setSelectedTenant(selected)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {tenantsData?.data?.map((t: any) => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 text-xs font-bold rounded-xl cursor-pointer"
                  onClick={async () => {
                    if (!selectedTenant) return alert('Please select a target client first')
                    await axiosClient.post('/billing/stripe-webhook-simulate', {
                      type: 'customer.subscription.updated',
                      establishment_id: selectedTenant.id,
                      tier: selectedTenant.plan_tier,
                      status: 'past_due',
                    })
                    queryClient.invalidateQueries({ queryKey: ['super-admin-tenants'] })
                    alert('Webhook simulated: status set to past_due')
                  }}
                >
                  Simulate Deficit (402)
                </Button>

                <Button 
                  className="bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 text-xs font-bold rounded-xl cursor-pointer"
                  onClick={async () => {
                    if (!selectedTenant) return alert('Please select a target client first')
                    await axiosClient.post('/billing/stripe-webhook-simulate', {
                      type: 'customer.subscription.deleted',
                      establishment_id: selectedTenant.id,
                      tier: selectedTenant.plan_tier,
                      status: 'canceled',
                    })
                    queryClient.invalidateQueries({ queryKey: ['super-admin-tenants'] })
                    alert('Webhook simulated: status set to canceled')
                  }}
                >
                  Simulate Cancel
                </Button>
              </div>

              <Button 
                className="w-full bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-bold rounded-xl cursor-pointer"
                onClick={async () => {
                  if (!selectedTenant) return alert('Please select a target client first')
                  await axiosClient.post('/billing/stripe-webhook-simulate', {
                    type: 'customer.subscription.created',
                    establishment_id: selectedTenant.id,
                    tier: selectedTenant.plan_tier,
                    status: 'active',
                  })
                  queryClient.invalidateQueries({ queryKey: ['super-admin-tenants'] })
                  alert('Webhook simulated: status restored to active')
                }}
              >
                Restore Account (Active)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for Edit Limits */}
      <Dialog open={isLimitOpen} onOpenChange={setIsLimitOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">ADJUST LICENSING LIMITS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">Maximum Branches Count</label>
              <Input 
                type="number" 
                value={limitsForm.max_branches}
                onChange={e => setLimitsForm({...limitsForm, max_branches: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">Maximum Active Students Count</label>
              <Input 
                type="number" 
                value={limitsForm.max_students}
                onChange={e => setLimitsForm({...limitsForm, max_students: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsLimitOpen(false)}>Cancel</Button>
            <Button 
              className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c]"
              onClick={() => updateLimitsMutation.mutate(limitsForm)}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Edit Plan Override */}
      <Dialog open={isPlanOpen} onOpenChange={setIsPlanOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">FORCE PLAN OVERRIDE (SAAS)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">Active Tier</label>
              <Select 
                value={planForm.plan_tier}
                onValueChange={val => setPlanForm({...planForm, plan_tier: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">Billing Status</label>
              <Select 
                value={planForm.subscription_status}
                onValueChange={val => setPlanForm({...planForm, subscription_status: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsPlanOpen(false)}>Cancel</Button>
            <Button 
              className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c]"
              onClick={() => updatePlanMutation.mutate(planForm)}
            >
              Force Plan Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Impersonate Form */}
      <Dialog open={isImpersonateOpen} onOpenChange={setIsImpersonateOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Lock className="h-5 w-5 text-neutral-700" />
              IMPERSONATED SESSION AUTHENTICATION
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-xs text-neutral-500">
              You are generating an active authentication token for <strong>{selectedTenant?.nom}</strong>. This bypass will be recorded in audit logs.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">User ID to impersonate</label>
              <Input 
                placeholder="e.g. 2 (school owner user id)" 
                value={impersonateForm.user_id}
                onChange={e => setImpersonateForm({...impersonateForm, user_id: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">Support Ticket / Reason</label>
              <Input 
                placeholder="e.g. Support ticket #1809 - diagnostics" 
                value={impersonateForm.reason}
                onChange={e => setImpersonateForm({...impersonateForm, reason: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsImpersonateOpen(false)}>Cancel</Button>
            <Button 
              className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c]"
              onClick={() => impersonateMutation.mutate(impersonateForm)}
              disabled={impersonateMutation.isPending}
            >
              {impersonateMutation.isPending ? 'Logging In...' : 'Launch Impersonation'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default SuperAdminDashboard;
