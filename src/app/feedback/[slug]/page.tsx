import { notFound } from "next/navigation";
import { PublicFeedbackForm } from "@/components/feedback/public-feedback-form";
import { resolvePublicOrganizationBySlug } from "@/features/feedback/service";

type FeedbackPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { slug } = await params;
  const organization = await resolvePublicOrganizationBySlug(slug);

  if (!organization) {
    notFound();
  }

  return (
    <main className="public-feedback-page">
      <section className="public-feedback-panel" aria-labelledby="feedback-title">
        <div className="public-feedback-copy">
          <p className="eyebrow">ReviewPulse feedback</p>
          <h1 id="feedback-title">Conte como foi sua experiência com {organization.name}</h1>
          <p>
            Sua resposta ajuda a equipe a corrigir problemas rapidamente, reconhecer bons atendimentos e acompanhar padrões reais dos clientes.
          </p>
        </div>
        <PublicFeedbackForm publicSlug={organization.publicFeedbackSlug} organizationName={organization.name} />
      </section>
    </main>
  );
}
