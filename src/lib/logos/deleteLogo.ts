import { createClient } from "@/lib/supabase/server";

export async function deleteLogo(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { data: row, error: fetchErr } = await supabase
    .from("logos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !row) throw new Error("Not found");

  if (row.image_path) {
    const { data: storageData, error: storageErr } = await supabase
      .storage
      .from("logos")
      .remove([row.image_path]);
    console.log("[deleteLogo] storage.remove result:", {
      path: row.image_path,
      data: storageData,
      error: storageErr?.message || null,
    });
    if (storageErr) throw new Error(storageErr.message);
  }

  const { error: dbErr } = await supabase
    .from("logos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  console.log("[deleteLogo] db.delete result:", {
    id,
    error: dbErr?.message || null,
  });

  if (dbErr) throw new Error(dbErr.message);

  return { success: true };
}
