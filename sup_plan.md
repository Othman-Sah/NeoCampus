# Super-Admin Panel — Full Feature Overhaul

## The Problem

Right now, the entire super-admin experience is **one single 777-line monolithic file** ([SuperAdminDashboard.tsx](file:///c:/Users/Clevo/Documents/EMSI/Internship/NeoCampus/neocampus-frontend/src/ui/pages/super-admin/SuperAdminDashboard.tsx)). Everything — stats, charts, tenant table, audit logs, webhook simulator, onboarding dialog, limits dialog, plan override dialog, impersonation dialog — is crammed into one page.

Compare this to the **admin** role which has **30+ dedicated pages** across users, students, teachers, classes, finance, library, exams, bulletins, transport, attendance, grades, and settings. The super-admin — who controls the **entire platform** — gets a single dashboard page.

This is architecturally and functionally inadequate for a SaaS platform operator.

---

## What Currently Exists

### Frontend (1 page)
- `SuperAdminDashboard.tsx` — monolithic page with:
  - 4 stat cards (institutions, branches, MRR, platform load)
  - 2 charts (hardcoded fake data, not real)
  - Tenant table (no search, no pagination, no filters)
  - Audit log feed (backend returns mock data)
  - Stripe webhook simulator
  - 4 modal dialogs (onboard, limits, plan override, impersonate)

### Backend (7 endpoints)
| Endpoint | Status |
|----------|--------|
| `GET /super-admin/stats` | ✅ Real data (except CPU/load mocked) |
| `GET /super-admin/tenants` | ✅ Paginated, works |
| `POST /super-admin/tenants` | ✅ Full atomic onboarding |
| `POST /super-admin/tenants/{id}/subscription` | ✅ Works |
| `POST /super-admin/tenants/{id}/limits` | ✅ Works |
| `POST /super-admin/impersonate` | ✅ Works (no "stop" mechanism) |
| `GET /super-admin/audit-logs` | ❌ Returns hardcoded mock data |

### Backend Gaps (No API exists)
- ❌ No tenant edit/update (name, address, logo)
- ❌ No tenant suspend/delete/archive
- ❌ No global user listing across tenants
- ❌ No real audit log table or model
- ❌ No billing/invoice history
- ❌ No branch management from super-admin
- ❌ No "stop impersonating" / return-to-admin mechanism
- ❌ No platform health monitoring
- ❌ No feature flag management
- ❌ No support ticket / communication system

---

## User Review Required

> [!IMPORTANT]
> This is a **massive** feature set. I recommend implementing this in **phases** (see bottom of plan). Please review and tell me:
> 1. Which pages/features are **must-have** for your internship scope?
> 2. Which are **nice-to-have** that we can skip?
> 3. Any features I'm missing that you want?

> [!WARNING]
> Many of these features require **new backend API endpoints**. Each page below notes whether backend work is needed. Do you want me to build both backend + frontend, or frontend-only with mock data for now?

---

## Proposed Super-Admin Page Architecture

The super-admin should have its own **dedicated navigation** with these sections:

```
📊 Dashboard          → /super-admin
🏫 Tenants            → /super-admin/tenants
   └─ Tenant Detail   → /super-admin/tenants/:id
👥 Users              → /super-admin/users
💳 Billing & Revenue  → /super-admin/billing
📋 Audit & Compliance → /super-admin/audit
🔧 Platform Config    → /super-admin/platform
🩺 System Health      → /super-admin/health
🛡️ Impersonation      → /super-admin/impersonate
```

---

## Proposed Changes

### Page 1 — Super-Admin Dashboard (`/super-admin`)
**Purpose**: High-level command center — KPIs at a glance, quick actions, alerts

**What it should show:**
- **KPI Row**: Total tenants, Total users (global), MRR, Active vs Churned ratio, Trial conversion rate
- **Revenue Chart**: REAL data from API — MRR trend over time by tier (not hardcoded)
- **Tenant Growth Chart**: Real acquisition data over time
- **Recent Activity Feed**: Last 10 audit log entries (real, not mock)
- **Alerts Panel**: Tenants with `past_due` or `canceled` status, tenants approaching limits, trials expiring in <3 days
- **Quick Actions**: Onboard new tenant, Go to Impersonation, Open Audit Log

**Backend needed:**
- Extend `GET /super-admin/stats` with: total users, churned count, trial conversion rate, at-risk tenants
- New: `GET /super-admin/stats/revenue-history` — monthly MRR over time
- New: `GET /super-admin/stats/growth-history` — tenant acquisition over time
- Real `audit_logs` table + endpoint (currently mock)

---

### Page 2 — Tenant Directory (`/super-admin/tenants`)
**Purpose**: Full CRUD management of all institutions/schools on the platform

**What it should show:**
- **Search bar** with filters: by name, code, plan tier, subscription status, date range
- **Data table** with: Name, Code, Plan, Status, Branches count, Students count, Users count, MRR contribution, Created date, Actions
- **Sortable columns** — by name, created date, students count, revenue
- **Bulk actions** — suspend multiple, export list to CSV
- **Pagination** — proper cursor/page pagination
- **Onboarding button** → opens a **dedicated full-page form** (not a tiny dialog) with:
  - Institution details section (name, address, logo upload, phone, website)
  - Subscription plan selection with visual tier cards
  - First branch configuration
  - Owner account creation with password strength meter
  - Review & confirm step (wizard-style)
- **Row actions**: View details, Edit, Suspend, Change plan, Impersonate admin

**Backend needed:**
- New: `PUT /super-admin/tenants/{id}` — edit tenant name/address/logo
- New: `POST /super-admin/tenants/{id}/suspend` — set status to suspended
- New: `POST /super-admin/tenants/{id}/activate` — reactivate
- New: `DELETE /super-admin/tenants/{id}` — soft-delete with cascading
- Extend `GET /super-admin/tenants` with: search, filters, sorting, students_count, users_count

---

### Page 3 — Tenant Detail (`/super-admin/tenants/:id`)
**Purpose**: Deep-dive view of a single institution — everything about them in one place

**Tabs:**
- **Overview**: Institution info, subscription card, limit usage (branches: 3/5, students: 847/1000 with progress bars), owner info, creation date, last login
- **Branches**: List of all branches (succursales) — name, address, student count per branch, created date. Add/edit/delete branches from super-admin level
- **Users**: All users in this institution — filterable by role, branch, status. With quick-impersonate button per user
- **Billing History**: Subscription changes timeline — when they upgraded, when payment failed, etc.
- **Usage Analytics**: Charts showing student enrollment trend, active users over time, module usage (which features they actually use), storage consumption
- **Configuration**: View/edit establishment settings (library config, bulletin config, fee defaults)
- **Audit Trail**: Filtered audit log showing only events related to this tenant

**Backend needed:**
- New: `GET /super-admin/tenants/{id}/detail` — full tenant profile with relations
- New: `GET /super-admin/tenants/{id}/branches` — all branches with stats
- New: `POST/PUT/DELETE /super-admin/tenants/{id}/branches` — branch CRUD from super-admin
- New: `GET /super-admin/tenants/{id}/users` — all users with role/branch filters
- New: `GET /super-admin/tenants/{id}/billing-history` — subscription change timeline
- New: `GET /super-admin/tenants/{id}/usage` — usage analytics data

---

### Page 4 — Global User Directory (`/super-admin/users`)
**Purpose**: See and manage every user across all tenants

**What it should show:**
- **Search** across all users by name, email, role
- **Filters**: By institution, role, branch, status (active/inactive)
- **Data table**: Name, Email, Role (badge), Institution, Branch, Last login, Created date
- **Actions per user**: View profile, Impersonate, Disable account, Reset password
- **Stats header**: Total users breakdown by role (pie chart or segmented bar)

**Backend needed:**
- New: `GET /super-admin/users` — global user listing with search/filter/pagination (bypasses tenant scope)
- New: `POST /super-admin/users/{id}/disable`
- New: `POST /super-admin/users/{id}/reset-password`

---

### Page 5 — Billing & Revenue (`/super-admin/billing`)
**Purpose**: Financial overview of the entire SaaS platform

**Sections:**
- **Revenue KPIs**: Current MRR, ARR (MRR × 12), MRR change vs last month (%), Average Revenue Per Tenant (ARPT), Churn rate
- **MRR Breakdown**: Stacked area chart — revenue by tier over time
- **Tier Distribution**: Donut chart showing how many tenants per plan tier
- **Revenue Table**: Per-tenant revenue — institution name, plan, monthly price, status, lifetime value (LTV)
- **Billing Events**: Recent subscription changes, payment failures, upgrades, downgrades
- **Stripe Webhook Simulator**: Move the existing simulator here (it's a dev tool, not a dashboard widget)
- **Export**: CSV/PDF export of revenue reports

**Backend needed:**
- New: `GET /super-admin/billing/revenue` — MRR, ARR, ARPT, churn rate calculations
- New: `GET /super-admin/billing/revenue-by-tier` — time-series revenue data by tier
- New: `GET /super-admin/billing/events` — subscription change events timeline
- Move webhook simulator to billing section

---

### Page 6 — Audit & Compliance Log (`/super-admin/audit`)
**Purpose**: Real, persistent audit trail of all privileged actions

**What it should log (events):**
- Impersonation sessions (who, when, duration, reason)
- Tenant onboarding events
- Subscription overrides (plan changes, status changes)
- Limit adjustments
- User account disabling/enabling
- Super-admin logins

**UI:**
- **Timeline view**: Chronological feed with icons per event type
- **Filterable**: By action type, actor (which super-admin), target tenant, date range
- **Searchable**: Full-text search on descriptions and reasons
- **Detail expansion**: Click to expand full event payload (JSON)
- **Export**: CSV/PDF for compliance reporting

**Backend needed (MAJOR):**
- New: Create `audit_logs` migration table: `id`, `actor_id`, `actor_type`, `action`, `target_type`, `target_id`, `metadata` (JSON), `ip_address`, `user_agent`, `created_at`
- New: `AuditLog` model
- New: `AuditService` or `LogAuditEvent` use case — called from all super-admin actions
- New: `GET /super-admin/audit-logs` — real implementation with filters/search/pagination
- Refactor all super-admin controller methods to emit audit events

---

### Page 7 — Platform Configuration (`/super-admin/platform`)
**Purpose**: Global platform settings that affect all tenants

**Sections:**
- **Plan Tier Config**: Edit pricing, limits, and features per plan tier (currently hardcoded in PHP)
- **Default Settings**: Default values pushed to new tenants on onboarding (library config, bulletin config, fee defaults)
- **Feature Flags**: Toggle features on/off per plan tier or globally (e.g., "Transport module" only for Premium+, "AI Chatbot" only for Enterprise)
- **Maintenance Mode**: Enable/disable platform-wide maintenance banner
- **Email Templates**: View/edit notification email templates (welcome, payment failed, trial expiring)

**Backend needed:**
- New: `GET/PUT /super-admin/platform/plans` — CRUD on plan tier definitions
- New: `GET/PUT /super-admin/platform/defaults` — default tenant settings
- New: `GET/PUT /super-admin/platform/feature-flags` — feature flag management
- New: `POST /super-admin/platform/maintenance` — toggle maintenance mode

---

### Page 8 — System Health (`/super-admin/health`)
**Purpose**: Technical monitoring of the platform

**Sections:**
- **Server Status**: CPU, Memory, Disk usage (real metrics, not hardcoded)
- **Database Stats**: Size, connections, slow queries, table row counts
- **API Performance**: Average response times, error rates, 5xx count
- **Queue Health**: Pending jobs, failed jobs, job processing rate
- **Active Sessions**: Count of currently logged-in users by role
- **Uptime**: Server uptime, last restart date

**Backend needed:**
- New: `GET /super-admin/health/system` — real server metrics
- New: `GET /super-admin/health/database` — DB stats
- New: `GET /super-admin/health/api` — API performance metrics
- New: `GET /super-admin/health/sessions` — active session count

---

### Page 9 — Impersonation Center (`/super-admin/impersonate`)
**Purpose**: Dedicated, secure impersonation workflow (not a random dialog button)

**What it should have:**
- **Institution selector**: Dropdown with search to pick the target school
- **User list**: Shows all users in selected school, with role badges, last login dates
- **Click-to-impersonate**: Click a user row → confirmation modal with:
  - User details preview
  - Mandatory reason field
  - Warning about audit logging
  - "I understand this is a privileged action" checkbox
- **Active session banner**: When impersonating, show a floating top bar across the ENTIRE app: "You are viewing as [User Name] at [School Name] — Return to Super Admin"
- **Session history**: Table of past impersonation sessions — who, when, duration, reason

**Backend needed:**
- New: `POST /super-admin/stop-impersonation` — restore super-admin session
- New: `GET /super-admin/impersonation-history` — past sessions from audit log
- Extend impersonate response with: `impersonation_token`, `original_token` (to enable "return to admin")

---

## Super-Admin Navigation Design

The super-admin should get its own nav items in `DashboardLayout.tsx` (currently the default case returns `[]` — empty nav):

```
🏠 Dashboard        → /super-admin
🏫 Tenants           → /super-admin/tenants
👥 Users             → /super-admin/users  
💳 Billing           → /super-admin/billing
📋 Audit Log         → /super-admin/audit
🔧 Platform          → /super-admin/platform
🩺 Health            → /super-admin/health
🛡️ Impersonate       → /super-admin/impersonate
```

---

## Implementation Phases

### Phase 1 — Core (Must-Have) 🔴
1. Refactor `SuperAdminDashboard.tsx` into proper multi-page layout
2. Add super-admin navigation to `DashboardLayout.tsx`
3. **Tenant Directory** page with search, filters, pagination
4. **Tenant Detail** page with overview + branches + users tabs
5. **Dashboard** page with real KPIs (extend existing stats endpoint)
6. Fix all code smells: remove `any` types, remove `alert()`, remove hardcoded password, remove fake chart data

### Phase 2 — Operations (High Priority) 🟡
7. **Audit & Compliance** — create `audit_logs` table + model + real logging
8. **Impersonation Center** — dedicated page, return-to-admin mechanism, session banner
9. **Global User Directory** — cross-tenant user search and management
10. **Billing & Revenue** — real revenue dashboards with per-tenant breakdown

### Phase 3 — Platform Management (Nice-to-Have) 🟢
11. **Platform Configuration** — plan tiers, feature flags, defaults
12. **System Health** — server monitoring dashboard
13. Tenant onboarding wizard (multi-step full-page flow)
14. CSV/PDF exports across all pages

---

## Verification Plan

### Automated Tests
- Run `php artisan test` after backend changes
- Run `npm run build` to verify frontend compiles
- Add tenant isolation tests for new super-admin endpoints

### Manual Verification
- Navigate all super-admin pages and verify data loads
- Test impersonation flow end-to-end (impersonate → use app → return to admin)
- Verify audit log records all privileged actions
- Test tenant onboarding creates full working tenant
- Verify super-admin cannot see tenant data without impersonating
