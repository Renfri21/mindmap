// src/hooks/useMapStore.ts
import { useState, useRef } from 'react';

export function useMapStore() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [mouseMapPos, setMouseMapPos] = useState<{ x: number; y: number } | null>(null);

  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const isMapDraggingRef = useRef(false);
  const noteIsDraggingRef = useRef(false);

  const minScale = 0.1;
  const maxScale = 5;

  const zoomAt = (factor: number, centerX: number, centerY: number) => {
    const newScale = Math.min(Math.max(scale * factor, minScale), maxScale);
    const mapX = (centerX - offset.x) / scale;
    const mapY = (centerY - offset.y) / scale;
    const newOffsetX = centerX - mapX * newScale;
    const newOffsetY = centerY - mapY * newScale;
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const zoomIn = () => zoomAt(1.1, window.innerWidth / 2, window.innerHeight / 2);
  const zoomOut = () => zoomAt(0.9, window.innerWidth / 2, window.innerHeight / 2);

  const startDrag = (x: number, y: number) => {
    isMapDraggingRef.current = true;
    lastMousePos.current = { x, y };
  };

  const drag = (x: number, y: number) => {
    if (isMapDraggingRef.current && lastMousePos.current) {
      const dx = x - lastMousePos.current.x;
      const dy = y - lastMousePos.current.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x, y };
    }
  };

  const endDrag = () => {
    isMapDraggingRef.current = false;
    lastMousePos.current = null;
  };

  return {
    offset,
    scale,
    mouseMapPos,
    setMouseMapPos,
    lastMousePos,
    isMapDraggingRef,
    noteIsDraggingRef,
    zoomAt,
    zoomIn,
    zoomOut,
    startDrag,
    drag,
    endDrag,
  };
}
