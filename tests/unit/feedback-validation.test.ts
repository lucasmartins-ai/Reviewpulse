import { describe, expect, it } from "vitest";
import { feedbackSubmissionSchema } from "@/lib/validation/feedback";

describe("feedbackSubmissionSchema", () => {
  it("accepts and trims a valid public feedback submission", () => {
    const result = feedbackSubmissionSchema.safeParse({
      publicSlug: " river-dental ",
      rating: 8,
      comment: " Friendly team, but the wait was long. ",
      customerName: " Ana ",
      customerEmail: "ANA@EXAMPLE.COM "
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        publicSlug: "river-dental",
        rating: 8,
        comment: "Friendly team, but the wait was long.",
        customerName: "Ana",
        customerEmail: "ana@example.com"
      });
    }
  });

  it("rejects invalid rating and empty comments", () => {
    const result = feedbackSubmissionSchema.safeParse({
      publicSlug: "river-dental",
      rating: 11,
      comment: " "
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toContain("rating");
      expect(result.error.issues.map((issue) => issue.path.join("."))).toContain("comment");
    }
  });
});
