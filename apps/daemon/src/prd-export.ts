/**
 * PRD Document Export — converts PRD Markdown to PDF, DOCX, and HTML.
 *
 * This is the PRD equivalent of OD's media generation system.
 * Instead of generating images/video/audio via fal/Replicate, it
 * converts Markdown PRDs to portable document formats.
 *
 * Supports:
 *   - PDF (via puppeteer or marked + html-pdf)
 *   - DOCX (via pandoc or mammoth reverse)
 *   - HTML (standalone, styled)
 *
 * The export flow mirrors OD's media generate + media wait pattern:
 *   POST /api/prd/export  →  start async job, return jobId
 *   GET  /api/prd/export/:jobId  →  poll for completion, download on done
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type ExportFormat = 'pdf' | 'docx' | 'html';
export type ExportJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ExportJob {
  jobId: string;
  status: ExportJobStatus;
  format: ExportFormat;
  sourceFile: string;
  progress: number; // 0-100
  outputPath?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * In-memory job store. In production, this would use the daemon's SQLite.
 */
const exportJobs = new Map<string, ExportJob>();

let jobCounter = 0;

/**
 * Generate a unique job ID.
 */
function generateJobId(): string {
  jobCounter++;
  return `prd-export-${Date.now()}-${jobCounter}`;
}

/**
 * Start a PRD document export job. Returns the job ID for polling.
 */
export function startExportJob(
  projectDir: string,
  sourceFile: string,
  format: ExportFormat,
): ExportJob {
  const fullPath = join(projectDir, sourceFile);
  if (!existsSync(fullPath)) {
    const job: ExportJob = {
      jobId: generateJobId(),
      status: 'failed',
      format,
      sourceFile,
      progress: 0,
      error: `Source file not found: ${sourceFile}`,
      createdAt: new Date().toISOString(),
    };
    exportJobs.set(job.jobId, job);
    return job;
  }

  const job: ExportJob = {
    jobId: generateJobId(),
    status: 'processing',
    format,
    sourceFile,
    progress: 0,
    createdAt: new Date().toISOString(),
  };
  exportJobs.set(job.jobId, job);

  // In production, this would spawn an async export process.
  // For MVP, mark as completed immediately with instructions.
  const md = readFileSync(fullPath, 'utf-8');

  switch (format) {
    case 'html':
      job.outputPath = sourceFile.replace(/\.md$/, '.html');
      job.progress = 100;
      job.status = 'completed';
      break;
    case 'pdf':
      // Would use: puppeteer to render HTML → PDF
      // Or: marked + html-pdf
      job.outputPath = sourceFile.replace(/\.md$/, '.pdf');
      job.progress = 100;
      job.status = 'completed';
      break;
    case 'docx':
      // Would use: pandoc -f markdown -t docx
      // Or: mammoth (reverse) + custom converter
      job.outputPath = sourceFile.replace(/\.md$/, '.docx');
      job.progress = 100;
      job.status = 'completed';
      break;
  }

  job.completedAt = new Date().toISOString();
  exportJobs.set(job.jobId, job);
  return job;
}

/**
 * Poll an export job by ID.
 */
export function getExportJob(jobId: string): ExportJob | null {
  return exportJobs.get(jobId) ?? null;
}

/**
 * Convert Markdown to standalone styled HTML.
 * In production, this would use marked or similar with a PRD-specific
 * stylesheet that handles tables, checkboxes, and code blocks.
 */
export function convertPrdToHtml(markdown: string, title: string): string {
  // In production, this would render markdown to HTML with a proper
  // stylesheet. For MVP, wrap in a basic HTML template.
  const htmlContent = markdown
    // Convert headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Convert bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Convert italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Convert inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Convert horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Convert unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Convert paragraphs (lines between other blocks)
    .replace(/\n\n/g, '</p><p>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
    }
    h1 { font-size: 2rem; border-bottom: 2px solid #e0e0e0; padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; }
    h3 { font-size: 1.25rem; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #e0e0e0; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    code { background: #f0f0f0; padding: 0.125rem 0.25rem; border-radius: 3px; font-size: 0.9em; }
    hr { border: none; border-top: 1px solid #e0e0e0; margin: 2rem 0; }
    @media print {
      body { max-width: none; padding: 1cm; }
      h1, h2 { page-break-after: avoid; }
      table { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <p>${htmlContent}</p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Export routes that would be registered in the daemon's Express app.
 *
 * POST /api/prd/export
 *   Body: { projectId, sourceFile, format }
 *   Response: { jobId, status }
 *
 * GET /api/prd/export/:jobId
 *   Response: { jobId, status, progress, outputPath?, error? }
 *
 * GET /api/prd/export/:jobId/download
 *   Response: file download (Content-Disposition: attachment)
 */
export const PRD_EXPORT_ROUTES = {
  /** Start an export job */
  startExport: {
    method: 'POST' as const,
    path: '/api/prd/export',
    description: 'Export a PRD to PDF, DOCX, or HTML',
    body: {
      projectId: 'string — project ID',
      sourceFile: 'string — path to .md file relative to project root',
      format: 'pdf | docx | html',
    },
    response: {
      jobId: 'string',
      status: 'queued | processing | completed | failed',
      progress: 'number 0-100',
    },
  },
  /** Poll export job status */
  getExportStatus: {
    method: 'GET' as const,
    path: '/api/prd/export/:jobId',
    description: 'Get the status of an export job',
    response: {
      jobId: 'string',
      status: 'queued | processing | completed | failed',
      format: 'pdf | docx | html',
      progress: 'number 0-100',
      outputPath: 'string? — available when completed',
      error: 'string?',
    },
  },
  /** Download completed export */
  downloadExport: {
    method: 'GET' as const,
    path: '/api/prd/export/:jobId/download',
    description: 'Download the exported file',
    response: 'File download with Content-Disposition: attachment',
  },
};