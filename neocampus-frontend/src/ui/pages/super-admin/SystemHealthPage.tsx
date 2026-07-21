import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  Cpu,
  Database,
  HardDrive,
  HeartPulse,
  RefreshCw,
  Server,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { superAdminApi } from '@/infrastructure/api/superAdminApiService'

const HealthProgress: React.FC<{
  label: string
  value: number
  text: string
  icon: React.ComponentType<{ className?: string }>
}> = ({ label, value, text, icon: Icon }) => (
  <Card className="border border-neutral-100 bg-white rounded-xl shadow-sm">
    <CardContent className="pt-6 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase text-neutral-500">{label}</span>
        <Icon className="h-5 w-5 text-neutral-400" />
      </div>
      <div>
        <p className="text-3xl font-black">{value}%</p>
        <p className="text-[10px] text-neutral-400 mt-0.5">{text}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${value > 85 ? 'bg-red-500' : value > 60 ? 'bg-amber-500' : 'bg-[#d0f137]'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </CardContent>
  </Card>
)

export const SystemHealthPage: React.FC = () => {
  const healthQuery = useQuery({
    queryKey: ['super-admin-system-health'],
    queryFn: superAdminApi.getSystemHealth,
    refetchInterval: 10000, // refresh every 10 seconds automatically
  })

  const health = healthQuery.data
  const load = health?.system_load
  const db = health?.database
  const sessions = health?.sessions
  const queue = health?.queue

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">System Health</h1>
          <p className="text-sm text-neutral-500">Live monitoring of resource usage, database tables registry, queues status, and active user sessions.</p>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl" onClick={() => healthQuery.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh telemetry
        </Button>
      </div>

      {healthQuery.isError && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Telemetry link broken</AlertTitle>
          <AlertDescription>System health metrics could not be fetched from the API. Check server processes.</AlertDescription>
        </Alert>
      )}

      {/* Load indicators row */}
      {load ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <HealthProgress label="Processor Load" value={load.cpu} text="CPU utilization" icon={Cpu} />
          <HealthProgress
            label="Server RAM"
            value={load.memory?.percentage ?? 0}
            text={`${load.memory?.used ?? 0} GB used / ${load.memory?.total ?? 16} GB total`}
            icon={Server}
          />
          <HealthProgress
            label="System Disk"
            value={load.disk?.percentage ?? 0}
            text={`${load.disk?.used ?? 0} GB used / ${load.disk?.total ?? 100} GB total`}
            icon={HardDrive}
          />
        </div>
      ) : (
        <div className="text-xs text-neutral-400 font-bold">Awaiting server load telemetry...</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Telemetry diagnostics */}
        <div className="space-y-6 lg:col-span-2">
          {/* Database stats */}
          <Card className="border border-neutral-100 bg-white rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <Database className="h-5 w-5 text-neutral-600" />
                  Database Registry ({db?.name || 'Loading...'})
                </CardTitle>
                <CardDescription className="text-xs">Approximate row counts per MySQL database table.</CardDescription>
              </div>
              {db && (
                <div className="text-right">
                  <p className="text-xs font-bold text-neutral-500 uppercase">Estimated size</p>
                  <p className="text-lg font-black text-neutral-900">{db.size_mb} MB</p>
                </div>
              )}
            </CardHeader>
            <CardContent className="max-h-[350px] overflow-y-auto">
              {db?.tables?.length ? (
                <Table>
                  <TableHeader className="bg-neutral-50/50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="text-xs font-extrabold">Table Name</TableHead>
                      <TableHead className="text-xs font-extrabold text-right">Approximate Rows</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {db.tables.map((table: any) => (
                      <TableRow key={table.name} className="hover:bg-neutral-50/40">
                        <TableCell className="font-mono text-xs text-neutral-700">{table.name}</TableCell>
                        <TableCell className="text-right text-xs font-bold text-neutral-900">
                          {table.rows_approx.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-xs text-neutral-400 font-bold p-4 text-center">No table rows telemetry available.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status panel */}
        <div className="space-y-6">
          {/* Platform Status */}
          <Card className="border border-neutral-100 bg-white rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-red-500" />
                Uptime & Processes
              </CardTitle>
              <CardDescription className="text-xs">Platform availability metrics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs font-bold text-neutral-700">
              <div className="flex justify-between border-b border-neutral-50 pb-2">
                <span className="text-neutral-400">System Uptime</span>
                <span>{load?.uptime ?? 'Calculating...'}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-50 pb-2">
                <span className="text-neutral-400">DB Threads</span>
                <span>{db?.connections ?? 0} active</span>
              </div>
              <div className="flex justify-between border-b border-neutral-50 pb-2">
                <span className="text-neutral-400">Queue pending</span>
                <span className={queue?.pending > 0 ? 'text-amber-600' : 'text-neutral-700'}>{queue?.pending ?? 0} jobs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Queue failed</span>
                <span className={queue?.failed > 0 ? 'text-red-600' : 'text-neutral-700'}>{queue?.failed ?? 0} jobs</span>
              </div>
            </CardContent>
          </Card>

          {/* Session Metrics */}
          <Card className="border border-neutral-100 bg-white rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Active Sessions
              </CardTitle>
              <CardDescription className="text-xs">Database session driver telemetry.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs font-bold text-neutral-700">
              <div className="flex justify-between border-b border-neutral-50 pb-2">
                <span className="text-neutral-400">Active User Sessions</span>
                <span>{sessions?.active_users ?? 0} online</span>
              </div>
              <div className="flex justify-between border-b border-neutral-50 pb-2">
                <span className="text-neutral-400">Anonymous Guests</span>
                <span>{sessions?.guests ?? 0} sessions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total session footprint</span>
                <span>{sessions?.total ?? 0} total</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SystemHealthPage
