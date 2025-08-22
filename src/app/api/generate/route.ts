import { NextResponse } from "next/server";
import { generateLogos } from "@/lib/generate/generateLogos";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { brand, description, symbol, palette } = body ?? {};

    const { imagesB64, model, usedPrompt } = await generateLogos({
      brand,
      description,
      symbol,
      palette, 
    });

    return NextResponse.json({
      model,
      prompt: usedPrompt,
      images: imagesB64,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Generation failed" },
      { status: 400 }
    );
  }
}
