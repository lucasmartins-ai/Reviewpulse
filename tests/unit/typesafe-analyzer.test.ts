import { describe, expect, it } from "vitest";
import { TypeSafeFeedbackAnalyzer, createTypeSafeFeedbackAnalyzer } from "@/features/analysis/typesafe-analyzer";

describe("TypeSafeFeedbackAnalyzer", () => {
  it("falls back gracefully to local analysis when key resolver returns null", async () => {
    const fallbackAnalyzer = new TypeSafeFeedbackAnalyzer(() => null);

    const result = await fallbackAnalyzer.analyze({
      rating: 2,
      comment: "I waited 45 minutes and nobody explained the delay.",
      businessContext: "clinic"
    });

    expect(result.sentiment).toBe("negative");
    expect(result.urgency).toBe("high");
    expect(result.themes).toEqual(expect.arrayContaining(["speed", "communication"]));
    expect(result.modelProvider).toBe("local");
  });

  it("analyzes positive review accurately with TypeSafe or fallback", async () => {
    const analyzer = createTypeSafeFeedbackAnalyzer();

    const result = await analyzer.analyze({
      rating: 10,
      comment: "The team was exceedingly kind, the service was fast, and the result was excellent.",
      businessContext: "dental clinic"
    });

    expect(result.sentiment).toBe("positive");
    expect(result.urgency).toBe("low");
    expect(result.sentimentScore).toBeGreaterThan(0.2);
    expect(result.summary).toContain("positive");
    expect(result.modelProvider).toMatch(/typesafe|local/);
  });

  it("drafts contextual responses according to requested tone", async () => {
    const analyzer = createTypeSafeFeedbackAnalyzer();

    const draft = await analyzer.draftResponse({
      rating: 10,
      comment: "Incredible experience, super clean and fast!",
      sentiment: "positive",
      tone: "warm"
    });

    expect(draft.body.length).toBeGreaterThan(20);
    expect(draft.body).toContain("appreciate");
  });
});
