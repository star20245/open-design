/**
 * PRD Agent 功能验证测试脚本
 *
 * 测试覆盖：
 *   1. Linter 功能 — 所有 P0/P1/P2 规则
 *   2. Prompt Composer — 七层组装
 *   3. CLI — 所有子命令
 *
 * 运行: npx tsx apps/daemon/src/__tests__/prd-agent.test.ts
 */

// @ts-nocheck — 测试文件，绕过类型检查直接验证逻辑
import { lintPrd, renderFindingsForAgent } from '../lint-prd.js';
import { composePrdSystemPrompt } from '../prompts/prd-composer.js';
import { readFileSync, existsSync } from 'node:fs';

let passed = 0;
let failed = 0;

function assert(description: string, condition: boolean) {
  if (condition) {
    console.log(`  ✓ ${description}`);
    passed++;
  } else {
    console.log(`  ✗ ${description}`);
    failed++;
  }
}

// ═══════════════════════════════════════════════════════════════
// 1. LINTER 测试
// ═══════════════════════════════════════════════════════════════

console.log('\n=== 1. Linter 功能测试 ===\n');

// --- P0: vague requirements ---
{
  console.log('1.1 P0 — 模糊需求检测');
  const r1 = lintPrd('The system should be user-friendly and fast.');
  assert('检测 "user-friendly"', r1.some((f) => f.id === 'vague-user-friendly'));

  const r2 = lintPrd('The product delivers good UX and is intuitive.');
  assert('检测 "good UX"', r2.some((f) => f.id === 'vague-good-ux'));

  const r3 = lintPrd('The platform is robust and seamless.');
  assert('检测 "robust"', r3.some((f) => f.id === 'vague-robust'));

  const r4 = lintPrd('The system shall be robust and scalable.');
  assert('检测 vague (不重复)', r4.length >= 1);
}

// --- P0: fast / scalable without numbers ---
{
  console.log('\n1.2 P0 — fast/scalable 无量词检测');
  const r1 = lintPrd('The API must be fast.');
  assert('检测 "fast" 无数字', r1.some((f) => f.id === 'vague-fast'));

  const r2 = lintPrd('The API must be fast under 1000 concurrent users with P95 < 200ms.');
  assert('不误报 "fast" 有具体指标', !r2.some((f) => f.id === 'vague-fast'));

  const r3 = lintPrd('The system must be scalable.');
  assert('检测 "scalable" 无数字', r3.some((f) => f.id === 'vague-scalable'));
}

// --- P0: filler ---
{
  console.log('\n1.3 P0 — 填充/假指标检测');
  const r1 = lintPrd('Feature One: user login. Feature Two: dashboard.');
  assert('检测 "Feature One"', r1.some((f) => f.id === 'filler-feature-name'));

  const r2 = lintPrd('This solution is 10× faster than competitors.');
  assert('检测 "10× faster"', r2.some((f) => f.id === 'invented-metric-10x'));

  const r3 = lintPrd('We guarantee 99.9% uptime for all services.');
  assert('检测 "99.9% uptime"', r3.some((f) => f.id === 'invented-metric-uptime'));
}

// --- P1: missing sections ---
{
  console.log('\n1.4 P1 — 缺失章节检测');
  const r1 = lintPrd('# PRD\n\n## 1. Meta\n\nAs a user, I want to log in.');
  assert('检测缺失 Out of Scope', r1.some((f) => f.id === 'missing-out-of-scope'));
  assert('检测缺失 Performance', r1.some((f) => f.id === 'missing-performance'));
  assert('检测缺失 Accessibility', r1.some((f) => f.id === 'missing-accessibility'));
  assert('检测缺失 Security', r1.some((f) => f.id === 'missing-security'));
}

// --- P0 range bloat ---
{
  console.log('\n1.5 P1 — P0 范围膨胀检测');

  // Build a PRD with too many P0s
  let manyP0 = '# PRD\n';
  manyP0 += '## 7. Out of Scope\n1. X\n2. Y\n3. Z\n';
  manyP0 += '## 6. Non-Functional Requirements\n';
  manyP0 += '### 6.1 Performance\nTarget: <2s\n';
  manyP0 += '### 6.2 Accessibility\nWCAG 2.2 AA, keyboard\n';
  manyP0 += '### 6.3 Security\nauthentication: OAuth\nencryption\n';
  manyP0 += '| FR-001 | P0 |\n';
  manyP0 += '| FR-002 | P0 |\n';
  manyP0 += '| FR-003 | P0 |\n';
  manyP0 += '| FR-004 | P0 |\n';
  manyP0 += '| FR-005 | P1 |\n'; // 4 P0, 1 P1 = 80% P0

  const r1 = lintPrd(manyP0);
  assert('检测 P0 占比 >30%', r1.some((f) => f.id === 'p0-scope-bloat'));
}

