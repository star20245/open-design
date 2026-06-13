/**
 * PRD Pipeline configuration.
 *
 * This defines the multi-stage pipeline for PRD generation.
 * The pipeline runner (from OD's plugin system) executes these stages
 * sequentially, with repeat/until conditions for the review stage.
 *
 * This is the PRD equivalent of the plugin pipeline manifest.
 */

export const PRD_PIPELINE = {
  /** Pipeline stages — executed in order */
  stages: [
    {
      id: 'research',
      label: 'Research & Context',
      description: 'Gather context: read existing codebase, competitor docs, user research',
      atoms: [
        'codebase-analysis',
        'competitor-review',
        'user-research-synthesis',
      ],
      repeat: 1,
    },
    {
      id: 'structure',
      label: 'Structure & Plan',
      description: 'Develop personas, map epics, plan the document structure',
      atoms: [
        'persona-development',
        'epic-mapping',
        'section-outline',
      ],
      repeat: 1,
    },
    {
      id: 'writing',
      label: 'Write PRD',
      description: 'Write all sections of the PRD',
      atoms: [
        'executive-summary',
        'problem-statement',
        'user-stories',
        'functional-requirements',
        'non-functional-requirements',
        'out-of-scope',
        'dependencies-and-risks',
        'success-metrics',
      ],
      repeat: 1,
    },
    {
      id: 'review',
      label: 'Review & Refine',
      description: 'Self-review against quality rules, run critique, refine',
      atoms: [
        'quality-lint',
        'self-critique',
        'stakeholder-review',
      ],
      repeat: 3,
      until: 'composite_score >= 7',
      onFailure: 'emit_with_warnings',
    },
  ],

  /** Default pipeline for different PRD types */
  defaults: {
    greenfield: {
      stages: ['research', 'structure', 'writing', 'review'],
    },
    increment: {
      stages: ['research', 'writing', 'review'],
      // No structure stage needed — follows existing product structure
    },
    lean: {
      stages: ['research', 'writing', 'review'],
      // Lean canvas is a single pass
    },
  },
};

/**
 * PRD pipeline stage result — emitted after each stage completes.
 */
export interface PrdStageResult {
  stageId: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  atoms: PrdAtomResult[];
  durationMs: number;
  error?: string;
}

export interface PrdAtomResult {
  atomId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  output?: string;
  error?: string;
}