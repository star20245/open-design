# PRD Schema — Standard

This is the canonical 10-section PRD structure. It is the PRD equivalent of DESIGN.md — it defines the document's shape, mandatory sections, and agent prompt rules.

---

## 1. Document Meta

| Field | Required | Description |
|---|---|---|
| title | YES | Product/feature name |
| version | YES | Semantic version, starts at 0.1.0 |
| status | YES | Draft / Review / Approved |
| author | YES | Who wrote this |
| stakeholders | NO | Who needs to sign off |
| last_updated | AUTO | Date stamp |

---

## 2. Executive Summary

One paragraph. What is this? Why now? What changes?

Template:
```
[Product name] is a [product type] that [solves a specific problem] for [target users].
We are building this now because [business reason / market gap / user demand].
This PRD covers [MVP / V1 / feature increment] and defines [key scope].
```

---

## 3. Problem Statement

**Current state** (with data if available):
- What do users do today instead of using this product?
- What is the cost of the current approach (time, money, frustration)?

**Pain points** (who feels them, how often, severity):
- Pain point 1: [description] — affects [persona], [frequency], severity [high/medium/low]
- Pain point 2: [description] — affects [persona], [frequency], severity [high/medium/low]

**Why existing solutions don't work**:
- [Existing solution 1] doesn't work because [reason]
- [Existing solution 2] doesn't work because [reason]

---

## 4. User Personas & Stories

### 4.1 Primary Personas

For each persona:
- **Name**: [Realistic name]
- **Role**: [Job title or role]
- **Tech level**: [Novice / Intermediate / Expert]
- **Current workflow pain**: [What frustrates them today]
- **Goal with this product**: [What they want to achieve]
- **Usage frequency**: [Daily / Weekly / Monthly / Once]

### 4.2 User Stories

Organize into epics, then break each epic into user stories.

```
## Epic 1: [Epic name]

**As a** [persona], **I want** [goal starting with a verb], **so that** [reason why this is worth building].

**Priority**: P0 | P1 | P2
**Acceptance Criteria**:
- [ ] [Testable condition 1]
- [ ] [Testable condition 2]
- [ ] [Testable condition 3]
```

---

## 5. Functional Requirements

| ID | Requirement | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| FR-001 | The system MUST [specific action] | P0 | US-001 | How to verify: [test description] |
| FR-002 | The system MUST [specific action] | P1 | US-002 | How to verify: [test description] |

Every FR-ID must map to at least one user story. Every requirement must be testable.

---

## 6. Non-Functional Requirements

### 6.1 Performance
| Metric | Target | Measurement Method |
|---|---|---|
| First load | < N seconds | Lighthouse / WebPageTest |
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
| Data encryption | [At rest / in transit] |
| Compliance | [GDPR, SOC 2, HIPAA, etc.] |

### 6.4 Data
| Area | Requirement |
|---|---|
| Data retention | [Policy] |
| Data residency | [Region] |
| Backup strategy | [RPO, RTO] |

---

## 7. Out of Scope

The following are explicitly NOT included in this PRD:

1. **[Feature/area]** — [Reason why it's excluded]
2. **[Feature/area]** — [Reason why it's excluded]
3. **[Feature/area]** — [Reason why it's excluded]

---

## 8. Dependencies & Risks

### Internal Dependencies
| Dependency | Owner Team | What's Needed | Fallback if Not Ready |
|---|---|---|---|

### External Dependencies
| Dependency | Provider | What's Needed | Fallback if Not Ready |
|---|---|---|---|

### Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|

---

## 9. Success Metrics

How do we know this succeeded? Use SMART goals.

| Metric | Target | Measurement Method | Timeframe |
|---|---|---|---|
| [Metric name] | [Specific number] | [How to measure] | [When to measure] |
| [Metric name] | [Specific number] | [How to measure] | [When to measure] |

---

## 10. Agent Prompt Guide

When generating a PRD from this schema, use these rules:

1. **Every FR-ID must map to at least one user story.** If a requirement doesn't serve a user story, it shouldn't exist.
2. **No requirement without acceptance criteria.** If you can't describe how to test it, it's not a requirement.
3. **Performance targets must have a measurement method.** "Fast" is not a target; "P95 < 200ms" is.
4. **Use active voice.** "The system MUST..." not "It should be that..."
5. **Prioritize ruthlessly.** If >30% of requirements are P0, you're not prioritizing — you're listing.
6. **Out of scope is mandatory.** No PRD is complete without at least 3 items explicitly excluded.
7. **Use RFC 2119 keywords.** MUST (required), SHOULD (recommended), MAY (optional).
8. **Name things concretely.** "Feature One" is not a name; "Payment Reconciliation Dashboard" is.
9. **Trace every requirement.** FR → User Story → Persona → Problem Statement. Break the chain and the requirement is orphaned.
10. **Be honest about gaps.** `[NEEDS CLARIFICATION]` is better than a fabricated number.`