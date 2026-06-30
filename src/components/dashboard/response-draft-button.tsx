"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import type { ApiEnvelope } from "@/types/domain";

type ResponseDraftButtonProps = {
  feedbackId: string;
};

type DraftResponse = ApiEnvelope<{
  body: string;
}>;

export function ResponseDraftButton({ feedbackId }: ResponseDraftButtonProps) {
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function generateDraft() {
    setStatus("loading");
    setDraft("");

    try {
      const response = await fetch("/api/response-drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          feedbackId,
          tone: "professional"
        })
      });
      const body = (await response.json()) as DraftResponse;

      if (!response.ok || !body.success) {
        setStatus("error");
        return;
      }

      setDraft(body.data.body);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="draft-box">
      <button className="secondary-button" type="button" onClick={generateDraft} disabled={status === "loading"}>
        <MessageSquareText size={16} aria-hidden="true" />
        {status === "loading" ? "Gerando..." : "Gerar rascunho de resposta"}
      </button>
      {draft ? <p>{draft}</p> : null}
      {status === "error" ? <p className="inline-error">Não foi possível gerar o rascunho.</p> : null}
    </div>
  );
}
