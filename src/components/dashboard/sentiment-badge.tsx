import type { AnalysisSentiment } from "@/types/domain";

const labels: Record<AnalysisSentiment, string> = {
  positive: "positivo",
  neutral: "neutro",
  negative: "negativo"
};

export function SentimentBadge({ sentiment }: { sentiment: AnalysisSentiment }) {
  return (
    <span className={`sentiment-badge ${sentiment}`} aria-label={`Sentimento ${labels[sentiment]}`}>
      {labels[sentiment]}
    </span>
  );
}
