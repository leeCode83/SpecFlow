import { supabase } from "@/lib/supabase/supabase";
import type {
  GithubRepoData,
  GithubContentItem,
  GithubFileContent,
  GithubPRResult,
} from "@/lib/types";

async function getGithubToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.provider_token) return data.session?.provider_token;

  const stored = sessionStorage.getItem("github_oauth_token");
  if (stored) return stored;

  return null;
}

export async function connectGithub(): Promise<void> {
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "github",
    options: {
      skipBrowserRedirect: true,
      redirectTo: window.location.origin,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error("Failed to get authorization URL");

  const popup = window.open(data.url, "github-connect", "width=500,height=700");
  if (!popup) throw new Error("Popup blocked. Please allow popups for this site.");
  const safePopup = popup;

  const startTime = Date.now();
  let resolved = false;

  return new Promise((resolve, reject) => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== "github-oauth-complete") return;
      window.removeEventListener("message", handleMessage);
      checkSession();
    }

    async function checkSession() {
      if (resolved) return;

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.provider_token) {
        resolved = true;
        window.removeEventListener("message", handleMessage);
        sessionStorage.setItem("github_oauth_token", sessionData.session.provider_token);
        safePopup.close();
        resolve();
        return;
      }

      if (Date.now() - startTime > 120000) {
        resolved = true;
        window.removeEventListener("message", handleMessage);
        safePopup.close();
        reject(new Error("Authorization timed out after 2 minutes"));
        return;
      }

      if (safePopup.closed) {
        if (Date.now() - startTime > 10000) {
          resolved = true;
          window.removeEventListener("message", handleMessage);
          reject(new Error("Popup was closed before authorization completed"));
          return;
        }
      }

      setTimeout(checkSession, 500);
    }

    window.addEventListener("message", handleMessage);
    setTimeout(checkSession, 500);
  });
}

export async function syncRepo(
  projectId: string,
  fullName: string
): Promise<GithubRepoData> {
  const token = await getGithubToken();
  if (!token) throw new Error("GitHub token not available. Please connect GitHub.");

  const res = await fetch("/api/github/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      "X-Github-Token": token,
    },
    body: JSON.stringify({ projectId, fullName }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Sync failed" }));
    throw new Error(err.error || "Failed to sync repository");
  }

  return res.json();
}

export async function getRepoStatus(
  projectId: string
): Promise<GithubRepoData | null> {
  const token = await getGithubToken();
  if (!token) return null;

  const res = await fetch(`/api/github/repo-status?projectId=${projectId}`, {
    headers: {
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      "X-Github-Token": token,
    },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function getRepoContents(
  fullName: string,
  path: string = ""
): Promise<GithubContentItem[]> {
  const token = await getGithubToken();
  if (!token) throw new Error("GitHub token not available");

  const params = new URLSearchParams({ fullName });
  if (path) params.set("path", path);

  const res = await fetch(`/api/github/contents?${params}`, {
    headers: {
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      "X-Github-Token": token,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch contents" }));
    throw new Error(err.error || "Failed to fetch repository contents");
  }

  return res.json();
}

export async function getRepoFile(
  fullName: string,
  path: string
): Promise<GithubFileContent> {
  const token = await getGithubToken();
  if (!token) throw new Error("GitHub token not available");

  const params = new URLSearchParams({ fullName, path });

  const res = await fetch(`/api/github/file?${params}`, {
    headers: {
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      "X-Github-Token": token,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch file" }));
    throw new Error(err.error || "Failed to fetch file content");
  }

  return res.json();
}

export async function createSpecPR(
  fullName: string,
  specTitle: string,
  specContent: string,
  specType?: string
): Promise<GithubPRResult> {
  const token = await getGithubToken();
  if (!token) throw new Error("GitHub token not available");

  const res = await fetch("/api/github/create-pr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      "X-Github-Token": token,
    },
    body: JSON.stringify({ fullName, specTitle, specContent, specType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create PR" }));
    throw new Error(err.error || "Failed to create pull request");
  }

  return res.json();
}

export function parseGithubUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "github.com") return null;
    const parts = u.pathname.replace(/^\//, "").split("/");
    if (parts.length < 2) return null;
    return `${parts[0]}/${parts[1]}`;
  } catch {
    return null;
  }
}
