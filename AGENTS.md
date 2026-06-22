# AGENTS.md — Calendar Booking

## Project structure

Two independent packages in one repo (no root package.json, no monorepo tool):
- `backend/` — Python 3.12 + FastAPI (single file: `backend/main.py`, in-memory storage)
- `frontend/` — React 19 + Vite 8 + TypeScript 6 + Tailwind CSS 3 + shadcn/ui

## Commands (all run from `frontend/`)

| Command | Action |
|---|---|
| `npm run dev` | Vite dev server (HMR, port 5173) |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | ESLint (flat config, v10) |
| `npm run test:e2e` | Playwright E2E (no unit tests exist) |
| `npx playwright test --grep "Guest Flow"` | Single E2E test |
| `npm run dev:mock` | Mock API (prism) + Vite dev concurrently |
| `npm run release` | release-please manually |

From root: `make start` (backend on :8000), `make test-e2e` (delegates to npm).

## Architecture

- **API client:** `frontend/src/api/client.ts` — plain `fetch()`, base URL from `VITE_API_BASE` env var
- **Router:** react-router-dom BrowserRouter in `App.tsx` (5 routes: `/`, `/book`, `/book/:durationId/schedule`, `/book/:eventTypeId/confirm`, `/owner`)
- **Dead pages** (exist but not imported in `App.tsx`): `AvailabilityPage.tsx`, `EventTypesPage.tsx`
- **Backend:** FastAPI, in-memory dicts (all data lost on restart). No database.
- **Backend has no tests** — Python has no test framework installed.

## Quirks

- **No root package.json** — all npm commands must run from `frontend/`.
- **`frontend/dist/` is committed to git** (pre-built frontend). Update with `npm run build` before building Docker if frontend changed.
- **Port inconsistency:** Backend serves on :8000 (make start, Docker), but Vite proxy and CI tests target :3000. The Vite proxy (`/api -> localhost:3000`) is for dev; in production FastAPI serves everything on one port.
- **Two diverging TypeSpec API specs:** `spec/booking-api.tsp` matches the real backend; `tsp/main.tsp` is older/experimental (snake_case, admin endpoints not implemented).
- **E2E tests** require backend on :3000 (or `VITE_API_BASE`). Playwright `webServer` auto-starts Vite on :5173. In CI, backend is started separately as a background step.
- **E2E env vars:** `E2E_BASE_URL` (default `http://localhost:5173`), `VITE_API_BASE` (default `http://localhost:3000`), `CI` (enables retries, disables `reuseExistingServer`).
- **E2E test ordering matters** — in-memory state leaks across specs (owner-view "empty state" test is skipped).
- **Docker** (single `Dockerfile`): copies pre-built `frontend/dist/` — no Node in the image, no npm build step. Requires `dist/` to exist.
- **Lint:** ESLint only (no Prettier). Commit convention: conventional commits (enforced by commitlint).
- **Release:** release-please scans conventional commits, creates Release PRs on push to `main`.
- **CORS:** Backend has hardcoded allowed origins (localhost:5173 + Render URL). Add new origins when deploying elsewhere.
- **CI workflows:** `tests.yml` (E2E on push/PR to main), `release-please.yml`, `hexlet-check.yml` (auto-generated, do not edit), `opencode.yml` (AI assistant on `/oc` comments).
- **`render.yaml`** references a different repo number (`asakasinsky/ai-for-developers-project-386` — the upstream).



## Описание приложения

В проекте есть две условные роли: владелец календаря и гости. При этом в проекте нет регистрации и авторизации. Владелец календаря — один заранее заданный профиль. Этот профиль по умолчанию используется в админской части. Гость бронирует слоты без создания аккаунта и без входа в систему.

### Владелец календаря может:

Создавать типы событий. Для каждого типа события задает id, название, описание и длительность в минутах.
Просматривает страницу предстоящих встреч, где в одном списке показаны бронирования всех типов событий.

### Гость:

Может посмотреть страницу с видами брони, где доступно название, описание и длительность.
Выбирает тип события, открывает календарь и выбирает свободный слот в ближайшие 14 дней.
Создает бронирование на выбранный слот.

### Правило занятости:

На одно и то же время нельзя создать две записи, даже если это разные типы событий.

### Окно записи по умолчанию:

Доступные слоты формируются на 14 дней, начиная с текущей даты.
Гость может записаться только на свободный слот из этого окна.
Внутреннюю реализацию, стек и структуру проекта вы выбираете сами. На этом этапе мы договариваемся только о внешнем поведении системы: какие сценарии поддерживаются, какие данные передаются и какие ограничения действуют при бронировании.

