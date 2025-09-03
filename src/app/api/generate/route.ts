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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to fetch profile/credits" },
        { status: 400 }
      );
    }
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if ((profile.credits ?? 0) < 1) {
      return NextResponse.json(
        { error: "Not enough credits", code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }

    const body = await req.json();
    const { brand, description, symbol } = body ?? {};

    const { imagesB64, model, usedPrompt } = await generateLogos({
      brand,
      description,
      symbol,
    });

    const uploaded: any[] = [];
    for (const b64 of imagesB64) {
      try {
        const buffer = Buffer.from(b64, "base64");
        const filePath = `${user.id}/${crypto.randomUUID()}.png`;

        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(filePath, buffer, { contentType: "image/png" });

        if (uploadError) {
          continue;
        }

        const { data: inserted, error: insertError } = await supabase
          .from("logos")
          .insert({
            user_id: user.id,
            brand_name: brand,
            symbol_description: symbol,
            business_description: description,
            image_path: filePath,
          })
          .select()
          .single();

        if (insertError) {
          continue;
        }

        if (inserted) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("logos").getPublicUrl(filePath);
          uploaded.push({ ...inserted, url: publicUrl });
        }
      } catch {}
    }

    let remainingCredits = profile.credits;
    if (uploaded.length > 0) {
      const { data: updated, error: decError } = await supabase
        .from("profiles")
        .update({ credits: (profile.credits ?? 0) - 1 })
        .eq("user_id", user.id)
        .select("credits")
        .single();

      if (!decError && updated) {
        remainingCredits = updated.credits ?? remainingCredits - 1;
      }
    }

    return NextResponse.json({
      model,
      prompt: usedPrompt,
      logos: uploaded,
      remainingCredits,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Generation failed" },
      { status: 400 }
    );
  }
}
