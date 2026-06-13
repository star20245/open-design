/**
 * PRD Critique Theater — panelist definitions.
 *
 * This is the PRD equivalent of the Critique Theater panel system.
 * Instead of DESIGNER/CRITIC/BRAND/A11Y/COPY, the PRD has five
 * panelists: PM (writer), ENGINEER, DESIGNER, QA, STAKEHOLDER.
 *
 * The protocol is the same: CRITIQUE_RUN → ROUND → PANELIST → MUST_FIX → SHIP.
 * Each panelist scores on 5 dimensions (1-5 scale), must-fix items for
 * scores below threshold, and a composite score determines whether to
 * continue or ship.
 */

export const PRD_CRITIQUE_PANELISTS = {
  pm: {
    name: 'PM',
    role: 'Product Manager — writes the PRD',
    dimensions: [
      { id: 'completeness', label: 'All required sections present and filled', weight: 1 },
      { id: 'clarity', label: 'Every requirement is unambiguous and testable', weight: 1 },
      { id: 'scoping', label: 'Out of scope is explicit, priorities are realistic', weight: 1 },
      { id: 'traceability', label: 'Every FR traces to a user story, every story to a persona', weight: 1 },
      { id: 'structure', label: 'Follows the active schema, no invented sections', weight: 1 },
    ],
  },
  engineer: {
    name: 'Engineer',
    role: 'Tech Lead — evaluates implementation feasibility',
    dimensions: [
      { id: 'implementability', label: 'Every requirement can be estimated and built', weight: 2 },
      { id: 'api_design', label: 'API/interface boundaries are clearly defined', weight: 1 },
      { id: 'edge_cases', label: 'Error states, concurrency, and edge cases are covered', weight: 1 },
      { id: 'performance', label: 'Performance targets are realistic and measurable', weight: 1 },
      { id: 'dependencies', label: 'External dependencies are named and have fallbacks', weight: 1 },
    ],
  },
  designer: {
    name: 'Designer',
    role: 'UX Designer — evaluates user experience quality',
    dimensions: [
      { id: 'user_story_quality', label: 'User stories describe real scenarios, not feature lists', weight: 2 },
      { id: 'persona_accuracy', label: 'Personas are concrete, differentiated, and have usage context', weight: 1 },
      { id: 'acceptance_criteria', label: 'Acceptance criteria are testable and user-centered', weight: 1 },
      { id: 'accessibility', label: 'Accessibility requirements are defined and scoped', weight: 1 },
      { id: 'user_flow', label: 'The user journey is coherent from end to end', weight: 1 },
    ],
  },
  qa: {
    name: 'QA',
    role: 'QA Lead — evaluates testability',
    dimensions: [
      { id: 'testability', label: 'Every requirement can be turned into a test case', weight: 2 },
      { id: 'state_coverage', label: 'Loading, empty, error, edge, and populated states are covered', weight: 1 },
      { id: 'non_functional', label: 'Performance, security, and accessibility have measurable targets', weight: 1 },
      { id: 'acceptance_format', label: 'Acceptance criteria use Given/When/Then or checklist format', weight: 1 },
      { id: 'regression_risk', label: 'Changes to existing functionality are identified and assessed', weight: 1 },
    ],
  },
  stakeholder: {
    name: 'Stakeholder',
    role: 'Business Stakeholder — evaluates business alignment',
    dimensions: [
      { id: 'business_goal', label: 'Success metrics are SMART and aligned with company goals', weight: 2 },
      { id: 'scope', label: 'Scope is appropriate for the phase (MVP/V1/increment)', weight: 1 },
      { id: 'risk', label: 'Risks are identified with likelihood, impact, and mitigation', weight: 1 },
      { id: 'timeline', label: 'The PRD is scoped to be achievable in the stated timeframe', weight: 1 },
      { id: 'compliance', label: 'Regulatory requirements (GDPR, SOC 2, etc.) are addressed', weight: 1 },
    ],
  },
};

/**
 * Render the PRD Critique Theater protocol as a system prompt addendum.
 * This is injected into the system prompt after the quality rules layer
 * so the agent knows to self-critique before emitting.
 */
export function renderPrdCritiqueProtocol(): string {
  return `## PRD Critique Theater — self-review protocol

Before emitting the PRD artifact, run a silent 5-panelist critique. Score
yourself across the dimensions below. Any dimension under 3/5 is a regression
— go back, fix the weakest, re-score. Two passes is normal. Then emit.

### Panelist breakdown

**PM (Product Manager)** — writes the PRD (no self-score, just produces)
- Completeness: All required sections present and filled
- Clarity: Every requirement is unambiguous and testable
- Scoping: Out of scope is explicit, priorities are realistic
- Traceability: Every FR traces to a user story, every story to a persona
- Structure: Follows the active schema, no invented sections

**Engineer (Tech Lead)** — evaluates implementation feasibility
- Implementability: Every requirement can be estimated and built
- API Design: API/interface boundaries are clearly defined
- Edge Cases: Error states, concurrency, and edge cases are covered
- Performance: Performance targets are realistic and measurable
- Dependencies: External dependencies are named and have fallbacks

**Designer (UX Designer)** — evaluates user experience quality
- User Story Quality: Stories describe real scenarios, not feature lists
- Persona Accuracy: Personas are concrete, differentiated, with usage context
- Acceptance Criteria: Criteria are testable and user-centered
- Accessibility: Accessibility requirements are defined and scoped
- User Flow: The user journey is coherent from end to end

**QA (QA Lead)** — evaluates testability
- Testability: Every requirement can be turned into a test case
- State Coverage: Loading, empty, error, edge, populated states covered
- Non-Functional: Performance/security/accessibility have measurable targets
- Acceptance Format: Criteria use Given/When/Then or checklist format
- Regression Risk: Changes to existing functionality are identified

**Stakeholder (Business Stakeholder)** — evaluates business alignment
- Business Goal: Success metrics are SMART and aligned with company goals
- Scope: Scope appropriate for the phase (MVP/V1/increment)
- Risk: Risks identified with likelihood, impact, and mitigation
- Timeline: Scoped to be achievable in the stated timeframe
- Compliance: Regulatory requirements are addressed

### Scoring

- 5/5: No issues, production-ready
- 4/5: Minor issues, safe to ship
- 3/5: Material issues, should fix before shipping
- 2/5: Significant gaps, must fix before shipping
- 1/5: Missing entirely, blocking

Composite score < 7 (out of 10) means continue to another round.
Ship when composite >= 7 across all panelists.
`;
}