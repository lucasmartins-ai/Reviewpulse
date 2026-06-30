# Database

ReviewPulse uses a local SQLite database for the portfolio demo. The schema is
in [`../sqlite/schema.sql`](../sqlite/schema.sql).

The app creates `.data/reviewpulse.sqlite` on first run and seeds synthetic
feedback for `demo-clinic`.

## Tables

### `feedbacks`

Stores submitted feedback, local analysis output, and customer display fields.

Important fields:

- `rating`: integer from 0 to 10.
- `comment`: feedback text, limited to 4000 characters.
- `analysis_status`: `pending`, `completed`, or `failed`.
- `sentiment`: `positive`, `neutral`, or `negative`.
- `themes`: JSON string with the supported theme labels.

### `testimonials`

Stores approved or published quotes derived from positive feedback.

Important fields:

- `feedback_id`: unique link back to a feedback row.
- `quote`: editable testimonial text.
- `status`: `draft`, `approved`, `published`, or `archived`.

## Resetting Local Data

Stop the dev server and remove the generated database:

```bash
rm -f .data/reviewpulse.sqlite
npm run dev
```

## Git Hygiene

Generated SQLite files are ignored by git:

- `.data/`
- `*.sqlite`
- `*.sqlite-shm`
- `*.sqlite-wal`
- `*.db`
- `*.db-shm`
- `*.db-wal`
