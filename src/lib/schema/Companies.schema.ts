import { z } from "zod";

export const LocationSchema = z.object({
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
});

export const SocialMediaSchema = z.object({
  linkedin: z.string(),
  x: z.string(),
  instagram: z.string(),
});

export const CompanySchema = z.object({
  _id: z.string(),
  createdBy: z.union([
    z.string(),
    z
      .object({ _id: z.string(), name: z.string(), email: z.string() })
      .passthrough(),
  ]),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  logo: z.string(),
  socialMedia: SocialMediaSchema,
  industry: z.string(),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]),
  location: LocationSchema,
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Create company uses FormData (multipart) so we validate what we can
export const CreateCompanyRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  industry: z.string().min(1),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
  location: z.string(), // JSON string of location
  socialMedia: z.string(), // JSON string of socialMedia
});
export type CreateCompanyRequest = z.infer<typeof CreateCompanyRequestSchema>;

export const CreateCompanyResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: CompanySchema,
});
export type CreateCompanyResponse = z.infer<typeof CreateCompanyResponseSchema>;

export const GetMyCompanyResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    company: CompanySchema,
  }),
});
export type GetMyCompanyResponse = z.infer<typeof GetMyCompanyResponseSchema>;

export const GetCompanyResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: CompanySchema,
});
export type GetCompanyResponse = z.infer<typeof GetCompanyResponseSchema>;

export const GetAllCompaniesResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(CompanySchema),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    total: z.number(),
    limit: z.number(),
  }),
});
export type GetAllCompaniesResponse = z.infer<
  typeof GetAllCompaniesResponseSchema
>;
