import { z } from "zod";

export const CandidateSchema = z.object({
  _id: z.string(),
  userId: z.union([
    z.string(),
    z
      .object({ _id: z.string(), name: z.string(), email: z.string() })
      .passthrough(),
  ]),
  contactPhone: z.string().default(""),
  contactEmail: z.string().default(""),
  applications: z.array(z.string()).default([]),
  skills: z.array(z.string()),
  experienceLevel: z.enum([
    "internship",
    "entry-level",
    "associate",
    "mid-level",
    "senior-level",
  ]),
  preferredWorkType: z.enum([
    "full-time",
    "part-time",
    "contract",
    "freelance",
  ]),
  resume: z.string().default(""),
  workExperince: z
    .array(
      z.object({
        CompanyName: z.string(),
        Role: z.string(),
        StartDate: z.string(),
        EndDate: z.string(),
        Description: z.string(),
        isCurrent: z.boolean().default(false),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        Degree: z.string(),
        Institution: z.string(),
        GraduationYear: z.number(),
        Description: z.string(),
      }),
    )
    .default([]),
  socialLinks: z
    .array(
      z.object({
        platform: z.enum(["linkedin", "github", "twitter", "personal_website"]),
        url: z.string(),
      }),
    )
    .default([]),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GetCandidatesResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(CandidateSchema),
  pagination: z
    .object({
      currentPage: z.number(),
      totalPages: z.number(),
      total: z.number(),
      limit: z.number(),
    })
    .optional(),
});
export type GetCandidatesResponse = z.infer<typeof GetCandidatesResponseSchema>;

export const GetCandidateResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: CandidateSchema,
});
export type GetCandidateResponse = z.infer<typeof GetCandidateResponseSchema>;
