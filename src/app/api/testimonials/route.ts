import { type NextRequest } from "next/server";
import { upsertTestimonial } from "@/features/testimonials/service";
import { apiFailure, apiSuccess } from "@/lib/api/envelope";
import { testimonialUpsertSchema } from "@/lib/validation/feedback";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return apiFailure("VALIDATION_ERROR", "Envie um corpo JSON válido.", 400);
  }

  const parsed = testimonialUpsertSchema.safeParse(payload);
  if (!parsed.success) {
    return apiFailure("VALIDATION_ERROR", "Revise a citação, o nome e o status.", 422);
  }

  try {
    const testimonial = await upsertTestimonial(parsed.data);
    if (!testimonial) {
      return apiFailure("FORBIDDEN", "Apenas feedback positivo da sua organização pode virar depoimento.", 403);
    }

    return apiSuccess(testimonial);
  } catch {
    return apiFailure("SERVER_ERROR", "Não foi possível salvar o depoimento agora.", 500);
  }
}
