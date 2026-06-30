import "server-only";

import { createFeedbackAnalyzer } from "@/features/analysis/analyzer";
import { getDemoOrganizationBySlug, insertDemoFeedback, updateDemoFeedbackAnalysis } from "@/features/demo/store";
import type { FeedbackSubmissionInput } from "@/lib/validation/feedback";

export async function resolvePublicOrganizationBySlug(slug: string) {
  return getDemoOrganizationBySlug(slug);
}

export async function submitPublicFeedback(input: FeedbackSubmissionInput) {
  const organization = await resolvePublicOrganizationBySlug(input.publicSlug);
  if (!organization) {
    return null;
  }

  const feedback = await insertDemoFeedback(input);

  try {
    const analysis = await createFeedbackAnalyzer().analyze({
      rating: input.rating,
      comment: input.comment,
      businessContext: organization.businessCategory ?? undefined
    });
    updateDemoFeedbackAnalysis(feedback.id, analysis);
    return { feedbackId: feedback.id, analysisStatus: "completed" as const };
  } catch {
    updateDemoFeedbackAnalysis(feedback.id, null, true);
    return { feedbackId: feedback.id, analysisStatus: "failed" as const };
  }
}
