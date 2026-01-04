import type { PlacedBlock } from "../types/types";

type FaqJsonLd = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }>;
};

export function JsonLDHead(page: PlacedBlock[]) {
  const faq = buildFaqJsonLd(page);
  if (!faq) return "";

  const json = JSON.stringify(faq);
  return `<script type="application/ld+json">${json}</script>`;
}

function normalizeText(s: unknown): string {
  return String(s ?? "").trim();
}

function stripUnsafe(s: string): string {
  // If your answers are plain textarea text, this is enough.
  // If you ever allow rich text/HTML, you should sanitize differently.
  return s.replace(/\u0000/g, "").trim();
}

function buildFaqJsonLd(page: PlacedBlock[]): FaqJsonLd | null {
  const questions: FaqJsonLd["mainEntity"] = [];
  const seen = new Set<string>(); // dedupe by normalized question

  for (const block of page) {
    if (block.type !== "faq") continue;

    const faqs = (
      Array.isArray(block.fields?.faqs) ? block.fields.faqs : []
    ) as { question: string; answer: string }[];
    for (const item of faqs) {
      const q = stripUnsafe(normalizeText(item?.question));
      const a = stripUnsafe(normalizeText(item?.answer));
      if (!q || !a) continue;

      const key = q.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      questions.push({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      });
    }
  }

  if (questions.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions,
  };
}
