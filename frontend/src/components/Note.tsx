import React, { useState, useRef, useEffect } from 'react';

interface NoteProps {
    id: number;
    x: number;
    y: number;
    dragable?: boolean;
    scale: number;
    content: string;
}

const Note: React.FC<NoteProps> = ({ id, x, y, dragable, scale, content}) => {
    const [pos, setPos] = useState({ x, y });
    const draggingRef = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const posRef = useRef({ x, y });
    const scaleRef = useRef(scale);

    useEffect(() => {
        scaleRef.current = scale; 
    }, [scale]);

    // Handles moving the notes
    const handleMouseMove = (e: MouseEvent) => {
        if (!draggingRef.current) return;

        const dx = (e.clientX - lastMousePos.current.x) / scaleRef.current;
        const dy = (e.clientY - lastMousePos.current.y) / scaleRef.current;

        setPos(prev => {
            const newPos = { x: prev.x + dx, y: prev.y + dy };

            posRef.current = newPos; 
            return newPos;
        });

        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    // Handles getting the coordinates of a notes dropped location and sending it to update
    const handleMouseUp = () => {
        draggingRef.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        // Truncate coordinates to integers
        const finalX = Math.trunc(posRef.current.x);
        const finalY = Math.trunc(posRef.current.y);

        updateNoteCoordinates(id, finalX, finalY);
    };

    // post new coordinates to DataBase
    const updateNoteCoordinates = (id:number, x: number, y: number) => {
        fetch("/api/update-note-coordinates",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, x, y }),
        });
    };

    // post new content to DataBase
    const updateNoteContent = (id:number, content:string) => {
        fetch("/api/update-note-coordinates",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, content }),
        });
    };

    // Handles dragging of the notes
    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!dragable) return;

        draggingRef.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
          style={{
            width: "200px",
            height: "200px",
            position: "absolute",
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            cursor: dragable ? "grab" : "default",
            userSelect: "none",
            background: "yellow",
            color: "black",
            padding: "10px",
            border: "2px solid black",
            borderRadius: "6px",
            zIndex: 2,
          }}
          onMouseDown={handleMouseDown}
        >
           <textarea
                defaultValue={content}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const newText = e.currentTarget.value;

                    updateNoteContent(id, newText);
                    e.currentTarget.blur(); //
                  }
                }}
                style={{
                  color: "black",
                  resize: "none",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  width: "100%",
                  height: "100%",
                }}
            />
        </div>
      );

};

export default Note;
