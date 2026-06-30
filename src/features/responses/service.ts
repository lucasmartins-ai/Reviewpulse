import "server-only";

import { createDemoResponseDraft } from "@/features/demo/store";

export async function createResponseDraft(feedbackId: string, tone: "professional" | "warm" | "concise") {
  return createDemoResponseDraft(feedbackId, tone);
}
