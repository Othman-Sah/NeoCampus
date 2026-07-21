import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  UserSquare2,
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
  TenantUser,
  UserFilters,
  superAdminApi,
} from '@/infrastructure/api/superAdminApiService'
import { EmptyState } from '@/ui/pages/super-admin/SuperAdminShared'
import { formatDate, exportToCSV } from '@/ui/pages/super-admin/SuperAdminUtils'

type Toast = { type: 'success' | 'error'; text: string } | null

export const UserDirectoryPage: React.FC = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { startImpersonation } = useAuthStore()

  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    etablissement_id: 'all',
    role: 'all',
    status: 'all',
    page: 1,
    per_page: 10,
  })

  const [toast, setToast] = useState<Toast>(null)
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null)
  const [isImpersonateOpen, setIsImpersonateOpen] = useState(false)
  const [impersonateForm, setImpersonateForm] = useState<ImpersonatePayload>({ user_id: '', reason: '' })
  
  const [resetPasswordResult, setResetPasswordResult] = useState<{ email: string; tempPass: string } | null>(null)

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    window.setTimeout(() => setToast(null), 3500)
  }

  // Query users
  const usersQuery = useQuery({
    queryKey: ['super-admin-users', filters],
    queryFn: () => superAdminApi.users(filters),
  })

  // Query tenants for the filter dropdown
  const tenantsQuery = useQuery({
    queryKey: ['super-admin-tenants-list'],
    queryFn: () => superAdminApi.tenants({ per_page: 100 }),
  })

  const users = usersQuery.data?.data ?? []
  const tenants = tenantsQuery.data?.data ?? []

  const handleFilterChange = <K extends keyof UserFilters>(key: K, value: UserFilters[K]) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === 'page' ? (value as number) : 1,
    }))
  }

  const disableMutation = useMutation({
    mutationFn: superAdminApi.disableUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] })
      showToast('success', 'User account has been disabled.')
    },
    onError: () => showToast('error', 'Failed to disable user.'),
  })

  const enableMutation = useMutation({
    mutationFn: superAdminApi.enableUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] })
      showToast('success', 'User account has been activated.')
    },
    onError: () => showToast('error', 'Failed to activate user.'),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: superAdminApi.resetUserPassword,
    onSuccess: (data, userId) => {
      const u = users.find((user) => user.id === userId)
      if (u) {
        setResetPasswordResult({
          email: u.email,
          tempPass: data.temporary_password,
        })
      }
      showToast('success', 'Temporary password generated successfully.')
    },
    onError: () => showToast('error', 'Failed to reset user password.'),
  })

  const impersonateMutation = useMutation({
    mutationFn: superAdminApi.impersonate,
    onSuccess: (data: ImpersonateResponse) => {
      startImpersonation(data.user, data.token, data.original_user, data.original_token)
      setIsImpersonateOpen(false)
      navigate('/dashboard')
      window.location.reload()
    },
    onError: () => showToast('error', 'Impersonation session failed.'),
  })

  const triggerImpersonate = (user: TenantUser) => {
    setSelectedUser(user)
    setImpersonateForm({
      user_id: String(user.id),
      reason: `Super-admin diagnostics session for user ${user.email}`,
    })
    setIsImpersonateOpen(true)
  }

  const handleLaunchImpersonation = () => {
    if (!impersonateForm.reason || impersonateForm.reason.length < 5) {
      showToast('error', 'Please provide a descriptive reason (at least 5 characters).')
      return
    }
    impersonateMutation.mutate(impersonateForm)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super-admin':
        return 'bg-red-100 text-red-800 border border-red-200'
      case 'admin':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'teacher':
      case 'enseignant':
        return 'bg-purple-100 text-purple-800 border border-purple-200'
      case 'student':
      case 'eleve':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      default:
        return 'bg-neutral-100 text-neutral-800 border border-neutral-200'
    }
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
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">User Directory</h1>
          <p className="text-sm text-neutral-500">Manage, impersonate, suspend, or reset credentials of any user on the platform.</p>
        </div>
      </div>

      <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
        <CardContent className="grid grid-cols-1 gap-3 pt-6 lg:grid-cols-[2fr_220px_160px_160px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              className="pl-9"
              placeholder="Search by name, last name or email"
              value={filters.search ?? ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <Select
            value={String(filters.etablissement_id)}
            onValueChange={(val) => handleFilterChange('etablissement_id', val === 'all' ? 'all' : Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All schools" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All schools</SelectItem>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.role}
            onValueChange={(val) => handleFilterChange('role', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(val) => handleFilterChange('status', val as UserFilters['status'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {usersQuery.isError && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Error loading users</AlertTitle>
          <AlertDescription>The global user directory could not be fetched.</AlertDescription>
        </Alert>
      )}

      <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-black">All Platform Users</CardTitle>
            <CardDescription className="text-xs">
              {usersQuery.data?.total ?? 0} user records match the current filters.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-xl"
            onClick={() => {
              const exportData = users.map((u) => ({
                ID: u.id,
                Name: `${u.prenom} ${u.nom}`,
                Email: u.email,
                Role: u.role,
                Institution: u.etablissement?.nom ?? 'Super Admin',
                Status: u.disabled_at ? 'Disabled' : 'Active',
                Created: formatDate(u.created_at),
              }))
              exportToCSV(exportData, 'users_list.csv')
            }}
          >
            Export to CSV
          </Button>
        </CardHeader>
        <CardContent>
          {users.length ? (
            <Table>
              <TableHeader className="bg-neutral-50/50">
                <TableRow>
                  <TableHead className="text-xs font-extrabold">User</TableHead>
                  <TableHead className="text-xs font-extrabold">Role</TableHead>
                  <TableHead className="text-xs font-extrabold">Tenant Institution</TableHead>
                  <TableHead className="text-xs font-extrabold">Status</TableHead>
                  <TableHead className="text-xs font-extrabold">Created</TableHead>
                  <TableHead className="text-xs font-extrabold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-neutral-50/40">
                    <TableCell>
                      <div>
                        <p className="text-sm font-black text-neutral-900">
                          {user.prenom} {user.nom}
                        </p>
                        <p className="text-[10px] font-mono text-neutral-400">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`uppercase text-[9px] font-extrabold ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.etablissement ? (
                        <Link
                          to={`/super-admin/tenants/${user.etablissement.id}`}
                          className="text-xs font-bold text-neutral-700 hover:underline hover:text-black"
                        >
                          {user.etablissement.nom}
                        </Link>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">None (Super Admin)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.disabled_at ? (
                        <Badge className="bg-red-100 text-red-800 border border-red-200 capitalize text-[10px] font-bold">
                          Disabled
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border border-green-200 capitalize text-[10px] font-bold">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 font-bold">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        {user.role !== 'super-admin' && (
                          <>
                            {user.disabled_at ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 border-green-200 text-green-700 hover:bg-green-50"
                                onClick={() => enableMutation.mutate(user.id)}
                                disabled={enableMutation.isPending}
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => disableMutation.mutate(user.id)}
                                disabled={disableMutation.isPending}
                              >
                                <ShieldX className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onClick={() => resetPasswordMutation.mutate(user.id)}
                              disabled={resetPasswordMutation.isPending}
                              title="Reset Password"
                            >
                              <KeyRound className="h-3.5 w-3.5 text-neutral-600" />
                            </Button>
                            {!user.disabled_at && (
                              <Button
                                size="sm"
                                className="h-8 bg-black px-2 text-white hover:bg-neutral-900"
                                onClick={() => triggerImpersonate(user)}
                                title="Impersonate"
                              >
                                <UserSquare2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No users found" description="Adjust search or filters to locate platform users." />
          )}

          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
            <p className="text-xs font-bold text-neutral-500">
              Page {usersQuery.data?.current_page ?? 1} of {usersQuery.data?.last_page ?? 1}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page ?? 1) <= 1}
                onClick={() => handleFilterChange('page', (filters.page ?? 1) - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page ?? 1) >= (usersQuery.data?.last_page ?? 1)}
                onClick={() => handleFilterChange('page', (filters.page ?? 1) + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={Boolean(resetPasswordResult)} onOpenChange={(open) => !open && setResetPasswordResult(null)}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-neutral-700" />
              Password Reset Complete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-neutral-500">
              A temporary password has been successfully generated for <strong>{resetPasswordResult?.email}</strong>.
            </p>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-center justify-between font-mono text-sm font-black text-neutral-800">
              <span>{resetPasswordResult?.tempPass}</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-8 font-black hover:bg-neutral-100"
                onClick={() => {
                  if (resetPasswordResult) {
                    navigator.clipboard.writeText(resetPasswordResult.tempPass)
                    showToast('success', 'Copied to clipboard!')
                  }
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-[10px] text-neutral-400">
              Please share this temporary password with the user. They will be forced to update it on their next login attempt.
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              className="bg-black text-white hover:bg-neutral-900 rounded-xl font-bold"
              onClick={() => setResetPasswordResult(null)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Impersonate Dialog */}
      <Dialog open={isImpersonateOpen} onOpenChange={setIsImpersonateOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black">
              <Lock className="h-5 w-5" />
              Confirm Impersonation Session
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-neutral-500">
              You are about to launch a diagnostic login-as session for{' '}
              <strong>
                {selectedUser?.prenom} {selectedUser?.nom}
              </strong>{' '}
              ({selectedUser?.email}). This session bypass will be logged for security audit tracking.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">Reason / Support Ticket ID</label>
              <Input
                placeholder="e.g., Ticket #9023 - Inspect library module crash"
                value={impersonateForm.reason}
                onChange={(e) => setImpersonateForm({ ...impersonateForm, reason: e.target.value })}
              />
            </div>
            <div className="flex items-start gap-2.5 mt-2">
              <input type="checkbox" id="audit-confirm" className="mt-1 h-3.5 w-3.5 rounded border-neutral-300" required />
              <label htmlFor="audit-confirm" className="text-[10px] text-neutral-400 font-bold leading-normal">
                I understand this is a privileged administrative activity and is subjected to compliance logging.
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
              {impersonateMutation.isPending ? 'Launching...' : 'Start Impersonation'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserDirectoryPage
