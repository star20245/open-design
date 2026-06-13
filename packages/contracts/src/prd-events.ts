/**
 * PRD-specific realtime events.
 *
 * These events are emitted via SSE during PRD generation and are consumed
 * by the web UI to show live progress. They extend the existing event system
 * with PRD-specific event types.
 *
 * This is the PRD equivalent of the chat event types in packages/contracts/src/api/chat.ts.
 */

// ── PRD-specific event kinds ───────────────────────────────────

export type PrdEventKind =
  | 'prd_linter_findings'
  | 'prd_schema_changed'
  | 'prd_review_round'
  | 'prd_stage_progress'
  | 'prd_quality_pass'
  | 'prd_quality_fail';

// ── Linter findings event ──────────────────────────────────────

export interface PrdLinterFindingsEvent {
  kind: 'prd_linter_findings';
  /** Total findings */
  total: number;
  /** P0 findings (must fix) */
  p0: number;
  /** P1 findings (should fix) */
  p1: number;
  /** P2 findings (nice to have) */
  p2: number;
  /** Individual findings */
  findings: Array<{
    severity: 'P0' | 'P1' | 'P2';
    id: string;
    message: string;
    fix: string;
  }>;
}

// ── Schema changed event ───────────────────────────────────────

export interface PrdSchemaChangedEvent {
  kind: 'prd_schema_changed';
  /** Previous schema ID */
  previousId: string;
  /** New schema ID */
  newId: string;
  /** New schema name */
  newName: string;
}

// ── Review round event ─────────────────────────────────────────

export interface PrdReviewRoundEvent {
  kind: 'prd_review_round';
  /** Round number (1-based) */
  round: number;
  /** Max rounds */
  maxRounds: number;
  /** Composite score across all panelists */
  compositeScore: number;
  /** Threshold to pass */
  threshold: number;
  /** Whether to continue to next round */
  decision: 'continue' | 'ship';
  /** Panelist scores */
  panelists: Array<{
    role: string;
    name: string;
    score: number;
    mustFix: number;
    dimensions: Array<{
      id: string;
      label: string;
      score: number;
    }>;
  }>;
}

// ── Stage progress event ───────────────────────────────────────

export interface PrdStageProgressEvent {
  kind: 'prd_stage_progress';
  /** Stage ID */
  stageId: string;
  /** Stage label */
  stageLabel: string;
  /** Stage status */
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  /** Current atom within the stage */
  currentAtom?: string;
  /** Total atoms in the stage */
  totalAtoms: number;
  /** Completed atoms */
  completedAtoms: number;
}

// ── Quality pass/fail events ───────────────────────────────────

export interface PrdQualityPassEvent {
  kind: 'prd_quality_pass';
  /** Total findings that were resolved */
  resolvedFindings: number;
  /** Final quality score (0-10) */
  qualityScore: number;
}

export interface PrdQualityFailEvent {
  kind: 'prd_quality_fail';
  /** Unresolved P0 findings */
  unresolvedP0: number;
  /** Unresolved P1 findings */
  unresolvedP1: number;
  /** Reason for failure */
  reason: string;
}

// ── Union type for all PRD events ──────────────────────────────

export type PrdEvent =
  | PrdLinterFindingsEvent
  | PrdSchemaChangedEvent
  | PrdReviewRoundEvent
  | PrdStageProgressEvent
  | PrdQualityPassEvent
  | PrdQualityFailEvent;