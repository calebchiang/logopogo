import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { data: logo, error } = await supabase
      .from("logos")
      .select(
        "id,user_id,brand_name,symbol_description,palette,business_description,image_path,preview_path,editor_state_json,created_at,updated_at"
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !logo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: iconUrlData } = supabase.storage
      .from("logos")
      .getPublicUrl(logo.image_path || "");

    let preview_url: string | null = null;
    if (logo.preview_path) {
      const { data: prevUrlData } = supabase.storage
        .from("logo-previews")
        .getPublicUrl(logo.preview_path);
      const v = logo.updated_at ? `?v=${encodeURIComponent(logo.updated_at as string)}` : "";
      preview_url = prevUrlData?.publicUrl ? `${prevUrlData.publicUrl}${v}` : null;
    }

    const editorState =
      logo.editor_state_json ??
      {
        v: 1,
        bgColor: "#FFFFFF",
        image: { rotation: 0, opacity: 1 },
        textLayers: [],
      };

    const url = iconUrlData?.publicUrl || null;

    return NextResponse.json({ logo, url, preview_url, editorState });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to fetch logo" },
      { status: 500 }
    );
  }
}
