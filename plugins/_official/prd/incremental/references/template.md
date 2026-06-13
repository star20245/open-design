# Feature PRD Template — Incremental Feature

This is the section structure for an incremental feature PRD. Use this when adding a feature to an existing product.

---

# Feature PRD — [Feature Name]

## 1. Document Meta

| Field | Value |
|---|---|
| Feature Name | [Name] |
| Product | [Product Name] |
| Version | 0.1.0 |
| Status | Draft |
| Author | [Name] |
| Target Release | [Sprint / Milestone / Date] |
| Parent PRD | [Link to main product PRD] |

---

## 2. Why This Feature?

[One paragraph. What user problem does this solve? Why now instead of later? How does this align with the product roadmap?]

---

## 3. Current State

[Describe the existing product behavior that this feature changes or extends. What do users do today?]

---

## 4. User Stories

### Story 1: [Title]
**As a** [persona], **I want** [goal], **so that** [reason].

**Priority**: P0 | P1 | P2
**Acceptance Criteria**:
- [ ] [Testable condition]
- [ ] [Testable condition]

---

## 5. Functional Requirements

| ID | Requirement | Priority | Affected Module | Acceptance Criteria |
|---|---|---|---|---|
| FR-001 | The system MUST [action] | P0 | [Module] | [How to verify] |

---

## 6. Impact Analysis

### Affected Modules
| Module | Change Type | Breaking? | Migration Needed? |
|---|---|---|---|
| [Module] | [New / Modified / Deprecated] | [Yes / No] | [Yes / No] |

### API Changes
| Endpoint | Change | Breaking? |
|---|---|---|
| [GET /api/x] | [New / Modified / Deprecated] | [Yes / No] |

### Database Changes
| Change | Table | Migration |
|---|---|---|
| [New column] | [Table] | [Migration script] |

### UI Changes
| Screen | Change |
|---|---|
| [Screen] | [New component / Modified layout] |

---

## 7. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | [Impact on existing performance targets] |
| Accessibility | [WCAG level, new interactive elements] |
| Security | [New auth requirements, data exposure] |

---

## 8. Out of Scope

1. **[Feature/area]** — [Reason]
2. **[Feature/area]** — [Reason]

---

## 9. Dependencies

| Dependency | Team | Ready By | Blocker? |
|---|---|---|---|
| [Dependency] | [Team] | [Date] | [Yes / No] |

---

## 10. Success Criteria

| Criterion | How to Measure | Target |
|---|---|---|
| [Criterion] | [Method] | [Number] |