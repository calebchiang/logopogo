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
  console.log('[generateLogos] SYMBOL:', symbol)
  const paletteList = paletteHexes.join(", ");
  console.log('[generateLogos] PALETTE_LIST:', paletteList)

  return [
    `You are a high quality, professional logo generator for tech companies, websites, and apps. Generate a high quality, clean, modern, icon-only logo for the brand "${brand}". The logo must depict: ${symbol}.`,
    description && description.trim()
      ? `BUSINESS CONTEXT (FOR SYMBOLISM ONLY):
- ${description.trim()}
- Use this context only to inform the visual symbolism and shape choices. Do NOT include any text, letters, numbers, slogans, or brand names.`
      : null,
    `
1) If the ${symbol} explicitly names a color for the element it described, use that exact color for those specific elements (e.g. black and white panda).
2) For all other elements in ${symbol} without explicit color instructions, use the default ${paletteList} for color.
3.) If all specified elements in ${symbol} have a color description, then there is no need to use any colors from ${paletteList}`,

    `OUTPUT REQUIREMENTS:
- Return a single centered icon on a fully transparent background (PNG with alpha).
- The canvas background must be 100% transparent (alpha=0). Do NOT fill the canvas with any solid or gradient color.
- No borders, frames, canvases, or mockup surfaces.
- DO NOT include any elements in the logo that is not specified by the ${symbol}`,

    `BACKGROUND ELEMENTS:
- Do not add scenes/backgrounds by default.
- EXCEPTION: If the ${symbol} explicitly requests background elements (e.g., "green bamboo forest in the background"), include them as part of the icon composition while keeping the canvas transparent.`,

    `STYLE CONSTRAINTS:
- Clean, modern, vector-like shapes. No watermarks, signatures, UI chrome, reflections, or photorealism.`,

    `COMPOSITION:
- Center the icon on the canvas with equal padding on all sides.`,

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
