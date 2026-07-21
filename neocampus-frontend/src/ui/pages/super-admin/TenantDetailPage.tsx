import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building2, CreditCard, Settings, Users } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { superAdminApi } from '@/infrastructure/api/superAdminApiService'
import { EmptyState, PlanBadge, StatusBadge } from '@/ui/pages/super-admin/SuperAdminShared'
import { formatDate, planPrice } from '@/ui/pages/super-admin/SuperAdminUtils'

type Tab = 'overview' | 'branches' | 'users' | 'configuration'

const TabButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-xl px-4 py-2 text-xs font-black uppercase transition ${active ? 'bg-black text-[#d0f137]' : 'bg-white text-neutral-500 hover:bg-neutral-50'}`}
  >
    {label}
  </button>
)

const UsageBar: React.FC<{ label: string; value: number; max: number }> = ({ label, value, max }) => {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold">
        <span>{label}</span>
        <span className="text-neutral-500">{value} / {max}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-[#d0f137]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export const TenantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const detailQuery = useQuery({
    queryKey: ['super-admin-tenant-detail', id],
    queryFn: () => superAdminApi.tenantDetail(id ?? ''),
    enabled: Boolean(id),
  })

  const tenant = detailQuery.data
  const settingMap = useMemo(() => {
    const entries = tenant?.settings.map((setting) => [setting.key, Number(setting.value)]) ?? []
    return Object.fromEntries(entries) as Record<string, number>
  }, [tenant?.settings])

  const maxBranches = settingMap.max_branches ?? (tenant?.plan_tier === 'premium' ? 5 : tenant?.plan_tier === 'enterprise' ? 999 : 1)
  const maxStudents = settingMap.max_students ?? (tenant?.plan_tier === 'premium' ? 1000 : tenant?.plan_tier === 'enterprise' ? 99999 : 200)

  if (detailQuery.isLoading) {
    return <div className="text-sm font-bold text-neutral-500">Loading tenant profile...</div>
  }

  if (detailQuery.isError || !tenant) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Tenant unavailable</AlertTitle>
        <AlertDescription>The tenant profile could not be loaded.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-2 gap-2 px-0 text-xs font-bold">
            <Link to="/super-admin/tenants">
              <ArrowLeft className="h-4 w-4" />
              Back to tenants
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">{tenant.nom}</h1>
            <PlanBadge plan={tenant.plan_tier} />
            <StatusBadge status={tenant.subscription_status} />
          </div>
          <p className="text-sm text-neutral-500">{tenant.code} · Created {formatDate(tenant.created_at)}</p>
        </div>
        <Card className="w-full border border-neutral-100 rounded-xl bg-white shadow-sm md:w-72">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs font-bold uppercase text-neutral-500">Monthly contribution</p>
              <p className="text-2xl font-black">{planPrice[tenant.plan_tier]} EUR</p>
            </div>
            <CreditCard className="h-6 w-6 text-emerald-600" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl bg-neutral-100 p-2">
        <TabButton active={activeTab === 'overview'} label="Overview" onClick={() => setActiveTab('overview')} />
        <TabButton active={activeTab === 'branches'} label="Branches" onClick={() => setActiveTab('branches')} />
        <TabButton active={activeTab === 'users'} label="Users" onClick={() => setActiveTab('users')} />
        <TabButton active={activeTab === 'configuration'} label="Configuration" onClick={() => setActiveTab('configuration')} />
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border border-neutral-100 rounded-xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <Building2 className="h-4 w-4" />
                Institution
              </CardTitle>
              <CardDescription className="text-xs">Core tenant identity and billing status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="font-bold">Address:</span> {tenant.adresse || 'Not provided'}</div>
              <div><span className="font-bold">Plan:</span> {tenant.plan_tier}</div>
              <div><span className="font-bold">Status:</span> {tenant.subscription_status}</div>
              <div><span className="font-bold">Subscription ends:</span> {formatDate(tenant.subscription_ends_at)}</div>
            </CardContent>
          </Card>
          <Card className="border border-neutral-100 rounded-xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <Users className="h-4 w-4" />
                Population
              </CardTitle>
              <CardDescription className="text-xs">Current tenant footprint.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-neutral-50 p-3"><p className="text-2xl font-black">{tenant.succursales_count ?? 0}</p><p className="text-[10px] font-bold uppercase text-neutral-500">Branches</p></div>
              <div className="rounded-xl bg-neutral-50 p-3"><p className="text-2xl font-black">{tenant.eleves_count ?? 0}</p><p className="text-[10px] font-bold uppercase text-neutral-500">Students</p></div>
              <div className="rounded-xl bg-neutral-50 p-3"><p className="text-2xl font-black">{tenant.users_count ?? 0}</p><p className="text-[10px] font-bold uppercase text-neutral-500">Users</p></div>
            </CardContent>
          </Card>
          <Card className="border border-neutral-100 rounded-xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-black">Limit Usage</CardTitle>
              <CardDescription className="text-xs">Configured capacity compared to current usage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <UsageBar label="Branches" value={tenant.succursales_count ?? 0} max={maxBranches} />
              <UsageBar label="Students" value={tenant.eleves_count ?? 0} max={maxStudents} />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'branches' && (
        <Card className="border border-neutral-100 rounded-xl bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-black">Branches</CardTitle>
            <CardDescription className="text-xs">All campuses attached to this institution.</CardDescription>
          </CardHeader>
          <CardContent>
            {tenant.succursales.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Users</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenant.succursales.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-bold">{branch.nom}</TableCell>
                      <TableCell>{branch.adresse || 'Not provided'}</TableCell>
                      <TableCell className="text-center">{branch.eleves_count ?? 0}</TableCell>
                      <TableCell className="text-center">{branch.users_count ?? 0}</TableCell>
                      <TableCell>{formatDate(branch.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No branches" description="This tenant does not have branch records yet." />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'users' && (
        <Card className="border border-neutral-100 rounded-xl bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-black">Users</CardTitle>
            <CardDescription className="text-xs">Latest 100 users for this tenant.</CardDescription>
          </CardHeader>
          <CardContent>
            {tenant.users.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Branch ID</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenant.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-bold">{user.prenom} {user.nom}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>{user.succursale_id ?? 'Global'}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No users" description="This tenant has no users attached yet." />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'configuration' && (
        <Card className="border border-neutral-100 rounded-xl bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-black">
              <Settings className="h-4 w-4" />
              Configuration
            </CardTitle>
            <CardDescription className="text-xs">Tenant settings currently exposed by the backend.</CardDescription>
          </CardHeader>
          <CardContent>
            {tenant.settings.length ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {tenant.settings.map((setting) => (
                  <div key={setting.id} className="rounded-xl border border-neutral-100 p-4">
                    <p className="text-xs font-black uppercase text-neutral-500">{setting.key}</p>
                    <p className="mt-1 text-lg font-black text-neutral-900">{setting.value ?? 'Not set'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No settings" description="No tenant settings have been saved for this institution." />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TenantDetailPage
