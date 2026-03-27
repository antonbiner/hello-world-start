# Offline hydration limits (env overrides)

All variables are optional Vite env vars (`VITE_*`). Defaults are set in `src/services/offline/hydrationLimits.ts`.

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_HYDRATION_MAX_TEXT_BYTES` | 8 MiB | Max JSON/text per IndexedDB entry |
| `VITE_HYDRATION_MAX_BINARY_BYTES` | 8 MiB | Max binary stored in IndexedDB (fast path) |
| `VITE_HYDRATION_CACHE_API_MAX_BYTES` | 32 MiB | Max binary stored via **Cache API** (larger files, still offline) |
| `VITE_HYDRATION_PREFETCH_BINARY_BUDGET_BYTES` | 96 MiB | Total image prefetch budget per hydration run |
| `VITE_HYDRATION_MAX_DOCUMENT_DOWNLOADS` | 80 | Max document image downloads per hydration |
| `VITE_HYDRATION_EVICTION_THRESHOLD` | `0.85` | When `usage/quota` exceeds this, evict oldest IDB rows |
| `VITE_HYDRATION_EVICTION_FRACTION` | `0.25` | Fraction of IDB rows removed per eviction (oldest first) |

**Storage layers**

1. **IndexedDB** — JSON/text and binaries ≤ `MAX_BINARY_BYTES` (with LRU eviction on quota pressure + retries).
2. **Cache API** — (a) Binaries between `MAX_BINARY_BYTES` and `CACHE_API_MAX_BYTES`; (b) **Large JSON/text** when UTF-8 size is between `MAX_TEXT_BYTES` and `CACHE_API_MAX_BYTES` (same tenant-scoped cache name as IDB hash).

Clearing the scope (`clearHydrationCacheForCurrentScope`) removes both layers.

On each hydration run, the app also calls `navigator.storage.persist()` when available (reduces eviction risk in Safari / private modes — not guaranteed).

**Clients**

- **`fetch`** (including `apiFetch` / `dedupFetch`): uses `getCachedResponse` → IndexedDB, then Cache API.
- **Axios** (`axiosInstance`): GET while offline or in offline mode uses the same `getCachedResponse` path, so JSON/text and binary (ArrayBuffer in `response.data`) match `fetch` behavior. If nothing is cached and the browser is offline, returns a synthetic **503** JSON body (same idea as the fetch guard).

## Per-user module selection (Settings → Offline data)

**Source of truth:** PostgreSQL table `OfflineHydrationPreferences` (tenant + user, JSONB `ModulesJson`).

**API:**

- `GET /api/OfflineHydrationPreferences` — current user’s module toggles (camelCase `data.modules`).
- `PUT /api/OfflineHydrationPreferences` — body `{ "modules": { "moduleId": false } }` — only explicit **`false`** values are stored; omitted keys mean **enabled** (default).

**Frontend:** `src/services/api/offlineHydrationPreferencesApi.ts` and `src/services/offline/offlineHydrationPreferences.ts` load/save via the API (PUT uses `X-Bypass-Offline-Queue` so saves still reach the server while “offline mode” is on but the browser is online). The same compact map is mirrored to `localStorage` under `offline-hydration-module-prefs:<getOfflineScopeKey()>` for offline reads and hydration.

After login, `AuthContext` calls `syncHydrationPreferencesFromServer()`. On logout / session expiry, in-memory prefs are cleared so another user on the same device does not inherit toggles.

**Strict reads when offline-like:** If the browser is offline **or** explicit offline mode is on (`syncEngine` / `offlineRequestPolicy.ts`), API **GET** requests to `/api/...` are served **only** from the hydration cache (IndexedDB + Cache API). On cache miss, the client returns **503** with a JSON body — it does **not** hit the network (except requests with `X-Bypass-Hydration-Cache: true`, used by `hydrationOrchestrator` prefetch). When online and **not** in explicit offline mode, a GET that **fails on the network** may **fall back** to the same hydration cache (`axiosInstance` response interceptor + `offlineFetchGuard` try/catch + `apiFetch` catch).

Disabled steps are marked **Skipped** in the hydration overlay and are not fetched (`hydrationOrchestrator.ts`).

## Query-string fallback (same path, different `?params`)

Hydration and the live app often use **different** query strings for the same resource (e.g. `pageNumber` vs `page`). Cache keys include the normalized query, so `getCachedResponse` in `hydrationStore.ts` uses a **loose** match for known list paths: any cached GET for that **pathname** (newest `savedAt` wins). Paths include core lists (`/api/projects`, `/api/contacts`, …), `/api/articles`, `/api/sync/pull`, `/api/documents/stats`, `/api/projects/settings`, `/api/workflows`, `/api/calendar/events`, `/api/calendar/event-types`, `/api/dashboards`, every `/api/lookups/*`, `/api/taskchecklists/*`, `/api/users`, `/api/skills`, and `/api/roles/all-user-roles`. Response header `X-Offline-Cache-Query-Fallback: 1` is set when a loose IndexedDB entry is used.

## Hydration modules (orchestrator)

Runs include: project settings & lists, tasks (per-project + daily), contacts, documents (+ stats, image prefetch), **articles** (paged), offers/sales/service orders/dispatches/installations, **entity_details** (prefetch GETs for detail pages: projects, contacts, offers, sales, service orders, dispatches, installations, offer/sale payments & plans, support ticket detail/comments/links, **app settings** list, notifications), **time_expenses** (task time entries + summaries for project/daily tasks), support tickets list, lookups (+ article groups), dynamic forms, **workflows** (list + default), **directory** (users + skills), **calendar** (`GET /api/Calendar/events`, event types, then per-event detail + attendees + reminders up to a cap), **dashboards** (`GET /api/Dashboards` then per-id dashboard JSON up to a cap), task checklists, sync pull feed.

Detail prefetch caps (see `hydrationOrchestrator.ts`): `MAX_ENTITY_DETAIL_PREFETCH`, `MAX_PAYMENT_DETAIL_PREFETCH`, `MAX_SUPPORT_DETAIL_PREFETCH`, `MAX_TIME_TASK_PREFETCH`, `MAX_CALENDAR_EVENT_DETAIL_PREFETCH`, `MAX_DASHBOARD_DETAIL_PREFETCH`. Entities beyond these or never loaded online may still miss cache.

**Not** prefetched: arbitrary project/task/detail URLs beyond what hydration walks (e.g. a project you never opened while online may still miss). Use the modules above + normal online browsing to widen the cache.

Migration: `FlowServiceBackend/Migrations/20260321120000_AddOfflineHydrationPreferences.cs`.

## Synthetic 503 + API read helpers

When a GET misses the hydration cache offline, the client may return **503** with JSON `{ offline: true, cached: false, message?: string }`. API modules use `parseOfflineNoCacheBody` + `isOfflineNoCache503` to return **empty lists / defaults** where appropriate.

**Important:** After `parseOfflineNoCacheBody` on a **503**, the response body is already consumed. Use `throwIfNotOkAfterOfflineCheck()` before a success-path `response.json()` so other 503 errors do not try to read the body twice.

`articlesApi`: list parsing uses a dedicated 503 branch; `transactionsApi.getAll()` (GET `/api/articles/transactions`) aligns with hydration prefetch when the backend exposes that route.

## Central empty defaults (`apiFetch` + Axios)

`getSyntheticDataForOfflineCacheMissGet()` in `src/services/offline/offlineApiGetDefaults.ts` maps **GET** paths to safe empty payloads when the offline layer returns **503** with `{ offline: true, cached: false }`. Wired in:

- `apiClient.ts` (`apiFetch`) — CRM entities using `apiFetch` (contacts, offers, sales, service orders, dispatches, notifications, planning, sync history, …).
- `axiosInstance.ts` — Axios-based modules (installations, support tickets, recurring tasks, …).

**Documents** use raw `fetch` in `documents.service.ts`; those methods handle 503 + empty stats/list explicitly.

**tasksApi** also uses raw `fetch`; `getProjectTaskById` / `getDailyTaskById` on offline cache miss merge **`getOfflineDetailPlaceholder`** (same paths as `offlineDetailPlaceholders`) into full DTOs before mapping, so task detail screens don’t throw when `apiFetch` isn’t in the path.

**projectsApi** (`fetch`): `getById` uses the same **placeholder → full `ProjectResponseDto` → mapper** pattern so project detail doesn’t throw on offline cache miss.

**paymentsApi** (`fetch`): `getSummary` / `getStatement` return zeroed summary / empty statement shapes on offline **503** (lists already returned `[]`).

**taskTimeEntryApi** (`fetch`): `getTimeEntryById` returns a mapped entry from **`getOfflineDetailPlaceholder`** on cache miss (lists/summaries already degrade to `[]` / empty summaries).

**Calendar** (`calendarApi.ts`) uses shared **`axiosInstance`** with `/api/Calendar/...` so calendar GETs participate in the same offline cache + **`offlineApiGetDefaults`** / **`offlineDetailPlaceholders`** path as other Axios modules (replacing the old standalone Axios client).

**Hydration** also prefetches `/api/service-orders/statistics`, and the **task_checklists** step now includes `GET /api/recurringtasks/project-task/{id}` (capped) so recurring rules are cached when project tasks were hydrated. Loose cache matching includes `/api/planning/*` and `/api/recurringtasks/*`.

## Subscriptions (`subscriptionApi.ts`)

- **Default:** calls real `/api/subscriptions/*` via `apiFetch` (empty/offline-safe payloads come from `offlineApiGetDefaults` + `offlineDetailPlaceholders`).
- **Mock UI only:** set `VITE_SUBSCRIPTION_USE_MOCK=true` in `.env` to use embedded demo data (no network).

## Detail placeholders (`offlineDetailPlaceholders.ts`)

When a **GET** misses cache and there is no list/tab synthetic, `apiFetch` / Axios try **`getOfflineDetailPlaceholder(url)`** so detail routes return minimal stub JSON (contacts, offers, sales, projects, tasks, subscriptions/current, workflow executions/approvals, dynamic forms, entity form documents, tenants, email accounts, public forms, calendar event/types, …) instead of a hard error. Screens should still treat content as possibly incomplete when offline.

`offlineApiGetDefaults` also covers **articles/transactions**, **workflows/{id}/executions**, **workflow-executions** (root list), **tenants** list, **signatures/me**, **offer/sale payments + summary**, **email-accounts** list/tab shapes, **subscriptions/current**, and **dynamicforms** `…/responses` / `…/responses/count` where those GETs use `apiFetch`/Axios.

## Permissions (`permissionsApi.ts`)

GETs use **`parseOfflineNoCacheBody`** / **`throwIfNotOkAfterOfflineCheck`**. On offline cache miss (**503** + `offline`/`cached`), role and user permission lists return **`[]`** (no silent “mock” substitution for that case).
