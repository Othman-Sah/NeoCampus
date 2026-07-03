# 🏛️ NeoCampus — AI Constitution
### The Governing Document for All AI-Assisted Development Sessions

> **Version**: 1.2  
> **Created**: 2026-06-27  
> **Project**: NeoCampus / NeoEdu — EMSI Internship  
> **Usage**: Paste this file at the top of every AI prompt for this project.

---

## 📇 DELIVERABLE 1 — PROJECT INDEX

| Field | Value |
|---|---|
| **Project Name** | NeoCampus (also: NeoEdu) |
| **Type** | Multi-role school management web application |
| **Backend** | Laravel 11 (API-only), PHP 8.3, Sanctum authentication, MySQL 8 |
| **Frontend** | React 18 (TypeScript), Vite, React Router v6, Axios, TailwindCSS, shadcn/ui |
| **State & Data** | Zustand (global state), TanStack Query / React Query (server state) |
| **Architecture** | Hexagonal (Ports & Adapters) — domain logic in the core, adapters for DB/API/UI |
| **Roles** | `admin`, `comptable`, `enseignant`, `bibliothecaire`, `parent`, `eleve` |
| **Multi-Tenant** | Yes — every `Etablissement` has fully isolated data via global Eloquent scopes |
| **Figma Design** | NEOEDU — Link: `[PASTE YOUR FIGMA FILE LINK HERE]` |
| **Figma MCP Server** | Integrated via Figma Dev Mode MCP Server (tools: `get_design_context`, `get_variable_defs`, `get_screenshot`, `get_metadata`) |
| **Language Policy** | Bilingual — French UI strings (via `/lang/fr.json`) + English code identifiers |
| **Role Management** | `spatie/laravel-permission` |
| **API Docs** | `darkaonline/l5-swagger` (OpenAPI 3.0) |

### 🗂️ Key Modules

| # | Module | Description |
|---|---|---|
| 1 | **Auth** | Multi-role login, Sanctum tokens, role-based redirect |
| 2 | **Students** | CRUD, enrollment, dossier management, search |
| 3 | **Teachers** | CRUD, speciality, class/subject assignment |
| 4 | **Classes & Sections** | Class hierarchy, sections (Primaire/Collège/Lycée), academic years |
| 5 | **Timetable** | Weekly grid, drag-and-drop scheduling, conflict detection |
| 6 | **Attendance** | Bulk marking (Présent/Absent/Retard), history, reports |
| 7 | **Grades** | Exam creation, bulk grade entry, per-subject averages |
| 8 | **Bulletins** | Report card generation, ranking, printable A4 layout |
| 9 | **Finance** | Fee management, payments, discounts, penalties, reports |
| 10 | **Library** | Book catalog, loans, returns, overdue tracking |
| 11 | **Transport** | Vehicles, drivers, routes, student-route assignment |
| 12 | **Announcements** | Role-targeted news feed, rich text, notification system |
| 13 | **AI Chatbot** | Context-aware assistant (read-only), rate-limited, multilingual |

### 🏗️ Architecture Map

```
BACKEND (Laravel 11)                           FRONTEND (React 18 + Vite)
─────────────────────                          ─────────────────────────
app/                                           src/
├── Domain/                                    ├── domain/
│   ├── Ports/          ← Interfaces           │   ├── entities/       ← TS interfaces
│   ├── Models/         ← Pure domain models   │   └── ports/          ← Service contracts
│   └── Exceptions/     ← Domain exceptions    ├── application/
├── Application/                               │   ├── useCases/       ← Custom hooks
│   ├── UseCases/       ← One per action       │   └── stores/         ← Zustand stores
│   └── DTOs/           ← Input/Output DTOs    ├── infrastructure/
├── Infrastructure/                            │   └── api/            ← Axios adapters
│   ├── Persistence/    ← Eloquent adapters    ├── ui/
│   └── External/       ← LLM, SMS, Email      │   ├── components/     ← shadcn/ui based
├── Http/                                      │   ├── layouts/        ← Dashboard, Auth
│   ├── Controllers/Api/← Thin controllers     │   └── pages/          ← One folder/module
│   ├── Requests/       ← Form validation      └── lib/
│   └── Resources/      ← API transformers         └── utils.ts
```

