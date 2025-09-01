"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Text as KonvaText, Line } from "react-konva";
import useImage from "use-image";

type TextLayer = {
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
  opacity?: number;
};

type Props = {
  logoId: string;
  imageUrl: string;
  brandName?: string | null;
  textLayers: TextLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onReposition: (
    id: string,
    patch: Partial<Pick<TextLayer, "x" | "y" | "rotation" | "scaleX" | "scaleY">>
  ) => void;
  onChangeText: (id: string, patch: Partial<Omit<TextLayer, "id">>) => void;
  bgColor: string;
  imageRotation: number;
  imageOpacity: number;
  imageX?: number;
  imageY?: number;
  imageScaleX?: number;
  imageScaleY?: number;
  onImageTransform?: (patch: Partial<{ x: number; y: number; scaleX: number; scaleY: number }>) => void;
};

export type EditorHandle = {
  capturePreview: (opts?: { transparent?: boolean }) => Promise<string | null>;
  captureDownload: (opts?: { transparent?: boolean }) => Promise<string | null>;
};

export default forwardRef<EditorHandle, Props>(function Editor(
  {
    logoId,
    imageUrl,
    brandName,
    textLayers,
    selectedId,
    onSelect,
    onReposition,
    onChangeText,
    bgColor,
    imageRotation,
    imageOpacity,
    imageX,
    imageY,
    imageScaleX,
    imageScaleY,
    onImageTransform,
  }: Props,
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<any>(null);
  const bgRectRef = useRef<any>(null);
  const imageNodeRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const textNodeRefs = useRef<Record<string, any>>({});
  const [stageSize, setStageSize] = useState({ w: 600, h: 600 });
  const [img, imgStatus] = useImage(imageUrl, "anonymous");

  const [imgState, setImgState] = useState({
    x: typeof imageX === "number" ? imageX : 0,
    y: typeof imageY === "number" ? imageY : 0,
    scaleX: typeof imageScaleX === "number" ? imageScaleX : 1,
    scaleY: typeof imageScaleY === "number" ? imageScaleY : 1,
  });

  const [textDims, setTextDims] = useState<Record<string, { w: number; h: number }>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const editableRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const [showVGuide, setShowVGuide] = useState(false);
  const [showHGuide, setShowHGuide] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const size = Math.max(200, Math.min(w, 600));
      setStageSize({ w: size, h: size });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!img || imgStatus !== "loaded") return;
    if (typeof imageX === "number" && typeof imageY === "number") {
      setImgState({
        x: imageX,
        y: imageY,
        scaleX: typeof imageScaleX === "number" ? imageScaleX : 1,
        scaleY: typeof imageScaleY === "number" ? imageScaleY : 1,
      });
      return;
    }
    const { w, h } = stageSize;
    const iw = img.width || 1;
    const ih = img.height || 1;
    const margin = 0.8;
    const scale = Math.min((w * margin) / iw, (h * margin) / ih);
    const centered = { x: w / 2, y: h / 2, scaleX: scale, scaleY: scale };
    setImgState(centered);
    onImageTransform?.(centered);
  }, [img, imgStatus, stageSize, imageX, imageY, imageScaleX, imageScaleY, onImageTransform]);

  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    if (selectedId === "image" && imageNodeRef.current) {
      tr.nodes([imageNodeRef.current]);
    } else if (selectedId && textNodeRefs.current[selectedId]) {
      tr.nodes([textNodeRefs.current[selectedId]]);
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [selectedId, textLayers, imgState, imageRotation, imageOpacity]);

  useEffect(() => {
    textLayers.forEach((t) => {
      if (t.x === 0 && t.y === 0) {
        const cx = Math.max(8, stageSize.w / 2);
        const cy = Math.max(8, stageSize.h / 2);
        onReposition(t.id, { x: cx, y: cy });
      }
    });
  }, [textLayers, stageSize, onReposition]);

  useEffect(() => {
    let changed = false;
    const next = { ...textDims };
    textLayers.forEach((t) => {
      const node = textNodeRefs.current[t.id];
      if (node) {
        const w = node.width();
        const h = node.height();
        const prev = next[t.id];
        if (!prev || prev.w !== w || prev.h !== h) {
          next[t.id] = { w, h };
          changed = true;
        }
      }
    });
    if (changed) setTextDims(next);
  }, [textLayers, stageSize]);

  useEffect(() => {
    if (!editId) return;
    const el = editableRef.current;
    const layer = textLayers.find((t) => t.id === editId);
    if (!el || !layer) return;
    el.innerHTML = layer.html ?? (layer.text || "");
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    savedRangeRef.current = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
  }, [editId, textLayers]);

  useEffect(() => {
    if (!editId) return;
    const onSelChange = () => {
      const el = editableRef.current;
      const sel = window.getSelection();
      if (!el || !sel || sel.rangeCount === 0) return;
      const anchor = sel.anchorNode;
      if (anchor && el.contains(anchor)) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    };
    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
  }, [editId]);

  useEffect(() => {
    const handler = (e: any) => {
      const cmd = e?.detail?.cmd as "bold" | "italic" | "underline";
      if (!cmd) return;
      if (editId && editableRef.current) {
        const el = editableRef.current;
        el.focus();
        const sel = window.getSelection();
        if (savedRangeRef.current) {
          sel?.removeAllRanges();
          sel?.addRange(savedRangeRef.current);
        }
        document.execCommand(cmd);
        const html = el.innerHTML;
        const text = el.innerText;
        onChangeText(editId, { html, text });
        const sel2 = window.getSelection();
        savedRangeRef.current =
          sel2 && sel2.rangeCount ? sel2.getRangeAt(0).cloneRange() : savedRangeRef.current;
        return;
      }
      if (selectedId && selectedId !== "image") {
        beginEdit(selectedId);
        requestAnimationFrame(() => {
          const el = editableRef.current;
          if (!el) return;
          const range = document.createRange();
          range.selectNodeContents(el);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
          document.execCommand(cmd);
          const html = el.innerHTML;
          const text = el.innerText;
          onChangeText(selectedId, { html, text });
          setEditId(null);
        });
      }
    };
    window.addEventListener("editor-format", handler as EventListener);
    return () => window.removeEventListener("editor-format", handler as EventListener);
  }, [editId, selectedId, onChangeText]);

  const handleStageMouseDown = (e: any) => {
    if (e.target === e.target.getStage()) {
      setEditId(null);
      onSelect(null);
      return;
    }
  };

  const beginEdit = (id: string) => {
    onSelect(id);
    setEditId(id);
  };

  const handleEditableInput = () => {
    if (!editId) return;
    const el = editableRef.current;
    if (!el) return;
    const html = el.innerHTML;
    const text = el.innerText;
    onChangeText(editId, { html, text });
  };

  const waitFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

  useImperativeHandle(ref, () => ({
    async capturePreview(opts?: { transparent?: boolean }) {
      if (!stageRef.current) return null;
      if (imageUrl && imgStatus !== "loaded") return null;

      const prevEditId = editId;
      if (prevEditId) {
        handleEditableInput();
        setEditId(null);
        await waitFrame();
      }

      const tr = transformerRef.current as any | null;
      let prevNodes: any[] = [];
      if (tr) {
        prevNodes = tr.nodes();
        tr.nodes([]);
        tr.getLayer()?.draw();
      }

      let bgWasVisible: boolean | undefined;
      if (opts?.transparent && bgRectRef.current) {
        bgWasVisible = bgRectRef.current.visible();
        bgRectRef.current.visible(false);
        bgRectRef.current.getLayer()?.draw();
      }

      await waitFrame();
      const uri = stageRef.current.toDataURL({ pixelRatio: 1, mimeType: "image/png" });

      if (opts?.transparent && bgRectRef.current) {
        bgRectRef.current.visible(bgWasVisible ?? true);
        bgRectRef.current.getLayer()?.draw();
      }

      if (tr) {
        tr.nodes(prevNodes);
        tr.getLayer()?.draw();
      }
      if (prevEditId) setEditId(prevEditId);

      return uri || null;
    },

    async captureDownload(opts?: { transparent?: boolean }) {
      if (!stageRef.current) return null;
      if (imageUrl && imgStatus !== "loaded") return null;

      const prevEditId = editId;
      if (prevEditId) {
        handleEditableInput();
        setEditId(null);
        await waitFrame();
      }

      const tr = transformerRef.current as any | null;
      let prevNodes: any[] = [];
      if (tr) {
        prevNodes = tr.nodes();
        tr.nodes([]);
        tr.getLayer()?.draw();
      }

      let bgWasVisible: boolean | undefined;
      if (opts?.transparent && bgRectRef.current) {
        bgWasVisible = bgRectRef.current.visible();
        bgRectRef.current.visible(false);
        bgRectRef.current.getLayer()?.draw();
      }

      await waitFrame();
      const stageW = stageRef.current.width() || 1;
      const pixelRatio = Math.max(1, 1024 / stageW);
      const uri = stageRef.current.toDataURL({ mimeType: "image/png", pixelRatio });

      if (opts?.transparent && bgRectRef.current) {
        bgRectRef.current.visible(bgWasVisible ?? true);
        bgRectRef.current.getLayer()?.draw();
      }

      if (tr) {
        tr.nodes(prevNodes);
        tr.getLayer()?.draw();
      }
      if (prevEditId) setEditId(prevEditId);

      return uri || null;
    },
  }));

  const editingLayer = editId ? textLayers.find((t) => t.id === editId) : undefined;
  const editDims = editingLayer ? textDims[editingLayer.id] : undefined;
  const overlayLeft = editingLayer ? editingLayer.x - (editDims?.w || 0) / 2 : 0;
  const overlayTop = editingLayer ? editingLayer.y - (editDims?.h || 0) / 2 : 0;

  const centerX = stageSize.w / 2;
  const centerY = stageSize.h / 2;
  const snapThreshold = 8;

  return (
    <div className="w-fit">
      <div ref={containerRef} className="relative w-full">
        <Stage
          ref={stageRef}
          width={stageSize.w}
          height={stageSize.h}
          onMouseDown={handleStageMouseDown}
          onTouchStart={handleStageMouseDown}
          className="rounded-lg bg-[var(--background)]"
        >
          <Layer>
            <Rect
              ref={bgRectRef}
              x={0}
              y={0}
              width={stageSize.w}
              height={stageSize.h}
              fill={bgColor}
              listening={false}
            />

            {img && (
              <KonvaImage
                ref={imageNodeRef}
                image={img}
                x={imgState.x}
                y={imgState.y}
                draggable
                scaleX={imgState.scaleX}
                scaleY={imgState.scaleY}
                rotation={imageRotation}
                opacity={imageOpacity}
                offsetX={img.width ? img.width / 2 : 0}
                offsetY={img.height ? img.height / 2 : 0}
                onMouseDown={() => onSelect("image")}
                onTap={() => onSelect("image")}
                onDragMove={(e) => {
                  const node = e.target;
                  let nx = node.x();
                  let ny = node.y();
                  const nearV = Math.abs(nx - centerX) <= snapThreshold;
                  const nearH = Math.abs(ny - centerY) <= snapThreshold;
                  setShowVGuide(nearV);
                  setShowHGuide(nearH);
                  if (nearV) {
                    nx = centerX;
                    node.x(nx);
                  }
                  if (nearH) {
                    ny = centerY;
                    node.y(ny);
                  }
                  node.getLayer()?.batchDraw();
                }}
                onDragEnd={(e) => {
                  setShowVGuide(false);
                  setShowHGuide(false);
                  const patch = { x: e.target.x(), y: e.target.y() };
                  setImgState((s) => ({ ...s, ...patch }));
                  onImageTransform?.(patch);
                }}
                onTransformEnd={(e) => {
                  const node = e.target;
                  const patch = {
                    x: node.x(),
                    y: node.y(),
                    scaleX: node.scaleX(),
                    scaleY: node.scaleY(),
                  };
                  setImgState((s) => ({ ...s, ...patch }));
                  onImageTransform?.(patch);
                }}
              />
            )}

            {textLayers.map((t) => {
              const hasBold = !!t.html && (t.html.includes("<b") || t.html.includes("<strong"));
              const hasItalic = !!t.html && (t.html.includes("<i") || t.html.includes("<em"));
              const hasUnderline = !!t.html && t.html.includes("<u");
              const fontStyle =
                hasBold && hasItalic ? "bold italic" : hasBold ? "bold" : hasItalic ? "italic" : "normal";
              const textDecoration = hasUnderline ? "underline" : undefined;

              const dims = textDims[t.id];
              const offX = dims ? dims.w / 2 : 0;
              const offY = dims ? dims.h / 2 : 0;

              return (
                <KonvaText
                  key={t.id}
                  ref={(node) => {
                    if (node) textNodeRefs.current[t.id] = node;
                  }}
                  x={t.x}
                  y={t.y}
                  offsetX={offX}
                  offsetY={offY}
                  text={t.text || ""}
                  fontFamily={t.fontFamily}
                  fontSize={t.fontSize}
                  fill={t.color}
                  rotation={t.rotation}
                  scaleX={t.scaleX}
                  scaleY={t.scaleY}
                  opacity={editId === t.id ? 0 : t.opacity ?? 1}
                  fontStyle={fontStyle as any}
                  textDecoration={textDecoration as any}
                  draggable
                  onMouseDown={() => onSelect(t.id)}
                  onTap={() => onSelect(t.id)}
                  onDblClick={() => beginEdit(t.id)}
                  onDblTap={() => beginEdit(t.id)}
                  onDragMove={(e) => {
                    const node = e.target;
                    let nx = node.x();
                    let ny = node.y();
                    const nearV = Math.abs(nx - centerX) <= snapThreshold;
                    const nearH = Math.abs(ny - centerY) <= snapThreshold;
                    setShowVGuide(nearV);
                    setShowHGuide(nearH);
                    if (nearV) {
                      nx = centerX;
                      node.x(nx);
                    }
                    if (nearH) {
                      ny = centerY;
                      node.y(ny);
                    }
                    node.getLayer()?.batchDraw();
                  }}
                  onDragEnd={(e) => {
                    setShowVGuide(false);
                    setShowHGuide(false);
                    onReposition(t.id, { x: e.target.x(), y: e.target.y() });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const sy = node.scaleY();
                    const newFontSize = Math.max(4, t.fontSize * sy);
                    onChangeText(t.id, {
                      fontSize: newFontSize,
                      scaleX: 1,
                      scaleY: 1,
                      rotation: node.rotation(),
                    });
                    onReposition(t.id, { x: node.x(), y: node.y() });
                    node.scaleX(1);
                    node.scaleY(1);
                  }}
                />
              );
            })}

            <Transformer
              ref={transformerRef}
              visible={!!selectedId && !editId}
              rotateEnabled
              keepRatio
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
                "middle-left",
                "middle-right",
                "top-center",
                "bottom-center",
              ]}
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 10 || newBox.height < 10 ? oldBox : newBox)}
            />
          </Layer>

          <Layer listening={false}>
            {showVGuide && (
              <Line
                points={[centerX, 0, centerX, stageSize.h]}
                stroke="#60a5fa"
                strokeWidth={1}
                dash={[4, 4]}
                opacity={0.9}
              />
            )}
            {showHGuide && (
              <Line
                points={[0, centerY, stageSize.w, centerY]}
                stroke="#60a5fa"
                strokeWidth={1}
                dash={[4, 4]}
                opacity={0.9}
              />
            )}
          </Layer>
        </Stage>

        {editingLayer && (
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onInput={handleEditableInput}
            onBlur={() => setEditId(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setEditId(null);
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setEditId(null);
              }
            }}
            className="absolute whitespace-pre-wrap leading-none"
            style={{
              left: overlayLeft,
              top: overlayTop,
              fontFamily: editingLayer?.fontFamily,
              fontSize: editingLayer?.fontSize,
              color: editingLayer?.color,
              background: "transparent",
              outline: "none",
              border: "none",
              padding: 0,
              margin: 0,
              minWidth: 2,
              transform: "translateZ(0)",
              cursor: "text",
              zIndex: 10,
            }}
          />
        )}
      </div>

      {imgStatus === "loading" && <div className="mt-3 h-4 w-28 animate-pulse rounded bg-zinc-900/40" />}
      {imgStatus === "failed" && <div className="mt-3 text-sm text-red-500">Failed to load image</div>}
    </div>
  );
});
