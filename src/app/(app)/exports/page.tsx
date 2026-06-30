import { Download } from "lucide-react";

export const runtime = "nodejs";

export default async function ExportsPage() {
  return (
    <main className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Relatório portátil</p>
          <h1>Exportação CSV</h1>
          <p>Baixe feedbacks da clínica demo com células protegidas contra fórmula maliciosa.</p>
        </div>
      </header>
      <section className="panel export-panel">
        <h2>Feedbacks completos</h2>
        <p>Inclui data, nota, sentimento, temas, comentário, cliente e resumo operacional.</p>
        <a className="primary-button" href="/api/exports/feedback.csv">
          <Download size={18} aria-hidden="true" />
          Baixar CSV
        </a>
      </section>
    </main>
  );
}