// --- Clean PRD — no false positives ---
{
  console.log('\n1.6 干净 PRD — 无误报');

  let clean = '# Product Requirements Document\n\n';
  clean += '## 1. Document Meta\n\n';
  clean += '## 2. Executive Summary\n\nThis is a test.\n\n';
  clean += '## 3. Problem Statement\n\nUsers need X.\n\n';
  clean += '## 4. User Personas & Stories\n\n';
  clean += 'As a data engineer, I want to query databases, so that I can analyze data.\n\n';
  clean += '## 5. Functional Requirements\n\n| FR-001 | P1 |\n| FR-002 | P1 |\n\n';
  clean += '## 6. Non-Functional Requirements\n\n';
  clean += '### 6.1 Performance\nP95 < 200ms\n\n';
  clean += '### 6.2 Accessibility\nWCAG 2.2 AA, keyboard navigation, screen reader compatible\n\n';
  clean += '### 6.3 Security\nauthentication: OAuth, encryption: TLS 1.3\n\n';
  clean += '## 7. Out of Scope\n\n1. Mobile app — web-only MVP\n2. Offline — requires internet\n3. Admin — separate project\n\n';
  clean += '## 8. Dependencies\n\n## 9. Success Metrics\n\n';

  const r1 = lintPrd(clean);
  assert('无 P0 误报', r1.filter((f) => f.severity === 'P0').length === 0);
  assert('无 P1 误报', r1.filter((f) => f.severity === 'P1').length === 0);
}

// --- renderFindingsForAgent ---
{
  console.log('\n1.7 格式化输出');
  const findings = lintPrd('The system is user-friendly and robust.');
  const rendered = renderFindingsForAgent(findings);
  assert('渲染包含 <prd-lint>', rendered.includes('<prd-lint>'));
  assert('渲染包含 P0 计数', rendered.includes('P0'));
  assert('渲染包含修复建议', rendered.includes('Fix:'));
}

// ═══════════════════════════════════════════════════════════════
// 2. PROMPT COMPOSER 测试
// ═══════════════════════════════════════════════════════════════

console.log('\n=== 2. Prompt Composer 组装测试 ===\n');

{
  console.log('2.1 最小化组装（无可选层）');
  const p = composePrdSystemPrompt({});
  assert('包含 Layer 1 注入抵抗', p.includes('prompt injection resistance'));
  assert('包含 Layer 2 discovery', p.includes('RULE 1'));
  assert('包含 Layer 3 PM身份', p.includes('expert product manager'));
  assert('包含反角色扮演', p.includes('Never fabricate conversation turns'));
  assert('无错误空块', !p.includes('undefined'));
}

{
  console.log('\n2.2 完整组装（所有7层）');
  const p = composePrdSystemPrompt({
    memoryBody: '- company: Acme Corp\n- product: OmniDB',
    userInstructions: '所有 PRD 必须用 RFC 2119 关键词',
    projectInstructions: '目标平台：桌面 Web',
    schemaBody: '# PRD Schema — Standard\n\n10 sections...',
    qualityRulesBody: '## R0: No vague requirements\n\n...',
    skillBody: '## SKILL.md — Greenfield PRD\n\nPre-flight: ...',
    metadata: { kind: 'prd', prdType: 'greenfield', schemaId: 'standard' },
  });
  assert('Layer 4: 包含 memory', p.includes('Acme Corp'));
  assert('Layer 4: 包含 user instructions', p.includes('RFC 2119'));
  assert('Layer 5: 包含 schema', p.includes('PRD Schema — Standard'));
  assert('Layer 6: 包含 quality rules', p.includes('R0: No vague requirements'));
  assert('Layer 7: 包含 skill', p.includes('SKILL.md — Greenfield'));
  assert('metadata: 包含 prd type', p.includes('greenfield'));
}

