import React, { useState, useRef } from 'react';
import SvgGrid from './SvgGrid';
import Note from './Note';

function Map() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const [mouseMapPos, setMouseMapPos] = useState<{ x: number; y: number } | null>(null);

  const minScale = 0.1;
  const maxScale = 5;
  const gridSize = 100;

  // Handle mouse down to start dragging
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  // Handle mouse up to stop dragging
  const onMouseUp = () => {
    setIsDragging(false);
    lastMousePos.current = null;
  };

  // Handle mouse move for dragging AND update mouse map coordinates
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging && lastMousePos.current) {
      // Dragging: update offset
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }

    // Update mouse position in map coordinates regardless of dragging
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const mapX = (mouseX - offset.x) / scale;
    const mapY = -((mouseY - offset.y) / scale);
    setMouseMapPos({ x: mapX, y: mapY });
  };

  // When mouse leaves container, clear coordinate display and stop dragging
  const onMouseLeave = () => {
    setIsDragging(false);
    lastMousePos.current = null;
    setMouseMapPos(null);
  };

  // Handle wheel for zooming
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const zoomIntensity = 0.001; // Adjust zoom speed
    const delta = -e.deltaY * zoomIntensity;

    let newScale = scale * (1 + delta);
    newScale = Math.min(Math.max(newScale, minScale), maxScale);

    // Calculate mouse position relative to map container
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate map coordinates before zoom
    const mapX = (mouseX - offset.x) / scale;
    const mapY = (mouseY - offset.y) / scale;

    // Calculate new offset to zoom towards cursor
    const newOffsetX = mouseX - mapX * newScale;
    const newOffsetY = mouseY - mapY * newScale;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const [notes, setNotes] = useState<{ x: number; y: number; text: string }[]>([
    { x: 0, y: 0, text: "Test Sticky Note (0,0)" }
  ]);

  const addNote = () => {
    setNotes(prev => [
      ...prev,
      { x: 200, y: 200, text: "New Note" } // pick default coordinates
    ]);
  };



  return (
    /* Background div */
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: '#f0f0f0',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onWheel={onWheel}
    >
     
        {/* Notes div */}
       <div class="notes"
        style={{
          position: 'absolute',
          //width: 100000,
          //height: 100000,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          zIndex: 2,
        }}
      >

        {/* Use the Note component here */}
        <Note x={0} y={0}>Make note crud functions </Note>
        <Note x={200} y={0}>Make line/link function </Note>
        <Note x={400} y={0}>Show notes from DB, not hard coded like now </Note>
        <Note x={0} y={150}>Note: height, width, x_coordinate, y_coordinate, note_content(should be any character + style, ex. bullets), group(like a subject it belongs to. this can be used to group notes together) </Note>
        {/* You can add more notes here */}

        {notes.map((note, index) => (
          <Note key={index} x={note.x} y={note.y}>
            {note.text}
          </Note>
        ))}

      </div>

        

      <button
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          zIndex: 1000,
          padding: "8px 12px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer"
        }}
        onClick={addNote}
      >
        Add Note
      </button>

      <SvgGrid
        width={100000}
        height={100000}
        scale={scale}
        offsetX={offset.x}
        offsetY={offset.y}
        gridSize={gridSize}
      />

      {/* Coordinate display box */}
      {mouseMapPos && (
        <div
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: 4,
            fontFamily: 'monospace',
            fontSize: 14,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 9999,
            whiteSpace: 'nowrap',
          }}
        >
          X: {mouseMapPos.x.toFixed(0)}, Y: {mouseMapPos.y.toFixed(0)}
        </div>
      )}
    </div>
  );
}

export default Map;
