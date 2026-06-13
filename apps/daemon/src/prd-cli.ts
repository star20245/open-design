/**
 * PRD CLI entry point — `od prd` subcommand.
 *
 * This is the PRD equivalent of OD's UI/CLI dual-track requirement.
 * Every PRD Agent capability reachable via the Web UI must also be
 * reachable via `od prd <subcommand>`.
 *
 * Subcommands:
 *   od prd new       — Create a new PRD project
 *   od prd generate  — Generate a PRD from a brief
 *   od prd lint      — Lint an existing PRD
 *   od prd export    — Export a PRD to PDF/DOCX/HTML
 *   od prd schemas   — List available PRD schemas
 *   od prd rules     — List available quality rules
 */

import { discoverPrdSchemas, loadPrdSchemaContent } from '../prd-schema-resolver.js';
import { lintPrd, renderFindingsForAgent } from '../lint-prd.js';
import { startExportJob, ExportFormat } from '../prd-export.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// ── Constants ──────────────────────────────────────────────────

const CLI_NAME = 'od prd';
const VERSION = '0.1.0';

// ── Help text ──────────────────────────────────────────────────

const HELP = `
${CLI_NAME} — PRD Agent CLI (v${VERSION})

Usage:
  od prd <subcommand> [options]

Subcommands:
  new         Create a new PRD project
  generate    Generate a PRD from a brief
  lint        Lint an existing PRD Markdown file
  export      Export a PRD to PDF, DOCX, or HTML
  schemas     List available PRD schemas
  rules       List available quality rules
  help        Show this help

Examples:
  od prd new --name "Payment System" --schema standard
  od prd generate --brief "B2B analytics dashboard for data engineers"
  od prd lint ./prd.md
  od prd export ./prd.md --format pdf
  od prd schemas
`;

// ── Schema list ────────────────────────────────────────────────

function listSchemas(): never {
  const schemas = discoverPrdSchemas();
  console.log('Available PRD Schemas:\n');
  for (const s of schemas) {
    console.log(`  ${s.id.padEnd(16)} ${s.name}`);
    console.log(`  ${''.padEnd(16)} ${s.description}`);
    console.log();
  }
  process.exit(0);
}

// ── Rule list ──────────────────────────────────────────────────

const KNOWN_RULES = [
  { id: 'prd-quality', name: 'R0: No Vague Requirements', severity: 'P0' },
  { id: 'prd-anti-slop', name: 'R5: No Filler', severity: 'P0' },
  { id: 'scope-triage', name: 'R2: Scope Triage', severity: 'P1' },
  { id: 'non-functional-floor', name: 'R3: Non-Functional Floor', severity: 'P1' },
  { id: 'out-of-scope', name: 'R4: Out of Scope Explicit', severity: 'P1' },
  { id: 'dependencies', name: 'R6: Dependencies Concrete', severity: 'P2' },
];

function listRules(): never {
  console.log('Available PRD Quality Rules:\n');
  for (const r of KNOWN_RULES) {
    console.log(`  [${r.severity}] ${r.id.padEnd(24)} ${r.name}`);
  }
  console.log();
  process.exit(0);
}

// ── New project ────────────────────────────────────────────────

interface NewProjectOptions {
  name: string;
  schema: string;
  dir?: string;
}

function createProject(opts: NewProjectOptions): never {
  const projectDir = opts.dir ?? join(process.cwd(), opts.name.toLowerCase().replace(/\s+/g, '-'));
  if (!existsSync(projectDir)) {
    mkdirSync(projectDir, { recursive: true });
  }

  const schemaContent = loadPrdSchemaContent(opts.schema);
  const prdPath = join(projectDir, 'prd.md');
  const template = `# Product Requirements Document — ${opts.name}

> Schema: ${opts.schema}
> Created: ${new Date().toISOString().split('T')[0]}
> Status: Draft

---

<!-- Fill in the PRD sections below following the ${opts.schema} schema -->

## 1. Document Meta

| Field | Value |
|---|---|
| Title | ${opts.name} PRD |
| Version | 0.1.0 |
| Status | Draft |
| Author | [Your Name] |

---

## 2. Executive Summary

[Product name] is a [product type] that [solves a specific problem] for [target users].
`;

  writeFileSync(prdPath, template, 'utf-8');
  console.log(`Created PRD project: ${projectDir}`);
  console.log(`  Schema: ${opts.schema}`);
  console.log(`  PRD file: ${prdPath}`);
  console.log();
  console.log('Next: od prd generate --brief "your product brief"');
  process.exit(0);
}

// ── Generate ───────────────────────────────────────────────────

interface GenerateOptions {
  brief: string;
  schema?: string;
  agent?: string;
  dir?: string;
}

function generatePrd(opts: GenerateOptions): never {
  console.log('PRD generation is handled by the daemon via the chat API.');
  console.log('The CLI sends the brief to the daemon, which:');
  console.log('  1. Composes the 7-layer system prompt');
  console.log('  2. Spawns the agent (Claude Code, Codex, etc.)');
  console.log('  3. Streams the PRD back as SSE events');
  console.log();
  console.log(`Brief: ${opts.brief}`);
  console.log(`Schema: ${opts.schema ?? 'standard'}`);
  console.log(`Agent: ${opts.agent ?? 'auto-detected'}`);
  console.log();
  console.log('In production, this would POST to the daemon and stream the response.');
  process.exit(0);
}