---

## ✅ DELIVERABLE 2 — AI DO'S (Rules to Always Follow)

### Hexagonal Architecture

1. **DO** always scaffold new features as a hexagonal **Port + Adapter** pair: define a domain interface in `app/Domain/Ports/`, implement it as an Eloquent adapter in `app/Infrastructure/Persistence/`, and orchestrate through a UseCase in `app/Application/UseCases/`.

2. **DO** bind every Port interface to its concrete adapter in `AppServiceProvider` using `$this->app->bind(PortInterface::class, EloquentAdapter::class)`.

3. **DO** keep controllers thin — they must only validate input (via FormRequest), delegate to a UseCase, and return an API Resource. Zero business logic in controllers.

4. **DO** mirror the hexagonal pattern on the frontend: define TypeScript entity interfaces in `src/domain/entities/`, service contracts in `src/domain/ports/`, Axios adapters in `src/infrastructure/api/`, and orchestration hooks in `src/application/useCases/`.

### Laravel Backend

5. **DO** write every new Laravel API route as a resource route with explicit `middleware(['auth:sanctum', 'role:X'])` — no unprotected routes except login.

6. **DO** include `etablissement_id` scoping on every Eloquent query to enforce tenant isolation. Use the `EnsureTenantIsolation` global scope — never query without it.

7. **DO** create a `FormRequest` class for every store/update endpoint with full validation rules, and use `$request->validated()` (or `->only(...)`) to whitelist input fields.

8. **DO** return all API responses through Laravel API Resource transformers (`JsonResource`) — never return raw Eloquent models.

9. **DO** write a database seeder (with Faker, French locale `fr_FR`) for every new entity, and register it in `DatabaseSeeder.php`. ALL mock/test/demo data — without exception — must live in these seeders and be inserted into the **database itself**. Never place mock data in local files, TypeScript/JS constants, PHP arrays, JSON files, or any offline source.

10. **DO** create a Laravel Policy for any entity that has ownership or role-based access rules, and authorize actions in the controller via `$this->authorize()`.

11. **DO** add OpenAPI/Swagger annotations (`@OA\Get`, `@OA\Post`, etc.) to every new controller method, including request body schemas, response schemas, and error codes.

12. **DO** use Eloquent relationships (`hasMany`, `belongsTo`, `belongsToMany`) and eager loading (`with(...)`) for related data — never use N+1 queries.

13. **DO** paginate **every** list endpoint using `->paginate($perPage)` where `$perPage` comes from a validated query param with a hard maximum of 100. Never return unbounded collections — a school with 2 000 students must not crash the API.

14. **DO** wrap every UseCase that performs **two or more write operations** in a `DB::transaction(fn () => ...)` block. A partial failure must leave the database in its original state — no orphaned or inconsistent records.

15. **DO** return a **consistent JSON error envelope** from every API endpoint:
    ```json
    { "message": "Human-readable description", "errors": { "field": ["rule"] }, "code": "SNAKE_CASE_ERROR_CODE" }
    ```
    Map all domain exceptions to HTTP responses in `app/Exceptions/Handler.php`. Laravel must never return an HTML error page to the frontend.

16. **DO** store all configuration values (API keys, database URLs, third-party credentials, feature flags) exclusively in `.env` and reference them only through `config()` in application code — never call `env()` outside of `config/*.php` files.

17. **DO** apply `SoftDeletes` to every major entity (`Student`, `Teacher`, `Payment`, `Class`, `Loan`, etc.). Hard-deleting auditable records is forbidden — use `->delete()` (soft) and expose a trash/restore endpoint where appropriate.

18. **DO** store every timestamp in **UTC** in the database (`APP_TIMEZONE=UTC`). Convert to the user's display timezone only inside API Resources or on the frontend — never at the persistence layer.

