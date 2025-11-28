// import React, { useState, useEffect, useRef } from 'react';
// import SvgGrid from './SvgGrid';
// import Note from './Note';
// import { useNotes } from '../hooks/useNotes';
// import Toolbar from './Toolbar';

// function Map() {
// // ------------------ NOTES STATE ------------------
//   // Custom hook to manage notes data
//   const { notes, fetchNotes, addNote, updateNote, selectNote } = useNotes();

//   // ------------------ INITIAL USER POSITION ------------------
//   // Start user's screen position where they last left off
//   const userLastPositionX = 0;
//   const userLastPositionY = 0;

//   // Map offset and zoom scale
//   const [offset, setOffset] = useState({ x: userLastPositionX, y: userLastPositionY });
//   const [scale, setScale] = useState(1);

//   // Mouse position in map coordinates
//   const [mouseMapPos, setMouseMapPos] = useState<{ x: number; y: number } | null>(null);

//   // Track last mouse position for drag calculations
//   const lastMousePos = useRef<{ x: number; y: number } | null>(null);
//   const [isMouseDown, setIsMouseDown] = useState(false);

//   // Minimum and maximum zoom levels
//   const minScale = 0.1;
//   const maxScale = 5;

//   // Grid size for the background grid
//   const gridSize = 100;

//   // Toggle for content update mode
//   // true = every letter (live), false = on Enter/blur
//   const [liveUpdate, setLiveUpdate] = useState(false);

//   const [noteIsDragging, setNoteIsDragging] = useState(false);

// // ------------------ MOUSE HANDLERS ------------------

//   /**
//    * Handle mousedown on the background.
//    * - Deselects all notes
//    * - Starts drag for moving the map
//    */
//   const handleBackgroundOnMouseDown = (e: React.MouseEvent) => {
//     if (noteIsDragging) return; // Note is being dragged → don't drag background

//     selectNote(null); // Deselect any selected note
//     setIsMouseDown(true); // Start dragging
//     lastMousePos.current = { x: e.clientX, y: e.clientY };
//   };

//   /**
//    * Handle mouse up event
//    * - Stop dragging
//    */
//   const onMouseUp = () => {
//     setIsMouseDown(false);
//     lastMousePos.current = null;
//   };

//   /**
//    * Handle mouse move event
//    * - Updates map offset if dragging
//    * - Updates mouse coordinates in map space
//    */
//   const onMouseMove = (e: React.MouseEvent) => {
//     if (isMouseDown && lastMousePos.current) {
//       const dx = e.clientX - lastMousePos.current.x;
//       const dy = e.clientY - lastMousePos.current.y;

//       setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
//       lastMousePos.current = { x: e.clientX, y: e.clientY };
//     }

//     // Calculate mouse position in map coordinates
//     const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
//     const mouseX = e.clientX - rect.left;
//     const mouseY = e.clientY - rect.top;
//     const mapX = (mouseX - offset.x) / scale;
//     const mapY = -((mouseY - offset.y) / scale);

//     setMouseMapPos({ x: mapX, y: mapY });
//   };

//   /**
//    * Handle mouse leaving the map
//    * - Stops dragging
//    * - Clears mouse coordinates display
//    */
//   const onMouseLeave = () => {
//     setIsMouseDown(false);
//     lastMousePos.current = null;
//     setMouseMapPos(null);
//   };

//   /**
//    * Handle wheel events for zooming in/out
//    * - Zooms towards cursor position
//    */
//   const onWheel = (e: React.WheelEvent) => {
//     const zoomIntensity = 0.001; // Zoom speed factor
//     const delta = -e.deltaY * zoomIntensity;

//     let newScale = scale * (1 + delta);
//     newScale = Math.min(Math.max(newScale, minScale), maxScale);

//     // Cursor position relative to map container
//     const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
//     const mouseX = e.clientX - rect.left;
//     const mouseY = e.clientY - rect.top;

//     // Map coordinates under cursor before zoom
//     const mapX = (mouseX - offset.x) / scale;
//     const mapY = (mouseY - offset.y) / scale;

//     // Adjust offset to zoom toward cursor
//     const newOffsetX = mouseX - mapX * newScale;
//     const newOffsetY = mouseY - mapY * newScale;

//     setScale(newScale);
//     setOffset({ x: newOffsetX, y: newOffsetY });
//   };

// // ------------------ TOUCH SCREEN HANDLERS ------------------

//   /**
//    * Start drag on touch devices
//    */
//   const onTouchStart = (e: React.TouchEvent) => {
//     setIsMouseDown(true);
//     const touch = e.touches[0];
//     lastMousePos.current = { x: touch.clientX, y: touch.clientY };
//   };

//   /**
//    * Global touchmove and touchend listeners for smooth drag
//    */
//   useEffect(() => {
//     const handleTouchMove = (e: TouchEvent) => {
//       if (!isMouseDown || !lastMousePos.current) return;
//       e.preventDefault(); // Prevent page scroll

//       const touch = e.touches[0];
//       const dx = touch.clientX - lastMousePos.current.x;
//       const dy = touch.clientY - lastMousePos.current.y;

//       setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
//       lastMousePos.current = { x: touch.clientX, y: touch.clientY };
//     };

//     const handleTouchEnd = () => {
//       setIsMouseDown(false);
//       lastMousePos.current = null;
//     };

