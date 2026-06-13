# SKILL.md — Incremental Feature PRD

## od
kind: skill
taskKind: prd
mode: increment
capabilities: [prompt:inject]

## od.craft
requires: [prd-quality, scope-triage, non-functional-floor, out-of-scope, prd-anti-slop]

## Workflow

Pre-flight: Read references/template.md for the section structure.

### Step 1 — Context gathering

If the user hasn't provided: the existing product context, the feature to add, the affected modules — ask with <question-form>. Don't guess.

If the user has shared a codebase, read the relevant files to understand the existing architecture, interfaces, and constraints the new feature must respect.

### Step 2 — Impact analysis

Identify what the new feature touches:
- **Affected modules**: Which existing components/services need changes
- **New modules**: What new components/services are needed
- **API changes**: New endpoints, breaking changes, deprecations
- **Database changes**: New tables, migrations, schema changes
- **UI changes**: New screens, modified screens, new components

### Step 3 — Write the feature PRD

Follow the active PRD Schema, focusing on:
1. **Why this feature** — what user problem does it solve? Why now?
2. **What changes** — functional requirements, API changes, UI changes
3. **What doesn't change** — explicitly call out what stays the same
4. **Impact on existing functionality** — regression risks, migration needs
5. **Acceptance criteria** — how to verify the feature works without breaking existing flows

### Step 4 — Self-review against quality rules

Run through the PRD Quality Rules:
- **R0**: No vague requirements
- **R1**: User story completeness
- **R2**: Scope triage (P0 ratio < 30%)
- **R3**: Non-functional floor (performance, accessibility, security)
- **R4**: Out of scope explicit (at least 3 items excluded)
- **R5**: No filler
- **R6**: Dependencies concrete

## Assets

- references/template.md — the feature PRD section structure