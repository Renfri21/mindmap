// Node verion
import React, { useState, useEffect, useRef } from 'react';
import type { Note } from '../../types/Note';

interface NoteProps {
  note: Note;
  onUpdate: (id: number, updates: Partial<Note>) => void;
}

export default function Note({ note, onUpdate }: NoteProps) {
  const [content, setContent] = useState(note.content);
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { 
    setContent(note.content) 
  }, [note.content]);

  useEffect(()=>{
    if(editing && ref.current){
      ref.current.focus();
      const len = ref.current.value.length;
      ref.current.setSelectionRange(len,len);
    }
  },[editing]);

  const commit = async  () => {
    await onUpdate(note.id, String(content ?? ''));
    setEditing(false);
  }

  return (
    <div
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: editing ? '#FFF9C4' : '#E6D77A',
        borderRadius: 4,

        /* paper feel */
        boxShadow: editing
          ? '0 0 0 2px rgba(82,180,255,0.6)'
          : 'inset 0 0 0 1px rgba(0,0,0,0.06)',

        cursor: editing ? 'text' : 'default',
      }}
    >
      <textarea
        ref={ref}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            setContent(note.content);
            setEditing(false);
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          resize: 'none',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: '#2b2b2b',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 14,
          lineHeight: 1.5,

          cursor: editing ? 'text' : 'default',
        }}
      />
    </div>
  );
}
