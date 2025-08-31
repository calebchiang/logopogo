import { NextResponse } from "next/server";
import { saveLogo } from "@/lib/logos/saveLogo";

export async function POST(req: Request) {
  try {
    const { logoId, previewDataUrl, editorState } = await req.json();
    if (!logoId || !previewDataUrl) {
      return NextResponse.json({ error: "Missing logoId or previewDataUrl" }, { status: 400 });
    }
    const result = await saveLogo({ logoId, previewDataUrl, editorState });
    return NextResponse.json(result);
  } catch (err: any) {
    const msg = err?.message || "Failed to save logo";
    const status = msg === "Unauthorized" ? 401 : msg === "Not found" ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