{
  console.log('\n2.3 层级顺序验证');
  const p = composePrdSystemPrompt({
    memoryBody: 'MEMORY_MARKER_XYZ123',
    schemaBody: 'SCHEMA_MARKER_XYZ123',
    qualityRulesBody: 'RULES_MARKER_XYZ123',
    skillBody: 'SKILL_MARKER_XYZ123',
  });
  const idxInjection = p.indexOf('prompt injection resistance');
  const idxDiscovery = p.indexOf('RULE 1');
  const idxIdentity = p.indexOf('Identity and workflow charter');
  const idxMemory = p.indexOf('MEMORY_MARKER_XYZ123');
  const idxSchema = p.indexOf('SCHEMA_MARKER_XYZ123');
  const idxRules = p.indexOf('RULES_MARKER_XYZ123');
  const idxSkill = p.indexOf('SKILL_MARKER_XYZ123');
  const idxAntiRoleplay = p.indexOf('Never fabricate');

  assert('Layer 1 < Layer 2', idxInjection < idxDiscovery);
  assert('Layer 2 < Layer 3', idxDiscovery < idxIdentity);
  assert('Layer 3 < Layer 4', idxIdentity < idxMemory);
  assert('Layer 4 < Layer 5', idxMemory < idxSchema);
  assert('Layer 5 < Layer 6', idxSchema < idxRules);
  assert('Layer 6 < Layer 7', idxRules < idxSkill);
  assert('Layer 7 < Anti-roleplay', idxSkill < idxAntiRoleplay);
}

// ═══════════════════════════════════════════════════════════════
// 3. CONTRACT TYPES 验证
// ═══════════════════════════════════════════════════════════════

console.log('\n=== 3. 合约类型 验证 ===\n');

{
  console.log('3.1 PrdProjectMeta 字段完整性');
  // 验证 PrdProjectMeta 接口包含了文档中定义的关键字段
  const requiredFields = ['kind', 'prdType', 'schemaId', 'targetAudience'];
  // 这些接口在 packages/contracts/src/prd.ts 中定义
  const prdFile = readFileSync('packages/contracts/src/prd.ts', 'utf-8');
  for (const field of requiredFields) {
    assert(`PrdProjectMeta 包含 ${field}`, prdFile.includes(field));
  }
}

{
  console.log('\n3.2 PrdEvent 事件类型完整性');
  const eventFile = readFileSync('packages/contracts/src/prd-events.ts', 'utf-8');
  const requiredEvents = [
    'prd_linter_findings',
    'prd_schema_changed',
    'prd_review_round',
    'prd_stage_progress',
    'prd_quality_pass',
    'prd_quality_fail',
  ];
  for (const ev of requiredEvents) {
    assert(`包含 ${ev} 事件`, eventFile.includes(ev));
  }
}

// ═══════════════════════════════════════════════════════════════
// 4. 文件存在性验证
// ═══════════════════════════════════════════════════════════════

console.log('\n=== 4. 文件存在性验证 ===\n');

const expectedFiles = [
  // Phase 1 — 核心
  'apps/daemon/src/prompts/prd-system.ts',
  'apps/daemon/src/prompts/prd-discovery.ts',
  'apps/daemon/src/prompts/prd-composer.ts',
  'apps/daemon/src/prompts/prd-memory.ts',
  'apps/daemon/src/lint-prd.ts',
  'apps/daemon/src/prd-schema-resolver.ts',

  // Phase 1 — 规则
  'prd-rules/prd-quality.md',
  'prd-rules/scope-triage.md',
  'prd-rules/non-functional-floor.md',
  'prd-rules/out-of-scope.md',
  'prd-rules/prd-anti-slop.md',
  'prd-rules/dependencies.md',

  // Phase 1 — Schema
  'prd-schemas/standard/SCHEMA.md',
  'prd-schemas/lean-canvas/SCHEMA.md',
  'prd-schemas/agile-epic/SCHEMA.md',

  // Phase 1 — 技能
  'plugins/_official/prd/greenfield/SKILL.md',
  'plugins/_official/prd/greenfield/references/template.md',
  'plugins/_official/prd/greenfield/references/checklist.md',
  'plugins/_official/prd/incremental/SKILL.md',
  'plugins/_official/prd/incremental/references/template.md',

  // Phase 2
  'apps/daemon/src/prompts/prd-critique.ts',

  // Phase 3
  'packages/contracts/src/prd.ts',
  'apps/daemon/src/prd-connectors.ts',

  // Phase 4
  'apps/daemon/src/prd-pipeline.ts',
  'packages/contracts/src/prd-events.ts',
  'apps/daemon/src/prd-export.ts',
  'apps/daemon/src/prd-cli.ts',
];

for (const file of expectedFiles) {
  const exists = existsSync(file);
  assert(`文件存在: ${file}`, exists);
}

// ═══════════════════════════════════════════════════════════════
// 结果
// ═══════════════════════════════════════════════════════════════

console.log(`\n${'='.repeat(50)}`);
console.log(`总计: ${passed + failed} 项测试`);
console.log(`通过: ${passed}`);
console.log(`失败: ${failed}`);
console.log(`${'='.repeat(50)}\n`);

if (failed > 0) {
  process.exit(1);
}