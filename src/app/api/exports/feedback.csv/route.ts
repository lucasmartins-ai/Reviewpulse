import { type NextRequest } from "next/server";
import { exportFeedbackCsv } from "@/features/exports/service";
import { apiFailure } from "@/lib/api/envelope";
import { exportFeedbackQuerySchema } from "@/lib/validation/feedback";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = exportFeedbackQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return apiFailure("VALIDATION_ERROR", "Revise os filtros da exportação.", 422);
  }

  try {
    const csv = await exportFeedbackCsv(parsed.data);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="reviewpulse-feedback.csv"',
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return apiFailure("EXPORT_FAILED", "Não foi possível gerar a exportação agora.", 500);
  }
}
