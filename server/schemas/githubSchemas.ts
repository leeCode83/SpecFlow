import { z } from "zod";

export const SyncRepoSchema = z.object({
  projectId: z.string().uuid(),
  fullName: z.string().min(1),
});

export const GetContentsSchema = z.object({
  fullName: z.string().min(1),
  path: z.string().optional().default(''),
});

export const GetFileSchema = z.object({
  fullName: z.string().min(1),
  path: z.string().min(1),
});

export const CreatePRSchema = z.object({
  fullName: z.string().min(1),
  specTitle: z.string().min(1),
  specContent: z.string().min(1),
  specType: z.string().optional(),
});
