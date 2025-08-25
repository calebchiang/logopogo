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
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { brand, description, symbol, palette } = body ?? {};
    console.log("Incoming body:", body);

    const { imagesB64, model, usedPrompt } = await generateLogos({
      brand,
      description,
      symbol,
      palette,
    });
    console.log("Generated images:", imagesB64.length);

    const uploaded: any[] = [];
    for (const b64 of imagesB64) {
      try {
        const buffer = Buffer.from(b64, "base64");
        const filePath = `${user.id}/${crypto.randomUUID()}.png`;
        console.log("Uploading file:", filePath, "size:", buffer.length);

        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(filePath, buffer, { contentType: "image/png" });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        const { data: inserted, error: insertError } = await supabase
          .from("logos")
          .insert({
            user_id: user.id,
            brand_name: brand,
            symbol_description: symbol,
            palette: Array.isArray(palette) ? palette : [palette],
            business_description: description,
            image_path: filePath,
          })
          .select()
          .single();

        if (insertError) {
          console.error("DB insert error:", insertError);
          continue;
        }

        if (inserted) {
          const { data: { publicUrl } } = supabase
            .storage
            .from("logos")
            .getPublicUrl(filePath);
          console.log("Saved logo:", publicUrl);
          uploaded.push({ ...inserted, url: publicUrl });
        }
      } catch (innerErr: any) {
        console.error("Error in logo loop:", innerErr);
      }
    }

    console.log("Final uploaded count:", uploaded.length);

    return NextResponse.json({
      model,
      prompt: usedPrompt,
      logos: uploaded,
    });
  } catch (err: any) {
    console.error("Route error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Generation failed" },
      { status: 400 }
    );
  }
}
