import { NextResponse } from "next/server";
import { generateLogos } from "@/lib/generate/generateLogos";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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