19. **DO** store all uploaded files (profile photos, documents, receipts) via Laravel's `Storage` facade against a named disk configured in `config/filesystems.php`. Never store binary content in the database or use absolute server paths in code.

20. **DO** use Laravel's structured logger (`Log::channel('...')->info/warning/error(['context' => ...])`) for every significant domain event (login, payment recorded, grade changed, role assigned). Never use `error_log()`, `print_r()`, or `echo` for logging.

### React Frontend (continued)

21. **DO** make every UI page fully responsive using Tailwind's mobile-first breakpoints (`sm:` / `md:` / `lg:` / `xl:`). No page may break or overflow on screens narrower than 375 px.

22. **DO** add `aria-label`, `role`, and keyboard-navigable `tabIndex` / `onKeyDown` handlers to every custom interactive element (modals, dropdowns, data tables). shadcn/ui covers the basics — any component built on top must preserve those attributes.

### Git & API Hygiene

23. **DO** prefix all API routes with `/api/v1/` from day one. Never register unversioned routes — a future `/api/v2/` migration must not require breaking changes in existing consumers.

24. **DO** follow the branch naming convention: `feature/<module>-<short-desc>` and `fix/<module>-<short-desc>`. Never commit directly to `main`/`master` — all changes go through a Pull Request.

### 🏢 SaaS & Multi-Tenancy

> NeoCampus is a **multi-tenant SaaS**. Every `Etablissement` is a fully isolated tenant. Tenant isolation is not a filter — it is a **hard security boundary**. Violating it is equivalent to a data breach.

25. **DO** treat `etablissement_id` as an immutable security boundary on every database operation. The `EnsureTenantIsolation` global scope must be active on every tenant-scoped Eloquent model at all times — not just on list endpoints.

26. **DO** write a **cross-tenant isolation test** for every new list and show endpoint. Authenticate as a user of `Etablissement A`, request a resource belonging to `Etablissement B`, and assert the response is `403` or `404` — never `200`. This test is not optional.

27. **DO** store all per-tenant configuration (default loan duration, max active loans per member, fine amounts per day, feature toggles) in a dedicated `etablissement_settings` table with a JSON `value` column — keyed by `(etablissement_id, key)`. Never hardcode tenant-specific limits as PHP constants or `.env` values.

28. **DO** bootstrap default module settings for a new `Etablissement` automatically via an `EstablishmentBootstrapper` service invoked from the `CreateEtablissementUseCase`. On onboarding, every module's default settings row must be inserted — a freshly created school must be immediately functional with sensible defaults.

29. **DO** implement a dedicated `super-admin` role that can operate across tenants. All super-admin cross-tenant queries must: (a) use `withoutGlobalScope(TenantScope::class)` explicitly, (b) be protected by a `SuperAdminMiddleware`, (c) log the action with full audit context (who, which tenant, what action, timestamp).

30. **DO** cascade soft-delete all tenant-scoped records when an `Etablissement` is deactivated. Maintain a 90-day soft-delete recovery window before permanent purge. The deactivation event must be dispatched as a queued job — never a synchronous loop over thousands of records.

31. **DO** ensure every seeder creates **fully isolated, per-tenant data**. No seeded record may be shared across tenants. Every factory-generated entity must receive the `etablissement_id` of its specific tenant — never `null` or a global value.

### React Frontend

13. **DO** use **shadcn/ui** components for all UI elements (Tables, Inputs, Selects, Buttons, Sheets, Dialogs, etc.) — never write raw HTML `<table>`, `<input>`, or `<select>` tags.

14. **DO** use **TanStack Query (React Query)** for all server-state data fetching, caching, and mutations — never use `useEffect` + `useState` for API calls.

15. **DO** use **React Hook Form** + **Zod** for all form handling and validation across the application.

16. **DO** use **Zustand** for global client-side state (auth, UI preferences, language) — keep stores minimal and focused.

