import type {
  FeedbackAnalysisInput,
  FeedbackAnalysisResult,
  FeedbackAnalyzer,
  FeedbackTheme,
  ResponseDraftInput,
  ResponseDraftResult
} from "@/types/domain";

const themeKeywords: Record<FeedbackTheme, string[]> = {
  service: ["service", "staff", "team", "employee", "kind", "rude", "helpful", "atendimento", "equipe"],
  price: ["price", "cost", "expensive", "cheap", "fee", "bill", "preco", "preço", "caro"],
  speed: ["wait", "waiting", "delay", "slow", "fast", "quick", "minutes", "rapido", "rápido", "demora"],
  quality: ["quality", "result", "excellent", "clean", "broken", "poor", "great", "qualidade", "resultado"],
  communication: ["explained", "update", "message", "call", "answer", "nobody", "communication", "resposta"]
};

const positiveWords = ["excellent", "great", "kind", "helpful", "fast", "clean", "love", "loved", "perfect", "atenciosa", "rapido", "rápido"];
const negativeWords = ["bad", "poor", "rude", "slow", "delay", "waited", "waiting", "nobody", "expensive", "broken", "complaint", "demora"];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const matchesAny = (text: string, words: string[]) => words.some((word) => text.includes(word));

function detectThemes(comment: string): FeedbackTheme[] {
  const lowerComment = comment.toLowerCase();
  return Object.entries(themeKeywords)
    .filter(([, keywords]) => matchesAny(lowerComment, keywords))
    .map(([theme]) => theme as FeedbackTheme);
}

function scoreSentiment(input: FeedbackAnalysisInput) {
  const lowerComment = input.comment.toLowerCase();
  const positiveHits = positiveWords.filter((word) => lowerComment.includes(word)).length;
  const negativeHits = negativeWords.filter((word) => lowerComment.includes(word)).length;
  const ratingSignal = (input.rating - 5) / 5;
  const wordSignal = (positiveHits - negativeHits) * 0.22;
  const score = clamp(ratingSignal + wordSignal, -1, 1);

  if (score >= 0.3) {
    return { sentiment: "positive" as const, score };
  }

  if (score <= -0.25) {
    return { sentiment: "negative" as const, score };
  }

  return { sentiment: "neutral" as const, score };
}

function getUrgency(input: FeedbackAnalysisInput, sentiment: FeedbackAnalysisResult["sentiment"]) {
  const urgentWords = ["angry", "refund", "never again", "unsafe", "dangerous", "complaint", "lawyer"];
  const comment = input.comment.toLowerCase();

  if (sentiment === "negative" && (input.rating <= 3 || matchesAny(comment, urgentWords))) {
    return "high" as const;
  }

  if (sentiment === "negative" || input.rating <= 5) {
    return "medium" as const;
  }

  return "low" as const;
}

function buildSummary(input: FeedbackAnalysisInput, themes: FeedbackTheme[], sentiment: FeedbackAnalysisResult["sentiment"]) {
  const themeText = themes.length > 0 ? themes.join(", ") : "general experience";
  return `Customer left ${sentiment} feedback about ${themeText} with a ${input.rating}/10 rating.`;
}

function buildSuggestedAction(sentiment: FeedbackAnalysisResult["sentiment"], urgency: FeedbackAnalysisResult["urgency"]) {
  if (sentiment === "negative") {
    return urgency === "high"
      ? "follow up today, acknowledge the issue, and explain the next operational step."
      : "follow up with a specific apology and ask what would improve the experience.";
  }

  if (sentiment === "positive") {
    return "Thank the customer and consider turning this feedback into an approved testimonial.";
  }

  return "Ask one clarifying question and review whether the same theme appears in recent feedback.";
}

function buildDraft(input: ResponseDraftInput): string {
  const greeting = input.tone === "concise" ? "Thank you for the feedback." : "Thank you for taking the time to share this feedback.";
  const reviewLine =
    input.sentiment === "negative"
      ? "We are sorry the experience did not meet the standard you expected."
      : "We appreciate the details you shared about your experience.";
  const actionLine =
    input.sentiment === "positive"
      ? "We will share this with the team and keep using it as a standard for future visits."
      : "We will review this with the team and follow up on the part of the experience that needs attention.";

  return `${greeting} ${reviewLine} ${actionLine}`;
}

export function createLocalFeedbackAnalyzer(): FeedbackAnalyzer {
  return {
    async analyze(input: FeedbackAnalysisInput): Promise<FeedbackAnalysisResult> {
      const themes = detectThemes(input.comment);
      const { sentiment, score } = scoreSentiment(input);
      const urgency = getUrgency(input, sentiment);

      return {
        sentiment,
        sentimentScore: Number(score.toFixed(3)),
        themes,
        summary: buildSummary(input, themes, sentiment),
        suggestedAction: buildSuggestedAction(sentiment, urgency),
        urgency,
        modelProvider: "local",
        modelName: "deterministic-fallback",
        promptVersion: "local-v1"
      };
    },
    async draftResponse(input: ResponseDraftInput): Promise<ResponseDraftResult> {
      return {
        body: buildDraft(input),
        modelProvider: "local",
        modelName: "deterministic-fallback"
      };
    }
  };
}
