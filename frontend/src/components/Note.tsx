// // export default Note;
// // src/components/Note.tsx
// import React, { useRef, useState, useEffect } from 'react';
// import type { Note as NoteType } from '../types/Note';

// /**
//  * Props for the Note component
//  * - note:        The note data (position, content, etc.)
//  * - scale:       Current zoom scale of the map/whiteboard
//  * - onUpdate:    Callback when note data (like position or content) changes
//  * - onSelect:    Callback when a note is clicked or selected
//  */
// interface NoteProps {
//   note: NoteType;
//   scale: number;
//   onUpdate: (id: string, updates: Partial<NoteType>) => void;
//   onSelect: (id: string | null) => void;
//   liveUpdate: boolean;
//     // Called when note decides to take exclusive pointer control (stop map dragging)
//   onTakePointer?: () => void;
// }


// /**
//  * The Note component represents a single sticky note on the map/whiteboard.
//  * - It can be clicked, selected, dragged, and edited.
//  * - It updates its position in real time and saves when dragging stops.
//  */
// export default function Note({ note, scale, onUpdate, onSelect, liveUpdate, onTakePointer }: NoteProps) {

//    const scaleRef = useRef(scale);
//   useEffect(() => {
//     scaleRef.current = scale;
//   }, [scale]);

//   // Position state (visual during drag)
//   const [tempPos, setTempPos] = useState({ x: note.x, y: note.y });
//   const tempPosRef = useRef({ x: note.x, y: note.y });
//   useEffect(() => {
//     setTempPos({ x: note.x, y: note.y });
//     tempPosRef.current = { x: note.x, y: note.y };
//   }, [note.x, note.y]);

//   // Content state
//   const [tempContent, setTempContent] = useState(note.content);
//   useEffect(() => {
//     setTempContent(note.content);
//   }, [note.content]);

//   // Dragging refs
//   const draggingRef = useRef(false);
//   const initialMouseRef = useRef<{ x: number; y: number } | null>(null);
//   const movedBeforeSelectRef = useRef(false);
//   const longPressTimerRef = useRef<number | null>(null);

//   // Editing state
//   const [isEditing, setIsEditing] = useState(false);
//   const textareaRef = useRef<HTMLTextAreaElement | null>(null);

//   useEffect(() => {
//     if (isEditing && textareaRef.current) {
//       textareaRef.current.focus();
//       const len = textareaRef.current.value.length;
//       textareaRef.current.setSelectionRange(len, len);
//     }
//   }, [isEditing]);

//   // Cleanup
//   useEffect(() => {
//     return () => {
//       if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
//       document.removeEventListener('mousemove', onDocumentMouseMove);
//       document.removeEventListener('mouseup', onDocumentMouseUp);
//     };
//   }, []);

//   // -------------------------------
//   // Document Handlers
//   // -------------------------------
//   function onDocumentMouseMove(e: MouseEvent) {
//     if (!initialMouseRef.current) return;

//     // Cancel long-press if moved significantly
//     if (!draggingRef.current && longPressTimerRef.current) {
//       const dx = e.clientX - initialMouseRef.current.x;
//       const dy = e.clientY - initialMouseRef.current.y;
//       if (dx * dx + dy * dy > 36) { // 6px threshold
//         movedBeforeSelectRef.current = true;
//         if (longPressTimerRef.current) {
//           clearTimeout(longPressTimerRef.current);
//           longPressTimerRef.current = null;
//         }
//         document.removeEventListener('mousemove', onDocumentMouseMove);
//         document.removeEventListener('mouseup', onDocumentMouseUp);
//         return;
//       }
//     }

//     // Move note if dragging
//     if (draggingRef.current) {
//       e.preventDefault();
//       const prev = tempPosRef.current;
//       const dx = (e.clientX - (initialMouseRef.current?.x ?? e.clientX)) / scaleRef.current;
//       const dy = (e.clientY - (initialMouseRef.current?.y ?? e.clientY)) / scaleRef.current;
//       initialMouseRef.current = { x: e.clientX, y: e.clientY };
//       const newPos = { x: prev.x + dx, y: prev.y + dy };
//       tempPosRef.current = newPos;
//       setTempPos(newPos);
//     }
//   }

//   function onDocumentMouseUp() {
//     if (longPressTimerRef.current) {
//       clearTimeout(longPressTimerRef.current);
//       longPressTimerRef.current = null;
//     }

