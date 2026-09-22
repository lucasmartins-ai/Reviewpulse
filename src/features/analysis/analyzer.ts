import "server-only";

import { createTypeSafeFeedbackAnalyzer } from "@/features/analysis/typesafe-analyzer";
import type { FeedbackAnalyzer } from "@/types/domain";

export function createFeedbackAnalyzer(): FeedbackAnalyzer {
  return createTypeSafeFeedbackAnalyzer();
}

