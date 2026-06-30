import type { TestimonialItem } from "@/types/domain";

export function TestimonialLibrary({ testimonials }: { testimonials: TestimonialItem[] }) {
  if (testimonials.length === 0) {
    return <p className="empty-state">Nenhum depoimento aprovado ainda. Transforme feedbacks positivos em prova social revisada.</p>;
  }

  return (
    <div className="testimonial-grid">
      {testimonials.map((testimonial) => (
        <article className="testimonial-card" key={testimonial.id}>
          <p>“{testimonial.quote}”</p>
          <div>
            <strong>{testimonial.customerDisplayName ?? "Cliente"}</strong>
            <span className="status-chip">{testimonial.status}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
