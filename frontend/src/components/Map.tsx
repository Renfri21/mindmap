import React, { useState,useEffect, useRef } from 'react';
import SvgGrid from './SvgGrid';
import Note from './Note';
import { motion } from "framer-motion";

function Map() {


  const [notes, setNotes] = useState<{ id: number; x: number; y: number; content: string }[]>([]);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const [mouseMapPos, setMouseMapPos] = useState<{ x: number; y: number } | null>(null);

  const minScale = 0.1;
  const maxScale = 5;
  const gridSize = 100;


  useEffect(() => {

    fetchNotes();
  }, []);


  async function fetchNotes() {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      setNotes(data);
      console.log(data);
      console.log("1");
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  }


  // Handle mouse down to start dragging map
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  // Handle mouse up to stop dragging of map
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


  // when Add Note button is pressed, crate a new empty note in the middle of the current viewport
  const createNote = async () => {

    // Center of visible screen in pixels
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Convert screen pixels to map coordinates
    const x_coordinate = (centerX - offset.x) / scale;
    const y_coordinate = ((centerY - offset.y) / scale); 

    try {
      const response = await fetch("/api/create-note", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `x_coordinate=${encodeURIComponent(x_coordinate)}&y_coordinate=${encodeURIComponent(y_coordinate)}`,
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      await fetchNotes();

    } 
    catch (err) {
      console.error("something went wrong");
    }

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
       <div className="notes"
        style={{
          position: 'absolute',
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          zIndex: 2,
        }}
      >

      {/* Render all notes */}
      {notes.map(note => (

        // <Note> component comes from Note.tsx
        <Note 
          id={note.id} 
          key={note.id} 
          x={note.x_coordinate} 
          y={note.y_coordinate}
          scale={scale} 
          dragable
        >

        {note.note_content} {note.id}
        
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
        onClick={createNote}
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

      {/* Coordinates display box */}
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
