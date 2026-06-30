# Security

ReviewPulse is a public portfolio demo. The safest default is to avoid secrets,
private customer data, hosted databases, and third-party API calls.

## Current Posture

- No credentials are required to run the app.
- No provider keys are committed.
- Demo data is synthetic.
- SQLite files are generated locally and ignored by git.
- Public route inputs are validated with Zod.
- API errors use generic user-facing messages.
- CSV export escapes formula-leading cells.
- A small in-memory rate limiter protects the public feedback endpoint during a
  local run.

## Public Feedback Route

`POST /api/feedback` validates:

- slug shape
- rating range
- comment length
- optional customer fields
- email format

The response returns only `feedbackId` and `analysisStatus`. It does not return
database internals.

## CSV Export

Spreadsheet formula injection is handled in `src/features/exports/csv.ts`.
Values beginning with `=`, `+`, `-`, or `@` after leading whitespace are
prefixed with `'` before CSV quoting.

## Local Files

The following must stay out of git:

- `.env`
- `.env.local`
- `.env.*.local`
- `.data/`
- `*.sqlite`
- `.next/`
- `node_modules/`
- `playwright-report/`
- `test-results/`
- `coverage/`
- caches and `tsconfig.tsbuildinfo`

## Not Included

This portfolio version does not implement production authentication,
authorization, tenant isolation, or hosted backups. Those are deliberately out
of scope for a visible GitHub demo.