//     document.addEventListener("touchmove", handleTouchMove, { passive: false });
//     document.addEventListener("touchend", handleTouchEnd);

//     return () => {
//       window.removeEventListener("touchmove", handleTouchMove);
//       window.removeEventListener("touchend", handleTouchEnd);
//     };
//   }, [isMouseDown]);

// // ------------------ ZOOM BUTTON FUNCTIONS ------------------

//   /**
//    * Zoom in using the button
//    * - Zoom towards screen center
//    */
//   const zoomIn = () => {
//     const zoomIntensity = 0.1;
//     const newScale = Math.min(scale * (1 + zoomIntensity), maxScale);

//     const centerX = window.innerWidth / 2;
//     const centerY = window.innerHeight / 2;

//     const mapX = (centerX - offset.x) / scale;
//     const mapY = (centerY - offset.y) / scale;

//     setScale(newScale);
//     setOffset({ x: centerX - mapX * newScale, y: centerY - mapY * newScale });
//   };

//   /**
//    * Zoom out using the button
//    * - Zoom towards screen center
//    */
//   const zoomOut = () => {
//     const zoomIntensity = 0.1;
//     const newScale = Math.max(scale * (1 - zoomIntensity), minScale);

//     const centerX = window.innerWidth / 2;
//     const centerY = window.innerHeight / 2;

//     const mapX = (centerX - offset.x) / scale;
//     const mapY = (centerY - offset.y) / scale;

//     setScale(newScale);
//     setOffset({ x: centerX - mapX * newScale, y: centerY - mapY * newScale });
//   };

// // ------------------ CREATE NEW NOTE ------------------

//   /**
//    * Adds a new note centered in the current viewport
//    */
//   const createNote = async () => {

//     const centerX = window.innerWidth / 2;
//     const centerY = window.innerHeight / 2;

//     // Convert screen coordinates to map coordinates
//     const x = (centerX - offset.x) / scale;
//     const y = ((centerY - offset.y) / scale); 
//     addNote(x, y);
//     // try {
//     //   const response = await fetch("/api/create-note", {
//     //     method: "POST",
//     //     headers: { "Content-Type": "application/json" },
//     //     body: JSON.stringify({ x, y }),
//     //   });

//     //   if (!response.ok) throw new Error("Failed to create note");
//     //   await fetchNotes(); // Refresh notes after creation
//     // } catch (err) {
//     //   console.error("Failed to create note:", err);
//     // }
//   };

// // ------------------ RENDER ------------------
//   return (
//     <div
//       id="background"
//       className="background"
//       style={{
//         width: '100vw',
//         height: '100vh',
//         overflow: 'hidden',
//         position: 'relative',
//         //background: '#f0f0f0', // white mode 
//         background: '#181818',
//         userSelect: 'none',
//         touchAction: 'none',
//         overscrollBehavior: 'contain',
//         cursor:  isMouseDown ? 'grabbing' : 'grab',
//       }}
//       onMouseDown={handleBackgroundOnMouseDown}
//       onMouseUp={onMouseUp}
//       onMouseMove={onMouseMove}
//       onMouseLeave={onMouseLeave}
//       onWheel={onWheel}
//       onTouchStart={onTouchStart}
//     >
//       {/* Notes container, transformed by map offset and scale */}
//       <div
//         className="notes"
//         style={{
//           position: 'absolute',
//           transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
//           transformOrigin: '0 0',
//           zIndex: 2,
//         }}
//       >
//         {/* Render all notes */}
//         {notes.map(note => (
//           <Note
//             key={note.id}
//             note={note}
//             scale={scale}
//             onUpdate={updateNote}
//             onSelect={selectNote}
//             liveUpdate={liveUpdate}
//             onTakePointer={() => setIsMouseDown(true)} // stop map drag while note drag is active
//           />
//         ))}
//       </div>

//       {/* Grid overlay */}
//       <SvgGrid
//         width={100000}
//         height={100000}
//         scale={scale}
//         offsetX={offset.x}
//         offsetY={offset.y}
//         gridSize={gridSize}
//       />

//       {/* Coordinates display */}
//       {mouseMapPos && (
//         <div className="coordinates-display-box">
//           X: {mouseMapPos.x.toFixed(0)}, Y: {mouseMapPos.y.toFixed(0)}
//         </div>
//       )}

//       {/* Zoom buttons */}
//         <div id="controls" className="zoom-control-buttons">
//           <button className="zoom-button" onClick={zoomIn}>
//             +
//           </button>

//           <button className="zoom-button" onClick={zoomOut}>
//             -
//           </button>
//         </div>

//        <Toolbar
//         onAddNote={createNote}
//         onZoomIn={zoomIn}
//         onZoomOut={zoomOut}
//         onToggleLiveUpdate={() => setLiveUpdate(prev => !prev)}
//         liveUpdate={liveUpdate}
//       />
//     </div>
//   );
// }

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
    if (!isMapDraggingRef.current || !lastMousePos.current) return;

    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleBackgroundMouseUp = () => {
    isMapDraggingRef.current = false;
    lastMousePos.current = null;
  };

  const handleBackgroundMouseLeave = () => {
    handleBackgroundMouseUp();
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
    addNote(x, y);
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

      {/* Toolbar */}
      <Toolbar
        onAddNote={createNote}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onToggleLiveUpdate={() => setLiveUpdate(prev => !prev)}
        liveUpdate={liveUpdate}
      />
    </div>
  );
}

export default Map;
