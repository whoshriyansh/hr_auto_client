import { z } from "zod";

const LocationSchema = z.object({
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
});

export const JobSchema = z.object({
  _id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  mode: z.enum(["remote", "hybrid", "onsite"]),
  workType: z.enum(["full-time", "part-time", "contract", "freelance"]),
  experienceLevel: z.enum([
    "internship",
    "entry-level",
    "associate",
    "mid-level",
    "senior-level",
  ]),
  applicationDeadline: z.string(),
  status: z.enum(["draft", "published", "paused", "closed"]),
  skills: z.array(z.string()),
  location: LocationSchema,
  salary: z.number(),
  disclosed: z.boolean(),
  equity: z.number().optional().default(0),
  totalApplicants: z.number().default(0),
  views: z.number().default(0),
  createdBy: z.string(),
  companyId: z.union([
    z.string(),
    z.object({ _id: z.string(), name: z.string() }).passthrough(),
  ]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateJobRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  jobType: z.enum(["Indian", "World Wide"]),
  mode: z.enum(["remote", "hybrid", "onsite"]).optional(),
  workType: z
    .enum(["full-time", "part-time", "contract", "freelance"])
    .optional(),
  experienceLevel: z
    .enum([
      "internship",
      "entry-level",
      "associate",
      "mid-level",
      "senior-level",
    ])
    .optional(),
  applicationDeadline: z.string().optional(),
  skills: z.array(z.string()).optional(),
  location: z
    .object({
      address: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
    })
    .optional(),
  salary: z.number().optional(),
  disclosed: z.boolean().optional(),
  equity: z.number().optional(),
  status: z.enum(["draft", "published", "paused", "closed"]).optional(),
});
export type CreateJobRequest = z.infer<typeof CreateJobRequestSchema>;

export const CreateJobAIRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  jobType: z.enum(["Indian", "World Wide"]),
  mode: z.enum(["remote", "hybrid", "onsite"]).optional(),
  workType: z
    .enum(["full-time", "part-time", "contract", "freelance"])
    .optional(),
  experienceLevel: z
    .enum([
      "internship",
      "entry-level",
      "associate",
      "mid-level",
      "senior-level",
    ])
    .optional(),
  applicationDeadline: z.string().optional(),
  skills: z.array(z.string()).optional(),
  location: z
    .object({
      address: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
    })
    .optional(),
  salary: z.number().optional(),
  disclosed: z.boolean().optional(),
  equity: z.number().optional(),
});
export type CreateJobAIRequest = z.infer<typeof CreateJobAIRequestSchema>;

export const CreateJobResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: JobSchema,
});
export type CreateJobResponse = z.infer<typeof CreateJobResponseSchema>;

export const GetJobResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: JobSchema,
});
export type GetJobResponse = z.infer<typeof GetJobResponseSchema>;

export const GetJobsResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(JobSchema),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    total: z.number(),
    limit: z.number(),
  }),
});
export type GetJobsResponse = z.infer<typeof GetJobsResponseSchema>;
