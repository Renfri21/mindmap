// export default Map;
// src/components/Map.tsx

import React from 'react';
import SvgGrid from './SvgGrid';
import Note from './Note';
import Toolbar from './Toolbar';
import { useNotes } from '../hooks/useNotes';
import { useMapStore } from '../store/useMapStore';

export default function Map() {
  const { notes, addNote, updateNote, selectNote } = useNotes();
  const {
    offset, scale, mouseMapPos, setMouseMapPos,
    lastMousePos, isMapDraggingRef, noteIsDraggingRef,
    zoomIn, zoomOut, startDrag, drag, endDrag, zoomAt
  } = useMapStore();

  const gridSize = 100;

  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if (noteIsDraggingRef.current) return;
    selectNote(null);
    startDrag(e.clientX, e.clientY);
  };

  const handleBackgroundMouseMove = (e: React.MouseEvent) => {
    drag(e.clientX, e.clientY);

    // Map coordinates
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const mapX = (mouseX - offset.x) / scale;
    const mapY = -((mouseY - offset.y) / scale);
    setMouseMapPos({ x: mapX, y: mapY });
  };

  const handleBackgroundMouseUp = () => endDrag();
  const handleBackgroundMouseLeave = () => endDrag();

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.001;
    zoomAt(1 - e.deltaY * zoomIntensity, e.clientX, e.clientY);
  };

  const createNote = () => {
    const x = (window.innerWidth / 2 - offset.x) / scale;
    const y = (window.innerHeight / 2 - offset.y) / scale;
    addNote(x, y, scale);
  };

  return (
    <div
      style={{
        width: '100vw', height: '100vh', position: 'relative',
        overflow: 'hidden', background: '#181818', userSelect: 'none',
        touchAction: 'none', cursor: isMapDraggingRef.current ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleBackgroundMouseDown}
      onMouseMove={handleBackgroundMouseMove}
      onMouseUp={handleBackgroundMouseUp}
      onMouseLeave={handleBackgroundMouseLeave}
      onWheel={handleWheel}
    >
      <div style={{
        position: 'absolute',
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transformOrigin: '0 0',
        zIndex: 2,
      }}>
        {notes.map(note => (
          <Note
            key={note.id}
            note={note}
            scale={scale}
            onUpdate={updateNote}
            onSelect={selectNote}
            onTakePointer={(dragging) => {
              noteIsDraggingRef.current = dragging;
              if (dragging) isMapDraggingRef.current = false;
            }}
          />
        ))}
      </div>

      <SvgGrid
        width={100000}
        height={100000}
        scale={scale}
        offsetX={offset.x}
        offsetY={offset.y}
        gridSize={gridSize}
      />

      {mouseMapPos && (
        <div className="coordinates-display-box">
          X: {mouseMapPos.x.toFixed(0)}, Y: {mouseMapPos.y.toFixed(0)}
        </div>
      )}

      <Toolbar
        onAddNote={createNote}
        liveUpdate={false}
      />

      <div id="controls" className="zoom-control-buttons">
        <button onClick={zoomIn}>+</button>
        <button onClick={zoomOut}>-</button>
      </div>
    </div>
  );
}
