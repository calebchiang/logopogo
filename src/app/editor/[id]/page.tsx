import { createClient } from "@/lib/supabase/server"

type RouteParams = { id: string }

export default async function EditorPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: logo, error } = await supabase
    .from("logos")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !logo) {
    return <div className="p-8 text-red-500">Logo not found</div>
  }

  const { data: publicUrlData } = supabase.storage
    .from("logos")
    .getPublicUrl(logo.image_path)

  const url = publicUrlData?.publicUrl

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Editor for {logo.brand_name}</h1>
      {url ? (
        <img src={url} alt={logo.brand_name ?? "Logo"} className="max-w-md border rounded-lg" />
      ) : (
        <p className="text-red-500">No image found</p>
      )}
    </div>
  )
}