// ── Lint ───────────────────────────────────────────────────────

interface LintOptions {
  file: string;
  json?: boolean;
}

function lintPrdFile(opts: LintOptions): never {
  if (!existsSync(opts.file)) {
    console.error(`Error: File not found: ${opts.file}`);
    process.exit(1);
  }

  const content = readFileSync(opts.file, 'utf-8');
  const findings = lintPrd(content);

  if (opts.json) {
    console.log(JSON.stringify(findings, null, 2));
  } else {
    if (findings.length === 0) {
      console.log('No quality issues found. PRD looks good!');
    } else {
      const p0 = findings.filter((f) => f.severity === 'P0').length;
      const p1 = findings.filter((f) => f.severity === 'P1').length;
      const p2 = findings.filter((f) => f.severity === 'P2').length;
      console.log(`Found ${findings.length} issues: ${p0} P0, ${p1} P1, ${p2} P2\n`);
      console.log(renderFindingsForAgent(findings));
    }
  }
  process.exit(0);
}

// ── Export ─────────────────────────────────────────────────────

interface ExportOptions {
  file: string;
  format: ExportFormat;
  dir?: string;
}

function exportPrd(opts: ExportOptions): never {
  if (!existsSync(opts.file)) {
    console.error(`Error: File not found: ${opts.file}`);
    process.exit(1);
  }

  const projectDir = opts.dir ?? process.cwd();
  const job = startExportJob(projectDir, opts.file, opts.format);

  console.log(`Export job started: ${job.jobId}`);
  console.log(`  Source: ${opts.file}`);
  console.log(`  Format: ${opts.format}`);
  console.log(`  Status: ${job.status}`);

  if (job.status === 'completed') {
    console.log(`  Output: ${job.outputPath}`);
    console.log();
    console.log('Export completed successfully.');
  } else if (job.status === 'failed') {
    console.error(`  Error: ${job.error}`);
    process.exit(1);
  }
  process.exit(0);
}

// ── Main entry point ───────────────────────────────────────────

export function runPrdCli(args: string[]): void {
  const subcommand = args[0];

  switch (subcommand) {
    case 'help':
    case '--help':
    case '-h':
      console.log(HELP);
      process.exit(0);

    case 'schemas':
      listSchemas();

    case 'rules':
      listRules();

    case 'new': {
      const nameIdx = args.indexOf('--name');
      if (nameIdx < 0) {
        console.error('Error: --name is required');
        console.log('Usage: od prd new --name "Product Name" [--schema standard] [--dir ./path]');
        process.exit(1);
      }
      const schemaIdx = args.indexOf('--schema');
      createProject({
        name: args[nameIdx + 1] ?? 'Untitled',
        schema: schemaIdx >= 0 ? (args[schemaIdx + 1] ?? 'standard') : 'standard',
        dir: undefined,
      });
    }

    case 'generate': {
      const briefIdx = args.indexOf('--brief');
      if (briefIdx < 0) {
        console.error('Error: --brief is required');
        console.log('Usage: od prd generate --brief "your product brief" [--schema standard] [--agent claude]');
        process.exit(1);
      }
      const schemaIdx = args.indexOf('--schema');
      const agentIdx = args.indexOf('--agent');
      generatePrd({
        brief: args[briefIdx + 1] ?? '',
        schema: schemaIdx >= 0 ? (args[schemaIdx + 1] ?? 'standard') : 'standard',
        agent: agentIdx >= 0 ? args[agentIdx + 1] : undefined,
      });
    }

    case 'lint': {
      const fileIdx = args.indexOf('--file');
      const jsonFlag = args.includes('--json');
      const file = fileIdx >= 0 ? args[fileIdx + 1] : args[1];
      if (!file) {
        console.error('Error: file path is required');
        console.log('Usage: od prd lint <file> [--json]');
        process.exit(1);
      }
      lintPrdFile({ file, json: jsonFlag });
    }

    case 'export': {
      const fileIdx = args.indexOf('--file');
      const formatIdx = args.indexOf('--format');
      const file = fileIdx >= 0 ? args[fileIdx + 1] : args[1];
      const format = (formatIdx >= 0 ? args[formatIdx + 1] : 'pdf') as ExportFormat;
      if (!file) {
        console.error('Error: file path is required');
        console.log('Usage: od prd export <file> --format pdf|docx|html');
        process.exit(1);
      }
      if (!['pdf', 'docx', 'html'].includes(format)) {
        console.error(`Error: Invalid format "${format}". Use pdf, docx, or html.`);
        process.exit(1);
      }
      exportPrd({ file, format });
    }

    default:
      console.error(`Unknown subcommand: ${subcommand}`);
      console.log(HELP);
      process.exit(1);
  }
}

// Allow running directly for testing
if (process.argv[1]?.endsWith('prd-cli.js') || process.argv[1]?.endsWith('prd-cli.ts')) {
  runPrdCli(process.argv.slice(2));
}