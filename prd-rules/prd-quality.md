# PRD Quality Rules — R0: No Vague Requirements (P0 — linter-enforced)

Every requirement MUST be testable. If you can't describe how to verify it, it's not a requirement — it's a wish.

## Vague-to-concrete replacement table

| Vague | Concrete replacement |
|---|---|
| "User-friendly" | "User completes the flow in ≤3 clicks with ≤2s per page load" |
| "Fast" | "P95 latency < 200ms for the search endpoint" |
| "Good UX" | "Error rate < 2% on form submission, task completion rate > 80%" |
| "Scalable" | "Supports 10k concurrent users with linear horizontal scaling" |
| "Robust" | "99.5% uptime SLA, automatic failover within 30s" |
| "Intuitive" | "First-time user completes core task without documentation in < 5 min" |
| "Should" without a test | Split into MUST with test or delete |

## Linter pattern

The linter scans for these patterns as P0:

```
/user-friendly/i
/\bfast\b(?!.*\d+\s*ms)/i    — "fast" without a number
/\bgood\s*UX\b/i
/\bscalable\b(?!.*\d+\s*(users|rps|qps|concurrent))/i
/\brobust\b/i
/\bintuitive\b/i
/\bseamless\b/i
/\bcutting-edge\b/i
/\bstate-of-the-art\b/i
/\bworld-class\b/i
/\bbest-in-class\b/i
```

**Fix**: Replace every flagged word with a concrete, measurable condition. If you can't measure it, you don't understand the requirement well enough to write it.