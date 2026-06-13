# PRD Quality Rules — R2: Scope Triage (P1)

Every requirement MUST carry a priority. A PRD without priorities is a wish list, not a plan.

## Priority levels

| Priority | Meaning | Test |
|---|---|---|
| P0 | Blocking — cannot ship without this | "If we removed this, would the product be unusable?" |
| P1 | Core MVP — important but has a workaround | "Could we ship without this and still deliver value?" |
| P2 | Nice-to-have — post-MVP | "Would this be nice in a future version?" |

## Scope bloat signal

A PRD with **>30% P0 items** is a sign of scope bloat. P0 means "literally cannot ship without this." If a third of your requirements are P0, you're either:

1. Over-prioritizing — some of these are actually P1
2. Under-scoping — the MVP is too large

**Fix**: Review each P0. Ask: "Is there really no workaround? Could we ship a degraded but functional version without this?" If yes, downgrade to P1.

## Linter check

```
P0 ratio = count(P0) / count(all requirements)
if P0 ratio > 0.3 → P1 warning: "P0 requirements at X%. Consider triaging."
```