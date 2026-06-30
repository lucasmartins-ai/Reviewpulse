import type { CsvFeedbackRow } from "@/types/domain";

const headers = ["created_at", "rating", "sentiment", "themes", "comment", "customer_name", "customer_email", "summary"] as const;

export function escapeCsvCell(value: string | number | null | undefined) {
  let text = value == null ? "" : String(value);

  if (/^[=+\-@]/.test(text.trimStart())) {
    text = `'${text}`;
  }

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function feedbackRowsToCsv(rows: CsvFeedbackRow[]) {
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.createdAt,
        row.rating,
        row.sentiment,
        row.themes.join("; "),
        row.comment,
        row.customerName,
        row.customerEmail,
        row.summary
      ]
        .map(escapeCsvCell)
        .join(",")
    )
  ];

  return `${lines.join("\n")}\n`;
}
