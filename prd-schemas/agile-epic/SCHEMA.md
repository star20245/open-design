# PRD Schema — Agile Epic

A lightweight PRD format focused on epics and user stories. Best for incremental feature development within an existing product.

---

## 1. Epic Summary

| Field | Value |
|---|---|
| Epic Name | [Name] |
| Product Area | [Area] |
| Sprint / Release | [When] |
| PM | [Name] |
| Tech Lead | [Name] |

---

## 2. Why This Epic?

One paragraph. What user problem does this solve? Why now instead of later?

---

## 3. User Stories

### Story 1: [Title]
**As a** [persona], **I want** [goal], **so that** [reason].

**Priority**: P0 | P1 | P2
**Estimate**: [Story points]
**Acceptance Criteria**:
- [ ] [Testable condition]
- [ ] [Testable condition]

### Story 2: [Title]
...

---

## 4. Technical Considerations

| Area | Note |
|---|---|
| Affected services | [List] |
| Database changes | [Migrations needed] |
| API changes | [New endpoints / breaking changes] |
| Performance impact | [Expected load change] |

---

## 5. Design References

| Asset | Link / Description |
|---|---|
| Figma | [Link] |
| Design spec | [Link] |
| Prototype | [Link] |

---

## 6. Dependencies

| Dependency | Team | Ready By | Blocker? |
|---|---|---|---|
| [Dependency] | [Team] | [Date] | [Yes / No] |

---

## 7. Out of Scope

1. **[Feature]** — [Reason]
2. **[Feature]** — [Reason]

---

## 8. Success Criteria

| Criterion | How to Measure | Target |
|---|---|---|
| [Criterion] | [Method] | [Number] |

---

## 9. Agent Prompt Guide

When generating an Agile Epic PRD:
1. **One epic = one coherent user goal.** If stories don't share a theme, split into separate epics.
2. **Every story must be estimable.** If engineering can't estimate it, break it down further.
3. **Technical considerations are mandatory.** Don't surprise engineering with undocumented DB changes.
4. **Dependencies must have dates.** "When it's ready" is not a date — pin it to a sprint or milestone.
5. **Keep out of scope tight.** Agile epics should be narrow; push nice-to-haves to a follow-up epic.