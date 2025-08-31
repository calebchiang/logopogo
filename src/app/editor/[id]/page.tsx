"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor, { EditorHandle } from "@/components/editor/Editor";
import EditorSidebar from "@/components/editor/EditorSidebar";
import SaveModal from "@/components/editor/SaveModal";
import { FONTS } from "@/lib/fonts";

type LogoRow = {
  id: string;
  user_id: string;
  brand_name?: string | null;
  symbol_description?: string | null;
  palette?: string[] | null;
  business_description?: string | null;
  image_path: string;
  preview_path?: string | null;
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
  opacity: number;
};

type EditorState = {
  v: number;
  bgColor: string;
  image: {
    rotation: number;
    opacity: number;
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
  };
  textLayers: Array<{
    id: string;
    text: string;
    html?: string | null;
    fontFamily: string;
    fontSize: number;
    color: string;
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    opacity: number;
  }>;
};

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState<LogoRow | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>("image");
  const [bgColor, setBgColor] = useState<string>("#FFFFFF");
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [imageOpacity, setImageOpacity] = useState<number>(1);
  const [imageX, setImageX] = useState<number | undefined>(undefined);
  const [imageY, setImageY] = useState<number | undefined>(undefined);
  const [imageScaleX, setImageScaleX] = useState<number | undefined>(undefined);
  const [imageScaleY, setImageScaleY] = useState<number | undefined>(undefined);

  const editorRef = useRef<EditorHandle | null>(null);

  const initialStateRef = useRef<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const hydrateFromState = (st: EditorState | null | undefined) => {
      if (!st || typeof st !== "object") return;
      if (typeof st.bgColor === "string") setBgColor(st.bgColor);
      if (st.image) {
        if (typeof st.image.rotation === "number") setImageRotation(st.image.rotation);
        if (typeof st.image.opacity === "number") setImageOpacity(st.image.opacity);
        if (typeof st.image.x === "number") setImageX(st.image.x);
        if (typeof st.image.y === "number") setImageY(st.image.y);
        if (typeof st.image.scaleX === "number") setImageScaleX(st.image.scaleX);
        if (typeof st.image.scaleY === "number") setImageScaleY(st.image.scaleY);
      }
      if (Array.isArray(st.textLayers)) {
        const layers: TextLayer[] = st.textLayers.map((t) => ({
          id: t.id,
          text: t.text ?? "",
          html: t.html ?? t.text ?? "",
          fontFamily: t.fontFamily ?? "Inter",
          fontSize: typeof t.fontSize === "number" ? t.fontSize : 72,
          color: t.color ?? "#000000",
          x: typeof t.x === "number" ? t.x : 0,
          y: typeof t.y === "number" ? t.y : 0,
          rotation: typeof t.rotation === "number" ? t.rotation : 0,
          scaleX: typeof t.scaleX === "number" ? t.scaleX : 1,
          scaleY: typeof t.scaleY === "number" ? t.scaleY : 1,
          opacity: typeof t.opacity === "number" ? t.opacity : 1,
        }));
        setTextLayers(layers);
      }
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/logos/get-one?id=${encodeURIComponent(id)}`, { cache: "no-store" });
        if (res.status === 401) {
          if (!mounted) return;
          setError("Please sign in to view this logo.");
          setLogo(null);
          setUrl(null);
          return;
        }
        if (!res.ok) throw new Error(await res.text());

        const json = (await res.json()) as {
          logo: LogoRow;
          url: string | null;
          preview_url?: string | null;
          editorState?: EditorState | null;
        };

        if (!mounted) return;
        setLogo(json.logo);
        setUrl(json.url || null);
        hydrateFromState(json.editorState);
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

  const onSelect = (id: string | null) => setSelectedId(id);

  const selectedText = textLayers.find((t) => t.id === selectedId) || null;
  const textColor = selectedText?.color ?? "#000000";
  const selectedFontFamily = selectedText?.fontFamily ?? FONTS?.[0]?.cssFamily ?? "Inter";

  const rotationDeg = selectedId === "image" ? imageRotation : selectedText?.rotation ?? 0;
  const opacityPct =
    selectedId === "image"
      ? Math.round((imageOpacity ?? 1) * 100)
      : Math.round((selectedText?.opacity ?? 1) * 100);

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
    if (selectedId === "image") setImageRotation(deg);
    else onChangeText(selectedId, { rotation: deg });
  };

  const onChangeOpacityPct = (pct: number) => {
    const clamped = Math.max(0, Math.min(100, pct));
    const value01 = clamped / 100;
    if (!selectedId) return;
    if (selectedId === "image") setImageOpacity(value01);
    else onChangeText(selectedId, { opacity: value01 });
  };

  const buildEditorState = (): EditorState =>
    ({
      v: 1,
      bgColor,
      image: {
        rotation: imageRotation,
        opacity: imageOpacity,
        x: imageX,
        y: imageY,
        scaleX: imageScaleX,
        scaleY: imageScaleY,
      },
      textLayers: textLayers.map((t) => ({
        id: t.id,
        text: t.text,
        html: t.html ?? null,
        fontFamily: t.fontFamily,
        fontSize: t.fontSize,
        color: t.color,
        x: t.x,
        y: t.y,
        rotation: t.rotation,
        scaleX: t.scaleX,
        scaleY: t.scaleY,
        opacity: t.opacity,
      })),
    } as EditorState);

  const currentStateJSON = useMemo(() => JSON.stringify(buildEditorState()), [
    bgColor,
    textLayers,
    imageRotation,
    imageOpacity,
    imageX,
    imageY,
    imageScaleX,
    imageScaleY,
  ]);

  useEffect(() => {
    if (!logo) return;
    if (initialStateRef.current === null) {
      initialStateRef.current = currentStateJSON;
      setDirty(false);
    } else {
      setDirty(currentStateJSON !== initialStateRef.current);
    }
  }, [currentStateJSON, logo]);

  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!dirty) return;
      const el = e.target as HTMLElement | null;
      if (!el) return;
      const a = el.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      if (a.getAttribute("target") === "_blank") return;
      if (href.startsWith("#")) return;
      e.preventDefault();
      setPendingHref(href);
      setSaveOpen(true);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [dirty]);

  const saveNow = async () => {
    if (!logo) throw new Error("No logo");
    const uri = await editorRef.current?.capturePreview();
    if (!uri) throw new Error("Nothing to save");
    const editorState = JSON.parse(currentStateJSON) as EditorState;
    const res = await fetch("/api/logos/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoId: logo.id, previewDataUrl: uri, editorState }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || "Failed to save");
    }
    initialStateRef.current = currentStateJSON;
    setDirty(false);
  };

  const onDownload = async ({ transparent }: { transparent: boolean }) => {
    const uri = await editorRef.current?.captureDownload({ transparent });
    if (!uri) return;
    const a = document.createElement("a");
    a.href = uri;
    const rawName = (logo?.brand_name ?? "logo").trim() || "logo";
    const safeName = rawName.replace(/[^a-z0-9 _-]/gi, "").replace(/\s+/g, "-");
    a.download = `${safeName}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
            ref={editorRef}
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
            imageX={imageX}
            imageY={imageY}
            imageScaleX={imageScaleX}
            imageScaleY={imageScaleY}
            onImageTransform={(patch) => {
              if (typeof patch.x === "number") setImageX(patch.x);
              if (typeof patch.y === "number") setImageY(patch.y);
              if (typeof patch.scaleX === "number") setImageScaleX(patch.scaleX);
              if (typeof patch.scaleY === "number") setImageScaleY(patch.scaleY);
            }}
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
          onDownload={onDownload}
          onSave={saveNow}
        />
      </div>

      <SaveModal
        open={saveOpen}
        onOpenChange={setSaveOpen}
        onSave={saveNow}
        confirmHref={pendingHref}
      />
    </main>
  );
}
