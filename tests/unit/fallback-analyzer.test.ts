import { describe, expect, it } from "vitest";
import { createLocalFeedbackAnalyzer } from "@/features/analysis/local-analyzer";

describe("createLocalFeedbackAnalyzer", () => {
  it("classifies urgent negative waiting-time feedback with supported themes", async () => {
    const analyzer = createLocalFeedbackAnalyzer();

    const result = await analyzer.analyze({
      rating: 2,
      comment: "I waited 45 minutes and nobody explained the delay.",
      businessContext: "clinic"
    });

    expect(result.sentiment).toBe("negative");
    expect(result.urgency).toBe("high");
    expect(result.themes).toEqual(expect.arrayContaining(["speed", "communication"]));
    expect(result.summary.length).toBeGreaterThan(10);
    expect(result.suggestedAction).toContain("follow");
  });

  it("classifies clear praise as positive without inventing unsupported themes", async () => {
    const analyzer = createLocalFeedbackAnalyzer();

    const result = await analyzer.analyze({
      rating: 10,
      comment: "The team was kind, the service was fast, and the result was excellent."
    });

    expect(result.sentiment).toBe("positive");
    expect(result.urgency).toBe("low");
    expect(result.sentimentScore).toBeGreaterThan(0.5);
    expect(result.themes.every((theme) => ["service", "price", "speed", "quality", "communication"].includes(theme))).toBe(true);
  });
});
