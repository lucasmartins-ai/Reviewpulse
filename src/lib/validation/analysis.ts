import { z } from "zod";
import { sentimentValues, themeValues, urgencyValues } from "@/types/domain";

export const feedbackAnalysisResultSchema = z.object({
  sentiment: z.enum(sentimentValues),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.enum(themeValues)).max(themeValues.length),
  summary: z.string().trim().min(1).max(1000),
  suggestedAction: z.string().trim().min(1).max(1000),
  urgency: z.enum(urgencyValues),
  modelProvider: z.string().optional(),
  modelName: z.string().optional(),
  promptVersion: z.string().optional(),
  rawOutput: z.unknown().optional()
});