//     if (draggingRef.current) {
//       draggingRef.current = false;
//       onUpdate(note.id, { x: tempPosRef.current.x, y: -tempPosRef.current.y });
//       onTakePointer?.(); // tell map drag can resume
//     } else if (!movedBeforeSelectRef.current) {
//       onSelect(note.id); // select on click
//     }

//     document.removeEventListener('mousemove', onDocumentMouseMove);
//     document.removeEventListener('mouseup', onDocumentMouseUp);
//     initialMouseRef.current = null;
//     movedBeforeSelectRef.current = false;
//   }

//   // -------------------------------
//   // Note Handlers
//   // -------------------------------
//   const handleMouseDown = (e: React.MouseEvent) => {
//     initialMouseRef.current = { x: e.clientX, y: e.clientY };
//     movedBeforeSelectRef.current = false;

//     document.addEventListener('mousemove', onDocumentMouseMove);
//     document.addEventListener('mouseup', onDocumentMouseUp);

//     if (note.isSelected) {
//       // Already selected → drag immediately
//       draggingRef.current = true;
//       onTakePointer?.();
//       return;
//     }

//     // Not selected → start long-press to select + drag
//     longPressTimerRef.current = window.setTimeout(() => {
//       longPressTimerRef.current = null;
//       if (!movedBeforeSelectRef.current) {
//         onSelect(note.id);
//         draggingRef.current = true;
//         onTakePointer?.();
//       }
//     }, 300);
//   };

