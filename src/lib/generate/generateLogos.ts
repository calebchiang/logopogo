import OpenAI from "openai";

export type GenerateLogosArgs = {
  brand: string;
  symbol: string;
  description?: string;
};

export type GenerateLogosResult = {
  imagesB64: string[];
  model: string;
  usedPrompt: string;
};

const MODEL = "gpt-image-1";

function buildPrompt(brand: string, symbol: string, description?: string) {
  return [
    `You are a high-quality, professional logo generator for tech companies, websites, and apps.
Generate a clean, modern, icon-only logo for the brand "${brand}".
The logo must depict: ${symbol}.`,

    description && description.trim()
      ? `BUSINESS CONTEXT (FOR SYMBOLISM ONLY):
- ${description.trim()}
- Use this ONLY to inform shapes and symbolism. Do NOT include any text, letters, numbers, slogans, or brand names.`
      : null,

    `COLOR RULES:
- If the symbol description explicitly names colors for any element, use those exact colors for those elements.
- If colors are not specified, choose a tasteful minimal palette (monochrome or duotone) with strong contrast that works on both light and dark backgrounds.
- Avoid gradients unless explicitly requested. Prefer solid fills and simple strokes.`,

    `OUTPUT REQUIREMENTS:
- Return a single centered icon on a fully transparent background (PNG with alpha=0).
- No borders, frames, canvases, mockups, or extra UI elements.
- Include ONLY elements specified by the symbol description.`,

    `BACKGROUND ELEMENTS:
- Do not add backgrounds by default.
- EXCEPTION: If the symbol explicitly requests background elements, include them while keeping the canvas transparent.`,

    `STYLE CONSTRAINTS:
- Clean, modern, vector-like shapes. No photorealism, watermarks, signatures, or UI chrome.`,

    `COMPOSITION:
- Center the icon with even padding on all sides.`,

    `ABSOLUTE TEXT BAN:
- Do NOT include text, letters, numbers, monograms, or typographic marks.`,

    `NEGATIVE PROMPT:
no text, no letters, no numbers, no typography, no words, no monograms, no mockups.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function generateLogos({
  brand,
  symbol,
  description,
}: GenerateLogosArgs): Promise<GenerateLogosResult> {
  if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
  if (!brand?.trim()) throw new Error("Brand is required.");
  if (!symbol?.trim()) throw new Error("Symbol description is required.");

  const usedPrompt = buildPrompt(brand.trim(), symbol.trim(), description);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const result = await openai.images.generate({
    model: MODEL,
    prompt: usedPrompt,
    size: "1024x1024",
    n: 1,
  });

  const imagesB64 = (result.data ?? [])
    .map((d) => d.b64_json || "")
    .filter((b64): b64 is string => !!b64);

  if (!imagesB64.length) {
    throw new Error("No image returned from generator");
  }

  return {
    imagesB64,
    model: MODEL,
    usedPrompt,
  };
}
