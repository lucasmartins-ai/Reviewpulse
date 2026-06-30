import "server-only";

import { upsertDemoTestimonial } from "@/features/demo/store";
import type { TestimonialStatus } from "@/types/domain";

export async function upsertTestimonial(
  input: {
    feedbackId: string;
    quote: string;
    customerDisplayName?: string;
    status: TestimonialStatus;
  }
) {
  return upsertDemoTestimonial(input.feedbackId, input.quote, input.customerDisplayName, input.status);
}
