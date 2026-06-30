import "server-only";

import { createLocalFeedbackAnalyzer } from "@/features/analysis/local-analyzer";
import type { FeedbackAnalyzer } from "@/types/domain";

export function createFeedbackAnalyzer(): FeedbackAnalyzer {
  return createLocalFeedbackAnalyzer();
}
