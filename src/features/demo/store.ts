import "server-only";

import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createLocalFeedbackAnalyzer } from "@/features/analysis/local-analyzer";
import type { FeedbackSubmissionInput } from "@/lib/validation/feedback";
import { themeValues } from "@/types/domain";
import type { DashboardData, FeedbackAnalysisResult, FeedbackListItem, FeedbackTheme, PublicOrganization, TestimonialItem } from "@/types/domain";

type FeedbackRow = {
  id: string;
  rating: number;
  comment: string;
  customer_name: string | null;
  customer_email: string | null;
  analysis_status: FeedbackListItem["analysisStatus"];
  sentiment: FeedbackAnalysisResult["sentiment"] | null;
  sentiment_score: number | null;
  themes: string;
  summary: string | null;
  suggested_action: string | null;
  urgency: FeedbackAnalysisResult["urgency"] | null;
  created_at: string;
};

type TestimonialRow = {
  id: string;
  feedback_id: string | null;
  quote: string;
  customer_display_name: string | null;
  status: TestimonialItem["status"];
  approved_at: string | null;
  published_at: string | null;
  created_at: string;
};

const demoOrganization: PublicOrganization = {
  id: "demo-clinic",
  name: "Clinica Demo ReviewPulse",
  slug: "demo-clinic",
  publicFeedbackSlug: "demo-clinic",
  businessCategory: "clinic"
};

const now = new Date("2026-06-30T10:00:00.000Z");

const initialFeedback: FeedbackListItem[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    rating: 10,
    comment: "Equipe atenciosa, consulta no horario e explicacao clara do tratamento.",
    customerName: "Mariana S.",
    customerEmail: "mariana@example.com",
    analysisStatus: "completed",
    createdAt: now.toISOString(),
    analysis: {
      sentiment: "positive",
      sentimentScore: 0.92,
      themes: ["service", "communication", "speed"],
      summary: "Cliente elogiou atendimento, pontualidade e clareza na explicacao.",
      suggestedAction: "Aprove como depoimento e compartilhe o elogio com a equipe de atendimento.",
      urgency: "low",
      modelProvider: "local",
      modelName: "demo"
    }
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    rating: 4,
    comment: "O atendimento foi correto, mas esperei muito e nao recebi atualizacao.",
    customerName: "Carlos M.",
    customerEmail: "carlos@example.com",
    analysisStatus: "completed",
    createdAt: new Date(now.getTime() - 86_400_000).toISOString(),
    analysis: {
      sentiment: "negative",
      sentimentScore: -0.58,
      themes: ["speed", "communication"],
      summary: "Cliente ficou frustrado com espera e falta de atualizacao.",
      suggestedAction: "Responder com pedido de desculpas especifico e explicar o proximo ajuste operacional.",
      urgency: "medium",
      modelProvider: "local",
      modelName: "demo"
    }
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    rating: 7,
    comment: "Resultado bom, preco um pouco acima do esperado.",
    customerName: "Ana P.",
    customerEmail: null,
    analysisStatus: "completed",
    createdAt: new Date(now.getTime() - 172_800_000).toISOString(),
    analysis: {
      sentiment: "neutral",
      sentimentScore: 0.18,
      themes: ["quality", "price"],
      summary: "Cliente gostou do resultado, mas percebeu preco alto.",
      suggestedAction: "Perguntar um detalhe e acompanhar se preco aparece em novos feedbacks.",
      urgency: "low",
      modelProvider: "local",
      modelName: "demo"
    }
  }
];

const initialTestimonials: TestimonialItem[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    feedbackId: "10000000-0000-4000-8000-000000000001",
    quote: "Equipe atenciosa, consulta no horario e explicacao clara do tratamento.",
    customerDisplayName: "Mariana S.",
    status: "published",
    approvedAt: now.toISOString(),
    publishedAt: now.toISOString(),
    createdAt: now.toISOString()
  }
];

let db: DatabaseSync | null = null;

function getDatabasePath() {
  return process.env.REVIEWPULSE_SQLITE_PATH ?? path.join(process.cwd(), ".data", "reviewpulse.sqlite");
}

