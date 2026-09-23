/**
 * Turning a report into a GitHub issue.
 *
 * No token, no server, no telemetry: the app builds the issue's title and body
 * and hands GitHub a pre-filled "new issue" form, which the reporter reads and
 * submits themselves under their own account. That keeps a bug report one
 * dialog away from wherever the bug happened, while leaving the person in
 * charge of what actually gets published — an offline-first app has no business
 * posting on its user's behalf.
 *
 * Framework-free on purpose, so both the validation and the exact text can be
 * tested without rendering anything.
 */

/** What kind of report this is. It steers the title prefix, nothing else. */
export enum ReportKind {
  Bug = 'bug',
  Idea = 'idea',
  Question = 'question',
}

export interface ReportInput {
  kind: ReportKind;
  /** Who is reporting. Required — an issue with no name has nobody to reply to. */
  name: string;
  /** What happened. Required. */
  message: string;
  /** Optional way to reach them, beyond the GitHub account that posts it. */
  contact?: string;
}

/** The runtime facts worth attaching to any report of a bug. */
export interface ReportContext {
  appVersion: string;
  /** 'Desktop' or 'Web' — which build this is. */
  build: string;
  /** Electron/Chromium/Node line, when the desktop preload exposes it. */
  runtime?: string | null;
  uiLang: string;
  userAgent?: string;
}

export const MAX_NAME = 60;
export const MAX_CONTACT = 120;
export const MAX_MESSAGE = 4000;
/** Short enough not to nag, long enough to rule out "it broke". */
export const MIN_MESSAGE = 15;
const MIN_NAME = 2;
/** Title length GitHub shows without truncating it in a list. */
const MAX_TITLE = 72;
/**
 * Body budget for the URL. GitHub's own limit is on the whole request line and
 * sits around 8 KB; percent-encoding a paragraph can triple its length, so the
 * body is trimmed well inside that and the full text stays available to copy.
 */
const MAX_URL_BODY = 2400;

const TITLE_PREFIX: Record<ReportKind, string> = {
  [ReportKind.Bug]: 'Bug',
  [ReportKind.Idea]: 'Idea',
  [ReportKind.Question]: 'Question',
};

export interface ReportValidity {
  name: boolean;
  message: boolean;
  /** Both required fields are filled in, so the report can be sent. */
  ready: boolean;
}

/** Which required fields are satisfied. Whitespace is not an answer. */
export function validateReport(input: ReportInput): ReportValidity {
  const name = input.name.trim().length >= MIN_NAME;
  const message = input.message.trim().length >= MIN_MESSAGE;
  return { name, message, ready: name && message };
}

/** One line, from the first sentence of the report. */
export function issueTitle(input: ReportInput): string {
  const first = input.message.trim().split(/\r?\n/)[0]?.trim() ?? '';
  const prefix = `[${TITLE_PREFIX[input.kind]}] `;
  const room = MAX_TITLE - prefix.length;
  const summary =
    first.length > room ? `${first.slice(0, room - 1).trimEnd()}…` : first || 'Report';
  return prefix + summary;
}

/**
 * The issue body, as markdown.
 *
 * The reporter's own words come first and are quoted verbatim — a maintainer
 * reads the report, not the diagnostics — with the version and build under it,
 * which is the pair that settles most "cannot reproduce" threads.
 */
export function issueBody(input: ReportInput, ctx: ReportContext): string {
  const lines = [
    input.message.trim().slice(0, MAX_MESSAGE),
    '',
    '---',
    '',
    `- **Reported by:** ${input.name.trim().slice(0, MAX_NAME)}`,
  ];
  const contact = input.contact?.trim().slice(0, MAX_CONTACT);
  if (contact) lines.push(`- **Contact:** ${contact}`);
  lines.push(`- **Version:** ${ctx.appVersion} (${ctx.build})`);
  lines.push(`- **Interface language:** ${ctx.uiLang}`);
  if (ctx.runtime) lines.push(`- **Runtime:** ${ctx.runtime}`);
  if (ctx.userAgent) lines.push(`- **User agent:** ${ctx.userAgent}`);
  return lines.join('\n');
}

/** Trailing marker for a body that had to be cut down to fit the URL. */
const TRUNCATED = '\n\n_(trimmed — the full report was copied to the clipboard)_';

/**
 * The pre-filled "new issue" URL for `repoUrl`, which may be given with or
 * without a trailing slash or `.git`.
 */
export function issueUrl(repoUrl: string, input: ReportInput, ctx: ReportContext): string {
  const repo = repoUrl.replace(/\.git$/, '').replace(/\/+$/, '');
  const full = issueBody(input, ctx);
  const body =
    full.length > MAX_URL_BODY
      ? full.slice(0, MAX_URL_BODY - TRUNCATED.length).trimEnd() + TRUNCATED
      : full;
  const params = new URLSearchParams({ title: issueTitle(input), body });
  return `${repo}/issues/new?${params.toString()}`;
}

/** True when the URL had to drop part of the report to stay inside the limit. */
export function isTrimmed(input: ReportInput, ctx: ReportContext): boolean {
  return issueBody(input, ctx).length > MAX_URL_BODY;
}
