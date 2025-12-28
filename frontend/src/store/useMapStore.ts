import { create } from 'zustand';
import { useRef } from 'react';

interface MapStore {
  offset: { x: number; y: number };
  scale: number;
  mouseMapPos: { x: number; y: number } | null;
  
  // Actions
  setOffset: (offset: { x: number; y: number }) => void;
  setScale: (scale: number) => void;
  setMouseMapPos: (pos: { x: number; y: number } | null) => void;
  zoomAt: (factor: number, centerX: number, centerY: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  startDrag: (x: number, y: number) => void;
  drag: (x: number, y: number) => void;
  endDrag: () => void;
}

// Store refs separately since they're not reactive state
export const mapRefs = {
  lastMousePos: null as { x: number; y: number } | null,
  isMapDragging: false,
  noteIsDragging: false,
};

export const useMapStore = create<MapStore>((set, get) => ({
  offset: { x: 0, y: 0 },
  scale: 1,
  mouseMapPos: null,

  setOffset: (offset) => set({ offset }),
  setScale: (scale) => set({ scale }),
  setMouseMapPos: (mouseMapPos) => set({ mouseMapPos }),

  zoomAt: (factor, centerX, centerY) => {
    const { offset, scale } = get();
    const minScale = 0.1;
    const maxScale = 5;
    
    const newScale = Math.min(Math.max(scale * factor, minScale), maxScale);
    const mapX = (centerX - offset.x) / scale;
    const mapY = (centerY - offset.y) / scale;
    const newOffsetX = centerX - mapX * newScale;
    const newOffsetY = centerY - mapY * newScale;
    
    set({ 
      scale: newScale,
      offset: { x: newOffsetX, y: newOffsetY }
    });
  },

  zoomIn: () => {
    get().zoomAt(1.1, window.innerWidth / 2, window.innerHeight / 2);
  },

  zoomOut: () => {
    get().zoomAt(0.9, window.innerWidth / 2, window.innerHeight / 2);
  },

  startDrag: (x, y) => {
    mapRefs.isMapDragging = true;
    mapRefs.lastMousePos = { x, y };
  },

  drag: (x, y) => {
    if (mapRefs.isMapDragging && mapRefs.lastMousePos) {
      const dx = x - mapRefs.lastMousePos.x;
      const dy = y - mapRefs.lastMousePos.y;
      const { offset } = get();
      set({ offset: { x: offset.x + dx, y: offset.y + dy } });
      mapRefs.lastMousePos = { x, y };
    }
  },

  endDrag: () => {
    mapRefs.isMapDragging = false;
    mapRefs.lastMousePos = null;
  },
}));