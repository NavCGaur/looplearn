// shared/schema.ts
import { z } from "zod";

export const questionGenerationRequestSchema = z.object({
  classStandard: z.string().min(1, "Class/Standard is required"),
  subject: z.string().min(1, "Subject is required"),
  chapter: z.string().min(1, "Chapter is required"),
  topic: z.string().optional().default("All"),
  questionType: z.enum(["fill-in-blank", "multiple-choice", "true-false", "short-answer", "long-answer"])
    .default("fill-in-blank"),
  numberOfQuestions: z.number().min(1).max(15),
});

export const scienceQuestionSchema = z.object({
  id: z.string().optional(), // Optional for new questions
  classStandard: z.string().min(1),
  subject: z.string().min(1),
  chapter: z.string().min(1),
  topic: z.string().min(1),
  questionType: z.string().default("fill-in-blank"),
  questionText: z.string().min(1),
  answer: z.string().min(1),
  createdAt: z.string().datetime().optional(),
  createdBy: z.string().optional(),
});

// Types
export type QuestionGenerationRequest = z.infer<typeof questionGenerationRequestSchema>;
export type InsertScienceQuestion = z.infer<typeof scienceQuestionSchema>;