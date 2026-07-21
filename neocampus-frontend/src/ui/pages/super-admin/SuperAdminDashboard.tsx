import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  ArrowUpRight,
  Building2,
  CreditCard,
  FileLock2,
  ShieldAlert,
  Sliders,
  UserSquare2,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { superAdminApi } from '@/infrastructure/api/superAdminApiService'
import { EmptyState, PlanBadge, StatusBadge } from '@/ui/pages/super-admin/SuperAdminShared'

const StatCard: React.FC<{
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
}> = ({ title, value, description, icon: Icon }) => (
  <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{title}</p>
        <Icon className="h-5 w-5 text-[#d0f137]" />
      </div>
      <p className="text-3xl font-black mt-2">{value}</p>
      <p className="text-[10px] text-neutral-400 mt-1">{description}</p>
    </CardContent>
  </Card>
)

export const SuperAdminDashboard: React.FC = () => {
  const statsQuery = useQuery({ queryKey: ['super-admin-stats'], queryFn: superAdminApi.stats })
  const revenueQuery = useQuery({ queryKey: ['super-admin-revenue-history'], queryFn: superAdminApi.revenueHistory })
  const growthQuery = useQuery({ queryKey: ['super-admin-growth-history'], queryFn: superAdminApi.growthHistory })
  const auditQuery = useQuery({ queryKey: ['super-admin-audit-logs'], queryFn: superAdminApi.auditLogs })

  const stats = statsQuery.data
  const hasRevenue = (revenueQuery.data?.length ?? 0) > 0
  const hasGrowth = (growthQuery.data?.length ?? 0) > 0

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Super Admin Control Center</h1>
          <p className="text-sm text-neutral-500">Platform KPIs, tenant risk signals, and recent privileged activity.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c] gap-2 rounded-xl">
            <Link to="/super-admin/tenants">
              <Building2 className="h-4 w-4" />
              Tenants
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 rounded-xl">
            <Link to="/super-admin/impersonate">
              <UserSquare2 className="h-4 w-4" />
              Impersonation
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 rounded-xl">
            <Link to="/super-admin/audit">
              <FileLock2 className="h-4 w-4" />
              Audit Log
            </Link>
          </Button>
        </div>
      </div>

      {statsQuery.isError && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Dashboard data unavailable</AlertTitle>
          <AlertDescription>Super-admin statistics could not be loaded. Check the API server and your session.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Tenants" value={stats?.total_schools ?? 0} description="Total platform institutions" icon={Building2} />
        <StatCard title="Users" value={stats?.total_users ?? 0} description="All accounts across tenants" icon={Users} />
        <StatCard title="MRR" value={`${stats?.mrr ?? 0} EUR`} description="Active recurring revenue" icon={CreditCard} />
        <StatCard title="Churned" value={stats?.churned_tenants ?? 0} description="Canceled or suspended tenants" icon={ShieldAlert} />
        <StatCard title="Conversion" value={`${stats?.trial_conversion_rate ?? 0}%`} description="Active vs active plus trialing" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-black">Revenue Growth By Tier</CardTitle>
            <CardDescription className="text-xs">Calculated from active tenants and plan pricing.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {hasRevenue ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueQuery.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Basic" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                  <Area type="monotone" dataKey="Premium" stroke="#059669" fill="#d1fae5" strokeWidth={2} />
                  <Area type="monotone" dataKey="Enterprise" stroke="#7c3aed" fill="#ede9fe" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No revenue points yet" description="Revenue history will appear after tenant data exists." />
            )}
          </CardContent>
        </Card>

        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-black">Tenant Growth</CardTitle>
            <CardDescription className="text-xs">Cumulative acquisition over the last six months.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {hasGrowth ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthQuery.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="schools" fill="#0A0A0A" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No growth data yet" description="Tenant growth will appear after schools are onboarded." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-black">At-Risk Tenants</CardTitle>
            <CardDescription className="text-xs">Past due and canceled accounts needing attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.at_risk_tenants?.length ? stats.at_risk_tenants.map((tenant) => (
              <Link
                key={tenant.id}
                to={`/super-admin/tenants/${tenant.id}`}
                className="flex items-center justify-between rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50"
              >
                <div>
                  <p className="text-sm font-black text-neutral-900">{tenant.nom}</p>
                  <p className="text-[10px] font-mono text-neutral-400">{tenant.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PlanBadge plan={tenant.plan_tier} />
                  <StatusBadge status={tenant.subscription_status} />
                </div>
              </Link>
            )) : (
              <EmptyState title="No risk signals" description="No past due or canceled tenants right now." />
            )}
          </CardContent>
        </Card>

        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black">Recent Activity</CardTitle>
              <CardDescription className="text-xs">The audit endpoint is still mock-backed until Phase 2.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs font-bold">
              <Link to="/super-admin/audit">
                Open
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {auditQuery.data?.slice(0, 10).map((log) => (
              <div key={log.id} className="flex gap-4 rounded-xl border border-neutral-100 p-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[#d0f137]">
                  <FileLock2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-neutral-800">{log.description}</p>
                  <p className="mt-1 text-[10px] text-neutral-400">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
        <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Sliders className="h-5 w-5 text-neutral-500" />
            <div>
              <p className="text-sm font-black">Platform Load</p>
              <p className="text-xs text-neutral-500">
                CPU {stats?.system_load?.cpu ?? 0}% · DB {stats?.system_load?.db_size_mb ?? 0} MB · Connections {stats?.system_load?.db_connections ?? 0}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/super-admin/health">Open Health</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default SuperAdminDashboard
