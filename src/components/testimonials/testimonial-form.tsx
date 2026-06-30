"use client";

import { useState, type FormEvent } from "react";
import { Quote } from "lucide-react";
import type { ApiEnvelope, TestimonialItem } from "@/types/domain";

type TestimonialFormProps = {
  feedbackId: string;
  defaultQuote: string;
  defaultDisplayName: string | null;
};

type TestimonialResponse = ApiEnvelope<TestimonialItem>;

export function TestimonialForm({ feedbackId, defaultQuote, defaultDisplayName }: TestimonialFormProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          feedbackId,
          quote: String(formData.get("quote") ?? ""),
          customerDisplayName: String(formData.get("customerDisplayName") ?? ""),
          status: String(formData.get("status") ?? "approved")
        })
      });
      const body = (await response.json()) as TestimonialResponse;

      setStatus(response.ok && body.success ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="testimonial-form" onSubmit={onSubmit}>
      <label>
        <span>Citação</span>
        <textarea name="quote" defaultValue={defaultQuote} rows={3} maxLength={1000} />
      </label>
      <div className="form-grid">
        <label>
          <span>Nome exibido</span>
          <input name="customerDisplayName" defaultValue={defaultDisplayName ?? ""} maxLength={160} />
        </label>
        <label>
          <span>Status</span>
          <select name="status" defaultValue="approved">
            <option value="approved">Aprovado</option>
            <option value="published">Publicado</option>
          </select>
        </label>
      </div>
      <button className="secondary-button" type="submit" disabled={status === "saving"}>
        <Quote size={16} aria-hidden="true" />
        {status === "saving" ? "Salvando..." : "Criar depoimento"}
      </button>
      {status === "saved" ? <p className="form-message success">Depoimento salvo.</p> : null}
      {status === "error" ? <p className="form-message error">Não foi possível salvar este depoimento.</p> : null}
    </form>
  );
}
