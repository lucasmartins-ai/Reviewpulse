import { describe, expect, it } from "vitest";
import { escapeCsvCell, feedbackRowsToCsv } from "@/features/exports/csv";

describe("CSV export helpers", () => {
  it("escapes formulas before normal CSV quoting", () => {
    expect(escapeCsvCell("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)");
    expect(escapeCsvCell("+441234567")).toBe("'+441234567");
    expect(escapeCsvCell("-10")).toBe("'-10");
    expect(escapeCsvCell("@handle")).toBe("'@handle");
  });

  it("quotes commas, double quotes, and newlines", () => {
    expect(escapeCsvCell('Ana "VIP", clinic')).toBe('"Ana ""VIP"", clinic"');
    expect(escapeCsvCell("line one\nline two")).toBe('"line one\nline two"');
  });

  it("serializes feedback rows with stable headers", () => {
    const csv = feedbackRowsToCsv([
      {
        createdAt: "2026-06-30T10:00:00.000Z",
        rating: 9,
        sentiment: "positive",
        themes: ["service", "quality"],
        comment: "=Loved it",
        customerName: "Ana",
        customerEmail: "ana@example.com",
        summary: "Happy customer"
      }
    ]);

    expect(csv.split("\n")[0]).toBe("created_at,rating,sentiment,themes,comment,customer_name,customer_email,summary");
    expect(csv).toContain("service; quality");
    expect(csv).toContain("'=Loved it");
  });
});
