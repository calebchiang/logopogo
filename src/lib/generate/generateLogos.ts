import OpenAI from "openai";

export type GenerateLogosArgs = {
  brand: string;
  symbol: string;
  palette: string[] | string;
  description?: string; 
};

export type GenerateLogosResult = {
  imagesB64: string[];
  model: string;
  usedPrompt: string;
};

const MODEL = "gpt-image-1";

function normalizePalette(palette: GenerateLogosArgs["palette"]): string[] {
  const arr = Array.isArray(palette)
    ? palette
    : palette.split(",").map((c) => c.trim());
  return arr.filter((hex) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex));
}

function buildPrompt(
  brand: string,
  symbol: string,
  paletteHexes: string[],
  description?: string
) {
  const paletteList = paletteHexes.join(", ");

  return [
    `You are a high quality, professional logo generator for tech companies, websites, and apps. Generate high quality, clean, modern, icon-only logo for the brand "${brand}". The logo must depict: ${symbol}.`,
    description && description.trim()
      ? `BUSINESS CONTEXT (FOR SYMBOLISM ONLY):
- ${description.trim()}
- Use this context only to inform the visual symbolism and shape choices. Do NOT include any text, letters, numbers, slogans, or brand names.`
      : null,

    `OUTPUT REQUIREMENTS:
- Return a single centered icon on a fully transparent background (PNG with alpha). 
- The canvas background must be 100% transparent (alpha=0). Do NOT use white, off-white, or any solid/gradient background. 
- No borders, frames, canvases, or background shapes of any kind.`,

    `COLOR POLICY (STRICT):
- Use ONLY these HEX colors for all visible pixels: ${paletteList}.
- Use 1–2 colors from the provided palette maximum (solid fills only).`,

    `STYLE CONSTRAINTS:
- No watermarks, signatures, UI chrome, mockups, or reflections.`,

    `COMPOSITION:
- Center the icon on the canvas with equal padding on all sides.`,

    `ABSOLUTE TEXT BAN:
- Do NOT include text, letters, numbers, symbols, monograms, or typographic marks.`,

    `NEGATIVE PROMPT (STRICT EXCLUSIONS):
no text, no letters, no numbers, no typography, no words, no monograms, no shadows, no glows, no photorealism, no noise, no dithering,
no backgrounds, no scenes, no frames, no borders, no mockups, no reflections,
no semi-transparent fills (alpha<255).`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function generateLogos({
  brand,
  symbol,
  palette,
  description,
}: GenerateLogosArgs): Promise<GenerateLogosResult> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const paletteHexes = normalizePalette(palette);
  if (!paletteHexes.length) {
    throw new Error("Palette must include at least one valid hex color.");
  }
  if (!brand?.trim()) throw new Error("Brand is required.");
  if (!symbol?.trim()) throw new Error("Symbol description is required.");

  const usedPrompt = buildPrompt(
    brand.trim(),
    symbol.trim(),
    paletteHexes,
    description
  );

  const n = 4;

  const result = await openai.images.generate({
    model: MODEL,
    prompt: usedPrompt,
    size: "1024x1024",
    n,
  });

  const imagesB64 = (result.data ?? [])
    .map((d) => d.b64_json || "")
    .filter((b64): b64 is string => !!b64);

  return {
    imagesB64,
    model: MODEL,
    usedPrompt,
  };
}
