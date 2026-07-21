import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileLock2,
  KeyRound,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sliders,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AuditFilters, AuditLog, superAdminApi } from '@/infrastructure/api/superAdminApiService'
import { EmptyState } from '@/ui/pages/super-admin/SuperAdminShared'

export const AuditLogsPage: React.FC = () => {
  const [filters, setFilters] = useState<AuditFilters>({
    search: '',
    action: 'all',
    target_type: 'all',
    page: 1,
    per_page: 10,
  })

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const logsQuery = useQuery({
    queryKey: ['super-admin-audit-logs-page', filters],
    queryFn: () => superAdminApi.filteredAuditLogs(filters),
  })

  const logs = logsQuery.data?.data ?? []

  const handleFilterChange = <K extends keyof AuditFilters>(key: K, value: AuditFilters[K]) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === 'page' ? (value as number) : 1,
    }))
  }

  const getEventIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'impersonation_started':
        return <Lock className="h-4 w-4 text-[#d0f137]" />
      case 'user_disabled':
        return <ShieldX className="h-4 w-4 text-red-500" />
      case 'user_enabled':
        return <ShieldCheck className="h-4 w-4 text-green-500" />
      case 'user_password_reset':
        return <KeyRound className="h-4 w-4 text-amber-500" />
      case 'tenant_onboarded':
        return <Building2 className="h-4 w-4 text-blue-500" />
      case 'tenant_limits_overridden':
        return <Sliders className="h-4 w-4 text-purple-500" />
      case 'tenant_subscription_overridden':
        return <Activity className="h-4 w-4 text-emerald-500" />
      default:
        return <FileLock2 className="h-4 w-4 text-neutral-500" />
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'impersonation_started':
        return 'bg-black text-[#d0f137]'
      case 'user_disabled':
        return 'bg-red-100 text-red-800'
      case 'user_enabled':
        return 'bg-green-100 text-green-800'
      case 'user_password_reset':
        return 'bg-yellow-100 text-yellow-800'
      case 'tenant_onboarded':
        return 'bg-blue-100 text-blue-800'
      case 'tenant_limits_overridden':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Audit & Compliance Log</h1>
          <p className="text-sm text-neutral-500">Immutable chronological timeline of administrative actions performed across NeoCampus.</p>
        </div>
      </div>

      <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
        <CardContent className="grid grid-cols-1 gap-3 pt-6 lg:grid-cols-[2.5fr_200px_200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              className="pl-9"
              placeholder="Search audit descriptions or metadata logs..."
              value={filters.search ?? ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <Select
            value={filters.action}
            onValueChange={(val) => handleFilterChange('action', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="impersonation_started">Impersonation started</SelectItem>
              <SelectItem value="user_disabled">User disabled</SelectItem>
              <SelectItem value="user_enabled">User enabled</SelectItem>
              <SelectItem value="user_password_reset">User password reset</SelectItem>
              <SelectItem value="tenant_onboarded">Tenant onboarded</SelectItem>
              <SelectItem value="tenant_limits_overridden">Limits adjusted</SelectItem>
              <SelectItem value="tenant_subscription_overridden">Subscription changed</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.target_type}
            onValueChange={(val) => handleFilterChange('target_type', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All targets" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All targets</SelectItem>
              <SelectItem value="tenant">Tenant</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {logsQuery.isError && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Error loading audit trail</AlertTitle>
          <AlertDescription>System audit records could not be fetched from the database.</AlertDescription>
        </Alert>
      )}

      <Card className="border border-neutral-100 rounded-xl shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-base font-black">Platform Activity Timeline</CardTitle>
          <CardDescription className="text-xs">
            Showing latest logging entries. Metadata is stored as JSON payload.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length ? (
            <Table>
              <TableHeader className="bg-neutral-50/50">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="text-xs font-extrabold">Action Type</TableHead>
                  <TableHead className="text-xs font-extrabold">Log Description</TableHead>
                  <TableHead className="text-xs font-extrabold">Operator (Actor)</TableHead>
                  <TableHead className="text-xs font-extrabold">Date & Time</TableHead>
                  <TableHead className="text-xs font-extrabold text-right">Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  // Generate human readable description if backend gives standard DB values
                  const description = log.description || log.metadata?.reason || `Action: ${log.action} on ${log.target_type} ID ${log.target_id}`
                  
                  return (
                    <TableRow key={log.id} className="hover:bg-neutral-50/40">
                      <TableCell>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white">
                          {getEventIcon(log.action)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`uppercase text-[9px] font-black tracking-wider ${getActionBadgeColor(log.action)}`}>
                          {log.action.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-xs font-bold text-neutral-800 leading-normal">
                          {description}
                        </p>
                        {log.metadata?.reason && (
                          <p className="text-[10px] text-neutral-400 italic mt-0.5">
                            Reason: "{log.metadata.reason}"
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.actor ? (
                          <div>
                            <p className="text-xs font-extrabold text-neutral-700">
                              {log.actor.prenom} {log.actor.nom}
                            </p>
                            <p className="text-[9px] font-mono text-neutral-400">{log.actor.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400 font-bold italic">System</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-neutral-500">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 rounded-lg"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4 text-neutral-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No logs matching criteria" description="Expand your filters or search terms." />
          )}

          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
            <p className="text-xs font-bold text-neutral-500">
              Page {logsQuery.data?.current_page ?? 1} of {logsQuery.data?.last_page ?? 1}
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
                disabled={(filters.page ?? 1) >= (logsQuery.data?.last_page ?? 1)}
                onClick={() => handleFilterChange('page', (filters.page ?? 1) + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Payload Dialog */}
      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-xl bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <FileLock2 className="h-5 w-5 text-neutral-700" />
              Audit Payload Metadata
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase">Context Info</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold mt-1 text-neutral-700 bg-neutral-50 border border-neutral-100 rounded-xl p-3">
                <div><span className="text-neutral-400">Action:</span> {selectedLog?.action}</div>
                <div><span className="text-neutral-400">IP:</span> {selectedLog?.ip_address || 'N/A'}</div>
                <div><span className="text-neutral-400">Target Type:</span> {selectedLog?.target_type || 'N/A'}</div>
                <div><span className="text-neutral-400">Target ID:</span> {selectedLog?.target_id || 'N/A'}</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase">Browser User Agent</p>
              <p className="text-[10px] font-mono text-neutral-600 bg-neutral-50 border border-neutral-100 rounded-xl p-3 mt-1 break-all">
                {selectedLog?.user_agent || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase">JSON Metadata Payload</p>
              <pre className="text-xs font-mono text-neutral-800 bg-neutral-900 text-[#d0f137] rounded-xl p-4 mt-1 overflow-x-auto max-h-56">
                {selectedLog?.metadata ? JSON.stringify(selectedLog.metadata, null, 2) : '{}'}
              </pre>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              className="bg-black text-white hover:bg-neutral-900 rounded-xl font-bold"
              onClick={() => setSelectedLog(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AuditLogsPage
