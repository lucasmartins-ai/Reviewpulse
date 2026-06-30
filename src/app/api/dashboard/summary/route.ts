import { getDashboardData } from "@/features/dashboard/service";
import { apiFailure, apiSuccess } from "@/lib/api/envelope";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getDashboardData();
    return apiSuccess({
      metrics: data.metrics,
      topThemes: data.topThemes,
      recentFeedback: data.recentFeedback
    });
  } catch {
    return apiFailure("SERVER_ERROR", "Não foi possível carregar o resumo agora.", 500);
  }
}
