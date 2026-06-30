import { ResponseDraftButton } from "@/components/dashboard/response-draft-button";
import { SentimentBadge } from "@/components/dashboard/sentiment-badge";
import { TestimonialForm } from "@/components/testimonials/testimonial-form";
import type { FeedbackListItem } from "@/types/domain";

export function RecentFeedbackList({ feedback }: { feedback: FeedbackListItem[] }) {
  if (feedback.length === 0) {
    return <p className="empty-state">Ainda não há feedbacks. Compartilhe a página pública para começar a coletar respostas.</p>;
  }

  return (
    <div className="feedback-list">
      {feedback.map((item) => (
        <article className="feedback-item" key={item.id}>
          <div className="feedback-item-header">
            <div>
              <strong>{item.rating}/10</strong>
              <span>{item.customerName ?? "Cliente sem nome"}</span>
            </div>
            {item.analysis ? <SentimentBadge sentiment={item.analysis.sentiment} /> : <span className="status-chip">{item.analysisStatus}</span>}
          </div>
          <p className="feedback-comment">{item.comment}</p>
          {item.analysis ? (
            <div className="analysis-summary">
              <p>{item.analysis.summary}</p>
              <div className="theme-row">
                {item.analysis.themes.map((theme) => (
                  <span key={theme}>{theme}</span>
                ))}
              </div>
            </div>
          ) : null}
          <ResponseDraftButton feedbackId={item.id} />
          {item.analysis?.sentiment === "positive" ? (
            <TestimonialForm feedbackId={item.id} defaultQuote={item.comment} defaultDisplayName={item.customerName} />
          ) : null}
        </article>
      ))}
    </div>
  );
}
