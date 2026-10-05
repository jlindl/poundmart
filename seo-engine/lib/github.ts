/**
 * Opens a GitHub issue for failures. In Actions, GITHUB_TOKEN and
 * GITHUB_REPOSITORY are provided automatically; locally the issue is printed
 * instead.
 */
import { config } from "../config";

const API = "https://api.github.com";

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

/**
 * Opens an issue labelled `config.issues.label`. With `dedupe`, does nothing
 * if an open issue with the same title already exists (for conditions that
 * repeat every day until someone acts, like running out of topics).
 */
export async function openIssue(title: string, body: string, opts: { dedupe?: boolean } = {}): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) {
    console.warn(`[issue] GITHUB_TOKEN/GITHUB_REPOSITORY not set, so no issue was opened.\n  ${title}\n${body}`);
    return null;
  }

  if (opts.dedupe) {
    const res = await fetch(`${API}/repos/${repo}/issues?state=open&labels=${encodeURIComponent(config.issues.label)}&per_page=100`, {
      headers: headers(token),
    });
    if (res.ok) {
      const open = (await res.json()) as { title: string; html_url: string }[];
      const hit = open.find((i) => i.title === title);
      if (hit) {
        console.log(`[issue] already open: ${hit.html_url}`);
        return hit.html_url;
      }
    }
  }

  const res = await fetch(`${API}/repos/${repo}/issues`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ title, body, labels: [config.issues.label] }),
  });
  if (!res.ok) {
    console.warn(`[issue] GitHub returned ${res.status}: ${await res.text()}`);
    return null;
  }
  const json = (await res.json()) as { html_url: string };
  console.log(`[issue] opened ${json.html_url}`);
  return json.html_url;
}
