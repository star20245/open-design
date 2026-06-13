/**
 * PRD quality linter for generated PRD artifacts.
 *
 * Runs grep-style checks against a PRD artifact body and returns a list of
 * structured findings. P0 findings indicate the PRD has vague requirements,
 * missing sections, or filler content — and are surfaced back to the agent
 * as a system message so it can self-correct on the next turn.
 *
 * The linter is deliberately greppy: cheap, deterministic, and trivial
 * to extend. It does NOT parse Markdown structurally — false positives are
 * tolerable because each finding includes a snippet so the agent can verify.
 *
 * Wired into the artifact save flow (POST /api/artifacts/save) and
 * exposed standalone at POST /api/artifacts/lint.
 */

type LintSeverity = 'P0' | 'P1' | 'P2';

export type LintFinding = {
  severity: LintSeverity;
  id: string;
  message: string;
  fix: string;
  snippet?: string;
};

// ── P0 patterns: vague requirements ──────────────────────────────
const VAGUE_PATTERNS: Array<{ re: RegExp; id: string; message: string; fix: string }> = [
  {
    re: /\buser-friendly\b/i,
    id: 'vague-user-friendly',
    message: 'Vague requirement: "user-friendly" — replace with measurable UX metrics.',
    fix: 'Specify: "User completes the flow in ≤3 clicks with ≤2s per page load."',
  },
  {
    re: /\bgood\s*UX\b/i,
    id: 'vague-good-ux',
    message: 'Vague requirement: "good UX" — replace with specific UX metrics.',
    fix: 'Specify: "Error rate < 2% on form submission, task completion rate > 80%."',
  },
  {
    re: /\bintuitive\b/i,
    id: 'vague-intuitive',
    message: 'Vague requirement: "intuitive" — replace with measurable usability target.',
    fix: 'Specify: "First-time user completes core task without documentation in < 5 min."',
  },
  {
    re: /\brobust\b/i,
    id: 'vague-robust',
    message: 'Vague requirement: "robust" — replace with reliability SLA.',
    fix: 'Specify: "99.5% uptime SLA, automatic failover within 30s."',
  },
  {
    re: /\bseamless\b/i,
    id: 'vague-seamless',
    message: 'Vague requirement: "seamless" — replace with specific integration spec.',
    fix: 'Specify: "Data syncs within 500ms of change, no manual refresh required."',
  },
  {
    re: /\bcutting-edge\b/i,
    id: 'vague-cutting-edge',
    message: 'Vague: "cutting-edge" — marketing language in a requirements doc.',
    fix: 'Remove or replace with the specific technology/approach being referenced.',
  },
  {
    re: /\bworld-class\b/i,
    id: 'vague-world-class',
    message: 'Vague: "world-class" — unmeasurable marketing language.',
    fix: 'Remove or replace with a specific benchmark: "Performance in the top quartile of [industry benchmark]."',
  },
];

// ── P0: filler patterns ────────────────────────────────────────
const FILLER_PATTERNS: Array<{ re: RegExp; id: string; message: string; fix: string }> = [
  {
    re: /\bfeature\s+(one|two|three|1|2|3)\b/i,
    id: 'filler-feature-name',
    message: 'Placeholder feature name detected — name things concretely.',
    fix: 'Replace "Feature One" with the actual feature name.',
  },
  {
    re: /\blorem\s+ipsum\b/i,
    id: 'filler-lorem',
    message: 'Lorem ipsum placeholder text detected.',
    fix: 'Replace with real content or [NEEDS CLARIFICATION] marker.',
  },
  {
    re: /\bthe system shall be robust\b/i,
    id: 'filler-robust-clause',
    message: 'Generic filler clause: "the system shall be robust" — no testable meaning.',
    fix: 'Replace with specific reliability requirements (uptime, failover, error rate).',
  },
];

// ── P0: invented metrics ────────────────────────────────────────
const INVENTED_METRIC_PATTERNS = [
  { re: /\b10×\s+(faster|better|easier|more)\b/i, id: 'invented-metric-10x' },
  { re: /\b100×\s+(faster|better)\b/i, id: 'invented-metric-100x' },
  { re: /\b99\.\d+%\s+uptime\b/i, id: 'invented-metric-uptime' },
  { re: /\b3×\s+more\s+(productive|efficient)\b/i, id: 'invented-metric-3x' },
  { re: /\b5×\s+(faster|better|more)\b/i, id: 'invented-metric-5x' },
];

// ── P0: fast/scalable without a number ──────────────────────────
const FAST_WITHOUT_NUMBER =
  /\bfast\b(?![^.]*?\d+\s*(?:ms|s|seconds|minutes))/i;
const SCALABLE_WITHOUT_NUMBER =
  /\bscalable\b(?![^.]*?\d+\s*(?:users|rps|qps|concurrent|requests))/i;

// ── P1: missing sections ────────────────────────────────────────
const OUT_OF_SCOPE_RE = /##\s+\d+\.\s+Out of Scope/i;
const PERFORMANCE_RE = /##\s+\d+\.\d+\s+Performance|##\s+\d+\.\s+Non-Functional Requirements/i;
const ACCESSIBILITY_RE = /(?:accessibility|a11y|WCAG)/i;
const SECURITY_RE = /(?:security|authentication|authorization|encryption)/i;

/**
 * Run all checks against a PRD artifact body. Returns an array of
 * findings. The checks are intentionally independent so adding a new
 * one only means appending to this function.
 */
