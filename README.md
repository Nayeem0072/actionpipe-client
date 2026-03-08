# ActionPipe — Client

Web client for **ActionPipe**: turn meeting transcripts into structured actions, normalize to tool calls, and execute with one click.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Environment

Copy `.env.example` to `.env` and set:

- **Auth0** — `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID` (from Auth0 Dashboard). Set `VITE_AUTH0_AUDIENCE` to your Auth0 API identifier so the frontend can request an access token for the backend and call `GET /me`.
- **Backend API** — `VITE_API_URL` (optional; defaults to `http://localhost:8000`)

## Pages & features

### Public

| Route | Page | Description |
|-------|------|-------------|
| `/` | **Landing** | Marketing landing: hero, “How it works”, features, integrations, audience, CTA. Log in / Sign up (Auth0 Google). When authenticated, shows user avatar and Log out. |
| `/callback` | **Callback** | Auth0 redirect target; shows “Completing login…” then redirects to `/dashboard` when authenticated. |
| `/logout` | **Logout** | Post-logout confirmation and “Back to home” link. |

### Dashboard (auth required)

Layout: sidebar + main content. Sidebar has logo, search (UI only), nav, and user block with logout.

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | **Dashboard** | Welcome message, overview cards (Actions extracted, Executions, Integrations — placeholders), and “Quick start” link to docs. |
| `/dashboard/actions` | **Actions** | Full pipeline UI: **Step 1** — upload transcript (.txt, .csv, .pdf, .doc), meeting date, language (en/es/fr/de/bn); **Step 2** — live pipeline view with three agents (Extractor → Normalizer → Executor), each with step-by-step progress via SSE; **Step 3** — run complete with summary (actions extracted / normalized). Backend: `POST /runs` (multipart), `GET /runs/:runId/stream` (SSE). |

Sidebar nav (as implemented):

- **Dashboard** — Overview (`/dashboard`), Reports (`/dashboard/reports` — link only)
- **Features** — Actions (`/dashboard/actions`)
- **Integrations** — Connections (`/dashboard/connections` — link only)
- **Settings** — `/dashboard/settings` (link only)

*Note: Reports, Connections, and Settings are linked in the sidebar but do not have route/page implementations yet.*

## API integration

- **Me** (`src/api/me.ts`): `getMe(accessToken)` calls `GET /me` with `Authorization: Bearer <access_token>`. Use the `useMe()` hook (`src/hooks/useMe.ts`) after Auth0 login to load the backend user (created/updated on first request).
- **Runs** (`src/api/runs.ts`): create a run with `createRun({ file, meetingDate?, language? })`, subscribe to progress with `subscribeToRunStream(runId, callbacks)`. SSE events: `progress`, `step_done`, `agent_done`, `run_complete`, `error`. API base from `VITE_API_URL` via `src/api/config.ts`.

## Stack

- React 18 + TypeScript
- Vite 5
- React Router 6
- Auth0 (Google OAuth)
