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
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const { data: pu } = supabase.storage.from("logos").getPublicUrl(row.image_path);
    return { ...row, url: pu?.publicUrl as string };
  });
}