17. **DO** implement skeleton loading states (using shadcn/ui `Skeleton`) for every data-fetching component, and friendly empty-state illustrations when no data exists.

18. **DO** add smooth page transition animations (Framer Motion or CSS keyframes) between routes, and micro-interactions (hover effects, button feedback) on interactive elements.

### Design & i18n

19. **DO** follow the **Figma NEOEDU design tokens** (colors, spacing, typography, border-radius, shadows) exactly. Use the Figma MCP Server tools (`get_design_context`, `get_variable_defs`) to extract and verify tokens before implementing any UI.

20. **DO** keep all French language strings in `/lang/fr.json` (backend) and `src/lib/i18n/fr.json` (frontend) — never hardcode French text inside components or blade files.

21. **DO** use English for all code identifiers (variable names, function names, class names, file names) even when the domain concept is French (e.g., `Student` not `Eleve` in code, but `Eleve` in the DB table name if matching the class diagram).

### Quality & Security

22. **DO** write PHPUnit tests (unit for UseCases, feature for HTTP endpoints) for every new backend feature, using the `RefreshDatabase` trait and factories.

23. **DO** write Vitest + React Testing Library tests for every new page and critical component.

24. **DO** apply rate limiting to all routes: `throttle:60,1` for public, `throttle:600,1` for authenticated, `throttle:20,1` for chatbot.

25. **DO** document every new feature in the project `README.md` and update the `ARCHITECTURE.md` if the hexagonal pattern is extended.

---

## 🚫 DELIVERABLE 3 — AI DON'TS (Hard Prohibitions)

### Architecture Violations

1. **DON'T** put business logic inside Laravel controllers or React components — it belongs in UseCases (backend) or custom hooks/service layers (frontend).

2. **DON'T** add a new module without first creating its Port interface in `app/Domain/Ports/` and its corresponding frontend contract in `src/domain/ports/`.

3. **DON'T** let a UseCase depend on an Eloquent model or any infrastructure class directly — it must depend only on the Port interface (dependency inversion).

4. **DON'T** bypass the hexagonal layering by calling Eloquent queries directly from controllers, middleware, or request classes.

### Database & Backend

5. **DON'T** use `DB::table()` raw queries or `DB::raw()` — always use Eloquent models, scopes, and relationships.

### ⚡ Query Performance — ZERO TOLERANCE FOR SLOW FETCHING

5a. ⛔ **NEVER fetch data using loops that trigger individual database queries.** This is a hard prohibition with zero exceptions:
    - **DON'T** iterate over a collection and call `->find()`, `->where(...)->first()`, or any query inside a `foreach` / `for` / `array_map` loop — this is N+1 and will grind the app to a halt.
    - **DON'T** lazy-load relationships inside loops — always eager-load with `with(['relation1', 'relation2'])` **before** the loop.
    - **DON'T** call `->count()`, `->sum()`, `->avg()` inside loops — use Eloquent aggregates or `withCount()` / `withSum()` at the query level.
    - **DO** use `->whereIn()` to fetch multiple records in a single round-trip instead of looping over IDs.
    - **DO** use `->chunk(500, fn($batch) => ...)` or `->cursor()` for bulk-processing large datasets — never load tens of thousands of records into memory at once.
    - **DO** add database indexes on every column used in `->where()`, `->orderBy()`, or `->join()` clauses (beyond the mandatory `etablissement_id`, `classe_id`, `eleve_id`).
    - **DO** use Laravel Telescope (dev) or query logging to verify that every new endpoint issues **≤ 5 SQL queries** under normal conditions. Any endpoint exceeding this must be justified with a comment.
    - **DO** prefer `->select([...])` to fetch only the columns actually needed — never `SELECT *` when only 3 fields are used.
    - Every API list endpoint must respond in **< 300 ms** on a seeded dataset of realistic size. If it doesn't, optimize before merging.

6. **DON'T** write any Eloquent query without the `etablissement_id` tenant scope. If a query intentionally crosses tenants (e.g., super-admin), it must use `withoutGlobalScope(TenantScope::class)` explicitly and be documented with a comment explaining why.

