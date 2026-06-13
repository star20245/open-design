/**
 * PRD contract type extensions.
 *
 * These types extend the existing contracts package to support PRD-specific
 * concepts. In production, these would be added to packages/contracts/src/.
 *
 * Key additions:
 *   - PrdProject extends Project with PRD-specific metadata
 *   - PrdSchemaEntry for schema discovery
 *   - PrdRunRequest extends ChatRequest for PRD runs
 *   - PrdQualityEvent for real-time quality check events
 */

// ── PRD-specific project metadata ──────────────────────────────

export interface PrdProjectMeta {
  /** Project kind discriminator: 'prd' */
  kind: 'prd';
  /** PRD type: greenfield, increment, migration, api-spec */
  prdType: 'greenfield' | 'increment' | 'migration' | 'api-spec' | 'gdd';
  /** Active schema ID */
  schemaId: string;
  /** Target audience for the document */
  targetAudience: 'engineering' | 'executive' | 'design' | 'qa' | 'external';
  /** Product name */
  productName?: string;
  /** Product type */
  productType?: 'b2c' | 'b2b' | 'internal' | 'platform' | 'api';
  /** System state */
  systemState?: 'greenfield' | 'codebase' | 'migration' | 'increment';
  /** Scope */
  scope?: 'mvp' | 'v1' | 'feature';
}

// ── PRD Schema entry ───────────────────────────────────────────

export interface PrdSchemaEntry {
  /** Schema ID (directory name) */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description */
  description: string;
  /** Path to SCHEMA.md */
  schemaPath: string;
  /** Path to example PRD */
  examplePath?: string;
  /** Schema version */
  version: string;
}

// ── PRD-specific chat request ──────────────────────────────────

export interface PrdRunRequest {
  /** Project ID */
  projectId: string;
  /** User message */
  message: string;
  /** Agent ID to use */
  agentId?: string;
  /** Active PRD schema ID */
  schemaId?: string;
  /** Active PRD type */
  prdType?: string;
  /** Conversation ID for resuming */
  conversationId?: string;
  /** Whether to resume an existing run */
  resume?: boolean;
}

// ── PRD quality event ──────────────────────────────────────────

export interface PrdQualityEvent {
  kind: 'prd_quality';
  /** Total findings */
  totalFindings: number;
  /** P0 count */
  p0Count: number;
  /** P1 count */
  p1Count: number;
  /** P2 count */
  p2Count: number;
  /** Whether the artifact passed quality checks */
  passed: boolean;
}

// ── PRD artifact event ─────────────────────────────────────────

export interface PrdArtifactEvent {
  kind: 'prd_artifact';
  action: 'created' | 'updated' | 'deleted';
  artifactId: string;
  title: string;
  /** PRD type */
  prdType: string;
  /** Schema used */
  schemaId: string;
  /** Section count */
  sectionCount: number;
  /** Requirement count */
  requirementCount: number;
  /** Quality score (0-10) */
  qualityScore?: number;
}