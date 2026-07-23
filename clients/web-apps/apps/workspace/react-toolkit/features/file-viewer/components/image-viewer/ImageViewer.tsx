import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useViewerStore } from "../../stores/file-viewer-store";

//  Types
interface DragOrigin {
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

//  Component
interface ImageViewerProps {
  fileUrl: string;
}

const ImageViewer = ({ fileUrl }: ImageViewerProps) => {
  const { scale, rotate } = useViewerStore(
    useShallow((s) => ({ scale: s.scale, rotate: s.rotate })),
  );

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOrigin = useRef<DragOrigin>({
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // Reset pan offset whenever zoom returns to default or rotation changes
  useEffect(() => {
    if (scale <= 1) setOffset({ x: 0, y: 0 });
  }, [scale]);

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [rotate]);

  //  Drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scale <= 1) return; // only allow panning when zoomed in
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragOrigin.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffset({
      x: dragOrigin.current.offsetX + (e.clientX - dragOrigin.current.startX),
      y: dragOrigin.current.offsetY + (e.clientY - dragOrigin.current.startY),
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  //  Cursor
  const cursor = scale <= 1 ? "default" : isDragging ? "grabbing" : "grab";

  return (
    <div
      className="flex h-full w-full p-2 select-none items-center justify-center overflow-hidden"
      style={{ cursor }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="Image preview"
      role="img"
    >
      <img
        src={fileUrl}
        alt="File preview"
        draggable={false}
        className="max-h-full max-w-full object-contain"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotate}deg)`,
          // No transition while dragging for immediate feedback; ease on discrete changes
          transition: isDragging ? "none" : "transform 0.15s ease-out",
          willChange: "transform",
        }}
      />
    </div>
  );
};

export default ImageViewer;
