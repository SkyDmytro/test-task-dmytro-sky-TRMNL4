# Application review UI

SvelteKit app for listing and reviewing applications (filter by program, view detail, update status). Uses MySQL and Kysely.

## 1. How to run

Copy `.env.example` to `.env` and set values (required: `DB_USER`, `DB_PASSWORD`).

```sh
cp .env.example .env
```

### Option A: Full app + DB in Docker

```sh
docker compose up -d --build
docker compose run --rm app pnpm run migrate
docker compose run --rm app pnpm run seed
```

Open [http://localhost:3000](http://localhost:3000). The app sets `ORIGIN=http://localhost:3000` so update-status form submissions pass SvelteKit’s CSRF check.

### Option B: Only DB in Docker, app locally

```sh
docker compose up -d mysql
```

Ensure `.env` has `DB_HOST=localhost` and `DB_PORT=3307`, then:

```sh
pnpm install
pnpm run migrate
pnpm run seed
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Run tests (with DB not required for unit tests): `pnpm test`.

Routes: list + filters `/applications?programId=1&page=1&status=...&q=...`, detail `/applications/[id]`.

---

## 2. Architectural decisions

### Svelte / frontend

- **SvelteKit** with file-based routing. Pages use `+page.svelte` and `+page.server.ts`; load runs on the server, form actions handle mutations.
- **Svelte 5** runes: `$props()` for page data and form state, `$derived()` for computed values, `$state()` only where needed (e.g. form refs).
- **Forms**: native `<form>` with `action="?/updateStatus"`; `submitStatusForm()` in `$lib/shared/status-form.ts` sets the status input and calls `requestSubmit()` so the form posts to the server. No client-side fetch for status updates.
- **UI**: Tailwind, bits-ui (dropdown, select, table). Shared pieces: `ApplicationStatusSelect`, `CopyLinkButton`, `formatDate` / `formatProgramLabel` in `$lib/shared/format.ts`.
- **Navigation**: program filter uses `goto()` with query built from `applications-list-query.js`; list and detail use normal links and redirects after actions. List state (program, page, status, date range, search) lives in the URL.

### Server

- **Load and actions** live in `+page.server.ts`. They stay thin: parse params/formData, call service/repo, then return data or redirect/fail.
- **Single repo accessor**: `getApplicationsRepo()` in `repo.server.ts` returns a shared `ApplicationsRepository` instance (backed by Kysely). Used by all load/action code.
- **Business logic** in `applications-service.ts`: `updateApplicationStatus`, `pickSelectedProgramId`, `getApplicationsListRedirectUrl`, `loadApplicationsOverview`. All take the repo (and other inputs) as arguments; no direct DB or env access.
- **Result handling**: `update-status-handler.ts` maps `UpdateStatusResult` to SvelteKit `fail(400/404, { message })` so the same service can be used from list and detail pages.

### Database

- **Kysely** with **MySQL** (`mysql2` driver). Types in `$lib/db/types.ts` define the schema; `ApplicationStatus` is shared from `$lib/shared/application.ts`.
- **Config**: `createDbConfig(env)` in `db/config.ts` reads `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`; required keys enforced at startup.
- **Connection**: `getDb()` in `db.server.ts` returns a singleton `Kysely<Database>` so the app uses one pool. Only used on the server (`db.server.ts` and repo are server-only).

### Server / repository

- **Interface** `ApplicationsRepository` in `applications-repository.ts`: `listPrograms`, `listApplicationsByProgramId`, `getApplicationById`, `updateApplicationStatus`. All data types (e.g. `ApplicationListItem`, `ApplicationDetailItem`) live next to the interface.
- **Implementation**: `createKyselyApplicationsRepository(getDb())` in `kysely-applications-repository.server.ts`; wired in `repo.server.ts`. Repo is the only layer that talks to Kysely; services and routes depend only on the interface.

### Other

- **Shared validation and parsing**: `isApplicationStatus()` and `applicationStatuses` in `application.ts`; `parseNumericId()` for IDs from URL/form. Used on server and, where needed, for types.
- **URL state**: list filters (programId, page, status, dateFrom, dateTo, q for search) are in the query string. `applications-list-query.ts` provides `extractApplicationsListParamsRaw`, `normalizeListParams`, and helpers to build list URLs; the service uses them for load and redirects.

---

## 3. What can be improved

- **Optimistic UX**: e.g. `enhance()` on forms and inline toasts so status updates feel instant while still using server actions.
- **Authorization and audit**: who can change status, and logging of status changes.
- **Error and loading UX**: clearer messages and loading states (e.g. skeleton or disabled controls during submit).
- **Tests**: expand coverage for service, repo, and list-query (e.g. edge cases for `pickSelectedProgramId`, redirect URL logic, `normalizeListParams`).
