import { axiosClient } from '@/infrastructure/api/axiosClient'

export type PlanTier = 'free' | 'basic' | 'premium' | 'enterprise'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'suspended'

export interface SuperAdminStats {
  total_schools: number
  total_branches: number
  total_students: number
  total_users: number
  active_tenants: number
  churned_tenants: number
  trial_conversion_rate: number
  mrr: number
  at_risk_tenants: Tenant[]
  system_load: {
    cpu: number
    db_connections: number
    db_size_mb: number
  }
}

export interface Tenant {
  id: number
  nom: string
  adresse?: string | null
  code: string
  logo?: string | null
  plan_tier: PlanTier
  subscription_status: SubscriptionStatus
  trial_ends_at?: string | null
  subscription_ends_at?: string | null
  created_at?: string
  updated_at?: string
  succursales_count?: number
  users_count?: number
  eleves_count?: number
}

export interface TenantBranch {
  id: number
  etablissement_id: number
  nom: string
  adresse?: string | null
  telephone?: string | null
  created_at?: string
  users_count?: number
  eleves_count?: number
}

export interface TenantUser {
  id: number
  etablissement_id: number
  succursale_id?: number | null
  nom: string
  prenom: string
  email: string
  role: string
  disabled_at?: string | null
  created_at?: string
  etablissement?: Pick<Tenant, 'id' | 'nom' | 'code' | 'plan_tier' | 'subscription_status'>
}

export interface TenantSetting {
  id: number
  key: string
  value: string | number | null
}

export interface TenantDetail extends Tenant {
  settings: TenantSetting[]
  succursales: TenantBranch[]
  users: TenantUser[]
}

export interface AuditLog {
  id: number
  action: string
  actor_id?: number | null
  actor_type: string
  target_type?: string | null
  target_id?: number | null
  metadata?: Record<string, string | number | boolean | null>
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
  actor?: {
    id: number
    nom: string
    prenom: string
    email: string
    role: string
  } | null
  description?: string
  reason?: string
  timestamp?: string
}

export interface ChartPoint {
  name: string
  Basic?: number
  Premium?: number
  Enterprise?: number
  schools?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface TenantFilters {
  search?: string
  plan_tier?: PlanTier | 'all'
  subscription_status?: SubscriptionStatus | 'all'
  sort_by?: 'nom' | 'created_at' | 'succursales_count' | 'users_count' | 'eleves_count'
  sort_direction?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface UserFilters {
  search?: string
  etablissement_id?: number | 'all'
  role?: string
  status?: 'active' | 'disabled' | 'all'
  page?: number
  per_page?: number
}

export interface AuditFilters {
  search?: string
  action?: string
  target_type?: string
  target_id?: number
  actor_id?: number
  page?: number
  per_page?: number
}

export interface OnboardTenantPayload {
  establishment_nom: string
  establishment_adresse: string
  plan_tier: PlanTier
  branch_nom: string
  owner_nom: string
  owner_prenom: string
  owner_email: string
  owner_password: string
}

export interface LimitPayload {
  max_branches: number
  max_students: number
}

export interface PlanPayload {
  plan_tier: PlanTier
  subscription_status: SubscriptionStatus
}

export interface ImpersonatePayload {
  user_id: string
  reason: string
}

export interface ImpersonateResponse {
  token: string
  original_token: string
  original_user: import('@/domain/entities/User').User
  user: import('@/domain/entities/User').User
  message: string
}

export interface BillingRevenue {
  mrr: number
  arr: number
  arpt: number
  churn_rate: number
  tier_distribution: Array<{ tier: PlanTier; count: number }>
  tenants: Array<Tenant & { monthly_price: number }>
}

const cleanFilters = (filters: TenantFilters | UserFilters | AuditFilters) => {
  const params: Record<string, string | number> = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') {
      params[key] = value
    }
  })
  return params
}

