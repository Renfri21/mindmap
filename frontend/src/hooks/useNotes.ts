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

  async function addNote(x: number, y: number, scale: number) {
    // Show local temporary note
      const tempNote: Note = {
        id: Date.now(), // temporary local ID
        x,
        y,
        width: 200,
        height: 200,
        content: '',
        color: '#ffd966',
        scale,
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


  async function updateNote(id: number, updates: Partial<Note>) {
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

  async function removeNote(id: number) {
    setNotes((prev) => prev.filter((n) => n.id !== id));

    try {
      await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  }

  function selectNote(id: number | null) {
    setNotes((prev) =>
      prev.map((n) => ({ ...n, isSelected: n.id === id }))
    );
  }

  return { notes, loading, error, fetchNotes, addNote, updateNote, removeNote, selectNote };
}
