import { z } from "zod";
import { testimonialStatusValues } from "@/types/domain";

const trimmedOptionalString = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.string().max(maxLength).optional()
  );

export const feedbackSubmissionSchema = z.object({
  publicSlug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a valid public feedback slug."),
  rating: z.coerce.number().int().min(0).max(10),
  comment: z.string().trim().min(1).max(4000),
  customerName: trimmedOptionalString(160),
  customerEmail: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }
      const trimmed = value.trim().toLowerCase();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.string().email().max(320).optional()
  ),
  customerPhone: trimmedOptionalString(80)
});

export const responseDraftSchema = z.object({
  feedbackId: z.string().uuid(),
  tone: z.enum(["professional", "warm", "concise"]).default("professional")
});

export const testimonialUpsertSchema = z.object({
  feedbackId: z.string().uuid(),
  quote: z.string().trim().min(1).max(1000),
  customerDisplayName: trimmedOptionalString(160),
  status: z.enum(testimonialStatusValues).default("approved")
});

export const exportFeedbackQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional()
});

export type FeedbackSubmissionInput = z.infer<typeof feedbackSubmissionSchema>;
export type ResponseDraftRequest = z.infer<typeof responseDraftSchema>;
export type TestimonialUpsertRequest = z.infer<typeof testimonialUpsertSchema>;
