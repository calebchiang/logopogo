import { createClient } from "@/lib/supabase/server";

type Args = { logoId: string; previewDataUrl: string; editorState?: any };

export async function saveLogo({ logoId, previewDataUrl, editorState }: Args) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { data: row, error: fetchErr } = await supabase
    .from("logos")
    .select("id,user_id,preview_path")
    .eq("id", logoId)
    .eq("user_id", user.id)
    .single();
  if (fetchErr || !row) throw new Error("Not found");

  const m = /^data:image\/png;base64,(.+)$/i.exec(previewDataUrl);
  if (!m) throw new Error("Invalid previewDataUrl");
  const buffer = Buffer.from(m[1], "base64");

  const previewPath =
    row.preview_path && row.preview_path.startsWith(`${user.id}/`)
      ? row.preview_path
      : `${user.id}/${logoId}.png`;

  const { error: uploadErr } = await supabase.storage
    .from("logo-previews")
    .upload(previewPath, buffer, {
      upsert: true,
      contentType: "image/png",
      cacheControl: "31536000, immutable",
    });
  if (uploadErr) throw new Error(uploadErr.message);

  const nowIso = new Date().toISOString();
  const update: Record<string, any> = {
    preview_path: previewPath,
    updated_at: nowIso, // bump to change ?v= and bust cache
  };
  if (typeof editorState !== "undefined") update.editor_state_json = editorState;

  const { data: updated, error: dbErr } = await supabase
    .from("logos")
    .update(update)
    .eq("id", logoId)
    .eq("user_id", user.id)
    .select("updated_at")
    .single();
  if (dbErr) throw new Error(dbErr.message);

  const { data: pub } = supabase.storage.from("logo-previews").getPublicUrl(previewPath);
  const v = updated?.updated_at ? `?v=${encodeURIComponent(updated.updated_at as string)}` : "";
  const preview_url = `${pub.publicUrl}${v}`;

  return { preview_url, updated_at: updated?.updated_at ?? null };
}
