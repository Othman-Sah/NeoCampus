import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  ArrowUpRight,
  Building2,
  Coins,
  CreditCard,
  FileLock2,
  HelpCircle,
  Percent,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { superAdminApi, Tenant, SubscriptionStatus } from '@/infrastructure/api/superAdminApiService'
import { EmptyState, PlanBadge, StatusBadge } from '@/ui/pages/super-admin/SuperAdminShared'
import { formatDate } from '@/ui/pages/super-admin/SuperAdminUtils'

type Toast = { type: 'success' | 'error'; text: string } | null

const COLORS = ['#94a3b8', '#3b82f6', '#10b981', '#8b5cf6'] // correspond to: free, basic, premium, enterprise

export const BillingRevenuePage: React.FC = () => {
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<Toast>(null)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    window.setTimeout(() => setToast(null), 3500)
  }

  // Fetch billing revenue stats
  const billingQuery = useQuery({
    queryKey: ['super-admin-billing-revenue'],
    queryFn: superAdminApi.billingRevenue,
  })

  // Fetch billing events (subscription audit trail)
  const eventsQuery = useQuery({
    queryKey: ['super-admin-billing-events'],
    queryFn: () => superAdminApi.billingEvents(),
  })

  const billing = billingQuery.data
  const events = eventsQuery.data?.data ?? []
  const tenants = billing?.tenants ?? []

  const webhookMutation = useMutation({
    mutationFn: ({ tenant, status }: { tenant: Tenant; status: Extract<SubscriptionStatus, 'active' | 'past_due' | 'canceled'> }) =>
      superAdminApi.simulateWebhook(tenant, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-billing-revenue'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-billing-events'] })
      showToast('success', 'Webhook simulation completed. Metrics and events updated.')
    },
    onError: () => showToast('error', 'Webhook simulation failed.'),
  })

  const handleSimulate = (status: 'active' | 'past_due' | 'canceled') => {
    if (!selectedTenant) {
      showToast('error', 'Please select a tenant row first.')
      return
    }
    webhookMutation.mutate({ tenant: selectedTenant, status })
  }

  const chartData = billing?.tier_distribution.map((dist) => ({
    name: dist.tier.charAt(0).toUpperCase() + dist.tier.slice(1),
    value: dist.count,
  })) ?? []

  return (
    <div className="space-y-6 pb-10">
      {toast && (
        <div className={`fixed right-6 top-6 z-[10000] rounded-xl px-4 py-3 text-xs font-bold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
          {toast.text}
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Billing & Revenue</h1>
          <p className="text-sm text-neutral-500">Monitor Monthly Recurring Revenue (MRR), track plan distribution, and audit financial events.</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 self-start rounded-xl"
          onClick={() => {
            billingQuery.refetch()
            eventsQuery.refetch()
            showToast('success', 'Data refreshed.')
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {billingQuery.isError && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Billing data unavailable</AlertTitle>
          <AlertDescription>Financial performance metrics could not be loaded.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Platform MRR</p>
              <Coins className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-black mt-2">{billing?.mrr ?? 0} EUR</p>
            <p className="text-[10px] text-neutral-400 mt-1">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Estimated ARR</p>
              <CreditCard className="h-5 w-5 text-neutral-500" />
            </div>
            <p className="text-3xl font-black mt-2">{billing?.arr ?? 0} EUR</p>
            <p className="text-[10px] text-neutral-400 mt-1">Annual Recurring Run Rate (MRR × 12)</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">ARPT</p>
              <HelpCircle className="h-5 w-5 text-neutral-500" />
            </div>
            <p className="text-3xl font-black mt-2">{billing?.arpt ?? 0} EUR</p>
            <p className="text-[10px] text-neutral-400 mt-1">Average Revenue Per Tenant</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Churn Rate</p>
              <Percent className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-3xl font-black mt-2">{billing?.churn_rate ?? 0}%</p>
            <p className="text-[10px] text-neutral-400 mt-1">Suspended or Canceled vs. Total tenants</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-black">Tenant Revenue Registry</CardTitle>
            <CardDescription className="text-xs">Individual financial contribution per registered institution.</CardDescription>
          </CardHeader>
          <CardContent>
            {tenants.length ? (
              <Table>
                <TableHeader className="bg-neutral-50/50">
                  <TableRow>
                    <TableHead className="text-xs font-extrabold">Institution</TableHead>
                    <TableHead className="text-xs font-extrabold">Plan</TableHead>
                    <TableHead className="text-xs font-extrabold">Status</TableHead>
                    <TableHead className="text-xs font-extrabold text-center">Footprint</TableHead>
                    <TableHead className="text-xs font-extrabold text-right">Contribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((t) => (
                    <TableRow
                      key={t.id}
                      className={`hover:bg-neutral-50/40 cursor-pointer ${selectedTenant?.id === t.id ? 'bg-[#d0f137]/10 hover:bg-[#d0f137]/10' : ''}`}
                      onClick={() => setSelectedTenant(t)}
                    >
                      <TableCell>
                        <div>
                          <Link to={`/super-admin/tenants/${t.id}`} className="text-xs font-black text-neutral-900 hover:underline">
                            {t.nom}
                          </Link>
                          <p className="text-[10px] font-mono text-neutral-400">{t.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PlanBadge plan={t.plan_tier} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={t.subscription_status} />
                      </TableCell>
                      <TableCell className="text-center text-xs font-bold">
                        {t.succursales_count ?? 0} B · {t.eleves_count ?? 0} S
                      </TableCell>
                      <TableCell className="text-right text-xs font-black">
                        {t.monthly_price} EUR/mo
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No tenant records" description="Onboard tenants to begin seeing recurring contributions." />
            )}
          </CardContent>
        </Card>

        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-black">Plan Distribution</CardTitle>
            <CardDescription className="text-xs">Platform market share breakdown by licensing tier.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex justify-center items-center">
            {chartData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No chart points" description="Subscription split will render when active plans are detected." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-black">Stripe Webhook Simulator</CardTitle>
            <CardDescription className="text-xs">
              Select a tenant row above to test stripe webhook invoice status transitions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-neutral-500" />
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Selected Target</p>
                <p className="text-sm font-black text-neutral-900">
                  {selectedTenant ? selectedTenant.nom : 'Select a tenant from the table'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg text-xs"
                disabled={!selectedTenant || webhookMutation.isPending}
                onClick={() => handleSimulate('past_due')}
              >
                Simulate Payment Fail (Past Due)
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg text-xs text-red-600 border-red-100 hover:bg-red-50"
                disabled={!selectedTenant || webhookMutation.isPending}
                onClick={() => handleSimulate('canceled')}
              >
                Simulate Churn (Cancel)
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                disabled={!selectedTenant || webhookMutation.isPending}
                onClick={() => handleSimulate('active')}
              >
                Restore Plan (Active)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black">Subscription Activity</CardTitle>
              <CardDescription className="text-xs">Recent subscription overrides performed.</CardDescription>
            </div>
            <FileLock2 className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent className="space-y-4 max-h-[350px] overflow-y-auto">
            {events.length ? (
              events.slice(0, 10).map((log) => (
                <div key={log.id} className="flex gap-3 rounded-xl border border-neutral-100 p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[#d0f137]">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-neutral-800 leading-snug">{log.description}</p>
                    <p className="mt-1 text-[9px] text-neutral-400">{formatDate(log.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No billing audit logs" description="Plan adjustments will show up in this feed." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BillingRevenuePage
