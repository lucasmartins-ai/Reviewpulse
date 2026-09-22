import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type {
  FeedbackAnalysisInput,
  FeedbackAnalysisResult,
  FeedbackAnalyzer,
  FeedbackTheme,
  ResponseDraftInput,
  ResponseDraftResult,
  AnalysisSentiment,
  AnalysisUrgency
} from "@/types/domain";
import { createLocalFeedbackAnalyzer } from "./local-analyzer";

let cachedKey: string | null = null;

function resolveTypeSafeKey(): string | null {
  if (cachedKey) return cachedKey;
  if (process.env.TYPESAFE_API_KEY && process.env.TYPESAFE_API_KEY.trim().length > 0) {
    cachedKey = process.env.TYPESAFE_API_KEY.trim();
    return cachedKey;
  }
  try {
    const key = execSync("security find-generic-password -s \"typesafe\" -w", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
      timeout: 1500
    }).trim();
    if (key.length > 0) {
      cachedKey = key;
      return cachedKey;
    }
  } catch {
    // sem entrada no keychain
  }
  return null;
}

/** Canonical fleet ledger (shared LOOKAORCHESTRATOR file); never throws, no-op off-Mac. */
const LEDGER_FILE =
  process.env.TYPESAFE_LEDGER_PATH ??
  path.join(os.homedir(), "Downloads", "LOOKAORCHESTRATOR", "logs", "typesafe", "jev.jsonl");

