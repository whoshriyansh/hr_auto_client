import { z } from "zod";

export const ApplicationSchema = z.object({
  _id: z.string(),
  candidateId: z.string().nullable().optional(),
  applicantName: z.string(),
  applicantEmail: z.string(),
  applicantPhoneNumber: z.string(),
  createdBy: z.string().nullable().optional(),
  jobId: z.union([
    z.string(),
    z.object({ _id: z.string(), title: z.string() }).passthrough(),
  ]),
  companyId: z.union([
    z.string(),
    z.object({ _id: z.string(), name: z.string() }).passthrough(),
  ]),
  resume: z.string(),
  coverLetter: z.string().default(""),
  status: z.enum([
    "pending",
    "shortlisted",
    "ai_interview_scheduled",
    "ai_interview_complete",
    "ai_shortlisted",
    "ai_rejected",
    "interview_scheduled",
    "interview_complete",
    "accepted",
    "rejected",
  ]),
  extractedSkills: z.array(z.string()).default([]),
  experienceLevel: z.string().default(""),
  extractedExperience: z.string().default(""),
  analysisResume: z.enum(["pending", "completed", "failed"]).default("pending"),
  aiResumeToJobAnalysis: z
    .object({
      aiScore: z.number().default(0),
      jobRelevanceScore: z.number().default(0),
      jobMatchScore: z.number().default(0),
    })
    .default({ aiScore: 0, jobRelevanceScore: 0, jobMatchScore: 0 }),
  aiFinalInterviewAnalysis: z
    .object({
      matchScore: z.number().optional(),
      summary: z.string().optional(),
      strengths: z.array(z.string()).optional(),
      weaknesses: z.array(z.string()).optional(),
      greenFlags: z.array(z.string()).optional(),
      redFlags: z.array(z.string()).optional(),
      analyzedAt: z.string().optional(),
      aiRejectionReason: z.string().nullable().optional(),
      recommendation: z
        .enum(["strong_yes", "yes", "neutral", "no", "strong_no"])
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PublicApplyResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: ApplicationSchema,
});
export type PublicApplyResponse = z.infer<typeof PublicApplyResponseSchema>;

export const GetApplicationsResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(ApplicationSchema),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    total: z.number(),
    limit: z.number(),
  }),
});
export type GetApplicationsResponse = z.infer<
  typeof GetApplicationsResponseSchema
>;

export const GetApplicationResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: ApplicationSchema,
});
export type GetApplicationResponse = z.infer<
  typeof GetApplicationResponseSchema
>;

export const UpdateStatusRequestSchema = z.object({
  status: z.enum([
    "pending",
    "shortlisted",
    "ai_interview_scheduled",
    "ai_interview_complete",
    "ai_shortlisted",
    "ai_rejected",
    "interview_scheduled",
    "interview_complete",
    "accepted",
    "rejected",
  ]),
});
export type UpdateStatusRequest = z.infer<typeof UpdateStatusRequestSchema>;
