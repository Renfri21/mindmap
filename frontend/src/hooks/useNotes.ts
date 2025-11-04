// // src/hooks/useNotes.ts
// import { useState } from 'react';
// import type { Note } from '../types/Note';
// import { nanoid } from 'nanoid'; // install with: npm install nanoid

// export function useNotes() {
//   const [notes, setNotes] = useState<Note[]>([]);

//   const addNote = (x: number, y: number) => {
//     const newNote: Note = {
//       id: nanoid(),
//       x,
//       y,
//       width: 180,
//       height: 180,
//       content: 'New note',
//       color: '#ffd966',
//       isSelected: false,
//     };
//     setNotes((prev) => [...prev, newNote]);
//   };

//   const updateNote = (id: string, updates: Partial<Note>) => {
//     setNotes((prev) =>
//       prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
//     );
//   };

//   const removeNote = (id: string) => {
//     setNotes((prev) => prev.filter((note) => note.id !== id));
//   };

//   const selectNote = (id: string | null) => {
//     setNotes((prev) =>
//       prev.map((note) => ({
//         ...note,
//         isSelected: note.id === id,
//       }))
//     );
//   };

//   return { notes, addNote, updateNote, removeNote, selectNote };
// }

// src/hooks/useNotes.ts
import { useState, useEffect } from 'react';
import type { Note } from '../types/Note';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      setLoading(true);
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data: Note[] = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function addNote(x: number, y: number) {
    // Show local temporary note
      const tempNote: Note = {
        id: Date.now(), // temporary local ID
        x,
        y,
        width: 200,
        height: 200,
        content: '',
        color: '#ffd966',
        isSelected: true,
      };

      // Show note instantly localy
      setNotes((prev) => [...prev, tempNote]);

    try {
      const res = await fetch('/api/create-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempNote),
      });

      if (!res.ok) throw new Error('Failed to add note');

      const savedNote: Note = await res.json();

      // Replace the temporary note with the saved one from DB
      setNotes((prev) =>
        prev.map((note) => (note.id === tempNote.id ? savedNote : note))
      );

      // Fetch all notes again to ensure consistency
      await fetchNotes();
    } catch (err) {
      console.error('Failed to add note:', err);

      // Remove the temp note if saving failed
      setNotes((prev) => prev.filter((n) => n.id !== tempNote.id));
    }
  }

  // async function addNote(x: number, y: number) {
  //   const newNote: Omit<Note, 'id'> = {
  //     x,
  //     y,
  //     width: 200,
  //     height: 200,
  //     content: 'New note',
  //     color: '#ffd966',
  //     isSelected: false,
  //   };

  //   try {
  //     const res = await fetch('/api/create-note', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(newNote),
  //     });
  //     if (!res.ok) throw new Error('Failed to add note');

  //     const savedNote: Note = await res.json();
      
  //     setNotes((prev) => [...prev, savedNote]);
  //   } catch (err) {
  //     console.error('Failed to add note:', err);
  //   }
  // }

  async function updateNote(id: string, updates: Partial<Note>) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );

    try {
      await fetch(`/api/notes/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  }

  async function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));

    try {
      await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  }

  function selectNote(id: string | null) {
    setNotes((prev) =>
      prev.map((n) => ({ ...n, isSelected: n.id === id }))
    );
  }

  return { notes, loading, error, fetchNotes, addNote, updateNote, removeNote, selectNote };
}
