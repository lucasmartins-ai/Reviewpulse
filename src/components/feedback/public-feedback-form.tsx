"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { ApiEnvelope } from "@/types/domain";

type PublicFeedbackFormProps = {
  publicSlug: string;
  organizationName: string;
};

type FeedbackResponse = ApiEnvelope<{
  feedbackId: string;
  analysisStatus: "completed" | "failed";
}>;

export function PublicFeedbackForm({ publicSlug, organizationName }: PublicFeedbackFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setMessage("");

    const formData = new FormData(form);
    const payload = {
      publicSlug,
      rating: Number(formData.get("rating")),
      comment: String(formData.get("comment") ?? ""),
      customerName: String(formData.get("customerName") ?? ""),
      customerEmail: String(formData.get("customerEmail") ?? "")
    };

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const body = (await response.json()) as FeedbackResponse;

      if (!response.ok || !body.success) {
        setStatus("error");
        setMessage(body.success ? "Não foi possível enviar agora." : body.error.message);
        return;
      }

      form.reset();
      setStatus("success");
      setMessage(
        body.data.analysisStatus === "completed"
          ? "Feedback recebido. A equipe já pode revisar a análise."
          : "Feedback recebido. A análise automática será revisada pela equipe."
      );
    } catch {
      setStatus("error");
      setMessage("Não foi possível enviar agora. Tente novamente em instantes.");
    }
  }

  return (
    <form className="feedback-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          <span>Nota</span>
          <select name="rating" defaultValue="9" required>
            {Array.from({ length: 11 }, (_, rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Nome</span>
          <input name="customerName" autoComplete="name" placeholder="Como podemos te identificar?" />
        </label>
      </div>

      <label>
        <span>Comentário</span>
        <textarea name="comment" required minLength={1} maxLength={4000} rows={6} placeholder={`Conte como foi sua experiência com ${organizationName}.`} />
      </label>

      <label>
        <span>E-mail</span>
        <input name="customerEmail" type="email" autoComplete="email" placeholder="Opcional, para retorno da equipe" />
      </label>

      <button className="primary-button" type="submit" disabled={!isReady || status === "submitting"}>
        {status === "submitting" ? "Enviando..." : "Enviar feedback"}
      </button>

      {message ? (
        <p className={status === "success" ? "form-message success" : "form-message error"} role={status === "error" ? "alert" : "status"}>
          {status === "success" ? <strong>Feedback recebido.</strong> : null} {message.replace("Feedback recebido. ", "")}
        </p>
      ) : null}
    </form>
  );
}