function ledger(entry: Record<string, unknown>): void {
  try {
    fs.mkdirSync(path.dirname(LEDGER_FILE), { recursive: true });
    fs.appendFileSync(LEDGER_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch {
    // ledger must never break analysis (no-op on hosts without the shared path)
  }
}

export class TypeSafeFeedbackAnalyzer implements FeedbackAnalyzer {
  private readonly fallback = createLocalFeedbackAnalyzer();

  constructor(private readonly keyResolver: () => string | null = resolveTypeSafeKey) {}

  async analyze(input: FeedbackAnalysisInput): Promise<FeedbackAnalysisResult> {
    const apiKey = this.keyResolver();
    if (!apiKey) {
      return this.fallback.analyze(input);
    }

    // API contract (probed 22/09): question `type` must be lowercase —
    // "Choice"/"Score"/"Noul" answers HTTP 400 (api_usage_error), which sent
    // every keyed call silently into the local fallback. Answers arrive in
    // `data.answers` (`choice`/`noul`/`score`), never `data.predictions`.
    const startedAt = Date.now();
    const statePayload = {
      rating: input.rating,
      comment: input.comment.slice(0, 1500),
      businessContext: input.businessContext ?? "general service business"
    };
    try {
      const response = await fetch("https://api.typesafe.ai/v1/systemone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          model: "jev-latest",
          state: statePayload,
          questions: {
            sentiment: {
              type: "choice",
              instructions: "Classify the overall sentiment of the customer feedback.",
              criteria: {
                positive: "Customer expresses satisfaction, gratitude, happiness, or praise.",
                neutral: "Customer is matter-of-fact, balanced, or non-committal.",
                negative: "Customer expresses frustration, disappointment, complaints, or problems."
              }
            },
            urgency: {
              type: "choice",
              instructions: "Assess the operational response urgency for the business team.",
              criteria: {
                high: "Severe grievance, safety/legal hazard, extreme anger, or immediate churn risk.",
                medium: "Notable defect, delay, or disappointment needing attentive support.",
                low: "Compliment, positive endorsement, or minor non-urgent observation."
              }
            },
            satisfactionScore: {
              type: "score",
              instructions: "Rate customer satisfaction on a scale from 1 (deeply disappointed) to 5 (thrilled/delighted).",
              criteria: ["1", "2", "3", "4", "5"]
            },
            themeService: {
              type: "noul",
              instructions: "Does this review comment on staff, customer service, politeness, or team attentiveness?"
            },
            themePrice: {
              type: "noul",
              instructions: "Does this review comment on price, cost, affordability, fees, or billing?"
            },
            themeSpeed: {
              type: "noul",
              instructions: "Does this review comment on speed, wait times, delays, or service timeliness?"
            },
            themeQuality: {
              type: "noul",
              instructions: "Does this review comment on the quality, effectiveness, cleanliness, or craftsmanship of the service or product?"
            },
            themeCommunication: {
              type: "noul",
              instructions: "Does this review comment on communication, clarity, notifications, explanations, or updates?"
            },
            isTestimonialWorthy: {
              type: "noul",
              instructions: "Is this review an authentic, high-value positive testimonial suitable for the company homepage?"
            }
          }
        })
      });

      if (!response.ok) {
        ledger({
          ts: new Date().toISOString(),
          feature: "reviewpulse_feedback",
          model: "jev-latest",
          status: "error",
          http_status: response.status,
          latency_ms: Date.now() - startedAt,
          state_chars: JSON.stringify(statePayload).length,
          error: (await response.text().catch(() => "")).slice(0, 300)
        });
        return this.fallback.analyze(input);
      }

      const data = await response.json();
      const answers = data.answers ?? {};
      ledger({
        ts: new Date().toISOString(),
        feature: "reviewpulse_feedback",
        model: data.model ?? "jev-latest",
        status: "ok",
        latency_ms: Date.now() - startedAt,
        input_tokens: data.usage?.input_tokens ?? 0,
        output_tokens: data.usage?.output_tokens ?? 0,
        state_chars: JSON.stringify(statePayload).length,
        answers
      });

      const sentiment: AnalysisSentiment =
        answers.sentiment?.choice === "positive" ||
        answers.sentiment?.choice === "neutral" ||
        answers.sentiment?.choice === "negative"
          ? answers.sentiment.choice
          : input.rating >= 8
            ? "positive"
            : input.rating <= 4
              ? "negative"
              : "neutral";

      const urgency: AnalysisUrgency =
        answers.urgency?.choice === "high" ||
        answers.urgency?.choice === "medium" ||
        answers.urgency?.choice === "low"
          ? answers.urgency.choice
          : sentiment === "negative" && input.rating <= 3
            ? "high"
            : sentiment === "negative"
              ? "medium"
              : "low";

      let sentimentScore = (input.rating - 5) / 5;
      // score = posicao ponderada 0-based sobre criteria ["1".."5"]: label = score + 1,
      // entao (label - 3) / 2 == (score - 2) / 2 em [-1, 1].
      const rawScore = answers.satisfactionScore?.score;
      if (typeof rawScore === "number" && !isNaN(rawScore)) {
        sentimentScore = (rawScore - 2) / 2;
      }

      const themes: FeedbackTheme[] = [];
      if ((answers.themeService?.noul ?? 0) > 0.5) themes.push("service");
      if ((answers.themePrice?.noul ?? 0) > 0.5) themes.push("price");
      if ((answers.themeSpeed?.noul ?? 0) > 0.5) themes.push("speed");
      if ((answers.themeQuality?.noul ?? 0) > 0.5) themes.push("quality");
      if ((answers.themeCommunication?.noul ?? 0) > 0.5) themes.push("communication");

      // If TypeSafe found no specific theme, fall back to regex detection
      if (themes.length === 0) {
        const fallbackResult = await this.fallback.analyze(input);
        themes.push(...fallbackResult.themes);
      }

      const isTestimonial = (answers.isTestimonialWorthy?.noul ?? 0) > 0.5;
      let suggestedAction: string;

      if (sentiment === "negative") {
        suggestedAction =
          urgency === "high"
            ? "Prioritize executive outreach today, investigate root cause, and offer immediate remediation."
            : "Follow up with customer to apologize and offer constructive resolution.";
      } else if (sentiment === "positive") {
        suggestedAction = isTestimonial
          ? "Approved for marketing testimonial spotlight. Send personalized thank-you note."
          : "Thank customer for positive feedback and share with the frontline team.";
      } else {
        suggestedAction = "Log feedback in weekly operations review and check if pattern recurs.";
      }

      const themeText = themes.length > 0 ? themes.join(", ") : "general experience";
      const summary = `Customer left ${sentiment} feedback about ${themeText} with a ${input.rating}/10 rating.`;

      return {
        sentiment,
        sentimentScore: Number(sentimentScore.toFixed(3)),
        themes,
        summary,
        suggestedAction,
        urgency,
        modelProvider: "typesafe",
        modelName: "jev-latest",
        promptVersion: "system-one-v1",
        rawOutput: answers
      };
    } catch (err) {
      ledger({
        ts: new Date().toISOString(),
        feature: "reviewpulse_feedback",
        model: "jev-latest",
        status: "error",
        latency_ms: Date.now() - startedAt,
        state_chars: JSON.stringify(statePayload).length,
        error: String((err as Error)?.message ?? err).slice(0, 300)
      });
      return this.fallback.analyze(input);
    }
  }

  async draftResponse(input: ResponseDraftInput): Promise<ResponseDraftResult> {
    const greeting =
      input.tone === "concise"
        ? "Thank you for the feedback."
        : input.tone === "warm"
          ? "We truly appreciate you taking the time to share your experience with us!"
          : "Thank you for taking the time to share this feedback.";

    const reviewLine =
      input.sentiment === "negative"
        ? "We sincerely apologize that your experience did not meet the high standards we strive for."
        : "We are thrilled to hear you had such a great experience with our team.";

    const actionLine =
      input.sentiment === "positive"
        ? "We'll celebrate this feedback with our team and look forward to welcoming you back."
        : "We are already investigating this with our operations team to ensure it does not happen again.";

    return {
      body: `${greeting} ${reviewLine} ${actionLine}`,
      modelProvider: "typesafe",
      modelName: "jev-latest"
    };
  }
}

export function createTypeSafeFeedbackAnalyzer(): FeedbackAnalyzer {
  return new TypeSafeFeedbackAnalyzer();
}
