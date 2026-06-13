# PRD Quality Checklist — Greenfield

Run through this checklist before emitting the artifact. P0 must all pass.

## P0 — Must Fix Before Emitting

- [ ] **No vague requirements**: Scan for "user-friendly", "fast", "good UX", "scalable", "robust", "intuitive", "seamless" — replace with measurable conditions
- [ ] **No filler**: No lorem ipsum, no "Feature One/Two", no invented metrics ("10× faster", "99.9% uptime")
- [ ] **User story completeness**: Every user story has a concrete persona, verb-first goal, reason, and at least one acceptance criterion
- [ ] **Every FR-ID maps to a user story**: No orphaned requirements
- [ ] **Every P0/P1 user story has acceptance criteria**: If you can't test it, it's not a requirement

## P1 — Should Fix

- [ ] **Scope triage**: Every requirement has P0/P1/P2 priority. P0 ratio is under 30%
- [ ] **Non-functional floor**: Performance, accessibility, security, and data sections are present (or marked N/A with reason)
- [ ] **Out of scope explicit**: At least 3 items explicitly excluded with reasons
- [ ] **Executive summary**: One paragraph that answers "what, why, who, scope"
- [ ] **Success metrics**: SMART goals with specific numbers, measurement methods, and timeframes

## P2 — Nice to Have

- [ ] **Dependencies are concrete**: Every dependency names the system, the specific thing needed, and the fallback
- [ ] **Personas have usage frequency**: Daily / Weekly / Monthly differentiated
- [ ] **Active voice throughout**: "The system MUST..." not "It should be that..."
- [ ] **RFC 2119 keywords**: MUST, SHOULD, MAY used consistently
- [ ] **Risks have mitigation**: Every risk has a concrete mitigation strategy