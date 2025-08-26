"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Editor from "@/components/editor/Editor";
import EditorSidebar from "@/components/editor/EditorSidebar";

type LogoRow = {
  id: string;
  user_id: string;
  brand_name?: string | null;
  symbol_description?: string | null;
  palette?: string[] | null;
  business_description?: string | null;
  image_path: string;
  created_at?: string | null;
};

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState<LogoRow | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/logos/get-one?id=${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        if (res.status === 401) {
          setError("Please sign in to view this logo.");
          setLogo(null);
          setUrl(null);
          return;
        }
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as { logo: LogoRow; url: string | null };
        if (!mounted) return;
        setLogo(json.logo);
        setUrl(json.url || null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load logo");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="p-6">
        <div className="mx-auto flex w-full max-w-6xl justify-center">
          {/* Editor skeleton (square canvas) */}
          <div className="shrink-0">
            <div className="rounded-lg overflow-hidden">
              <div className="h-[520px] w-[520px] sm:h-[560px] sm:w-[560px] md:h-[600px] md:w-[600px] bg-zinc-900/40 animate-pulse rounded-lg" />
            </div>
          </div>

          {/* Sidebar skeleton (attached, same width as real sidebar) */}
          <div className="w-[380px] shrink-0 border border-zinc-800 rounded-lg bg-zinc-900/30 p-4">
            <div className="h-5 w-40 bg-zinc-900/40 rounded animate-pulse" />
            <div className="mt-3 flex gap-2">
              <div className="h-9 w-28 bg-zinc-900/40 rounded-md animate-pulse" />
            </div>

            <div className="my-4 h-px w-full bg-zinc-800" />

            <div>
              <div className="h-4 w-28 bg-zinc-900/40 rounded animate-pulse" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="h-8 bg-zinc-900/40 rounded animate-pulse col-span-1" />
                <div className="h-8 bg-zinc-900/40 rounded animate-pulse col-span-1" />
                <div className="h-8 bg-zinc-900/40 rounded animate-pulse col-span-1" />
                <div className="h-8 bg-zinc-900/40 rounded animate-pulse col-span-1" />
              </div>
              <div className="mt-3 flex gap-2">
                <div className="h-8 w-8 bg-zinc-900/40 rounded-md animate-pulse" />
                <div className="h-8 w-8 bg-zinc-900/40 rounded-md animate-pulse" />
                <div className="h-8 w-8 bg-zinc-900/40 rounded-md animate-pulse" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="h-8 bg-zinc-900/40 rounded animate-pulse" />
                <div className="h-8 bg-zinc-900/40 rounded animate-pulse" />
              </div>
            </div>

            <div className="my-4 h-px w-full bg-zinc-800" />

            {/* Background Color skeleton */}
            <div>
              <div className="h-4 w-36 bg-zinc-900/40 rounded animate-pulse" />
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-zinc-900/40 animate-pulse" />
                  <div className="h-4 w-24 bg-zinc-900/40 rounded animate-pulse" />
                </div>
                <div className="h-7 w-16 bg-zinc-900/40 rounded-md animate-pulse" />
              </div>
            </div>

            <div className="my-4 h-px w-full bg-zinc-800" />

            {/* Transform skeleton */}
            <div>
              <div className="h-4 w-24 bg-zinc-900/40 rounded animate-pulse" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="h-5 bg-zinc-900/40 rounded animate-pulse" />
                <div className="h-5 bg-zinc-900/40 rounded animate-pulse" />
                <div className="h-5 bg-zinc-900/40 rounded animate-pulse col-span-2" />
                <div className="h-5 bg-zinc-900/40 rounded animate-pulse" />
                <div className="h-5 bg-zinc-900/40 rounded animate-pulse col-span-2" />
              </div>
              <div className="mt-3 flex gap-2">
                <div className="h-9 w-full bg-zinc-900/40 rounded-md animate-pulse" />
                <div className="h-9 w-full bg-zinc-900/40 rounded-md animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !logo) {
    return <div className="p-8 text-red-500">{error || "Logo not found"}</div>;
  }

  return (
    <main className="p-6">
      <div className="mx-auto flex w-full max-w-6xl justify-center">
        <div className="shrink-0 overflow-hidden">
          <Editor
            logoId={logo.id}
            imageUrl={url || ""}
            brandName={logo.brand_name || undefined}
          />
        </div>
        <EditorSidebar />
      </div>
    </main>
  );
}
