# SKILL.md — Greenfield Product PRD

## od
kind: skill
taskKind: prd
mode: greenfield
capabilities: [prompt:inject]

## od.craft
requires: [prd-quality, scope-triage, non-functional-floor, out-of-scope, prd-anti-slop, dependencies]

## Workflow

Pre-flight: Read references/template.md for the section structure skeleton. Read references/checklist.md for the P0/P1/P2 quality checklist.

### Step 1 — Context gathering

If the user hasn't provided: target users, problem statement, competition — ask with <question-form>. Don't guess.

### Step 2 — Persona development

Based on user input, develop 2-4 concrete personas. Each persona gets:
- **Name**: Realistic name
- **Role**: Job title or role
- **Tech level**: Novice / Intermediate / Expert
- **Current pain**: What frustrates them today
- **Goal**: What they want to achieve with this product
- **Usage frequency**: Daily / Weekly / Monthly / Once

### Step 3 — Epic & story mapping

Organize requirements into epics, then break each epic into user stories. Use the INVEST principle:
- **I**ndependent — can be developed in any order
- **N**egotiable — not a contract, a conversation starter
- **V**aluable — delivers value to the user
- **E**stimable — can be estimated by engineering
- **S**mall — fits within a sprint
- **T**estable — has clear acceptance criteria

### Step 4 — Write the PRD

Follow the active PRD Schema section by section:
1. Document Meta
2. Executive Summary
3. Problem Statement
4. User Personas & Stories
5. Functional Requirements
6. Non-Functional Requirements
7. Out of Scope
8. Dependencies & Risks
9. Success Metrics

Write the PRD as a single complete Markdown document.

### Step 5 — Self-review against quality rules

Run through the PRD Quality Rules checklist:
- **R0**: No vague requirements (P0 — scan for "user-friendly", "fast", "good UX", "scalable", "robust")
- **R1**: User story completeness (P0 — every story has persona, goal, reason, acceptance criteria)
- **R2**: Scope triage (P1 — every requirement has P0/P1/P2, P0 ratio < 30%)
- **R3**: Non-functional floor (P1 — performance, accessibility, security, data sections present)
- **R4**: Out of scope explicit (P1 — at least 3 items excluded with reasons)
- **R5**: No filler (P0 — no lorem ipsum, no "Feature One", no invented metrics)
- **R6**: Dependencies concrete (P2 — every dependency names the system and fallback)

For each violation:
- P0: Fix before emitting the artifact
- P1: Fix or flag with a "Note to reviewer"
- P2: Flag only

## Assets

- references/template.md — the section structure skeleton
- references/checklist.md — the P0/P1/P2 quality checklist