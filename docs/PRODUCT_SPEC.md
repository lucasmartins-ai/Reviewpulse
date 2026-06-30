# Product Spec

ReviewPulse is a compact reputation workflow for local service businesses. This
repository is a public portfolio demo that shows the product idea without hosted
infrastructure.

## Demo Goals

- Let a visitor submit feedback on `/feedback/demo-clinic`.
- Analyze feedback locally into sentiment, themes, summary, and next action.
- Show operational metrics on `/dashboard`.
- Turn positive feedback into approved testimonials.
- Export feedback as formula-safe CSV.
- Run with `npm install && npm run dev` and no credentials.

## Target User

The demo is aimed at a local clinic, salon, restaurant, or service provider that
wants to understand customer feedback without buying a full CRM.

## Included

| Area | Included |
| --- | --- |
| Feedback collection | Public form with rating, comment, name, and email |
| Analysis | Deterministic local sentiment and theme rules |
| Dashboard | Metrics, recent feedback, themes, testimonials |
| Testimonials | Create/update approved quotes from positive feedback |
| Response drafts | Local polite response draft |
| Export | CSV export with formula escaping |
| Storage | Local SQLite file with seeded mock data |

## Not Included

- Production authentication.
- Multi-tenant authorization.
- Hosted database setup.
- External LLM calls.
- Email alerts.
- Billing or team management.

## Acceptance Criteria

- The demo runs without `.env.local`.
- `/dashboard` is visible immediately.
- `/feedback/demo-clinic` can submit feedback.
- Submitted feedback is stored in SQLite.
- CSV export does not allow spreadsheet formula injection.
- Tests and build pass in the local environment.
