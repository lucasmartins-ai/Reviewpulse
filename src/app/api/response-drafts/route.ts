import { type NextRequest } from "next/server";
import { createResponseDraft } from "@/features/responses/service";
import { apiFailure, apiSuccess } from "@/lib/api/envelope";
import { responseDraftSchema } from "@/lib/validation/feedback";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return apiFailure("VALIDATION_ERROR", "Envie um corpo JSON válido.", 400);
  }

  const parsed = responseDraftSchema.safeParse(payload);
  if (!parsed.success) {
    return apiFailure("VALIDATION_ERROR", "Revise o feedback e o tom do rascunho.", 422);
  }

  try {
    const draft = await createResponseDraft(parsed.data.feedbackId, parsed.data.tone);
    if (!draft) {
      return apiFailure("NOT_FOUND", "Feedback não encontrado.", 404);
    }

    return apiSuccess(draft);
  } catch {
    return apiFailure("SERVER_ERROR", "Não foi possível gerar o rascunho agora.", 500);
  }
}
