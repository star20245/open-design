# PRD Quality Rules — R3: Non-Functional Floor (P1)

These sections MUST be present in every PRD unless explicitly marked N/A with a reason.

## Required sections

### 1. Performance budget

| Metric | Target | Measurement method |
|---|---|---|
| First load | < N seconds | Lighthouse / WebPageTest |
| API latency (P95) | < N ms | Server-side instrumentation |
| Concurrent users | N | Load test |
| Throughput | N RPS/QPS | Load test |

### 2. Accessibility target

| Standard | Level | Scope |
|---|---|---|
| WCAG | 2.2 AA | All user-facing surfaces |
| Keyboard navigation | Full | All interactive elements |
| Screen reader | Compatible | All content and controls |

Mark "N/A" only if the product has no user-facing interface (e.g., a backend API).

### 3. Security considerations

| Area | Requirement | Notes |
|---|---|---|
| Authentication | Method (OAuth, SAML, passwordless) | |
| Authorization | RBAC model | |
| Data at rest | Encryption standard | |
| Data in transit | TLS version | |
| Secrets management | How keys/credentials are stored | |
| Compliance | GDPR, SOC 2, HIPAA, etc. | List applicable regulations |

### 4. Data considerations

| Area | Requirement |
|---|---|
| Data retention | How long, what gets deleted when |
| Data residency | Where data is stored (region/country) |
| Backup strategy | Frequency, RPO, RTO |
| PII handling | What PII is collected, how it's protected |

## Linter check

```
if missing "## Performance" → P1: "Add performance budget section"
if missing "## Accessibility" → P1: "Add accessibility target section"
if missing "## Security" → P1: "Add security considerations section"
```