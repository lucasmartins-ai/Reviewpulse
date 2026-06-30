# API

The API is intentionally small. Routes validate input, call a domain service,
and return a typed JSON envelope.

```ts
type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = {
  success: false;
  error: { code: string; message: string };
};
```

Errors returned to the browser are generic. Internal errors are not exposed.

## `POST /api/feedback`

Creates feedback for the demo clinic and stores it in SQLite.

Request:

```json
{
  "publicSlug": "demo-clinic",
  "rating": 9,
  "comment": "Equipe atenciosa e atendimento rapido.",
  "customerName": "Ana",
  "customerEmail": "ana@example.com"
}
```

Validation:

- `publicSlug`: lowercase slug.
- `rating`: integer from 0 to 10.
- `comment`: 1 to 4000 characters.
- `customerName`, `customerEmail`, and `customerPhone`: optional.

Response:

```json
{
  "success": true,
  "data": {
    "feedbackId": "uuid",
    "analysisStatus": "completed"
  }
}
```

## `GET /api/dashboard/summary`

Returns the same local read model used by `/dashboard`.

Response data:

- Metrics.
- Top themes.
- Recent feedback.

## `POST /api/response-drafts`

Generates a local deterministic response draft for one feedback item.

Request:

```json
{
  "feedbackId": "uuid",
  "tone": "professional"
}
```

Valid tones:

- `professional`
- `warm`
- `concise`

## `POST /api/testimonials`

Creates or updates a testimonial from positive feedback.

Request:

```json
{
  "feedbackId": "uuid",
  "quote": "The team was helpful and fast.",
  "customerDisplayName": "Maria S.",
  "status": "approved"
}
```

Only positive feedback can become a testimonial.

## `GET /api/exports/feedback.csv`

Exports local feedback as formula-safe CSV.

Optional query parameters:

- `startDate`
- `endDate`
- `sentiment`

CSV cells starting with `=`, `+`, `-`, or `@` are prefixed with `'`.
