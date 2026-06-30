import { MessageSquareText, Star, TrendingUp, UsersRound } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RecentFeedbackList } from "@/components/dashboard/recent-feedback-list";
import { TestimonialLibrary } from "@/components/testimonials/testimonial-library";
import { getDashboardData } from "@/features/dashboard/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const averageRating = data.metrics.averageRating == null ? "--" : data.metrics.averageRating.toFixed(1);

  return (
    <main className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operação de reputação</p>
          <h1>Dashboard</h1>
          <p>Resumo de satisfação, temas recorrentes, alertas e prova social aprovada para {data.organization.name}.</p>
        </div>
        <a className="primary-button" href="/api/exports/feedback.csv">
          Exportar CSV
        </a>
      </header>

      <section className="metrics-grid" aria-label="Métricas principais">
        <MetricCard icon={Star} label="Média de rating" value={averageRating} detail="Escala 0 a 10" />
        <MetricCard icon={MessageSquareText} label="Volume" value={String(data.metrics.volume)} detail="Feedbacks recebidos" />
        <MetricCard icon={TrendingUp} label="Positivos" value={String(data.metrics.positive)} detail="Prontos para depoimento" />
        <MetricCard icon={UsersRound} label="Neutros / negativos" value={`${data.metrics.neutral} / ${data.metrics.negative}`} detail="Prioridade de revisão" />
      </section>

      <section className="content-grid">
        <div className="panel span-2">
          <div className="section-heading">
            <h2>Feedbacks recentes</h2>
            <p>Leia o sinal bruto, revise a análise e gere um rascunho de resposta quando fizer sentido.</p>
          </div>
          <RecentFeedbackList feedback={data.recentFeedback} />
        </div>
        <aside className="panel">
          <div className="section-heading">
            <h2>Temas recorrentes</h2>
            <p>O que aparece com mais frequência nas análises.</p>
          </div>
          <div className="theme-list">
            {data.topThemes.length === 0 ? <p className="empty-state">Sem temas suficientes.</p> : null}
            {data.topThemes.map((item) => (
              <div key={item.theme}>
                <span>{item.theme}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
          <div className="section-heading compact">
            <h2>Depoimentos aprovados</h2>
          </div>
          <TestimonialLibrary testimonials={data.testimonials.filter((testimonial) => testimonial.status === "approved" || testimonial.status === "published")} />
        </aside>
      </section>
    </main>
  );
}
