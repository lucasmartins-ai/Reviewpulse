import "server-only";

import { getDemoDashboardData } from "@/features/demo/store";
import { feedbackRowsToCsv } from "@/features/exports/csv";
import type { AnalysisSentiment, CsvFeedbackRow } from "@/types/domain";

type ExportFilters = {
  startDate?: string;
  endDate?: string;
  sentiment?: AnalysisSentiment;
};

export async function exportFeedbackCsv(filters: ExportFilters) {
  const rows = getDemoDashboardData().recentFeedback
    .filter((feedback) => !filters.sentiment || feedback.analysis?.sentiment === filters.sentiment)
    .filter((feedback) => !filters.startDate || feedback.createdAt >= filters.startDate)
    .filter((feedback) => !filters.endDate || feedback.createdAt < filters.endDate)
    .map(
      (feedback): CsvFeedbackRow => ({
        createdAt: feedback.createdAt,
        rating: feedback.rating,
        sentiment: feedback.analysis?.sentiment ?? "",
        themes: feedback.analysis?.themes ?? [],
        comment: feedback.comment,
        customerName: feedback.customerName,
        customerEmail: feedback.customerEmail,
        summary: feedback.analysis?.summary ?? null
      })
    );

  return feedbackRowsToCsv(rows);
}
