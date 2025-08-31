"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Save } from "lucide-react";
import DownloadModal from "@/components/editor/DownloadModal";

type FontOption = { name: string; cssFamily: string };

type EditorSidebarProps = {
  className?: string;
  onAddText: () => void;
  selectedId: string | null;
  bgColor: string;
  onChangeBg: (hex: string) => void;
  textColor: string;
  onChangeTextColor: (hex: string) => void;
  fonts?: FontOption[];
  selectedFontFamily?: string;
  onChangeFont: (cssFamily: string) => void;
  rotationDeg: number;
  opacityPct: number;
  onChangeRotationDeg: (deg: number) => void;
  onChangeOpacityPct: (pct: number) => void;
  onDownload?: (opts: { transparent: boolean }) => void;
  onSave?: () => Promise<void> | void;
};

const SOLID_COLORS = [
  "#000000",
  "#1F2937",
  "#374151",
  "#4B5563",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#E5E7EB",
  "#F3F4F6",
  "#FFFFFF",
  "#111827",
  "#0F172A",
  "#EF4444",
  "#DC2626",
  "#F97316",
  "#FB923C",
  "#F59E0B",
  "#FDE68A",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A78BFA",
  "#EC4899",
  "#F472B6",
  "#F43F5E",
  "#FF6B6B",
  "#FF8C42",
  "#FFE066",
  "#FFB347",
  "#C5FF66",
  "#7ED957",
  "#00C279",
  "#68E0E3",
  "#00AEEB",
  "#008AA8",
  "#35A7FF",
  "#6675FF",
  "#0B5FDE",
  "#2716C7",
  "#6A17E6",
  "#A77BFF",
  "#FF6BCB",
  "#9B4D1B",
];

type Panel = "main" | "bg";

const panelVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 16 : -16, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -16 : 16, opacity: 0 }),
};

