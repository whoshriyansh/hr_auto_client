import { z } from "zod";

export const InterviewSchema = z.object({
  _id: z.string(),
  applicationId: z.string(),
  jobId: z.string(),
  companyId: z.string(),
  candidateId: z.string().nullable().optional(),
  candidateName: z.string(),
  candidateEmail: z.string(),
  candidatePhone: z.string(),
  token: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
    }),
  ),
  answers: z
    .array(
      z.object({
        questionIndex: z.number(),
        question: z.string(),
        answer: z.string().default(""),
        answeredAt: z.string(),
      }),
    )
    .default([]),
  feedbackPerQuestion: z
    .array(
      z.object({
        questionIndex: z.number(),
        feedback: z.string().default(""),
      }),
    )
    .default([]),
  currentQuestionIndex: z.number().default(0),
  status: z.enum(["pending", "in_progress", "completed", "analyzed"]),
  startedAt: z.string().nullable().default(null),
  completedAt: z.string().nullable().default(null),
  aiAnalysis: z
    .object({
      overallScore: z.number().nullable().default(null),
      communicationScore: z.number().nullable().default(null),
      technicalScore: z.number().nullable().default(null),
      summary: z.string().default(""),
      strengths: z.array(z.string()).default([]),
      weaknesses: z.array(z.string()).default([]),
      greenFlags: z.array(z.string()).default([]),
      redFlags: z.array(z.string()).default([]),
      recommendation: z
        .enum(["strong_yes", "yes", "neutral", "no", "strong_no"])
        .nullable()
        .default(null),
      analyzedAt: z.string().nullable().default(null),
    })
    .optional()
    .nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GetInterviewsResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(InterviewSchema),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    total: z.number(),
    limit: z.number(),
  }),
});
export type GetInterviewsResponse = z.infer<typeof GetInterviewsResponseSchema>;

// Public interview start
export const StartInterviewResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    interviewId: z.string().optional(),
    currentQuestion: z
      .object({
        question: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
      })
      .optional(),
    currentQuestionIndex: z.number().optional(),
    totalQuestions: z.number().optional(),
    allQuestionsServed: z.boolean().optional(),
  }),
});
export type StartInterviewResponse = z.infer<
  typeof StartInterviewResponseSchema
>;

// Submit answer
export const SubmitAnswerRequestSchema = z.object({
  answer: z.string().min(1),
});
export type SubmitAnswerRequest = z.infer<typeof SubmitAnswerRequestSchema>;

export const SubmitAnswerResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    interviewComplete: z.boolean().optional(),
    nextQuestion: z
      .object({
        question: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
      })
      .optional(),
    currentQuestionIndex: z.number().optional(),
    totalQuestions: z.number().optional(),
  }),
});
export type SubmitAnswerResponse = z.infer<typeof SubmitAnswerResponseSchema>;
