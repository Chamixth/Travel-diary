# Travel Diary

Travel Diary turns private travel photographs into story-led digital memory experiences. The frontend is a React 19 application built with TanStack Start, TanStack Router, TypeScript, Tailwind CSS, Framer Motion, and Auth0. Its Go API lives in the sibling `Travel-diary-backend` repository.

## Local setup

Requirements:

- Node.js 22 or newer
- the backend running at `http://localhost:8001`
- an Auth0 SPA application and API

```bash
cp .env.example .env
npm install
npm run dev
```

The development server prints its local URL. Configure that origin as an Auth0 callback, logout, and web origin.

## Commands

```bash
npm run dev        # local TanStack Start server
npm test           # Vitest unit and contract tests
npm run lint       # ESLint and Prettier checks
npm run typecheck  # strict TypeScript validation
npm run contract:check # verify ExperienceSpec matches the backend source of truth
npm run e2e        # Playwright fixture render and accessibility gate
npm run build      # production client and server build
npm run preview    # preview a production build
```

Install Chromium once with `npx playwright install chromium` if it is not
already available. The render gate serves six synthetic experiences at the
development-only `/fixtures/experience/:fixtureId` route and captures its
screenshots under the ignored `test-results/` directory.

## Architecture

Existing `AlbumPlan` records are adapted into immutable, versioned `ExperienceSpec` snapshots and rendered by the registry runtime under `src/features/album-experience`. The runtime currently provides nine scene layouts, ten motion behaviors, eight transitions, eight effects, responsive choreography, and reduced-motion fallbacks. The album route retains `AlbumFilm` as a deployment-safe fallback when the new endpoint or contract is unavailable.

Generation uses persisted backend jobs. The browser starts a job, polls truthful stages, and loads the album after the job reaches `render_ready`; it does not hold an HTTP request open while AI generation runs.

Read:

- [Current architecture](docs/architecture/current-state.md)
- [Target architecture and delivery plan](docs/architecture/target-state.md)
- [Authentication notes](src/lib/auth/README.md)

## Environment

Copy `.env.example` and provide:

- `VITE_SITE_URL`: public frontend origin.
- `VITE_API_URL`: API URL used by direct development requests.
- `API_URL`: server-only API URL used by TanStack server functions.
- `SESSION_SECRET`: at least 32 characters for sealed application sessions.
- `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`, and `VITE_AUTH0_REDIRECT_URI`: Auth0 SPA/API configuration.
- `NEXT_PUBLIC_GEOAPIFY_KEY`: optional destination autocomplete key.

Do not commit `.env` files or credentials.
