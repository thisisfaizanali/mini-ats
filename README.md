# Mini ATS

A small applicant tracking system for managing jobs, candidates and their hiring stages.

Live demo: _coming soon_

## Features

- Candidates: create, view, edit and delete
- Jobs: create, edit, open/close and delete
- Hiring stages with a full stage-change history per candidate
- Kanban board with drag and drop between stages
- Search, filters, sort and pagination, all held in the URL
- Dashboard with KPIs, pipeline, weekly applications and source charts
- CSV export of the current filtered list
- Dark mode
- Responsive layout, from phone to desktop

## Tech stack

- **Next.js 15 (App Router)**: server components and Server Actions keep data fetching and mutations next to the UI.
- **TypeScript**
- **Prisma + PostgreSQL (Neon)**: typed queries and migrations; Neon gives a free serverless Postgres with a pooled endpoint.
- **zod**: one schema validates both the form and the Server Action.
- **react-hook-form**: uncontrolled forms with the zod resolver.
- **Tailwind CSS v4 + shadcn/ui**: accessible Radix primitives, copied into the repo so they can be edited.
- **Recharts**: the charts behind shadcn's chart components.
- **dnd-kit**: accessible, lightweight drag and drop for the board.
- **next-themes**: dark mode without a flash on load.
- **sonner**: toasts.

## Getting started

Prerequisites: Node 20+, pnpm, and a Postgres database (a free [Neon](https://neon.tech) project works).

Create `.env` in the project root:

```bash
# Pooled connection, used by the app at runtime
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DB?sslmode=require"
# Direct connection, used by Prisma migrations
DIRECT_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/DB?sslmode=require"
```

Then:

```bash
pnpm install
pnpm prisma migrate deploy
pnpm prisma db seed
pnpm dev
```

Open http://localhost:3000.

## Data model

- **Job**: `title`, `department`, `location`, `status` (OPEN / CLOSED), `description`. Has many candidates.
- **Candidate**: `name`, `email` (unique), `phone`, `skills` (string array), `source`, `resumeUrl`, `notes`, `stage`, `appliedAt`. Belongs to one job; has many stage changes.
- **StageChange**: `fromStage` (null for the first entry), `toStage`, `changedAt`. Belongs to a candidate and is deleted with it.

## Key decisions

- **Server Actions instead of API routes.** Mutations are plain async functions called from the client, with no fetch layer or route boilerplate. The one route handler is the CSV export, because it has to return a file.
- **Shared zod schemas.** The same schema validates the form on the client and again in the action on the server. Gotcha: the form sends the raw input, not the parsed output, because the server re-parses it and some fields change shape (skills goes in as a comma-separated string and comes out as an array).
- **One stage-change path, in a transaction.** Every stage update, from the detail page or the board, goes through a single action that updates the candidate and writes a `StageChange` row in one transaction, so the history can't drift from the current stage.
- **The URL is the source of truth for filters.** Search, filters, sort and page live in the query string, so a filtered view can be shared or bookmarked, Back works, and the server renders the right page directly.
- **Deleting a job with candidates is blocked.** The relation uses `onDelete: Restrict` and the UI explains why, instead of silently cascading and losing candidates.
- **Skills stored in lowercase.** Skills are trimmed, lowercased and de-duplicated on save, so search can use an exact array match (`has`) on a lowercased query.
- **No stage-transition rules, on purpose.** Real hiring is messy: candidates get reconsidered or skip steps. Any stage can move to any other, and the history records what happened.
- **Optimistic kanban moves with per-card rollback.** A dropped card moves instantly; if the save fails, only that card goes back, so other moves made meanwhile are kept.
- **IST dates throughout.** All dates are formatted with `Asia/Kolkata` explicitly, because the server runs in UTC. The UI, the CSV and its filename all agree on the calendar date.
- **CSV formula-injection guard.** Cells starting with `=`, `+`, `-`, `@`, tab or carriage return are prefixed with `'`, so spreadsheet apps don't run them as formulas.

## Trade-offs / what I'd add next

- Authentication and per-user access
- Partial skill search (e.g. `pg_trgm`), instead of exact matches only
- An activity feed with notes and comments per candidate
- Tests: unit tests for the schemas and query builders, and an end-to-end flow
- Rate limiting on the actions and the export
- Cursor pagination instead of offset, for large lists

## Project structure

```
app/
  actions/          Server Actions for candidates and jobs
  board/            Kanban board
  candidates/       List, detail, new, edit, and the CSV export route
  jobs/             Jobs list
  page.tsx          Dashboard
components/
  board/ candidates/ dashboard/ jobs/   Feature components
  ui/               shadcn/ui primitives
lib/
  candidate-query.ts  URL params to Prisma where/orderBy
  dashboard.ts        Dashboard queries
  validations.ts      Shared zod schemas
  csv.ts, format.ts, stages.ts, db.ts
prisma/
  schema.prisma, migrations/, seed.ts
```