function sendFormat(cmd: "bold" | "italic" | "underline") {
  window.dispatchEvent(new CustomEvent("editor-format", { detail: { cmd } }));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function EditorSidebar({
  className = "",
  onAddText,
  selectedId,
  bgColor,
  onChangeBg,
  textColor,
  onChangeTextColor,
  fonts = [],
  selectedFontFamily = "",
  onChangeFont,
  rotationDeg,
  opacityPct,
  onChangeRotationDeg,
  onChangeOpacityPct,
  onDownload,
  onSave,
}: EditorSidebarProps) {
  const [panel, setPanel] = useState<Panel>("main");
  const [dir, setDir] = useState(1);
  const [selectedBg, setSelectedBg] = useState<string>(bgColor);
  const [saving, setSaving] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const canFormat = !!(selectedId && selectedId !== "image");
  const canTransform = !!selectedId;
  const fontValue = canFormat ? selectedFontFamily || "" : "";

  useEffect(() => {
    setSelectedBg(bgColor);
  }, [bgColor]);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <aside className={`w-[380px] shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 ${className}`}>
        <AnimatePresence mode="wait" initial={false}>
          {panel === "main" ? (
            <motion.div
              key="main"
              custom={dir}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="mb-4">
                <h3 className="text-sm font-medium text-zinc-300">Layers & Elements</h3>
                <div className="mt-2 flex gap-2">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onAddText();
                    }}
                    className="rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
                  >
                    + Add Text
                  </button>
                </div>
              </div>

              <div className="h-px w-full bg-zinc-800 my-4" />

              <section className="space-y-3">
                <h4 className="text-sm font-medium text-zinc-300">Typography</h4>

                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-zinc-400">Font</label>
                  <select
                    disabled={!canFormat}
                    value={fontValue}
                    onChange={(e) => onChangeFont(e.target.value)}
                    className={`rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm ${
                      canFormat ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
                    }`}
                    style={{ fontFamily: fontValue || "inherit" }}
                  >
                    <option value="">—</option>
                    {fonts.map((f) => (
                      <option key={f.cssFamily} value={f.cssFamily} style={{ fontFamily: f.cssFamily }}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={!canFormat}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!canFormat) return;
                      sendFormat("bold");
                    }}
                    className={`rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm ${
                      canFormat ? "hover:bg-zinc-800" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    B
                  </button>
                  <button
                    disabled={!canFormat}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!canFormat) return;
                      sendFormat("italic");
                    }}
                    className={`rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm italic ${
                      canFormat ? "hover:bg-zinc-800" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    I
                  </button>
                  <button
                    disabled={!canFormat}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!canFormat) return;
                      sendFormat("underline");
                    }}
                    className={`rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm underline ${
                      canFormat ? "hover:bg-zinc-800" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    U
                  </button>
                </div>

                <div className="grid grid-cols-2 items-center gap-2">
                  <label className="text-xs text-zinc-400">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => onChangeTextColor(e.target.value)}
                    disabled={!canFormat}
                    className={`h-8 w-full rounded-md border border-zinc-700 bg-zinc-900 p-1 ${
                      canFormat ? "" : "opacity-50 cursor-not-allowed"
                    }`}
                  />
                </div>
              </section>

              <div className="h-px w-full bg-zinc-800 my-4" />

              <section className="space-y-3">
                <h4 className="text-sm font-medium text-zinc-300">Background Color</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-6 w-6 rounded-full border border-zinc-700"
                      style={{ backgroundColor: selectedBg }}
                      aria-label="Selected background preview"
                    />
                    <span className="text-xs text-zinc-400">{selectedBg.toUpperCase()}</span>
                  </div>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setDir(1);
                      setPanel("bg");
                    }}
                    className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs hover:bg-zinc-700"
                  >
                    Choose
                  </button>
                </div>
              </section>

              <div className="h-px w-full bg-zinc-800 my-4" />

              <section className="space-y-3">
                <h4 className="text-sm font-medium text-zinc-300">Transform</h4>

                <div className="grid grid-cols-2 items-center gap-2">
                  <label className="text-xs text-zinc-400">Rotate</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={rotationDeg}
                      onChange={(e) => onChangeRotationDeg(clamp(parseInt(e.target.value, 10) || 0, -180, 180))}
                      disabled={!canTransform}
                      className={`w-full ${canTransform ? "" : "opacity-50 cursor-not-allowed"}`}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      min={-180}
                      max={180}
                      step={1}
                      value={rotationDeg}
                      onChange={(e) => onChangeRotationDeg(clamp(parseInt(e.target.value, 10) || 0, -180, 180))}
                      disabled={!canTransform}
                      className={`w-16 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200 ${
                        canTransform ? "" : "opacity-50 cursor-not-allowed"
                      }`}
                    />
                  </div>

                  <label className="text-xs text-zinc-400">Opacity</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={opacityPct}
                      onChange={(e) => onChangeOpacityPct(clamp(parseInt(e.target.value, 10) || 0, 0, 100))}
                      disabled={!canTransform}
                      className={`w-full ${canTransform ? "" : "opacity-50 cursor-not-allowed"}`}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={100}
                      step={1}
                      value={opacityPct}
                      onChange={(e) => onChangeOpacityPct(clamp(parseInt(e.target.value, 10) || 0, 0, 100))}
                      disabled={!canTransform}
                      className={`w-16 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200 ${
                        canTransform ? "" : "opacity-50 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>
              </section>

              <div className="h-px w-full bg-zinc-800 my-4" />

              <section className="grid grid-cols-2 gap-2">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm font-medium text-white"
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving…" : "Save"}
                </button>

                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDownloadOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-medium text-white"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="bg"
              custom={dir}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDir(-1);
                    setPanel("main");
                  }}
                  className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs hover:bg-zinc-700"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Selected</span>
                  <div className="h-5 w-5 rounded-full border border-zinc-700" style={{ backgroundColor: selectedBg }} />
                </div>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-300">Default solid colors</h3>
              </div>
              <SwatchGrid
                colors={SOLID_COLORS}
                selected={selectedBg}
                onPick={(hex) => {
                  setSelectedBg(hex);
                  onChangeBg(hex);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      <DownloadModal
        open={downloadOpen}
        onOpenChange={setDownloadOpen}
        onDownload={(opts) => onDownload?.(opts)}
      />
    </>
  );
}

function SwatchGrid({
  colors,
  selected,
  onPick,
}: {
  colors: string[];
  selected: string;
  onPick: (hex: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {colors.map((c) => (
        <Swatch key={c} color={c} selected={selected === c} onClick={() => onPick(c)} />
      ))}
      <ColorPickerSwatch onPick={onPick} />
    </div>
  );
}

function Swatch({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Choose ${color}`}
      onClick={onClick}
      className={`h-8 w-8 rounded-full border transition-shadow ${
        selected ? "ring-2 ring-blue-500 border-zinc-700" : "border-zinc-700"
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

function ColorPickerSwatch({ onPick }: { onPick: (hex: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <button
        type="button"
        aria-label="Open color picker"
        onClick={() => inputRef.current?.click()}
        className="h-8 w-8 rounded-full border border-zinc-700 flex items-center justify-center"
        style={{
          background:
            "conic-gradient(from 0deg, red, orange, yellow, lime, aqua, blue, magenta, red)",
        }}
      >
        <span className="text-white text-sm leading-none select-none">+</span>
      </button>
      <input
        ref={inputRef}
        type="color"
        className="hidden"
        onChange={(e) => {
          if (e.target.value) onPick(e.target.value);
        }}
      />
    </>
  );
}
