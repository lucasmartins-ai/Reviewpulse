# Contributing

ReviewPulse should stay clean, focused, and practical. Contributions should
strengthen the local portfolio demo instead of adding broad SaaS surface area.

## Development Principles

- Keep domain logic out of route files.
- Validate inputs at every boundary.
- Prefer small, cohesive modules.
- Keep generated response text behind human review.
- Avoid external services unless the README setup remains credential-free.
- Add tests for behavior, not implementation details.

## Documentation Rules

- Update docs when behavior, schema, routes, or setup changes.
- Keep examples realistic for local businesses.
- Avoid vague AI marketing copy.
- Document security tradeoffs explicitly.

## Commit Style

Use conventional commits:

```text
feat: add feedback submission route
fix: prevent csv formula injection
docs: document sqlite setup
test: cover sentiment validation
```

## Pull Request Checklist

- [ ] User-facing behavior is described clearly.
- [ ] Inputs are validated.
- [ ] Secrets are not required or committed.
- [ ] Generated SQLite files stay ignored.
- [ ] Tests cover the changed behavior.
- [ ] Docs are updated when needed.
- [ ] Public copy is specific and human.
