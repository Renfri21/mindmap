// export default Map;
// src/components/Map.tsx
import React, { useState, useRef } from 'react';
import SvgGrid from './SvgGrid';
import Note from './Note';
import { useNotes } from '../hooks/useNotes';
import Toolbar from './Toolbar';

function Map() {
  const { notes, addNote, updateNote, selectNote } = useNotes();

  // ------------------ Map state ------------------
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [liveUpdate, setLiveUpdate] = useState(false);

  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const isMapDraggingRef = useRef(false);
  const noteIsDraggingRef = useRef(false);

  // Mouse position in map coordinates
  const [mouseMapPos, setMouseMapPos] = useState<{ x: number; y: number } | null>(null);


  const minScale = 0.1;
  const maxScale = 5;
  const gridSize = 100;

  // ------------------ Map drag ------------------
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    // Don't drag map while a note is dragging
    if (noteIsDraggingRef.current) return;

    selectNote(null); // deselect notes
    isMapDraggingRef.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleBackgroundMouseMove = (e: React.MouseEvent) => {
  //   if (!isMapDraggingRef.current || !lastMousePos.current) return;

  //   const dx = e.clientX - lastMousePos.current.x;
  //   const dy = e.clientY - lastMousePos.current.y;

  //   setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  //   lastMousePos.current = { x: e.clientX, y: e.clientY };
  // };
    if (isMapDraggingRef.current && lastMousePos.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;

      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }

    // Calculate mouse position in map coordinates
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const mapX = (mouseX - offset.x) / scale;
    const mapY = -((mouseY - offset.y) / scale);

    setMouseMapPos({ x: mapX, y: mapY });
  };


  const handleBackgroundMouseUp = () => {
    isMapDraggingRef.current = false;
    lastMousePos.current = null;
  };

  const handleBackgroundMouseLeave = () => {
    handleBackgroundMouseUp();
    //setMouseMapPos(null);
  };


  // ------------------ Zoom ------------------
  const zoomAt = (factor: number, centerX: number, centerY: number) => {
    const newScale = Math.min(Math.max(scale * factor, minScale), maxScale);
    const mapX = (centerX - offset.x) / scale;
    const mapY = (centerY - offset.y) / scale;
    const newOffsetX = centerX - mapX * newScale;
    const newOffsetY = centerY - mapY * newScale;
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.001;
    zoomAt(1 - e.deltaY * zoomIntensity, e.clientX, e.clientY);
  };

  const zoomIn = () => zoomAt(1.1, window.innerWidth / 2, window.innerHeight / 2);
  const zoomOut = () => zoomAt(0.9, window.innerWidth / 2, window.innerHeight / 2);

  // ------------------ Add note ------------------
  const createNote = () => {
    const x = (window.innerWidth / 2 - offset.x) / scale;
    const y = (window.innerHeight / 2 - offset.y) / scale;
    addNote(x, y, scale);
  };

  // ------------------ Render ------------------
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#181818',
        userSelect: 'none',
        touchAction: 'none',
        cursor: isMapDraggingRef.current ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleBackgroundMouseDown}
      onMouseMove={handleBackgroundMouseMove}
      onMouseUp={handleBackgroundMouseUp}
      onMouseLeave={handleBackgroundMouseLeave}
      onWheel={handleWheel}
    >
      {/* Notes container */}
      <div
        style={{
          position: 'absolute',
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          zIndex: 2,
        }}
      >
        {notes.map(note => (
          <Note
            key={note.id}
            note={note}
            scale={scale}
            liveUpdate={liveUpdate}
            onUpdate={updateNote}
            onSelect={selectNote}
            onTakePointer={(dragging: boolean) => {
              noteIsDraggingRef.current = dragging;
              // When a note starts dragging, cancel map drag
              if (dragging) isMapDraggingRef.current = false;
            }}
          />
        ))}
      </div>

      {/* Background grid */}
      <SvgGrid
        width={100000}
        height={100000}
        scale={scale}
        offsetX={offset.x}
        offsetY={offset.y}
        gridSize={gridSize}
      />

      {/* Coordinates display */}
     {mouseMapPos && (
        <div className="coordinates-display-box">
          X: {mouseMapPos.x.toFixed(0)}, Y: {mouseMapPos.y.toFixed(0)}
        </div>
      )}

      {/* Toolbar */}
      <Toolbar
        onAddNote={createNote}
        onToggleLiveUpdate={() => setLiveUpdate(prev => !prev)}
        liveUpdate={liveUpdate}
      />

      {/* Zoom buttons */}
         <div id="controls" className="zoom-control-buttons">
           <button className="zoom-button" onClick={zoomIn}>
             +
           </button>

           <button className="zoom-button" onClick={zoomOut}>
             -
           </button>
         </div>
    </div>
  );
}

export default Map;
