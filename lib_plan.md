# Implementation Plan - Extend Library Management Module

This plan outlines the design and step-by-step additions to implement the new Library management pages: Settings, Members Directory, Fines Ledger, and Analytics.

---

## Proposed Database Changes

### [NEW] Migration: `add_fine_status_to_emprunts_table`
Add columns to `emprunts` table to track fine payments:
* `amende_payee` (boolean, default `false`): Tracks whether the accrued overdue fine has been settled.
* `amende_annulee` (boolean, default `false`): Tracks whether the accrued overdue fine was waived/cancelled.

---

## Proposed Backend Changes (API)

### 1. Settings Endpoints
* **`GET /api/v1/library/settings`**: Retrieves the current tenant's settings from the `library_settings` table.
* **`PUT /api/v1/library/settings`**: Saves updated configurations (Max loans, loan duration, fine per day).

### 2. Members Endpoints
* **`GET /api/v1/library/members/list`**: Returns a paginated list of library members (`adherents`), enriched with their active loan counts, overdue loan counts, and total unpaid fines.
* **`GET /api/v1/library/members/{id}/history`**: Returns the complete historical record of loans (active, returned, overdue) for a specific member.

### 3. Fines Ledger Endpoints
* **`GET /api/v1/library/fines`**: Lists all loans that have accrued fines (either returned late or currently overdue).
* **`POST /api/v1/library/fines/{id}/pay`**: Registers payment for a fine (`amende_payee = true`).
* **`POST /api/v1/library/fines/{id}/waive`**: Waives/cancels an outstanding fine (`amende_annulee = true`).

### 4. Analytics Endpoint
* **`GET /api/v1/library/analytics`**: Returns aggregated insights:
  * Top 5 most borrowed books.
  * Top 5 most borrowed genres.
  * Monthly borrowing trends (last 6 months).
  * Overdue vs. returned loan ratio.
  * Total outstanding fine collections vs. collected fines.

---

## Proposed Frontend Changes

### 1. Unified Library Sub-Navigation
Add a tabbed navigation bar at the top of all Library pages:
* **Dashboard** (`/library`)
* **Book Catalog** (`/library/books`)
* **Loans Manager** (`/library/loans`)
* **Members Directory** (`/library/members`)
* **Fines Ledger** (`/library/fines`)
* **Analytics** (`/library/analytics`)
* **Settings** (`/library/settings`)

### 2. UI Pages Implementation
* **`LibraryMembers.tsx`**: Searchable table displaying members, roles, current borrowed status, active overdue alerts, and total unpaid fines. Clicking on a row opens a details drawer containing their loan history.
* **`LibraryFines.tsx`**: A dashboard to monitor fines. Displays quick metrics (Total Collected, Total Outstanding, Waived) and a table of fines with "Register Payment" and "Waive Fine" actions.
* **`LibraryAnalytics.tsx`**: Clean dashboard showcasing KPIs and usage charts (top genres, top books, monthly borrowing trends).
* **`LibrarySettings.tsx`**: Configuration form to manage maximum active loan counts, borrowing periods, and daily fine rates.

---

## Verification Plan

### Automated Tests
Run PHPUnit tests for the new controller endpoints:
```bash
php artisan test --filter=Library
```

### Manual Verification
1. Open the Library interface in the browser.
2. Confirm the top-level tabbed navigation works.
3. Test updating settings and checking if they apply to new loans (e.g. loan period changes).
4. Verify the autocomplete search dynamically loads active members in the members list.
5. Create an overdue loan, register a fine payment, and check the Fines Ledger update.
6. Verify the charts on the Analytics page display correct statistics.