export function lintPrd(rawMd: unknown): LintFinding[] {
  const out: LintFinding[] = [];
  if (typeof rawMd !== 'string' || rawMd.length === 0) return out;

  const md = rawMd;

  // ── P0-1: vague requirements ─────────────────────────────────
  for (const { re, id, message, fix } of VAGUE_PATTERNS) {
    const m = re.exec(md);
    if (m) {
      out.push({ severity: 'P0', id, message, fix, snippet: clip(m[0]) });
      break; // One vague signal per artifact is enough
    }
  }

  // ── P0-2: "fast" without a number ────────────────────────────
  const fastM = FAST_WITHOUT_NUMBER.exec(md);
  if (fastM && !out.find((f) => f.id.startsWith('vague-'))) {
    out.push({
      severity: 'P0',
      id: 'vague-fast',
      message: 'Vague requirement: "fast" without a specific metric.',
      fix: 'Replace with: "P95 latency < N ms" or "renders in < N seconds."',
      snippet: clip(fastM[0]),
    });
  }

  // ── P0-3: "scalable" without a number ────────────────────────
  const scalableM = SCALABLE_WITHOUT_NUMBER.exec(md);
  if (scalableM && !out.find((f) => f.id.startsWith('vague-'))) {
    out.push({
      severity: 'P0',
      id: 'vague-scalable',
      message: 'Vague: "scalable" without a specific target.',
      fix: 'Replace with: "Supports N concurrent users with linear horizontal scaling."',
      snippet: clip(scalableM[0]),
    });
  }

  // ── P0-4: filler patterns ────────────────────────────────────
  for (const { re, id, message, fix } of FILLER_PATTERNS) {
    const m = re.exec(md);
    if (m) {
      out.push({ severity: 'P0', id, message, fix, snippet: clip(m[0]) });
      break;
    }
  }

  // ── P0-5: invented metrics ───────────────────────────────────
  for (const { re, id } of INVENTED_METRIC_PATTERNS) {
    const m = re.exec(md);
    if (m) {
      out.push({
        severity: 'P0',
        id,
        message: `Suspected invented metric: "${m[0]}". No numbers without a real source.`,
        fix: 'Either cite the source or replace with [NEEDS DATA — ask user].',
        snippet: clip(m[0]),
      });
      break;
    }
  }

  // ── P1-1: missing out-of-scope section ────────────────────────
  if (!OUT_OF_SCOPE_RE.test(md)) {
    out.push({
      severity: 'P1',
      id: 'missing-out-of-scope',
      message: 'Missing "Out of Scope" section — scope creep is guaranteed without it.',
      fix: 'Add a "## N. Out of Scope" section with at least 3 items explicitly excluded.',
    });
  }

  // ── P1-2: missing performance section ─────────────────────────
  if (!PERFORMANCE_RE.test(md)) {
    out.push({
      severity: 'P1',
      id: 'missing-performance',
      message: 'Missing performance requirements section.',
      fix: 'Add a "### Performance" subsection under Non-Functional Requirements with specific targets.',
    });
  }

  // ── P1-3: missing accessibility section ───────────────────────
  if (!ACCESSIBILITY_RE.test(md)) {
    out.push({
      severity: 'P1',
      id: 'missing-accessibility',
      message: 'Missing accessibility requirements section.',
      fix: 'Add accessibility target (e.g., WCAG 2.2 AA) under Non-Functional Requirements, or mark N/A with reason.',
    });
  }

  // ── P1-4: missing security section ────────────────────────────
  if (!SECURITY_RE.test(md)) {
    out.push({
      severity: 'P1',
      id: 'missing-security',
      message: 'Missing security considerations section.',
      fix: 'Add authentication, authorization, data encryption, and compliance requirements.',
    });
  }

  // ── P2-1: check P0 requirement ratio ──────────────────────────
  const p0Count = (md.match(/P0/g) || []).length;
  const p1Count = (md.match(/P1/g) || []).length;
  const totalReq = p0Count + p1Count;
  if (totalReq > 0 && p0Count / totalReq > 0.3) {
    out.push({
      severity: 'P1',
      id: 'p0-scope-bloat',
      message: `P0 requirements at ${Math.round((p0Count / totalReq) * 100)}% of total — consider triaging.`,
      fix: 'Review each P0: is there really no workaround? Downgrade marginal P0s to P1.',
    });
  }

  return out;
}

/**
 * Format findings as a Markdown block ready to splice into a system
 * reminder back to the agent.
 */
export function renderFindingsForAgent(findings: LintFinding[]): string {
  if (findings.length === 0) return '';
  const sorted = [...findings].sort((a, b) => severity(a) - severity(b));
  const lines = [
    '<prd-lint>',
    'The PRD you just produced has the following quality issues.',
    `${findings.filter((f) => f.severity === 'P0').length} P0 (must fix), ${findings.filter((f) => f.severity === 'P1').length} P1 (should fix), ${findings.filter((f) => f.severity === 'P2').length} P2 (nice to have).`,
    'Re-emit a corrected `<artifact>` in your next turn.',
    '',
  ];
  for (const f of sorted) {
    lines.push(`**[${f.severity}] ${f.id}** — ${f.message}`);
    lines.push(`  Fix: ${f.fix}`);
    if (f.snippet) lines.push(`  Snippet: \`${f.snippet}\``);
    lines.push('');
  }
  lines.push('</prd-lint>');
  return lines.join('\n');
}

function severity(f: LintFinding): number {
  return f.severity === 'P0' ? 0 : f.severity === 'P1' ? 1 : 2;
}

function clip(s: string): string {
  if (!s) return '';
  const trimmed = s.replace(/\s+/g, ' ').trim();
  return trimmed.length > 200 ? trimmed.slice(0, 197) + '…' : trimmed;
}