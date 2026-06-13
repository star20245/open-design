# PRD Quality Rules — R4: Out of Scope Explicit (P1)

Without an out-of-scope section, scope creep is guaranteed. Every PRD MUST include an explicit "what we're NOT doing" section.

## Required format

```
## N. Out of Scope

The following are explicitly NOT included in this PRD:

1. **[Feature/area]** — [Reason why it's excluded]
2. **[Feature/area]** — [Reason why it's excluded]  
3. **[Feature/area]** — [Reason why it's excluded]
```

## Minimum requirements

- At least **3 items** explicitly listed
- Each item has a **reason** (not just "excluded")
- Reasons should be one of: "deferred to V2", "out of scope for MVP", "handled by separate team", "not needed for target users", "too complex for initial release"

## Common out-of-scope items

- Internationalization / localization
- Admin dashboards
- Analytics / reporting
- Migration tooling
- API documentation
- Third-party integrations not in the core path
- Mobile apps (if web-only)
- Offline support

## Linter check

```
if no "## N. Out of Scope" section → P1: "Add out-of-scope section"
if out-of-scope section has < 3 items → P1: "List at least 3 out-of-scope items"
```