"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type EditorSidebarProps = {
  className?: string;
};

const BRAND_COLORS = ["#0FA968", "#0E8A58", "#0A6E49", "#0A5B3C", "#54E187", "#2FB66E"];
const SOLID_COLORS = [
  "#000000","#4B5563","#6B7280","#9CA3AF","#D1D5DB","#F3F4F6",
  "#00C279","#7ED957","#C5FF66","#68E0E3","#00AEEB","#008AA8","#35A7FF",
  "#6675FF","#0B5FDE","#2716C7","#6A17E6","#A77BFF","#FF6BCB",
  "#FF6B6B","#FF3B30","#FF8C42","#FFE066","#FFB347","#FF6A3D","#9B4D1B",
];

type Panel = "main" | "bg";

const panelVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 16 : -16, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -16 : 16, opacity: 0 }),
};

export default function EditorSidebar({ className = "" }: EditorSidebarProps) {
  const [panel, setPanel] = useState<Panel>("main");
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward
  const [selectedBg, setSelectedBg] = useState<string>("#FFFFFF");

  return (
    <aside
      className={`w-[380px] shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 ${className}`}
    >
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
                <button className="rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700">
                  + Add Text
                </button>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-800 my-4" />

            {/* Typography */}
            <section className="space-y-3">
              <h4 className="text-sm font-medium text-zinc-300">Typography</h4>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-zinc-400">Font</label>
                <select className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm">
                  <option>Inter</option>
                  <option>System UI</option>
                  <option>Roboto</option>
                  <option>Montserrat</option>
                  <option>Poppins</option>
                  <option>DM Sans</option>
                  <option>Space Grotesk</option>
                </select>

                <label className="text-xs text-zinc-400">Size</label>
                <input
                  type="number"
                  min={8}
                  max={300}
                  defaultValue={72}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm hover:bg-zinc-800">
                  B
                </button>
                <button className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm italic hover:bg-zinc-800">
                  I
                </button>
                <button className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm underline hover:bg-zinc-800">
                  U
                </button>
              </div>

              <div className="grid grid-cols-2 items-center gap-2">
                <label className="text-xs text-zinc-400">Text Color</label>
                <input
                  type="color"
                  defaultValue="#000000"
                  className="h-8 w-full rounded-md border border-zinc-700 bg-zinc-900 p-1"
                />
              </div>
            </section>

            <div className="h-px w-full bg-zinc-800 my-4" />

            {/* Background Color */}
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
                  onClick={() => {
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

            {/* Transform */}
            <section className="space-y-3">
              <h4 className="text-sm font-medium text-zinc-300">Transform</h4>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-zinc-400">Rotate</label>
                <input type="range" min={-180} max={180} defaultValue={0} className="w-full" />
                <label className="text-xs text-zinc-400">Opacity</label>
                <input type="range" min={0} max={100} defaultValue={100} className="w-full" />
              </div>
              <div className="flex gap-2">
                <button className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700">
                  Bring Forward
                </button>
                <button className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700">
                  Send Backward
                </button>
              </div>
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
                onClick={() => {
                  setDir(-1);
                  setPanel("main");
                }}
                className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs hover:bg-zinc-700"
              >
                ← Back
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Selected</span>
                <div
                  className="h-5 w-5 rounded-full border border-zinc-700"
                  style={{ backgroundColor: selectedBg }}
                />
              </div>
            </div>

            <h3 className="text-sm font-medium text-zinc-300">Brand colors</h3>
            <div className="mt-2">
              <SwatchRow colors={BRAND_COLORS} selected={selectedBg} onPick={setSelectedBg} />
            </div>

            <div className="my-4 h-px w-full bg-zinc-800" />

            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-300">Default solid colors</h3>
              <button className="text-xs text-zinc-400 hover:text-zinc-200">See all</button>
            </div>
            <SwatchGrid colors={SOLID_COLORS} selected={selectedBg} onPick={setSelectedBg} />
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

function SwatchRow({
  colors,
  selected,
  onPick,
}: {
  colors: string[];
  selected: string;
  onPick: (hex: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {colors.map((c) => (
        <Swatch key={c} color={c} selected={selected === c} onClick={() => onPick(c)} />
      ))}
    </div>
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
    <div className="grid grid-cols-7 gap-2">
      {colors.map((c) => (
        <Swatch key={c} color={c} selected={selected === c} onClick={() => onPick(c)} />
      ))}
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
