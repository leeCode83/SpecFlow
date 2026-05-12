import { Octokit } from "octokit";

export class GithubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getRepo(fullName: string) {
    const [owner, repo] = fullName.split("/");
    const { data } = await this.octokit.rest.repos.get({ owner, repo });
    return {
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      language: data.language,
      topics: data.topics || [],
      defaultBranch: data.default_branch,
    };
  }

  async getContents(fullName: string, path: string = "") {
    const [owner, repo] = fullName.split("/");
    const { data } = await this.octokit.rest.repos.getContent({ owner, repo, path });
    if (!Array.isArray(data)) {
      return [
        {
          name: data.name,
          path: data.path,
          type: data.type,
          size: data.size,
        },
      ];
    }
    return data.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
    }));
  }

  async getFileContent(fullName: string, path: string) {
    const [owner, repo] = fullName.split("/");
    const { data } = await this.octokit.rest.repos.getContent({ owner, repo, path });
    if (Array.isArray(data)) throw new Error("Path is a directory, not a file");
    if (data.type !== "file") throw new Error("Not a regular file");
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return { content, size: data.size, sha: data.sha };
  }

  async createSpecPR(fullName: string, specTitle: string, specContent: string, specType: string = "Custom") {
    const [owner, repo] = fullName.split("/");

    const repoInfo = await this.octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoInfo.data.default_branch;

    const { data: ref } = await this.octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });

    const slug = specTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);
    const specPath = `specs/${specType.toLowerCase()}/${slug}.md`;

    const { data: blob } = await this.octokit.rest.git.createBlob({
      owner,
      repo,
      content: specContent,
      encoding: "utf-8",
    });

    const { data: tree } = await this.octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: ref.object.sha,
      tree: [{ path: specPath, mode: "100644", type: "blob", sha: blob.sha }],
    });

    const { data: commit } = await this.octokit.rest.git.createCommit({
      owner,
      repo,
      message: `feat(spec): add ${specTitle}`,
      tree: tree.sha,
      parents: [ref.object.sha],
    });

    const branchName = `idea-frame/spec-${slug}`;
    try {
      await this.octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: commit.sha,
      });
    } catch (e: any) {
      if (e.status === 422) {
        await this.octokit.rest.git.deleteRef({ owner, repo, ref: `heads/${branchName}` });
        await this.octokit.rest.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branchName}`,
          sha: commit.sha,
        });
      } else throw e;
    }

    const { data: pr } = await this.octokit.rest.pulls.create({
      owner,
      repo,
      title: `[Spec] ${specTitle}`,
      body: specContent,
      head: branchName,
      base: defaultBranch,
    });

    return { prUrl: pr.html_url, prNumber: pr.number };
  }
}
