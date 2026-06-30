import { RecentFeedbackList } from "@/components/dashboard/recent-feedback-list";
import { TestimonialLibrary } from "@/components/testimonials/testimonial-library";
import { getDashboardData } from "@/features/dashboard/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const data = await getDashboardData();
  const positiveFeedback = data.recentFeedback.filter((feedback) => feedback.analysis?.sentiment === "positive");

  return (
    <main className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Prova social revisada</p>
          <h1>Depoimentos</h1>
          <p>Crie, edite, aprove e publique citações a partir de feedbacks positivos reais.</p>
        </div>
      </header>
      <section className="content-grid">
        <div className="panel">
          <div className="section-heading">
            <h2>Biblioteca aprovada</h2>
            <p>Somente depoimentos aprovados ou publicados devem ser reutilizados em canais comerciais.</p>
          </div>
          <TestimonialLibrary testimonials={data.testimonials} />
        </div>
        <div className="panel">
          <div className="section-heading">
            <h2>Feedbacks positivos</h2>
            <p>Use a citação original como ponto de partida e revise antes de aprovar.</p>
          </div>
          <RecentFeedbackList feedback={positiveFeedback} />
        </div>
      </section>
    </main>
  );
}
