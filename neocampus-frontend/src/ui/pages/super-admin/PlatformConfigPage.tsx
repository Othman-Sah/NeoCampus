import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  Award,
  BookOpen,
  Building2,
  DollarSign,
  Layout,
  Plus,
  RefreshCw,
  Save,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { superAdminApi } from '@/infrastructure/api/superAdminApiService'

type Tab = 'plans' | 'defaults' | 'features' | 'maintenance'

const TabButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-xl px-4 py-2 text-xs font-black uppercase transition ${active ? 'bg-black text-[#d0f137]' : 'bg-white text-neutral-500 hover:bg-neutral-50'}`}
  >
    {label}
  </button>
)

const FEATURES_LIST = [
  { id: 'dashboard', label: 'Dashboard Control' },
  { id: 'users', label: 'User Directory' },
  { id: 'finance', label: 'Finance & Payments' },
  { id: 'library', label: 'Library Catalog' },
  { id: 'exams', label: 'Exams & Grades' },
  { id: 'transport', label: 'Bus Transport' },
  { id: 'ai_chatbot', label: 'AI Virtual Assistant' },
]

export const PlatformConfigPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('plans')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    window.setTimeout(() => setToast(null), 3000)
  }

  // Fetch settings
  const settingsQuery = useQuery({
    queryKey: ['super-admin-platform-settings'],
    queryFn: superAdminApi.getPlatformSettings,
  })

  // State local copies for editing
  const [plans, setPlans] = useState<any>(null)
  const [defaults, setDefaults] = useState<any>(null)
  const [featureFlags, setFeatureFlags] = useState<any>(null)
  const [maintenance, setMaintenance] = useState<any>(null)

  // Initialize state once query completes
  React.useEffect(() => {
    if (settingsQuery.data) {
      setPlans(JSON.parse(JSON.stringify(settingsQuery.data.plans)))
      setDefaults(JSON.parse(JSON.stringify(settingsQuery.data.defaults)))
      setFeatureFlags(JSON.parse(JSON.stringify(settingsQuery.data.feature_flags)))
      setMaintenance(JSON.parse(JSON.stringify(settingsQuery.data.maintenance)))
    }
  }, [settingsQuery.data])

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      superAdminApi.updatePlatformSettings(key, value),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-platform-settings'] })
      showToast('success', `Settings for '${variables.key}' saved successfully.`)
    },
    onError: () => showToast('error', 'Failed to save configuration settings.'),
  })

  const handleSave = (key: string, value: any) => {
    updateMutation.mutate({ key, value })
  }

  if (settingsQuery.isLoading || !plans || !defaults || !featureFlags || !maintenance) {
    return <div className="text-sm font-bold text-neutral-500">Loading configurations dashboard...</div>
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
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Platform Configuration</h1>
          <p className="text-sm text-neutral-500">Configure licensing plan tiers, set defaults for new schools, manage feature flags, or trigger maintenance.</p>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl" onClick={() => settingsQuery.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Reload settings
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl bg-neutral-100 p-2">
        <TabButton active={activeTab === 'plans'} label="Plan Tiers" onClick={() => setActiveTab('plans')} />
        <TabButton active={activeTab === 'defaults'} label="New Tenant Defaults" onClick={() => setActiveTab('defaults')} />
        <TabButton active={activeTab === 'features'} label="Feature Flags" onClick={() => setActiveTab('features')} />
        <TabButton active={activeTab === 'maintenance'} label="Maintenance Mode" onClick={() => setActiveTab('maintenance')} />
      </div>

      {/* Plans Config Tab */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 gap-6">
          {Object.keys(plans).map((tierKey) => {
            const tier = plans[tierKey]
            return (
              <Card key={tierKey} className="border border-neutral-100 bg-white shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black uppercase text-neutral-900">{tierKey} Tier</CardTitle>
                    <CardDescription className="text-xs">Adjust licensing price, capacity limits, and permissions.</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="bg-black text-white hover:bg-neutral-900 gap-1.5 rounded-lg text-xs"
                    onClick={() => handleSave('plans', plans)}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save {tierKey}
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-4 border-r border-neutral-100 pr-6">
                    <p className="text-xs font-black uppercase text-neutral-500 flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4" />
                      Licensing pricing
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-400">Monthly Price (EUR)</label>
                      <Input
                        type="number"
                        value={tier.price}
                        onChange={(e) => {
                          const updated = { ...plans }
                          updated[tierKey].price = Number(e.target.value)
                          setPlans(updated)
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-r border-neutral-100 px-6">
                    <p className="text-xs font-black uppercase text-neutral-500 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      Licensing limits
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400">Max Branches</label>
                        <Input
                          type="number"
                          value={tier.max_branches}
                          onChange={(e) => {
                            const updated = { ...plans }
                            updated[tierKey].max_branches = Number(e.target.value)
                            setPlans(updated)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400">Max Students</label>
                        <Input
                          type="number"
                          value={tier.max_students}
                          onChange={(e) => {
                            const updated = { ...plans }
                            updated[tierKey].max_students = Number(e.target.value)
                            setPlans(updated)
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pl-6">
                    <p className="text-xs font-black uppercase text-neutral-500 flex items-center gap-1.5">
                      <Shield className="h-4 w-4" />
                      Allowed modules
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {FEATURES_LIST.map((feat) => {
                        const hasFeat = tier.features.includes(feat.id)
                        return (
                          <div key={feat.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`${tierKey}-${feat.id}`}
                              checked={hasFeat}
                              onCheckedChange={(checked) => {
                                const updated = { ...plans }
                                if (checked) {
                                  updated[tierKey].features = [...updated[tierKey].features, feat.id]
                                } else {
                                  updated[tierKey].features = updated[tierKey].features.filter((f: string) => f !== feat.id)
                                }
                                setPlans(updated)
                              }}
                            />
                            <label htmlFor={`${tierKey}-${feat.id}`} className="text-xs font-bold text-neutral-700 select-none">
                              {feat.label}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Defaults Tab */}
      {activeTab === 'defaults' && (
        <Card className="border border-neutral-100 bg-white shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black text-neutral-900">Tenant Bootstrapping Parameters</CardTitle>
              <CardDescription className="text-xs">Configure the default settings applied to new schools upon onboarding.</CardDescription>
            </div>
            <Button
              className="bg-black text-white hover:bg-neutral-900 gap-1.5 rounded-lg text-xs"
              onClick={() => handleSave('defaults', defaults)}
              disabled={updateMutation.isPending}
            >
              <Save className="h-3.5 w-3.5" />
              Save Defaults
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Library Defaults */}
            <div className="space-y-4 border-r border-neutral-100 pr-6">
              <p className="text-xs font-black uppercase text-neutral-500 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                Library defaults
              </p>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400">Loan Duration (Days)</label>
                <Input
                  type="number"
                  value={defaults.library_loan_duration_days}
                  onChange={(e) => setDefaults({ ...defaults, library_loan_duration_days: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400">Max Active Books per Member</label>
                <Input
                  type="number"
                  value={defaults.library_max_loans_per_member}
                  onChange={(e) => setDefaults({ ...defaults, library_max_loans_per_member: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400">Overdue Fine Rate per Day (MAD)</label>
                <Input
                  type="number"
                  value={defaults.library_fine_per_day_mad}
                  onChange={(e) => setDefaults({ ...defaults, library_fine_per_day_mad: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Bulletin Defaults */}
            <div className="space-y-4 border-r border-neutral-100 px-6">
              <p className="text-xs font-black uppercase text-neutral-500 flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                Academic reports (Bulletins)
              </p>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400">Default Period Format</label>
                <Select
                  value={defaults.bulletin_format_periode}
                  onValueChange={(val) => setDefaults({ ...defaults, bulletin_format_periode: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="trimestre">Trimestre</SelectItem>
                    <SelectItem value="semestre">Semestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400">Encouragements</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={defaults.bulletin_seuil_encouragements}
                    onChange={(e) => setDefaults({ ...defaults, bulletin_seuil_encouragements: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400">Tableau d'Honneur</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={defaults.bulletin_seuil_tableau_honneur}
                    onChange={(e) => setDefaults({ ...defaults, bulletin_seuil_tableau_honneur: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400">Félicitations</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={defaults.bulletin_seuil_felicitations}
                    onChange={(e) => setDefaults({ ...defaults, bulletin_seuil_felicitations: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700">Show Class Min / Max Grades</span>
                  <Switch
                    checked={defaults.bulletin_show_min_max}
                    onCheckedChange={(checked) => setDefaults({ ...defaults, bulletin_show_min_max: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700">Show Student Rank per Subject</span>
                  <Switch
                    checked={defaults.bulletin_show_rang_matiere}
                    onCheckedChange={(checked) => setDefaults({ ...defaults, bulletin_show_rang_matiere: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Financial Defaults */}
            <div className="space-y-4 pl-6">
              <p className="text-xs font-black uppercase text-neutral-500 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                Financial templates
              </p>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400">Default Registration Fee (MAD)</label>
                <Input
                  type="number"
                  value={defaults.fee_registration_montant}
                  onChange={(e) => setDefaults({ ...defaults, fee_registration_montant: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400">Default Monthly Tuition Fee (MAD)</label>
                <Input
                  type="number"
                  value={defaults.fee_monthly_montant}
                  onChange={(e) => setDefaults({ ...defaults, fee_monthly_montant: Number(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Flags Tab */}
      {activeTab === 'features' && (
        <Card className="border border-neutral-100 bg-white shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black text-neutral-900">Platform Feature Flags</CardTitle>
              <CardDescription className="text-xs">Activate or deactivate specific modules globally across all establishments.</CardDescription>
            </div>
            <Button
              className="bg-black text-white hover:bg-neutral-900 gap-1.5 rounded-lg text-xs"
              onClick={() => handleSave('feature_flags', featureFlags)}
              disabled={updateMutation.isPending}
            >
              <Save className="h-3.5 w-3.5" />
              Save Flags
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-50 pb-4">
              <div>
                <p className="text-sm font-black text-neutral-800">Library Catalog Module</p>
                <p className="text-xs text-neutral-400">Controls librarian inventory system, loans registry, and returns.</p>
              </div>
              <Switch
                checked={featureFlags.library_enabled}
                onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, library_enabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between border-b border-neutral-50 pb-4">
              <div>
                <p className="text-sm font-black text-neutral-800">Bus Transport Module</p>
                <p className="text-xs text-neutral-400">Controls driver assignments, transport route registers, and passenger tracking.</p>
              </div>
              <Switch
                checked={featureFlags.transport_enabled}
                onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, transport_enabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between border-b border-neutral-50 pb-4">
              <div>
                <p className="text-sm font-black text-neutral-800">Bulletins & Reports Module</p>
                <p className="text-xs text-neutral-400">Toggles generation of student end-of-period report cards and rankings.</p>
              </div>
              <Switch
                checked={featureFlags.bulletins_enabled}
                onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, bulletins_enabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between border-b border-neutral-50 pb-4">
              <div>
                <p className="text-sm font-black text-neutral-800">Finance & Payouts Module</p>
                <p className="text-xs text-neutral-400">Controls school fee configuration, billing, penalties, and accounting receipts.</p>
              </div>
              <Switch
                checked={featureFlags.finance_enabled}
                onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, finance_enabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-neutral-800">AI Virtual Assistant Chatbot</p>
                <p className="text-xs text-neutral-400">Enables LLM-powered context-aware assistant chat box on user portals.</p>
              </div>
              <Switch
                checked={featureFlags.chatbot_enabled}
                onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, chatbot_enabled: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Mode Tab */}
      {activeTab === 'maintenance' && (
        <Card className="border border-neutral-100 bg-white shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black text-neutral-900">Platform Maintenance Gateway</CardTitle>
              <CardDescription className="text-xs">Take the platform offline or show a global system alert to active users.</CardDescription>
            </div>
            <Button
              className="bg-black text-white hover:bg-neutral-900 gap-1.5 rounded-lg text-xs"
              onClick={() => handleSave('maintenance', maintenance)}
              disabled={updateMutation.isPending}
            >
              <Save className="h-3.5 w-3.5" />
              Save Mode
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-red-50/50 border border-red-100 p-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-xs font-black text-red-900 uppercase">Emergency Platform Switch</p>
                  <p className="text-xs text-red-700">Activating this locks out non-super-admin user accesses and displays a banner.</p>
                </div>
              </div>
              <Switch
                checked={maintenance.active}
                onCheckedChange={(checked) => setMaintenance({ ...maintenance, active: checked })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase">Alert message</label>
              <Input
                placeholder="NeoCampus is currently down for scheduled technical updates..."
                value={maintenance.message}
                onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PlatformConfigPage