//   const handleDoubleClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setIsEditing(true);
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setTempContent(e.target.value);
//     if (liveUpdate) onUpdate(note.id, { content: e.target.value });
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (!liveUpdate && e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       onUpdate(note.id, { content: tempContent });
//       setIsEditing(false);
//     } else if (e.key === 'Escape') {
//       setTempContent(note.content);
//       setIsEditing(false);
//     }
//   };

//   const handleBlur = () => {
//     if (isEditing) {
//       if (!liveUpdate) onUpdate(note.id, { content: tempContent });
//       setIsEditing(false);
//     }
//   };

//   // -------------------------------
//   // Render
//   // -------------------------------
//   return (
//     <div
//       onMouseDown={handleMouseDown}
//       onDoubleClick={handleDoubleClick}
//       style={{
//         position: 'absolute',
//         left: tempPos.x,
//         top: tempPos.y,
//         width: 200,
//         height: 200,
//         background: 'yellow',
//         borderRadius: 8,
//         padding: 8,
//         boxShadow: note.isSelected
//           ? '0 0 12px rgba(82,180,255,0.9), 0 0 25px rgba(82,180,255,0.7)'
//           : '0 0 8px rgba(0,0,0,0.3)',
//         border: note.isSelected ? '2px solid #52b4ff' : '2px solid transparent',
//         cursor: draggingRef.current ? 'grabbing' : 'grab',
//         userSelect: isEditing ? 'text' : 'none',
//         transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
//       }}
//     >
//       <textarea
//         ref={textareaRef}
//         value={tempContent}
//         onChange={handleChange}
//         onKeyDown={handleKeyDown}
//         onBlur={handleBlur}
//         readOnly={!isEditing}
//         style={{
//           width: '100%',
//           height: '100%',
//           border: 'none',
//           background: 'transparent',
//           resize: 'none',
//           outline: 'none',
//           color: '#222',
//           fontSize: 14,
//           fontFamily: 'sans-serif',
//           cursor: isEditing ? 'text' : 'default',
//         }}
//       />
//     </div>
//   );
// }




//   // Keeps track of whether the note is currently being dragged
// //   const dragged = useRef(false);

// //   // Keeps a live reference to the current zoom scale (since closures capture old values)
// //   const scaleRef = useRef(scale);

// //   // Keeps a live reference to the note’s temporary position while dragging
// //   const tempPosRef = useRef({ x: note.x, y: note.y });

// //   // React state used for rendering the note’s visual position
// //   const [tempPos, setTempPos] = useState({ x: note.x, y: note.y });

// //   // Local content state to control throttled updates
// //   const [tempContent, setTempContent] = useState(note.content);

// //   /**
// //    * Keep the scaleRef updated whenever the scale changes
// //    * This ensures drag math always uses the current zoom value
// //    */
// //   useEffect(() => {
// //     scaleRef.current = scale; 
// //   }, [scale]);

// //   /**
// //    * Handle mouse down on the note (start of a click or drag)
// //    */
// //   const handleMouseDown = (e: React.MouseEvent) => {
// //     e.stopPropagation(); // Prevent dragging the background instead of the note

// //     // These offsets are useful if you want the note to "stick" to the cursor point (not used currently)
// //     //const offsetX = (e.clientX - note.x * scaleRef.current);
// //     //const offsetY = (e.clientY - note.y * scaleRef.current);

// //     dragged.current = false; // Assume it's just a click until movement occurs
// //     let lastMousePos = { x: e.clientX, y: e.clientY };

// //     /**
// //      * Handle mouse movement (dragging)
// //      * Moves the note visually while dragging, but doesn’t save yet
// //      */
// //     const handleMouseMove = (moveEvent: MouseEvent) => {
// //       dragged.current = true;

// //       // Calculate movement distance, adjusted for zoom level
// //       const dx = (moveEvent.clientX - lastMousePos.x) / scaleRef.current;
// //       const dy = (moveEvent.clientY - lastMousePos.y) / scaleRef.current;

// //       // Update local position visually
// //       setTempPos((prev) => {
// //         const newPos = { x: prev.x + dx, y: prev.y + dy };
// //         tempPosRef.current = newPos; // Keep the ref updated for saving later
// //         return newPos;
// //       });

// //       // Update last known mouse position
// //       lastMousePos = { x: moveEvent.clientX, y: moveEvent.clientY };
// //     };

// //     /**
// //      * Handle mouse release (end of click or drag)
// //      * Removes event listeners and updates final position if moved
// //      */
// //     const handleMouseUp = () => {
// //       // Clean up event listeners when the mouse is released
// //       document.removeEventListener('mousemove', handleMouseMove);
// //       document.removeEventListener('mouseup', handleMouseUp);

// //       if (dragged.current) {
// //         // If the note was dragged, save the final position to the parent
// //         onUpdate(note.id, {
// //           x: tempPosRef.current.x,
// //           y: -tempPosRef.current.y,
// //         });
// //       } else {
// //         // If it was just clicked (no drag), mark it as selected
// //         onSelect(note.id);
// //       }
// //     };

// //     // Attach listeners to track dragging even if mouse leaves the note
// //     document.addEventListener('mousemove', handleMouseMove);
// //     document.addEventListener('mouseup', handleMouseUp);
// //   };

// //   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
// //     setTempContent(e.target.value);
// //     if (liveUpdate) {
// //       onUpdate(note.id, { content: e.target.value });
// //     }
// //   };

// //   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
// //     if (!liveUpdate && e.key === 'Enter' && !e.shiftKey) {
// //       e.preventDefault();
// //       onUpdate(note.id, { content: tempContent });
// //     }
// //   };

// //   const handleBlur = () => {
// //     if (!liveUpdate) {
// //       onUpdate(note.id, { content: tempContent });
// //     }
// //   };



// //   /**
// //    * Render the note
// //    * - Positioned absolutely on the map using tempPos
// //    * - Includes a textarea for editing content
// //    * - Styled like a sticky note
// //    */
// //   return (
// //     <div
// //       onMouseDown={handleMouseDown}
// //       //onClick={(e) => e.stopPropagation()} // Prevent deselecting when clicking inside the note
// //       style={{
// //         position: 'absolute',
// //         left: tempPos.x,
// //         top: tempPos.y,
// //         //width: note.width,
// //         //height: note.height,
// //         //background: note.color,
// //         width: '200px',
// //         height: '200px',
// //         background: 'yellow',
// //         borderRadius: '8px',
// //         padding: '8px',
// //         boxShadow: note.isSelected
// //           ? '0 0 12px rgba(82, 180, 255, 0.9), 0 0 25px rgba(82, 180, 255, 0.7)'
// //           : '0 0 8px rgba(0,0,0,0.3)',
// //         border: note.isSelected ? '2px solid #52b4ff' : '2px solid transparent',
// //         cursor: 'grab',
// //         userSelect: 'none',
// //         transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
// //       }}
// //     >
// //       <textarea
// //         value={tempContent}
// //         onChange={handleChange}
// //         onKeyDown={handleKeyDown}
// //         onBlur={handleBlur}
// //         style={{
// //           width: '100%',
// //           height: '100%',
// //           border: 'none',
// //           background: 'transparent',
// //           resize: 'none',
// //           outline: 'none',
// //           color: '#222',
// //           fontSize: '14px',
// //           fontFamily: 'sans-serif',
// //         }}
// //       />
// //     </div>
// //   );
// // }

//  

import React, { useState, useRef, useEffect } from 'react';
import type { Note as NoteType } from '../types/Note';

interface NoteProps {
  note: NoteType;
  scale: number;
  liveUpdate: boolean;
  onUpdate: (id: number, updates: Partial<NoteType>) => void;
  onSelect: (id: number | null) => void;
  onTakePointer?: (dragging: boolean) => void;
}

export default function Note({ note, scale, liveUpdate, onUpdate, onSelect, onTakePointer }: NoteProps) {
  const scaleRef = useRef(scale);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  const [tempPos, setTempPos] = useState({ x: note.x, y: note.y });
  const tempPosRef = useRef({ x: note.x, y: note.y });
  useEffect(() => {
    setTempPos({ x: note.x, y: note.y });
    tempPosRef.current = { x: note.x, y: note.y };
  }, [note.x, note.y]);

  const [tempContent, setTempContent] = useState(note.content);
  useEffect(() => { setTempContent(note.content); }, [note.content]);

  const draggingRef = useRef(false);
  const initialMouseRef = useRef<{ x: number; y: number } | null>(null);
  const movedBeforeSelectRef = useRef(false);
  const longPressTimerRef = useRef<number | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      document.removeEventListener('mouseup', onDocumentMouseUp);
    };
  }, []);

  const onDocumentMouseMove = (e: MouseEvent) => {
    if (!initialMouseRef.current) return;

    if (!draggingRef.current && longPressTimerRef.current) {
      const dx = e.clientX - initialMouseRef.current.x;
      const dy = e.clientY - initialMouseRef.current.y;
      if (dx * dx + dy * dy > 36) {
        movedBeforeSelectRef.current = true;
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
        document.removeEventListener('mousemove', onDocumentMouseMove);
        document.removeEventListener('mouseup', onDocumentMouseUp);
        return;
      }
    }

    // Drag Note
    if (draggingRef.current) {
      e.preventDefault();
      const prev = tempPosRef.current;
      const dx = (e.clientX - (initialMouseRef.current?.x ?? e.clientX)) / scaleRef.current;
      const dy = (e.clientY - (initialMouseRef.current?.y ?? e.clientY)) / scaleRef.current;
      initialMouseRef.current = { x: e.clientX, y: e.clientY };
      const newPos = { x: prev.x + dx, y: prev.y + dy };
      tempPosRef.current = newPos;
      setTempPos(newPos);
    }
  };

  const onDocumentMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (draggingRef.current) {
      draggingRef.current = false;
      onUpdate(note.id, { x: tempPosRef.current.x, y: tempPosRef.current.y });
      onTakePointer?.(false); // release map drag
    } else if (!movedBeforeSelectRef.current) {
      onSelect(note.id);
    }

    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
    initialMouseRef.current = null;
    movedBeforeSelectRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
  e.stopPropagation();
  initialMouseRef.current = { x: e.clientX, y: e.clientY };
  movedBeforeSelectRef.current = false;

  document.addEventListener('mousemove', onDocumentMouseMove);
  document.addEventListener('mouseup', onDocumentMouseUp);

  if (note.isSelected) {
    // Already selected → drag immediately
    draggingRef.current = true;
    onTakePointer?.(true); // disable map drag
    return;
  }

  // Not selected → wait 0.3s for long press
  longPressTimerRef.current = window.setTimeout(() => {
    longPressTimerRef.current = null;
    if (!movedBeforeSelectRef.current) {
      onSelect(note.id);      // select note
      draggingRef.current = true;
      onTakePointer?.(true);  // start dragging
    }
  }, 300);
};

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTempContent(e.target.value);
    if (liveUpdate) onUpdate(note.id, { content: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!liveUpdate && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onUpdate(note.id, { content: tempContent });
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setTempContent(note.content);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (isEditing) {
      if (!liveUpdate) onUpdate(note.id, { content: tempContent });
      setIsEditing(false);
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: tempPos.x,
        top: tempPos.y,
        width: 200,
        height: 200,
        background: 'yellow',
        borderRadius: 8,
        padding: 8,
        boxShadow: note.isSelected
          ? '0 0 12px rgba(82,180,255,0.9), 0 0 25px rgba(82,180,255,0.7)'
          : '0 0 8px rgba(0,0,0,0.3)',
        border: note.isSelected ? '2px solid #52b4ff' : '2px solid transparent',
        cursor: draggingRef.current ? 'grabbing' : 'grab',
        userSelect: isEditing ? 'text' : 'none',
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
      }}
    >
      <textarea
        ref={textareaRef}
        value={tempContent}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        readOnly={!isEditing}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'transparent',
          resize: 'none',
          outline: 'none',
          color: '#222',
          fontSize: 14,
          fontFamily: 'sans-serif',
          cursor: isEditing ? 'text' : 'default',
        }}
      />
    </div>
  );
}
