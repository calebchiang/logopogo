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
      .select("*")
      .eq("id", id)
      .single();

    if (error || !logo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("logos")
      .getPublicUrl(logo.image_path);

    const url = publicUrlData?.publicUrl || null;

    return NextResponse.json({ logo, url });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to fetch logo" },
      { status: 500 }
    );
  }
}
