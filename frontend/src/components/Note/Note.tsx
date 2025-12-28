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

  useEffect(()=>{ setContent(note.content) }, [note.content]);

  useEffect(()=>{
    if(editing && ref.current){
      ref.current.focus();
      const len = ref.current.value.length;
      ref.current.setSelectionRange(len,len);
    }
  },[editing]);

  const commit = () => {
    onUpdate(note.id, { content });
    setEditing(false);
  }

  return (
    <textarea
      ref={ref}
      value={content}
      onChange={e=>setContent(e.target.value)}
      onDoubleClick={e=>{ e.stopPropagation(); setEditing(true); }}
      onBlur={commit}
      onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); commit(); } else if(e.key==='Escape'){ setContent(note.content); setEditing(false) } }}
      style={{
        color: 'black',
        width:'100%',
        height:'100%',
        resize:'none',
        outline:'none',
        background:'yellow',
        fontFamily:'sans-serif',
        fontSize:14,
        cursor: editing?'text':'default',
      }}
    />
  )
}
