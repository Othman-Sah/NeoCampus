import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Lock,
  Search,
  ShieldAlert,
  UserSquare2,
  Users,
} from 'lucide-react'
import { useAuthStore } from '@/application/stores/authStore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  ImpersonatePayload,
  ImpersonateResponse,
  Tenant,
  TenantUser,
  superAdminApi,
} from '@/infrastructure/api/superAdminApiService'
import { EmptyState } from '@/ui/pages/super-admin/SuperAdminShared'
import { formatDate } from '@/ui/pages/super-admin/SuperAdminUtils'

type Toast = { type: 'success' | 'error'; text: string } | null

export const ImpersonationCenterPage: React.FC = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { startImpersonation } = useAuthStore()

  const [toast, setToast] = useState<Toast>(null)
  const [selectedTenantId, setSelectedTenantId] = useState<number | 'none'>('none')
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null)
  const [isImpersonateOpen, setIsImpersonateOpen] = useState(false)
  const [impersonateForm, setImpersonateForm] = useState<ImpersonatePayload>({ user_id: '', reason: '' })

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    window.setTimeout(() => setToast(null), 3500)
  }

  // Load all tenants
  const tenantsQuery = useQuery({
    queryKey: ['super-admin-tenants-impersonate'],
    queryFn: () => superAdminApi.tenants({ per_page: 100 }),
  })

  // Load users for selected tenant
  const tenantUsersQuery = useQuery({
    queryKey: ['super-admin-tenant-users-impersonate', selectedTenantId],
    queryFn: () =>
      selectedTenantId !== 'none'
        ? superAdminApi.users({ etablissement_id: selectedTenantId, per_page: 50 })
        : Promise.resolve({ data: [] }),
    enabled: selectedTenantId !== 'none',
  })

  // Load impersonation history logs
  const historyQuery = useQuery({
    queryKey: ['super-admin-impersonation-history'],
    queryFn: () => superAdminApi.impersonationHistory(),
  })

  const tenants = tenantsQuery.data?.data ?? []
  const tenantUsers = tenantUsersQuery.data?.data ?? []
  const history = historyQuery.data?.data ?? []

  const impersonateMutation = useMutation({
    mutationFn: superAdminApi.impersonate,
    onSuccess: (data: ImpersonateResponse) => {
      startImpersonation(data.user, data.token, data.original_user, data.original_token)
      setIsImpersonateOpen(false)
      showToast('success', 'Impersonated session loaded.')
      navigate('/dashboard')
      window.location.reload()
    },
    onError: () => showToast('error', 'Impersonation request rejected by server. Reason required.'),
  })

  const triggerImpersonate = (user: TenantUser) => {
    setSelectedUser(user)
    setImpersonateForm({
      user_id: String(user.id),
      reason: `Support diagnostics session for tenant account ${user.email}`,
    })
    setIsImpersonateOpen(true)
  }

  const handleLaunchImpersonation = () => {
    if (!impersonateForm.reason || impersonateForm.reason.length < 5) {
      showToast('error', 'Please supply a descriptive audit reason (at least 5 characters).')
      return
    }
    impersonateMutation.mutate(impersonateForm)
  }

  return (
    <div className="space-y-6 pb-10">
      {toast && (
        <div className={`fixed right-6 top-6 z-[10000] rounded-xl px-4 py-3 text-xs font-bold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
          {toast.text}
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Impersonation Center</h1>
          <p className="text-sm text-neutral-500">
            Secure diagnostic login-as portal to investigate client issues. Full audit logging is enforced.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Impersonation Selector */}
        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-black">Launch Session Bypass</CardTitle>
            <CardDescription className="text-xs">
              Select a target institution and pick a user account to impersonate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-neutral-500 uppercase">Target Institution</label>
              <Select
                value={String(selectedTenantId)}
                onValueChange={(val) => setSelectedTenantId(val === 'none' ? 'none' : Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a school..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">Select a school...</SelectItem>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.nom} ({t.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTenantId !== 'none' && (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-extrabold text-neutral-500 uppercase flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-neutral-400" />
                  Available Accounts
                </p>

                {tenantUsersQuery.isLoading ? (
                  <div className="text-xs text-neutral-400 font-bold">Fetching school user directory...</div>
                ) : tenantUsers.length ? (
                  <div className="border border-neutral-100 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-neutral-50/50">
                        <TableRow>
                          <TableHead className="text-xs font-extrabold">Name</TableHead>
                          <TableHead className="text-xs font-extrabold">Role</TableHead>
                          <TableHead className="text-xs font-extrabold text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tenantUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-neutral-50/40">
                            <TableCell>
                              <div>
                                <p className="text-xs font-black text-neutral-800">
                                  {user.prenom} {user.nom}
                                </p>
                                <p className="text-[10px] font-mono text-neutral-400">{user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-neutral-100 text-neutral-700 uppercase text-[9px] font-bold">
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                className="h-7 bg-black hover:bg-neutral-900 text-white rounded-lg text-xs font-bold gap-1.5"
                                onClick={() => triggerImpersonate(user)}
                              >
                                <UserSquare2 className="h-3.5 w-3.5" />
                                Login As
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <EmptyState title="No users in institution" description="This tenant does not have any active users." />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Impersonation Security Banner */}
        <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-black flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-neutral-900" />
              Security Policy
            </CardTitle>
            <CardDescription className="text-xs">Privileged Administrative Operations Rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-neutral-500 font-bold leading-relaxed">
            <p>
              1. Impersonation allows full reading and writing capabilities inside the tenant's workspace scope.
            </p>
            <p>
              2. Every impersonated session must be logged with a clear explanation, referenced by a customer support ticket.
            </p>
            <p>
              3. System operators should never view or modify students' transcripts, bulletins, or financial invoices unless requested by the school owner.
            </p>
            <p>
              4. Sessions are automatically bounded. Access can be revoked anytime by the client or when clicking the return banner.
            </p>
          </CardContent>
          <div className="bg-neutral-900 rounded-b-xl p-4 text-[#d0f137] font-black text-center text-xs">
            COMPLIANCE LOGGING ACTIVE
          </div>
        </Card>
      </div>

      {/* History Log Table */}
      <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-base font-black">Audit History of Impersonations</CardTitle>
          <CardDescription className="text-xs">Logs detailing historical platform session overrides.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length ? (
            <Table>
              <TableHeader className="bg-neutral-50/50">
                <TableRow>
                  <TableHead className="text-xs font-extrabold">Operator (Super Admin)</TableHead>
                  <TableHead className="text-xs font-extrabold">Details</TableHead>
                  <TableHead className="text-xs font-extrabold">Justification (Reason)</TableHead>
                  <TableHead className="text-xs font-extrabold">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((log) => (
                  <TableRow key={log.id} className="hover:bg-neutral-50/40">
                    <TableCell>
                      {log.actor ? (
                        <div>
                          <p className="text-xs font-black text-neutral-800">
                            {log.actor.prenom} {log.actor.nom}
                          </p>
                          <p className="text-[9px] font-mono text-neutral-400">{log.actor.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 font-bold italic">System</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-sm">
                      <p className="text-xs font-bold text-neutral-800 leading-normal">
                        {log.description || `Impersonated user ID: ${log.metadata?.impersonated_user_id}`}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        IP: {log.ip_address || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-neutral-600 italic">
                      "{log.metadata?.reason || 'No reason supplied'}"
                    </TableCell>
                    <TableCell className="text-xs font-bold text-neutral-500">
                      {formatDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No impersonation records" description="No session overrides have been logged." />
          )}
        </CardContent>
      </Card>

      {/* Launch Impersonation Confirmation Modal */}
      <Dialog open={isImpersonateOpen} onOpenChange={setIsImpersonateOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black">
              <Lock className="h-5 w-5" />
              Launch Impersonated Session
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-neutral-500">
              You are launching an active authentication session for{' '}
              <strong>
                {selectedUser?.prenom} {selectedUser?.nom}
              </strong>{' '}
              ({selectedUser?.email}). This session bypass will be registered in compliance logs.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">Reason / Support Ticket ID</label>
              <Input
                placeholder="e.g., Ticket #9012 - Fix finance module invoices list error"
                value={impersonateForm.reason}
                onChange={(e) => setImpersonateForm({ ...impersonateForm, reason: e.target.value })}
              />
            </div>
            <div className="flex items-start gap-2.5 mt-2">
              <input type="checkbox" id="audit-confirm-impersonate" className="mt-1 h-3.5 w-3.5 rounded border-neutral-300" required />
              <label htmlFor="audit-confirm-impersonate" className="text-[10px] text-neutral-400 font-bold leading-normal">
                I confirm this session bypass is requested and authorized, and all actions during this session will be recorded in compliance logs under my operator identity.
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" className="rounded-xl" onClick={() => setIsImpersonateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#d0f137] text-black font-extrabold hover:bg-[#b8d62c] rounded-xl"
              disabled={impersonateMutation.isPending}
              onClick={handleLaunchImpersonation}
            >
              {impersonateMutation.isPending ? 'Logging In...' : 'Launch Impersonation'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ImpersonationCenterPage
