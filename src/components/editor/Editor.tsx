"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer, Rect } from "react-konva";
import useImage from "use-image";

type Props = {
  logoId: string;
  imageUrl: string;
  brandName?: string | null;
};

export default function Editor({ logoId, imageUrl, brandName }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<any>(null);
  const imageNodeRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ w: 600, h: 600 });
  const [selected, setSelected] = useState<boolean>(true);
  const [img, imgStatus] = useImage(imageUrl, "anonymous");
  const [imgState, setImgState] = useState({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });

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
    const { w, h } = stageSize;
    const iw = img.width || 1;
    const ih = img.height || 1;
    const margin = 0.8;
    const scale = Math.min((w * margin) / iw, (h * margin) / ih);
    const newW = iw * scale;
    const newH = ih * scale;
    setImgState({
      x: (w - newW) / 2,
      y: (h - newH) / 2,
      scaleX: scale,
      scaleY: scale,
      rotation: 0,
    });
  }, [img, imgStatus, stageSize]);

  useEffect(() => {
    if (!transformerRef.current || !imageNodeRef.current) return;
    if (selected) {
      transformerRef.current.nodes([imageNodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selected, imgState]);

  const handleDownload = () => {
    if (!stageRef.current) return;
    const tr = transformerRef.current as any | null;
    let prevNodes: any[] = [];
    if (tr) {
      prevNodes = tr.nodes();
      tr.nodes([]);
      tr.getLayer()?.draw();
    }
    const uri = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
    if (tr) {
      tr.nodes(prevNodes);
      tr.getLayer()?.draw();
    }
    const a = document.createElement("a");
    a.href = uri;
    a.download = `${brandName || "logo"}-${logoId}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleStageMouseDown = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelected(false);
      return;
    }
    setSelected(true);
  };

  return (
    <div className="w-fit">         
        <div ref={containerRef} className="w-full">
        <Stage
            ref={stageRef}
            width={stageSize.w}
            height={stageSize.h}
            onMouseDown={handleStageMouseDown}
            onTouchStart={handleStageMouseDown}
            className="rounded-lg bg-[var(--background)]"
        >
            <Layer>
            <Rect x={0} y={0} width={stageSize.w} height={stageSize.h} fill="white" listening={false} />
            {img && (
                <KonvaImage
                ref={imageNodeRef}
                image={img}
                x={imgState.x}
                y={imgState.y}
                draggable
                scaleX={imgState.scaleX}
                scaleY={imgState.scaleY}
                rotation={imgState.rotation}
                onDragEnd={(e) => setImgState((s) => ({ ...s, x: e.target.x(), y: e.target.y() }))}
                onTransformEnd={(e) => {
                    const node = e.target;
                    setImgState((s) => ({
                    ...s,
                    x: node.x(),
                    y: node.y(),
                    scaleX: node.scaleX(),
                    scaleY: node.scaleY(),
                    rotation: node.rotation(),
                    }));
                }}
                />
            )}
            <Transformer
                ref={transformerRef}
                visible={selected}
                rotateEnabled
                enabledAnchors={[
                "top-left","top-right","bottom-left","bottom-right",
                "middle-left","middle-right","top-center","bottom-center",
                ]}
                boundBoxFunc={(oldBox, newBox) =>
                newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
                }
            />
            </Layer>
        </Stage>
        </div>

        {imgStatus === "loading" && <div className="mt-3 h-4 w-28 animate-pulse rounded bg-zinc-900/40" />}
        {imgStatus === "failed" && <div className="mt-3 text-sm text-red-500">Failed to load image</div>}
    </div>
    );
}
