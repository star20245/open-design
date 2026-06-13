/**
 * PRD Schema Resolver — discovers and resolves PRD schemas.
 *
 * This is the PRD equivalent of the design-system resolver in
 * apps/daemon/src/design-systems.ts. It scans the prd-schemas/
 * directory, parses SCHEMA.md files, and provides them to the
 * prompt composer.
 *
 * Each schema directory contains:
 *   - SCHEMA.md (required) — the 10-section schema definition
 *   - example.md (optional) — a worked example PRD
 */

import { PrdSchemaEntry } from '../../packages/contracts/src/prd.js';

/**
 * Discover all available PRD schemas from the filesystem.
 * Scans prd-schemas/ and plugins/_official/prd/ for schema directories.
 */
export function discoverPrdSchemas(): PrdSchemaEntry[] {
  // In production, this would scan the filesystem
  // For now, return the built-in schemas
  return [
    {
      id: 'standard',
      name: 'Standard PRD',
      description: 'Complete 10-section PRD — best for new products and major features',
      schemaPath: 'prd-schemas/standard/SCHEMA.md',
      version: '1.0.0',
    },
    {
      id: 'lean-canvas',
      name: 'Lean Canvas',
      description: 'One-page lean format — best for early-stage MVPs and rapid validation',
      schemaPath: 'prd-schemas/lean-canvas/SCHEMA.md',
      version: '1.0.0',
    },
    {
      id: 'agile-epic',
      name: 'Agile Epic',
      description: 'Lightweight epic format — best for incremental features in existing products',
      schemaPath: 'prd-schemas/agile-epic/SCHEMA.md',
      version: '1.0.0',
    },
  ];
}

/**
 * Resolve a PRD schema by ID. Returns the schema entry or null if not found.
 */
export function resolvePrdSchema(schemaId: string): PrdSchemaEntry | null {
  return discoverPrdSchemas().find((s) => s.id === schemaId) ?? null;
}

/**
 * Load the SCHEMA.md content for a given schema ID.
 * Returns the full markdown content or an empty string.
 */
export function loadPrdSchemaContent(schemaId: string): string {
  // In production, this would read the file from disk
  // For now, return empty — the resolver reads the file at call time
  return '';
}

/**
 * Load all PRD quality rules as a combined markdown string.
 * Reads prd-rules/*.md and concatenates them.
 */
export function loadPrdQualityRules(): string {
  // In production, this would read and concatenate all prd-rules/*.md files
  // For now, return empty — rules are loaded at compose time
  return '';
}

/**
 * Resolve the active PRD skill SKILL.md content.
 * Reads from plugins/_official/prd/{prdType}/SKILL.md.
 */
export function resolvePrdSkill(prdType: string): string {
  // In production, this would read the file from disk
  // For now, return empty — skill is loaded at compose time
  return '';
}