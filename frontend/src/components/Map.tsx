import React, { useState, useEffect, useRef } from 'react';
import SvgGrid from './SvgGrid';
import Note from './Note';

function Map() {
  const [notes, setNotes] = useState<{ id: number; x: number; y: number; content: string }[]>([]);

// Start user's screen position on the same location as when they left the page
  var userLastPositionX = 0;
  var userLastPositionY = 0;

  const [offset, setOffset] = useState({ x: userLastPositionX, y: userLastPositionY });
  const [scale, setScale] = useState(1);
  const [mouseMapPos, setMouseMapPos] = useState<{ x: number; y: number } | null>(null);

  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  const minScale = 0.1;
  const maxScale = 5;
  const gridSize = 100;

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  }


    // ------------------ MOUSE HANDLERS ------------------
    const onMouseDown = (e: React.MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    // Handle mouse up to stop dragging of map
    const onMouseUp = () => {
      isDraggingRef.current = false;
      lastMousePos.current = null;
    };

    // Handle mouse move for dragging AND update mouse map coordinates
    const onMouseMove = (e: React.MouseEvent) => {
      if (isDraggingRef.current && lastMousePos.current) {
        // Dragging: update offset
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }

      // Update mouse coordinates
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const mapX = (mouseX - offset.x) / scale;
      const mapY = -((mouseY - offset.y) / scale);
      setMouseMapPos({ x: mapX, y: mapY });
    };

    // When mouse leaves container, clear coordinate display and stop dragging
    const onMouseLeave = () => {
      isDraggingRef.current = false;
      lastMousePos.current = null;
      setMouseMapPos(null);
    };

    // Handle wheel for zooming
    const onWheel = (e: React.WheelEvent) => {

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


    // ------------------ TOUCH HANDLERS ------------------
    const onTouchStart = (e:React.TouchEvent) => {
      isDraggingRef.current = true;
      // Use the first touch point
      const touch = e.touches[0];
      lastMousePos.current = { x: touch.clientX, y: touch.clientY };
    }

     useEffect(() => {
      const handleTouchMove = (e: TouchEvent) => {
        if (!isDraggingRef.current || !lastMousePos.current) return;
        e.preventDefault(); // prevent scrolling

        const touch = e.touches[0];
        const dx = touch.clientX - lastMousePos.current.x;
        const dy = touch.clientY - lastMousePos.current.y;

        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: touch.clientX, y: touch.clientY };
      };

      const handleTouchEnd = () => {
        isDraggingRef.current = false;
        lastMousePos.current = null;
      };

      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }, []);


  // ------------------ ZOOM BUTTONS ------------------
  const zoomIn = () => {
    const zoomIntensity = 0.1; // Adjust button zoom speed
    const newScale = Math.min(scale * (1 + zoomIntensity), maxScale);

    // Use viewport center as zoom point
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const mapX = (centerX - offset.x) / scale;
    const mapY = (centerY - offset.y) / scale;

    setScale(newScale);
    setOffset({ x: centerX - mapX * newScale, y: centerY - mapY * newScale });
  };

  // Handle zoom out button
  const zoomOut = () => {
    const zoomIntensity = 0.1; // Adjust button zoom speed
    const newScale = Math.max(scale * (1 - zoomIntensity), minScale);

    // Use viewport center as zoom point
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const mapX = (centerX - offset.x) / scale;
    const mapY = (centerY - offset.y) / scale;

    setScale(newScale);
    setOffset({ x: centerX - mapX * newScale, y: centerY - mapY * newScale });
  };

  // when Add Note button is pressed, crate a new empty note in the middle of the current viewport
  const createNote = async () => {

    // Center of visible screen in pixels
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Convert screen pixels to map coordinates
    const x = (centerX - offset.x) / scale;
    const y = -((centerY - offset.y) / scale); 

    try {
      const response = await fetch("/api/create-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x, y, })
      });

      if (!response.ok) throw new Error("Failed to create note");
      await fetchNotes();
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  };

  return (
    /* Background div */
    <div
      id="background"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        //background: '#f0f0f0', // white mode 
        background: '#181818',
        userSelect: 'none',
        touchAction: 'none',
        overscrollBehavior: 'contain',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
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
            key={note.id}
            id={note.id}
            x={note.x}
            y={-note.y}
            scale={scale}
            dragable
            content={note.content}
          />
        ))}
      </div>

      {/* Add Note Button */}
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

      {/* Grid */}
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

      {/* Zoom buttons */}
      <div id="controls"
        style={{
          textAlign: 'center',
          marginTop: '10px'
        }}>

        <button id="zoomOutButton" 
          style={{
            fontSize: '24px',
            width: '50px',
            height: '50px',
            margin: '0 10px',
            cursor: 'pointer'
          }}
          onClick={zoomOut}
        >
          -
        </button>
        <button id="zoomInButton"
          style={{ 
            fontSize: '24px',
            width: '50px',
            height: '50px',
            margin: '0 10px',
            cursor: 'pointer',
          }}
          onClick={zoomIn}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default Map;