function getDb() {
  if (db) {
    return db;
  }

  const databasePath = getDatabasePath();
  mkdirSync(path.dirname(databasePath), { recursive: true });

  db = new DatabaseSync(databasePath);
  db.exec(readFileSync(path.join(process.cwd(), "sqlite", "schema.sql"), "utf8"));
  seedDatabase(db);

  return db;
}

function seedDatabase(database: DatabaseSync) {
  const count = database.prepare("select count(*) as count from feedbacks").get() as { count: number };
  if (count.count > 0) {
    return;
  }

  const insertFeedback = database.prepare(
    `insert into feedbacks (
      id, rating, comment, customer_name, customer_email, analysis_status,
      sentiment, sentiment_score, themes, summary, suggested_action, urgency, created_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  for (const feedback of initialFeedback) {
    insertFeedback.run(
      feedback.id,
      feedback.rating,
      feedback.comment,
      feedback.customerName,
      feedback.customerEmail,
      feedback.analysisStatus,
      feedback.analysis?.sentiment ?? null,
      feedback.analysis?.sentimentScore ?? null,
      JSON.stringify(feedback.analysis?.themes ?? []),
      feedback.analysis?.summary ?? null,
      feedback.analysis?.suggestedAction ?? null,
      feedback.analysis?.urgency ?? null,
      feedback.createdAt
    );
  }

  const insertTestimonial = database.prepare(
    `insert into testimonials (
      id, feedback_id, quote, customer_display_name, status, approved_at, published_at, created_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  for (const testimonial of initialTestimonials) {
    insertTestimonial.run(
      testimonial.id,
      testimonial.feedbackId,
      testimonial.quote,
      testimonial.customerDisplayName,
      testimonial.status,
      testimonial.approvedAt,
      testimonial.publishedAt,
      testimonial.createdAt
    );
  }
}

export function getDemoOrganizationBySlug(slug: string) {
  return slug === demoOrganization.publicFeedbackSlug ? demoOrganization : null;
}

export function getDemoOrganization() {
  return demoOrganization;
}

export async function insertDemoFeedback(input: FeedbackSubmissionInput) {
  const feedback: FeedbackListItem = {
    id: crypto.randomUUID(),
    rating: input.rating,
    comment: input.comment,
    customerName: input.customerName ?? null,
    customerEmail: input.customerEmail ?? null,
    analysisStatus: "pending",
    createdAt: new Date().toISOString(),
    analysis: null
  };

  getDb()
    .prepare(
      `insert into feedbacks (
        id, rating, comment, customer_name, customer_email, analysis_status, themes, created_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(feedback.id, feedback.rating, feedback.comment, feedback.customerName, feedback.customerEmail, feedback.analysisStatus, "[]", feedback.createdAt);

  return feedback;
}

export function updateDemoFeedbackAnalysis(feedbackId: string, analysis: FeedbackAnalysisResult | null, failed = false) {
  getDb()
    .prepare(
      `update feedbacks
       set analysis_status = ?,
           sentiment = ?,
           sentiment_score = ?,
           themes = ?,
           summary = ?,
           suggested_action = ?,
           urgency = ?
       where id = ?`
    )
    .run(
      failed ? "failed" : "completed",
      analysis?.sentiment ?? null,
      analysis?.sentimentScore ?? null,
      JSON.stringify(analysis?.themes ?? []),
      analysis?.summary ?? null,
      analysis?.suggestedAction ?? null,
      analysis?.urgency ?? null,
      feedbackId
    );
}

export function getDemoDashboardData(): DashboardData {
  const feedback = getFeedbackRows().map(mapFeedbackRow);
  const testimonials = getTestimonialRows().map(mapTestimonialRow);
  const analyzed = feedback.filter((item) => item.analysis);
  const volume = feedback.length;
  const averageRating = volume === 0 ? null : feedback.reduce((total, item) => total + item.rating, 0) / volume;
  const sentimentCounts = analyzed.reduce(
    (counts, item) => ({
      ...counts,
      [item.analysis?.sentiment ?? "neutral"]: counts[item.analysis?.sentiment ?? "neutral"] + 1
    }),
    { positive: 0, neutral: 0, negative: 0 }
  );
  const themeCounts = new Map<FeedbackTheme, number>();
  analyzed.forEach((item) => {
    item.analysis?.themes.forEach((theme) => {
      themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1);
    });
  });

  return {
    organization: demoOrganization,
    metrics: {
      averageRating,
      volume,
      positive: sentimentCounts.positive,
      neutral: sentimentCounts.neutral,
      negative: sentimentCounts.negative
    },
    topThemes: Array.from(themeCounts.entries())
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count),
    recentFeedback: feedback.slice(0, 12),
    testimonials
  };
}

export function findDemoFeedback(feedbackId: string) {
  const row = getDb().prepare("select * from feedbacks where id = ?").get(feedbackId) as FeedbackRow | undefined;
  return row ? mapFeedbackRow(row) : null;
}

export async function createDemoResponseDraft(feedbackId: string, tone: "professional" | "warm" | "concise") {
  const feedback = findDemoFeedback(feedbackId);
  if (!feedback) {
    return null;
  }

  return createLocalFeedbackAnalyzer().draftResponse({
    rating: feedback.rating,
    comment: feedback.comment,
    sentiment: feedback.analysis?.sentiment,
    themes: feedback.analysis?.themes,
    tone,
    businessContext: demoOrganization.businessCategory ?? undefined
  });
}

export function upsertDemoTestimonial(feedbackId: string, quote: string, customerDisplayName: string | undefined, status: TestimonialItem["status"]) {
  const feedback = findDemoFeedback(feedbackId);
  if (!feedback || feedback.analysis?.sentiment !== "positive") {
    return null;
  }

  const existing = getDb().prepare("select * from testimonials where feedback_id = ?").get(feedbackId) as TestimonialRow | undefined;
  const timestamp = new Date().toISOString();
  const testimonial: TestimonialItem = {
    id: existing?.id ?? crypto.randomUUID(),
    feedbackId,
    quote,
    customerDisplayName: customerDisplayName ?? feedback.customerName,
    status,
    approvedAt: status === "approved" || status === "published" ? timestamp : null,
    publishedAt: status === "published" ? timestamp : null,
    createdAt: existing?.created_at ?? timestamp
  };

  getDb()
    .prepare(
      `insert into testimonials (
        id, feedback_id, quote, customer_display_name, status, approved_at, published_at, created_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?)
      on conflict(feedback_id) do update set
        quote = excluded.quote,
        customer_display_name = excluded.customer_display_name,
        status = excluded.status,
        approved_at = excluded.approved_at,
        published_at = excluded.published_at`
    )
    .run(
      testimonial.id,
      testimonial.feedbackId,
      testimonial.quote,
      testimonial.customerDisplayName,
      testimonial.status,
      testimonial.approvedAt,
      testimonial.publishedAt,
      testimonial.createdAt
    );

  return testimonial;
}

function getFeedbackRows() {
  return getDb().prepare("select * from feedbacks order by created_at desc").all() as FeedbackRow[];
}

function getTestimonialRows() {
  return getDb().prepare("select * from testimonials order by created_at desc").all() as TestimonialRow[];
}

function mapFeedbackRow(row: FeedbackRow): FeedbackListItem {
  const themes = parseThemes(row.themes);
  const analysis =
    row.analysis_status === "completed" && row.sentiment && row.sentiment_score != null && row.summary && row.suggested_action && row.urgency
      ? {
          sentiment: row.sentiment,
          sentimentScore: row.sentiment_score,
          themes,
          summary: row.summary,
          suggestedAction: row.suggested_action,
          urgency: row.urgency,
          modelProvider: "local",
          modelName: "sqlite-demo"
        }
      : null;

  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    analysisStatus: row.analysis_status,
    createdAt: row.created_at,
    analysis
  };
}

function mapTestimonialRow(row: TestimonialRow): TestimonialItem {
  return {
    id: row.id,
    feedbackId: row.feedback_id,
    quote: row.quote,
    customerDisplayName: row.customer_display_name,
    status: row.status,
    approvedAt: row.approved_at,
    publishedAt: row.published_at,
    createdAt: row.created_at
  };
}

function parseThemes(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((theme): theme is FeedbackTheme => themeValues.includes(theme as FeedbackTheme));
  } catch {
    return [];
  }
}
