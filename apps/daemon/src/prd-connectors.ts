/**
 * PRD Connector adapter — maps external services to PRD use cases.
 *
 * This is the PRD equivalent of the connector service in OD's
 * apps/daemon/src/connectors/service.ts. It defines which external
 * services are relevant for PRD generation and how they map to
 * agent tool calls.
 *
 * Key PRD connectors:
 *   - GitHub: Read existing codebase, analyze architecture
 *   - Jira: Read existing issues/epics as requirements input
 *   - Notion: Read product specs, meeting notes, user research
 *   - Slack: Read product discussions, user feedback channels
 *   - Linear: Read existing tasks, understand project context
 */

export interface PrdConnector {
  /** Connector ID */
  id: string;
  /** Display name */
  name: string;
  /** Description of PRD use case */
  prdUseCase: string;
  /** Whether this connector is commonly used for PRDs */
  recommended: boolean;
  /** Tool descriptions for the agent */
  tools: PrdConnectorTool[];
}

export interface PrdConnectorTool {
  /** Tool name */
  name: string;
  /** Description for the agent */
  description: string;
  /** Example usage in a PRD context */
  example: string;
}

/**
 * PRD connector definitions.
 */
export const PRD_CONNECTORS: PrdConnector[] = [
  {
    id: 'github',
    name: 'GitHub',
    prdUseCase: 'Read existing codebase to understand architecture, interfaces, and constraints',
    recommended: true,
    tools: [
      {
        name: 'read_file',
        description: 'Read a file from the repository to understand existing code',
        example: 'Read the API route definitions to understand existing endpoints',
      },
      {
        name: 'search_code',
        description: 'Search the codebase for patterns, interfaces, or dependencies',
        example: 'Search for "interface User" to find the user data model',
      },
      {
        name: 'list_directory',
        description: 'List files in a directory to understand project structure',
        example: 'List the src/ directory to understand the module organization',
      },
    ],
  },
  {
    id: 'jira',
    name: 'Jira',
    prdUseCase: 'Read existing issues and epics as requirements input for the PRD',
    recommended: true,
    tools: [
      {
        name: 'search_issues',
        description: 'Search for existing issues related to the product area',
        example: 'Search for "payment" issues to understand existing requirements',
      },
      {
        name: 'get_issue',
        description: 'Read a specific issue to understand its requirements',
        example: 'Read PROJ-123 to understand the auth migration epic',
      },
    ],
  },
  {
    id: 'notion',
    name: 'Notion',
    prdUseCase: 'Read product specs, meeting notes, user research, and design docs',
    recommended: true,
    tools: [
      {
        name: 'search_pages',
        description: 'Search Notion for relevant product documentation',
        example: 'Search for "user research" to find interview notes',
      },
      {
        name: 'read_page',
        description: 'Read a specific Notion page',
        example: 'Read the product strategy doc for business context',
      },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    prdUseCase: 'Read product discussions, user feedback, and team conversations',
    recommended: false,
    tools: [
      {
        name: 'search_messages',
        description: 'Search Slack for relevant discussions',
        example: 'Search for "user feedback" in the product channel',
      },
    ],
  },
  {
    id: 'linear',
    name: 'Linear',
    prdUseCase: 'Read existing tasks and projects to understand current work context',
    recommended: false,
    tools: [
      {
        name: 'search_issues',
        description: 'Search Linear for related tasks',
        example: 'Search for "onboarding" tasks to understand what\'s already planned',
      },
    ],
  },
];

/**
 * Get the recommended connectors for PRD use.
 */
export function getRecommendedPrdConnectors(): PrdConnector[] {
  return PRD_CONNECTORS.filter((c) => c.recommended);
}

/**
 * Get a connector by ID.
 */
export function getPrdConnector(id: string): PrdConnector | undefined {
  return PRD_CONNECTORS.find((c) => c.id === id);
}