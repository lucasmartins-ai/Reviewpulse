export const sentimentValues = ["positive", "neutral", "negative"] as const;
export const themeValues = ["service", "price", "speed", "quality", "communication"] as const;
export const urgencyValues = ["low", "medium", "high"] as const;
export const analysisStatusValues = ["pending", "completed", "failed"] as const;
export const testimonialStatusValues = ["draft", "approved", "published", "archived"] as const;

export type AnalysisSentiment = (typeof sentimentValues)[number];
export type FeedbackTheme = (typeof themeValues)[number];
export type AnalysisUrgency = (typeof urgencyValues)[number];
export type AnalysisStatus = (typeof analysisStatusValues)[number];
export type TestimonialStatus = (typeof testimonialStatusValues)[number];

export type FeedbackAnalysisInput = {
  rating: number;
  comment: string;
  businessContext?: string;
};

export type FeedbackAnalysisResult = {
  sentiment: AnalysisSentiment;
  sentimentScore: number;
  themes: FeedbackTheme[];
  summary: string;
  suggestedAction: string;
  urgency: AnalysisUrgency;
  modelProvider?: string;
  modelName?: string;
  promptVersion?: string;
  rawOutput?: unknown;
};

export type ResponseDraftInput = {
  rating: number;
  comment: string;
  sentiment?: AnalysisSentiment;
  themes?: FeedbackTheme[];
  tone: "professional" | "warm" | "concise";
  businessContext?: string;
};

export type ResponseDraftResult = {
  body: string;
  modelProvider?: string;
  modelName?: string;
};

export type FeedbackAnalyzer = {
  analyze(input: FeedbackAnalysisInput): Promise<FeedbackAnalysisResult>;
  draftResponse(input: ResponseDraftInput): Promise<ResponseDraftResult>;
};

export type PublicOrganization = {
  id: string;
  name: string;
  slug: string;
  publicFeedbackSlug: string;
  businessCategory: string | null;
};

export type FeedbackListItem = {
  id: string;
  rating: number;
  comment: string;
  customerName: string | null;
  customerEmail: string | null;
  analysisStatus: AnalysisStatus;
  createdAt: string;
  analysis: FeedbackAnalysisResult | null;
};

export type TestimonialItem = {
  id: string;
  feedbackId: string | null;
  quote: string;
  customerDisplayName: string | null;
  status: TestimonialStatus;
  approvedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
};

export type DashboardMetrics = {
  averageRating: number | null;
  volume: number;
  positive: number;
  neutral: number;
  negative: number;
};

export type DashboardData = {
  organization: PublicOrganization;
  metrics: DashboardMetrics;
  topThemes: Array<{ theme: FeedbackTheme; count: number }>;
  recentFeedback: FeedbackListItem[];
  testimonials: TestimonialItem[];
};

export type CsvFeedbackRow = {
  createdAt: string;
  rating: number;
  sentiment: AnalysisSentiment | "";
  themes: FeedbackTheme[];
  comment: string;
  customerName: string | null;
  customerEmail: string | null;
  summary: string | null;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
