import { z } from "zod";

export const QuestionItemSchema = z.object({
  question: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const QuestionnaireSchema = z.object({
  _id: z.string(),
  jobId: z.union([
    z.string(),
    z.object({ _id: z.string(), title: z.string() }).passthrough(),
  ]),
  companyId: z.union([
    z.string(),
    z.object({ _id: z.string(), name: z.string() }).passthrough(),
  ]),
  createdBy: z.string(),
  questions: z.array(QuestionItemSchema),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  experienceLevel: z.enum(["entry", "mid", "associate", "senior"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateQuestionsRequestSchema = z.object({
  jobId: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  experienceLevel: z.enum(["entry", "mid", "associate", "senior"]),
});
export type CreateQuestionsRequest = z.infer<
  typeof CreateQuestionsRequestSchema
>;

export const CreateQuestionsResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: QuestionnaireSchema,
});
export type CreateQuestionsResponse = z.infer<
  typeof CreateQuestionsResponseSchema
>;

export const GetQuestionsResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(QuestionnaireSchema),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    total: z.number(),
    limit: z.number(),
  }),
});
export type GetQuestionsResponse = z.infer<typeof GetQuestionsResponseSchema>;

export const GetQuestionByIdResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: QuestionnaireSchema,
});
export type GetQuestionByIdResponse = z.infer<
  typeof GetQuestionByIdResponseSchema
>;
