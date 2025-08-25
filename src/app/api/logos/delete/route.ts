import { NextResponse } from "next/server";
import { deleteLogo } from "@/lib/logos/deleteLogo";

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await deleteLogo(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const msg = err?.message || "Failed to delete logo";
    const status =
      msg === "Unauthorized" ? 401 :
      msg === "Not found" ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
