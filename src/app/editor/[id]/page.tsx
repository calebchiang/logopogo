"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Editor from "@/components/editor/Editor";
import EditorSidebar from "@/components/editor/EditorSidebar";
import { FONTS } from "@/lib/fonts";

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

export type TextLayer = {
  id: string;
  text: string;
  html?: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number; // 0..1
};

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState<LogoRow | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>("image");
  const [bgColor, setBgColor] = useState<string>("#FFFFFF");

  // Image transforms controlled here so sidebar can edit them
  const [imageRotation, setImageRotation] = useState<number>(0); // degrees
  const [imageOpacity, setImageOpacity] = useState<number>(1);   // 0..1

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

  const onAddText = () => {
    const newId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const layer: TextLayer = {
      id: newId,
      text: "Text Box",
      html: "Text Box",
      fontFamily: "Inter",
      fontSize: 72,
      color: "#000000",
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    };

    setTextLayers((prev) => [...prev, layer]);
    setSelectedId(newId);
  };

  const onChangeText = (id: string, patch: Partial<Omit<TextLayer, "id">>) => {
    setTextLayers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const onReposition = (
    id: string,
    patch: Partial<Pick<TextLayer, "x" | "y" | "rotation" | "scaleX" | "scaleY">>
  ) => {
    setTextLayers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const onSelect = (id: string | null) => {
    setSelectedId(id);
  };

  // ---- Selection-aware derived values ----
  const selectedText = textLayers.find((t) => t.id === selectedId) || null;
  const textColor = selectedText?.color ?? "#000000";
  const selectedFontFamily = selectedText?.fontFamily ?? FONTS?.[0]?.cssFamily ?? "Inter";

  // Rotation (deg) + Opacity (%) for the sidebar controls
  const rotationDeg =
    selectedId === "image" ? imageRotation : (selectedText?.rotation ?? 0);
  const opacityPct =
    selectedId === "image"
      ? Math.round((imageOpacity ?? 1) * 100)
      : Math.round((selectedText?.opacity ?? 1) * 100);

  // ---- Handlers wired to sidebar ----
  const onChangeTextColor = (hex: string) => {
    if (!selectedId || selectedId === "image") return;
    onChangeText(selectedId, { color: hex });
  };

  const onChangeFont = (cssFamily: string) => {
    if (!selectedId || selectedId === "image") return;
    onChangeText(selectedId, { fontFamily: cssFamily });
  };

  const onChangeRotationDeg = (deg: number) => {
    if (!selectedId) return;
    if (selectedId === "image") {
      setImageRotation(deg);
    } else {
      onChangeText(selectedId, { rotation: deg });
    }
  };

  const onChangeOpacityPct = (pct: number) => {
    const clamped = Math.max(0, Math.min(100, pct));
    const value01 = clamped / 100;
    if (!selectedId) return;
    if (selectedId === "image") {
      setImageOpacity(value01);
    } else {
      onChangeText(selectedId, { opacity: value01 });
    }
  };

  if (loading) {
    return (
      <main className="p-6">
        <div className="mx-auto flex w-full max-w-6xl justify-center">
          <div className="shrink-0">
            <div className="rounded-lg overflow-hidden">
              <div className="h-[520px] w-[520px] sm:h-[560px] sm:w-[560px] md:h-[600px] md:w-[600px] bg-zinc-900/40 animate-pulse rounded-lg" />
            </div>
          </div>
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
            textLayers={textLayers}
            selectedId={selectedId}
            onSelect={onSelect}
            onReposition={onReposition}
            onChangeText={onChangeText}
            bgColor={bgColor}
            imageRotation={imageRotation}
            imageOpacity={imageOpacity}
          />
        </div>
        <EditorSidebar
          className=""
          onAddText={onAddText}
          selectedId={selectedId}
          bgColor={bgColor}
          onChangeBg={setBgColor}
          textColor={textColor}
          onChangeTextColor={onChangeTextColor}
          fonts={FONTS}
          selectedFontFamily={selectedFontFamily}
          onChangeFont={onChangeFont}
          rotationDeg={rotationDeg}
          opacityPct={opacityPct}
          onChangeRotationDeg={onChangeRotationDeg}
          onChangeOpacityPct={onChangeOpacityPct}
        />
      </div>
    </main>
  );
}
