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
    const [selected, setSelected] = useState(false);
    const lastMousePos = useRef<{ x: number; y: number } | null>(null);
    const posRef = useRef({ x, y });
    const scaleRef = useRef(scale);
    const activeNoteRef = useRef<HTMLElement | null>(null);


    useEffect(() => {
        scaleRef.current = scale; 
    }, [scale]);

    // Handles moving the notes
    const handleMouseMove = (e: MouseEvent) => {
        if (!draggingRef.current || !lastMousePos.current) return;

        const dx = (e.clientX - lastMousePos.current.x) / scaleRef.current;
        const dy = (e.clientY - lastMousePos.current.y) / scaleRef.current;

        setPos(prev => {
            const newPos = { x: prev.x + dx, y: prev.y + dy };
            posRef.current = newPos; 
            return newPos;
        });
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    // Activate selected note
    const handleOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const noteElement = e.currentTarget;
        console.log(noteElement.classList);
        if (!noteElement.classList.contains('active-note') && !noteElement.classList.contains('dragable')){
            noteElement.classList.add("dragable");
            if(activeNoteRef.current){
                deactivateNote(e);
                console.log("active after deac");
                console.log(activeNoteRef.current);
            }

            
            activeNoteRef.current = noteElement;
            console.log(activeNoteRef.current);

        }
        else if (noteElement.classList.contains('dragable')){
            draggingRef.current = false;
            noteElement.classList.remove("dragable");
            noteElement.classList.add("active-note");
            //e.target.readOnly = false;
        }
        else {
            //event.stopPropagation();
            deactivateNote(e);
            //activeNote = e;
            e.currentTarget.classList.add("dragable");
            console.log(e.currentTarget.classList.contains('dragable'));
        }
    };

    const deactivateNote = (currentNote) => {
        //console.log(currentNote);
        // console.log();
        
            // Remove active state and disable content editing for all notes
            // document.querySelectorAll(".notes").forEach(note => {
            //     note.classList.remove("active-note");

            //     note.querySelectorAll(".note-task").forEach(task => {
            //         task.contentEditable = "false";
            //         task.classList.remove("note-task-active");
            //      });
            // });
            
    }
    

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

    // Handles dragging of the notes
    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!dragable) return;

        draggingRef.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation();
        if (!dragable) return;

        draggingRef.current = true;

        // Use the first finger
        const touch = e.touches[0];
        lastMousePos.current = { x: touch.clientX, y: touch.clientY };

        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
    }

    // Handles dragging move for touch
    const handleTouchMove = (e: TouchEvent) => {
        if (!draggingRef.current || !lastMousePos.current) return;

        const touch = e.touches[0];
        const dx = (touch.clientX - lastMousePos.current.x) / scaleRef.current;
        const dy = (touch.clientY - lastMousePos.current.y) / scaleRef.current;

        setPos(prev => {
            const newPos = { x: prev.x + dx, y: prev.y + dy };
            posRef.current = newPos; // update ref for persistence
            return newPos;
        });

    
        // Update position (you can use your setState or ref logic)
        // Example: setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));

        lastMousePos.current = { x: touch.clientX, y: touch.clientY };
    };

    // Handles dragging end for touch
    const handleTouchEnd = () => {
        draggingRef.current = false;
        lastMousePos.current = null;

        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);

        // Save final coordinates
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

    

    return (
        <div className="note"
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
          onClick={handleOnClick}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
           <textarea
                readOnly
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
