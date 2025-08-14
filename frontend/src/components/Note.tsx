import React, { useState, useRef, useEffect } from 'react';

interface NoteProps {
    id: number;
    x: number;
    y: number;
    dragable?: boolean;
    children: React.ReactNode;
    scale: number;
}

const Note: React.FC<NoteProps> = ({ id, x, y, dragable, children, scale}) => {
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

    // POST new coordinates to DataBase
    const updateNoteCoordinates = (id:number, x_coordinate: number, y_coordinate: number) => {
        fetch("/api/update-note-coordinates",{
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${encodeURIComponent(id)}&x_coordinate=${encodeURIComponent(x_coordinate)}&y_coordinate=${encodeURIComponent(y_coordinate)}`,
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
            height: "auto",
            position: "absolute",
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            cursor: dragable ? "grab" : "default",
            userSelect: "none",
            background: "yellow",
            color: "black",
            padding: "10px",
            borderRadius: "6px",
          }}
          onMouseDown={handleMouseDown}
        >
          {children}
        </div>
      );

};

export default Note;
