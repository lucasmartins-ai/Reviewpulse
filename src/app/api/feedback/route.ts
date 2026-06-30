import { type NextRequest } from "next/server";
import { apiFailure, apiSuccess } from "@/lib/api/envelope";
import { checkRateLimit } from "@/lib/rate-limit";
import { feedbackSubmissionSchema } from "@/lib/validation/feedback";
import { submitPublicFeedback } from "@/features/feedback/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return apiFailure("VALIDATION_ERROR", "Envie um corpo JSON válido.", 400);
  }

  const parsed = feedbackSubmissionSchema.safeParse(payload);
  if (!parsed.success) {
    return apiFailure("VALIDATION_ERROR", "Revise os campos do feedback e tente novamente.", 422);
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const rateLimit = checkRateLimit(`${forwardedFor}:${parsed.data.publicSlug}`);
  if (!rateLimit.allowed) {
    return apiFailure("RATE_LIMITED", "Muitas tentativas recentes. Tente novamente em alguns minutos.", 429);
  }

  try {
    const result = await submitPublicFeedback(parsed.data);

    if (!result) {
      return apiFailure("NOT_FOUND", "Página de feedback não encontrada.", 404);
    }

    return apiSuccess(result);
  } catch {
    return apiFailure("SERVER_ERROR", "Não foi possível salvar o feedback agora.", 500);
  }
}