export const superAdminApi = {
  async stats() {
    const res = await axiosClient.get<SuperAdminStats>('/super-admin/stats')
    return res.data
  },
  async revenueHistory() {
    const res = await axiosClient.get<ChartPoint[]>('/super-admin/stats/revenue-history')
    return res.data
  },
  async growthHistory() {
    const res = await axiosClient.get<ChartPoint[]>('/super-admin/stats/growth-history')
    return res.data
  },
  async tenants(filters: TenantFilters = {}) {
    const res = await axiosClient.get<PaginatedResponse<Tenant>>('/super-admin/tenants', {
      params: cleanFilters(filters),
    })
    return res.data
  },
  async tenantDetail(id: string | number) {
    const res = await axiosClient.get<TenantDetail>(`/super-admin/tenants/${id}/detail`)
    return res.data
  },
  async auditLogs() {
    const res = await axiosClient.get<PaginatedResponse<AuditLog>>('/super-admin/audit-logs')
    return res.data
  },
  async filteredAuditLogs(filters: AuditFilters = {}) {
    const res = await axiosClient.get<PaginatedResponse<AuditLog>>('/super-admin/audit-logs', {
      params: cleanFilters(filters),
    })
    return res.data
  },
  async impersonationHistory(filters: AuditFilters = {}) {
    const res = await axiosClient.get<PaginatedResponse<AuditLog>>('/super-admin/impersonation-history', {
      params: cleanFilters(filters),
    })
    return res.data
  },
  async users(filters: UserFilters = {}) {
    const res = await axiosClient.get<PaginatedResponse<TenantUser>>('/super-admin/users', {
      params: cleanFilters(filters),
    })
    return res.data
  },
  async disableUser(userId: number) {
    const res = await axiosClient.post(`/super-admin/users/${userId}/disable`)
    return res.data
  },
  async enableUser(userId: number) {
    const res = await axiosClient.post(`/super-admin/users/${userId}/enable`)
    return res.data
  },
  async resetUserPassword(userId: number) {
    const res = await axiosClient.post<{ message: string; temporary_password: string }>(`/super-admin/users/${userId}/reset-password`)
    return res.data
  },
  async billingRevenue() {
    const res = await axiosClient.get<BillingRevenue>('/super-admin/billing/revenue')
    return res.data
  },
  async billingEvents(filters: AuditFilters = {}) {
    const res = await axiosClient.get<PaginatedResponse<AuditLog>>('/super-admin/billing/events', {
      params: cleanFilters(filters),
    })
    return res.data
  },
  async onboardTenant(payload: OnboardTenantPayload) {
    const res = await axiosClient.post('/super-admin/tenants', payload)
    return res.data
  },
  async updateLimits(tenantId: number, payload: LimitPayload) {
    const res = await axiosClient.post(`/super-admin/tenants/${tenantId}/limits`, payload)
    return res.data
  },
  async updatePlan(tenantId: number, payload: PlanPayload) {
    const res = await axiosClient.post(`/super-admin/tenants/${tenantId}/subscription`, payload)
    return res.data
  },
  async impersonate(payload: ImpersonatePayload) {
    const res = await axiosClient.post<ImpersonateResponse>('/super-admin/impersonate', payload)
    return res.data
  },
  async stopImpersonation() {
    const res = await axiosClient.post('/super-admin/stop-impersonation')
    return res.data
  },
  async getPlatformSettings() {
    const res = await axiosClient.get<any>('/super-admin/platform/settings')
    return res.data
  },
  async updatePlatformSettings(key: string, value: any) {
    const res = await axiosClient.put('/super-admin/platform/settings', { key, value })
    return res.data
  },
  async getSystemHealth() {
    const res = await axiosClient.get<any>('/super-admin/health')
    return res.data
  },
  async simulateWebhook(tenant: Tenant, status: Extract<SubscriptionStatus, 'active' | 'past_due' | 'canceled'>) {
    const typeByStatus = {
      active: 'customer.subscription.created',
      past_due: 'customer.subscription.updated',
      canceled: 'customer.subscription.deleted',
    }

    const res = await axiosClient.post('/billing/stripe-webhook-simulate', {
      type: typeByStatus[status],
      establishment_id: tenant.id,
      tier: tenant.plan_tier,
      status,
    })
    return res.data
  },
}
