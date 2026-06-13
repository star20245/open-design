/**
 * PRD Memory extraction module.
 *
 * This is the PRD equivalent of the memory extraction logic in OD.
 * Instead of extracting design preferences (colors, fonts, styles),
 * it extracts product context (company, product, tech stack, compliance).
 *
 * The extraction prompt is passed to the agent so it can auto-extract
 * relevant facts from PRD conversations and store them for future use.
 */

/**
 * The prompt used to extract PRD-related memory from conversations.
 * This is injected into the system prompt when memory extraction is active.
 */
export const PRD_MEMORY_EXTRACTION_PROMPT = `
## Memory Extraction

From the user's conversations, extract and remember these facts.
They are injected into future PRD prompts as context.

### What to extract

1. **Company context**:
   - Company name, size, industry
   - Regulatory requirements (GDPR, SOC 2, HIPAA, etc.)
   - Target markets and geographies

2. **Product context**:
   - Product name and type
   - Target users (roles, tech levels)
   - Competitors and reference products
   - Current product stage (pre-launch, launched, mature)

3. **Technical context**:
   - Technology stack (frontend, backend, database, infrastructure)
   - Platform targets (web, iOS, Android, desktop)
   - Performance and scale requirements
   - Existing architecture constraints

4. **User preferences**:
   - Document format preferences (sections, detail level)
   - PRD audience preferences (engineering, exec, design)
   - Priority conventions (what they consider P0 vs P1)

### Format

Store as Markdown facts in a memory file. One fact per line, key: value format:

\`\`\`markdown
## Company context
- name: Acme Corp
- size: 200 employees
- industry: B2B SaaS
- compliance: SOC 2 Type II, GDPR

## Product context
- name: OmniDB
- type: Database query tool
- users: Data engineers, analysts
- stage: MVP
- competitors: DBeaver, DataGrip

## Technical context
- stack: React + Node.js + PostgreSQL
- platforms: Web, Desktop
- scale: <1000 users initially

## User preferences
- audience: Engineering team
- detail: High — include API specs
- priorities: P0 = blocking, P1 = core MVP
\`\`\`
`;

/**
 * Read the memory file from the project directory and return its content.
 * If no memory file exists, returns an empty string.
 */
export function loadPrdMemory(projectDir: string): string {
  // In production, this would read from .od/memory/MEMORY.md
  // For now, return empty — the memory module is a Phase 2 feature
  return '';
}

/**
 * Extract PRD memory from a conversation and write it to the memory file.
 * This is called after each PRD artifact is saved.
 */
export function extractPrdMemory(conversation: string): string {
  // In production, this would call the LLM to extract facts
  // For now, return empty — the memory module is a Phase 2 feature
  return '';
}