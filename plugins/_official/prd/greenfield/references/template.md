# PRD Template — Greenfield Product

This is the section structure skeleton for a greenfield product PRD. Copy this, fill in the sections, and replace bracketed placeholders with real content.

---

# Product Requirements Document — [Product Name]

## 1. Document Meta

| Field | Value |
|---|---|
| Title | [Product Name] PRD |
| Version | 0.1.0 |
| Status | Draft |
| Author | [Name] |
| Stakeholders | [Names / roles] |
| Last Updated | [Date] |

---

## 2. Executive Summary

[Product name] is a [product type] that [solves a specific problem] for [target users]. We are building this now because [business reason / market gap / user demand]. This PRD covers [MVP / V1] and defines [key scope].

---

## 3. Problem Statement

### Current State

[What do users do today instead of using this product? What is the cost of the current approach?]

### Pain Points

1. [Pain point] — affects [persona], [frequency], severity [H/M/L]
2. [Pain point] — affects [persona], [frequency], severity [H/M/L]

### Why Existing Solutions Don't Work

- [Existing solution 1] doesn't work because [reason]
- [Existing solution 2] doesn't work because [reason]

---

## 4. User Personas & Stories

### 4.1 Primary Personas

#### Persona 1: [Name]
- **Role**: [Job title]
- **Tech level**: [Novice / Intermediate / Expert]
- **Current pain**: [What frustrates them today]
- **Goal**: [What they want to achieve]
- **Usage frequency**: [Daily / Weekly / Monthly]

#### Persona 2: [Name]
...

### 4.2 User Stories

#### Epic 1: [Epic Name]

**As a** [persona], **I want** [goal starting with a verb], **so that** [reason].

**Priority**: P0 | P1 | P2
**Acceptance Criteria**:
- [ ] [Testable condition 1]
- [ ] [Testable condition 2]

---

## 5. Functional Requirements

| ID | Requirement | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| FR-001 | The system MUST [action] | P0 | US-001 | [How to verify] |
| FR-002 | The system MUST [action] | P1 | US-002 | [How to verify] |

---

## 6. Non-Functional Requirements

### 6.1 Performance
| Metric | Target | Measurement |
|---|---|---|
| First load | < N seconds | Lighthouse |
| API latency (P95) | < N ms | Server instrumentation |
| Concurrent users | N | Load test |

### 6.2 Accessibility
| Standard | Level | Scope |
|---|---|---|
| WCAG | 2.2 AA | All user-facing surfaces |

### 6.3 Security
| Area | Requirement |
|---|---|
| Authentication | [Method] |
| Authorization | [RBAC model] |
| Data encryption | [At rest / in transit specs] |
| Compliance | [GDPR, SOC 2, HIPAA, etc.] |

### 6.4 Data
| Area | Requirement |
|---|---|
| Data retention | [Policy] |
| Data residency | [Region] |
| Backup strategy | [RPO, RTO] |

---

## 7. Out of Scope

1. **[Feature/area]** — [Reason]
2. **[Feature/area]** — [Reason]
3. **[Feature/area]** — [Reason]

---

## 8. Dependencies & Risks

### Internal Dependencies
| Dependency | Owner | What's Needed | Fallback |
|---|---|---|---|

### External Dependencies
| Dependency | Provider | What's Needed | Fallback |
|---|---|---|---|

### Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|

---

## 9. Success Metrics

| Metric | Target | Measurement | Timeframe |
|---|---|---|---|
| [Metric] | [Number] | [How] | [When] |
| [Metric] | [Number] | [How] | [When] |