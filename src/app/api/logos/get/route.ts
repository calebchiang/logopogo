import { NextResponse } from "next/server";
import { getLogos } from "@/lib/logos/getLogos";

export async function GET() {
  try {
    const logos = await getLogos();
    return NextResponse.json({ logos });
  } catch (err: any) {
    const message = err?.message || "Failed to fetch logos";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
