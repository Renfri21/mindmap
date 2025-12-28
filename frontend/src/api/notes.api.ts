// src/api/notes.api.ts
import type { Note } from '../types/Note';

export async function fetchNotesApi(): Promise<Note[]> {
  const response = await fetch('/api/notes');
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
}


export async function updateNoteApi(id: number, updates: Partial<Note>) {
  const res = await fetch(`/api/notes/${id}`, { // FIXED: template literal syntax
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...updates,
      _method: 'PUT', // Laravel treats as PUT
    }),
  });
  
  if (!res.ok) throw new Error('Failed to update note');
  return res.json();
}