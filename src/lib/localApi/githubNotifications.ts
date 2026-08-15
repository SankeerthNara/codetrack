import { getGitHubToken } from './githubToken';

export interface GitHubNotificationItem {
  id: string;
  unread: boolean;
  reason: string;
  updatedAt: string;
  title: string;
  type: string;
  repoFullName: string;
  repoUrl: string;
  url: string;
}

export class GitHubNotificationsAuthError extends Error {}

function subjectWebUrl(subject: { url?: string; type?: string }, repoHtmlUrl: string): string {
  if (!subject.url) return repoHtmlUrl;
  // The API gives an api.github.com URL (e.g. .../repos/o/r/issues/12). GitHub's
  // web issue URL redirects to /pull/N automatically when it's actually a PR,
  // so this simple swap covers Issue, PullRequest, and Discussion correctly.
  const asWebUrl = subject.url.replace('https://api.github.com/repos/', 'https://github.com/');

  if (subject.type === 'Commit') {
    return asWebUrl.replace('/commits/', '/commit/');
  }
  if (subject.type === 'Issue' || subject.type === 'PullRequest' || subject.type === 'Discussion') {
    return asWebUrl;
  }
  // Releases and anything else (CheckSuite, etc.) don't map cleanly from the
  // API url to a web url — send those to the repo instead of a broken link.
  return repoHtmlUrl;
}

/**
 * `all=false` (the default) mirrors github.com/notifications' default
 * "Unread" view; pass `all=true` for the "All" view.
 */
export async function fetchGitHubNotifications(all: boolean): Promise<GitHubNotificationItem[]> {
  const token = getGitHubToken();
  if (!token) {
    throw new GitHubNotificationsAuthError('No GitHub token configured');
  }

  const response = await fetch(
    `https://api.github.com/notifications?all=${all}&per_page=50`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new GitHubNotificationsAuthError('GitHub token is invalid or missing the notifications scope');
  }
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data.map(
    (n: {
      id: string;
      unread: boolean;
      reason: string;
      updated_at: string;
      subject: { title: string; url?: string; type: string };
      repository: { full_name: string; html_url: string };
    }) => ({
      id: n.id,
      unread: n.unread,
      reason: n.reason,
      updatedAt: n.updated_at,
      title: n.subject.title,
      type: n.subject.type,
      repoFullName: n.repository.full_name,
      repoUrl: n.repository.html_url,
      url: subjectWebUrl(n.subject, n.repository.html_url),
    })
  );
}

export async function markAllGitHubNotificationsRead(): Promise<void> {
  const token = getGitHubToken();
  if (!token) {
    throw new GitHubNotificationsAuthError('No GitHub token configured');
  }

  const response = await fetch('https://api.github.com/notifications', {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new GitHubNotificationsAuthError('GitHub token is invalid or missing the notifications scope');
  }
  if (!response.ok && response.status !== 205) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
}

export async function markGitHubNotificationRead(threadId: string): Promise<void> {
  const token = getGitHubToken();
  if (!token) {
    throw new GitHubNotificationsAuthError('No GitHub token configured');
  }

  const response = await fetch(`https://api.github.com/notifications/threads/${threadId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new GitHubNotificationsAuthError('GitHub token is invalid or missing the notifications scope');
  }
  if (!response.ok && response.status !== 205) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
}
