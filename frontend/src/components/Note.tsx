import React, { useState, useRef, useEffect } from 'react';
import type { Note as NoteType } from '../types/Note';

interface NoteProps {
  note: NoteType;
  scale: number;
  onUpdate: (id: number, updates: Partial<NoteType>) => void;
  onSelect: (id: number | null) => void;
  onTakePointer?: (dragging: boolean) => void;
}

export default function Note({ note, scale, onUpdate, onSelect, onTakePointer }: NoteProps) {
  const scaleRef = useRef(scale);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  const [tempPos, setTempPos] = useState({ x: note.x, y: note.y });
  const tempPosRef = useRef({ x: note.x, y: note.y });
  useEffect(() => { setTempPos({ x: note.x, y: note.y }); tempPosRef.current = { x: note.x, y: note.y }; }, [note.x, note.y]);

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

  useEffect(() => () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
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
    if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }

    if (draggingRef.current) {
      draggingRef.current = false;
      onUpdate(note.id, { x: tempPosRef.current.x, y: tempPosRef.current.y });
      onTakePointer?.(false);
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
      draggingRef.current = true;
      onTakePointer?.(true);
      return;
    }

    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      if (!movedBeforeSelectRef.current) {
        onSelect(note.id);
        draggingRef.current = true;
        onTakePointer?.(true);
      }
    }, 300);
  };

  const handleDoubleClick = (e: React.MouseEvent) => { e.stopPropagation(); setIsEditing(true); };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setTempContent(e.target.value);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onUpdate(note.id, { content: tempContent }); setIsEditing(false); }
    else if (e.key === 'Escape') { setTempContent(note.content); setIsEditing(false); }
  };
  const handleBlur = () => { onUpdate(note.id, { content: tempContent }); setIsEditing(false); };

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