7. **DON'T** expose passwords, tokens, API keys, or PII (personal identifiable information) in API responses — always exclude sensitive fields in API Resources.

8. **DON'T** create database migrations without foreign key constraints and proper indexes on frequently queried columns (`etablissement_id`, `classe_id`, `eleve_id`).

9. **DON'T** skip writing a FormRequest validation class — no inline `$request->validate([...])` in controllers.

### Frontend

10. **DON'T** create a new UI component if a **shadcn/ui** component already covers the use case — extend or compose existing components instead.

11. **DON'T** use `useEffect` + `useState` for data fetching — use TanStack Query's `useQuery` and `useMutation` hooks exclusively.

12. **DON'T** store server-state in Zustand stores — Zustand is for client-only state (auth, UI preferences). Server data lives in TanStack Query's cache.

13. **DON'T** hardcode French (or any language) text inside React components or JSX — all user-facing strings must come from translation files and the i18n system.

14. **DON'T** use inline styles or ad-hoc Tailwind values — stick to the design tokens defined in `tailwind.config.ts` matching the Figma NEOEDU palette.

### Security & Access Control

15. **DON'T** skip role middleware (`role:X`) on any new API route — every endpoint must explicitly declare which roles can access it.

16. **DON'T** trust client-side role checks alone — always enforce authorization on the backend via middleware + Policies.

17. **DON'T** store sensitive data (tokens, passwords) in `localStorage` without understanding the XSS implications — document the tradeoff if `localStorage` is used for token persistence.

18. **DON'T** allow the AI chatbot to perform write operations or reveal data belonging to other students/users — it is strictly read-only and scoped to the authenticated user's data.

### 🏢 SaaS & Tenant Isolation Violations

18a. ⛔ **NEVER allow cross-tenant data leakage.** These are unconditional prohibitions:

- **DON'T** write a query on a tenant-scoped model without the `EnsureTenantIsolation` global scope active. The only exception is super-admin operations, which must use `withoutGlobalScope(TenantScope::class)` with an inline comment explaining why, wrapped in `SuperAdminMiddleware`.

- **DON'T** accept a resource ID (e.g., `livre_id`, `adherent_id`, `eleve_id`) from request input without validating in the `FormRequest` that it belongs to `auth()->user()->etablissement_id`. A user from school A must never be able to manipulate records from school B by guessing IDs.

- **DON'T** use a globally unique constraint on columns that are logically unique per tenant (e.g., ISBN, student code, teacher code). Uniqueness must always be scoped: `unique:table,column,null,id,etablissement_id,{tenant_id}`.

- **DON'T** hardcode per-tenant limits (max books, max loans, loan duration, fine rates) as PHP constants, config values, or `.env` entries. Every such limit must be fetched from `etablissement_settings` for the active tenant.

- **DON'T** run a synchronous PHP loop to cascade operations across all records of a deactivated tenant — use queued jobs and `chunk()` to avoid memory exhaustion and request timeouts.

- **DON'T** seed global/shared records that are accessible across multiple tenants. Every seeded entity must carry the `etablissement_id` of exactly one tenant.

- **DON'T** skip the cross-tenant isolation test for any new endpoint — if it isn't tested, it isn't isolated.

### Mock Data — ABSOLUTE PROHIBITION

19. ⛔ **NEVER EVER — UNDER ANY CIRCUMSTANCES — USE LOCAL MOCK DATA.** This is an unconditional, non-negotiable rule with zero exceptions:
    - **DON'T** create mock data in local files (`.ts`, `.js`, `.json`, `.php`, `.csv`, or any other format).
    - **DON'T** hardcode arrays, objects, or constants inside components, hooks, services, or backend code to simulate real data.
    - **DON'T** use in-memory fake stores, placeholder API interceptors (e.g., MSW handlers returning static data), or any offline data source as a substitute for real API/database responses.
    - **ALL** mock, seed, demo, or test data **MUST** be inserted into the **MySQL database** via Laravel seeders (`database/seeders/`) using Faker (`fr_FR` locale) and registered in `DatabaseSeeder.php`.
    - If data doesn't exist in the database yet, **write the seeder first** — never fake it locally.
    - Any AI-generated code that introduces local mock data in any form will be considered a critical violation of this constitution and must be immediately removed and replaced with a proper seeder.

