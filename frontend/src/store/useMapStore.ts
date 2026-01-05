import { create } from 'zustand';
import { useRef } from 'react';

/**
 * Zustand store interface for managing map state:
 * panning (offset), zooming (scale), and mouse position in map coordinates.
 */

interface MapStore {
  /**
   * Pixel-based translation of the entire map.
   * Determines how far away the map's origin x,y (0,0) is relative to the viewport
   */
  offset: { x: number; y: number }; 
  
  /**
   * Zoom level of the map.
   * 1 = 100%, values < 1 zoom out, values > 1 zoom in.
   */
  scale: number; 
  
  /**
   * Current mouse position converted to map (world) coordinates.
   * Used for coordinate display and debugging.
   */
  mouseMapPos: { x: number; y: number } | null;
  

  // --- Actions ---

  setOffset: (offset: { x: number; y: number }) => void;

  setScale: (scale: number) => void;
  setMouseMapPos: (pos: { x: number; y: number } | null) => void;

  /**
   * Zooms the map relative to a screen-space point (e.g. mouse position),
   * keeping that point visually fixed during zoom.
   */
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

  // Updates the map offset while the map is actively being dragged.
  // Computes the mouse delta since the last frame and applies it
  // to the current offset to pan the map smoothly.
  drag: (x, y) => {
    // Only pan the map if a drag operation is active
    // and a previous mouse position is available

    if (mapRefs.isMapDragging && mapRefs.lastMousePos) {

      // Calculate mouse movement since the last update
      const dx = x - mapRefs.lastMousePos.x;
      const dy = y - mapRefs.lastMousePos.y;

      // Read current offset from the store
      const { offset } = get();

      // Apply the delta to move the map
      set({ 
        offset: { 
          x: offset.x + dx, 
          y: offset.y + dy 
        } 
      });
      console.log(offset);
      // Apply the delta to move the map
      mapRefs.lastMousePos = { x, y };
    }
  },

  endDrag: () => {
    mapRefs.isMapDragging = false;
    mapRefs.lastMousePos = null;
  },
}));