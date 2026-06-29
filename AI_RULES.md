# 🏛️ NeoCampus — AI Constitution
### The Governing Document for All AI-Assisted Development Sessions

> **Version**: 1.0  
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

9. **DO** write a database seeder (with Faker, French locale `fr_FR`) for every new entity, and register it in `DatabaseSeeder.php`.

10. **DO** create a Laravel Policy for any entity that has ownership or role-based access rules, and authorize actions in the controller via `$this->authorize()`.

11. **DO** add OpenAPI/Swagger annotations (`@OA\Get`, `@OA\Post`, etc.) to every new controller method, including request body schemas, response schemas, and error codes.

12. **DO** use Eloquent relationships (`hasMany`, `belongsTo`, `belongsToMany`) and eager loading (`with(...)`) for related data — never use N+1 queries.

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

### Code Quality

19. **DON'T** commit code with `console.log`, `dd()`, `dump()`, or `var_dump()` debug statements — remove all debugging output before finalizing.

20. **DON'T** ignore TypeScript errors or use `// @ts-ignore` / `any` type — fix the type properly or create a dedicated type/interface.

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
