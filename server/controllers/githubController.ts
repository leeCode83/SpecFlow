import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";
import { GithubService } from "../services/githubService";
import { ApiError } from "../lib/ApiError";

export class GithubController {
  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, fullName } = req.body;
      const token = req.headers["x-github-token"] as string;

      if (!token) {
        throw new ApiError(401, "GitHub token required. Please sign in with GitHub.");
      }

      const service = new GithubService(token);
      const repo = await service.getRepo(fullName);

      const { data: existing } = await supabase
        .from("project_github")
        .select("id")
        .eq("project_id", projectId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("project_github")
          .update({
            full_name: repo.fullName,
            description: repo.description,
            stars: repo.stars,
            language: repo.language,
            topics: repo.topics,
            default_branch: repo.defaultBranch,
            fetched_at: new Date().toISOString(),
          })
          .eq("project_id", projectId);
      } else {
        await supabase.from("project_github").insert({
          project_id: projectId,
          full_name: repo.fullName,
          description: repo.description,
          stars: repo.stars,
          language: repo.language,
          topics: repo.topics,
          default_branch: repo.defaultBranch,
        });
      }

      res.json(repo);
    } catch (error) {
      next(error);
    }
  }

  async getRepoStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      if (!projectId) throw new ApiError(400, "projectId query parameter required");

      const { data } = await supabase
        .from("project_github")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      res.json(data || null);
    } catch (error) {
      next(error);
    }
  }

  async getContents(req: Request, res: Response, next: NextFunction) {
    try {
      const fullName = req.query.fullName as string;
      const path = (req.query.path as string) || "";
      const token = req.headers["x-github-token"] as string;

      if (!fullName) throw new ApiError(400, "fullName query parameter required");
      if (!token) throw new ApiError(401, "GitHub token required");

      const service = new GithubService(token);
      const contents = await service.getContents(fullName, path);
      res.json(contents);
    } catch (error) {
      next(error);
    }
  }

  async getFile(req: Request, res: Response, next: NextFunction) {
    try {
      const fullName = req.query.fullName as string;
      const path = req.query.path as string;
      const token = req.headers["x-github-token"] as string;

      if (!fullName || !path) throw new ApiError(400, "fullName and path required");
      if (!token) throw new ApiError(401, "GitHub token required");

      const service = new GithubService(token);
      const file = await service.getFileContent(fullName, path);
      res.json(file);
    } catch (error) {
      next(error);
    }
  }

  async createPR(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, specTitle, specContent, specType } = req.body;
      const token = req.headers["x-github-token"] as string;

      if (!token) throw new ApiError(401, "GitHub token required");

      const service = new GithubService(token);
      const result = await service.createSpecPR(fullName, specTitle, specContent, specType || "Custom");
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
