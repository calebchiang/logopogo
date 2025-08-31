import { createClient } from "@/lib/supabase/server";

export async function getLogos() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("logos")
    .select("id, brand_name, image_path, preview_path, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false }); // most recently edited first

  if (error) throw error;

  const toPublicUrl = (bucket: string, path?: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  };

  return (data ?? []).map((row) => {
    const original_url = toPublicUrl("logos", row.image_path);

    const preview_base = toPublicUrl("logo-previews", row.preview_path);
    const v = row.updated_at ? `?v=${encodeURIComponent(row.updated_at)}` : "";
    const preview_url = preview_base ? `${preview_base}${v}` : null;

    return {
      id: row.id,
      brand_name: row.brand_name,
      created_at: row.created_at,
      updated_at: row.updated_at,
      image_path: row.image_path,
      preview_path: row.preview_path,
      url: preview_url ?? original_url ?? "", 
    };
  });
}