### Code Quality

20. **DON'T** commit code with `console.log`, `dd()`, `dump()`, or `var_dump()` debug statements — remove all debugging output before finalizing.

21. **DON'T** ignore TypeScript errors or use `// @ts-ignore` / `any` type — fix the type properly or create a dedicated type/interface.

22. **DON'T** call `env()` directly inside controllers, models, or services — all environment values must be read through `config()`. Direct `env()` calls outside config files will break cached configurations (`php artisan config:cache`).

23. **DON'T** hard-delete any auditable entity (student, payment, grade, attendance record) — soft-delete only. If a hard delete is ever required, it must be explicitly authorized by an `admin` role and logged.

24. **DON'T** save timestamps in a non-UTC timezone to the database — no `Carbon::setTimezone()` before persistence. Timezone conversion is a display concern, not a storage concern.

25. **DON'T** push files to public storage without first validating MIME type, file size (max configurable per entity), and running a virus scan hook if available. Never trust the client-provided file extension alone.

26. **DON'T** commit directly to `main` or `master`. No force-pushes. No branch names like `test`, `temp`, `fix2`, or `final_final`.

---

## 📎 QUICK REFERENCE — Adding a New Feature

When adding any new feature (e.g., SMS notifications), follow this exact checklist:

```
□ 1. Domain Port        → app/Domain/Ports/[Feature]PortInterface.php
□ 2. Domain Model       → app/Domain/Models/[Feature].php (pure PHP, no Eloquent)
□ 3. DTO                → app/Application/DTOs/[Feature]DTO.php
□ 4. Use Case           → app/Application/UseCases/[Action][Feature]UseCase.php
□ 5. Eloquent Model     → app/Models/[Feature].php (with tenant scope)
□ 6. Migration          → database/migrations/create_[features]_table.php
□ 7. Adapter            → app/Infrastructure/Persistence/Eloquent[Feature]Repository.php
□ 8. Bind in Provider   → AppServiceProvider: bind(Port → Adapter)
□ 9. Controller         → app/Http/Controllers/Api/[Feature]Controller.php
□ 10. FormRequest       → app/Http/Requests/[Feature]Request.php
□ 11. API Resource      → app/Http/Resources/[Feature]Resource.php
□ 12. Routes            → routes/api.php (with auth:sanctum + role:X middleware)
□ 13. Seeder            → database/seeders/[Feature]Seeder.php
□ 14. Swagger Annotation→ @OA annotations on controller methods
□ 15. Frontend Entity   → src/domain/entities/[Feature].ts
□ 16. Frontend Port     → src/domain/ports/I[Feature]Service.ts
□ 17. API Service       → src/infrastructure/api/[feature]ApiService.ts
□ 18. Hook              → src/application/useCases/use[Feature].ts
□ 19. UI Page           → src/ui/pages/[feature]/[Feature]Page.tsx
□ 20. Tests (BE)        → tests/Unit + tests/Feature
□ 21. Tests (FE)        → src/__tests__/[Feature].test.tsx
□ 22. i18n Strings      → lang/fr.json + src/lib/i18n/fr.json
```

---

## 🔗 RELATED DOCUMENTS

| Document | Location |
|---|---|
| Master Roadmap | `../neocampus_master_roadmap.md` |
| Cahier des Charges | `../cahier_des_charges.pdf` |
| Class Diagram | `../diagram de class.pdf` |
| Use Case Diagram | `../diagram usage case.pdf` |
| Figma Design | `[PASTE YOUR FIGMA FILE LINK HERE]` |

---

*🏛️ This constitution governs all AI-assisted development on the NeoCampus project. Every prompt must include this document as context.*
