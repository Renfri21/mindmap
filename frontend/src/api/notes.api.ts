// src/api/notes.api.ts
import type { Note } from '../types/Note';

export async function fetchNotesApi(): Promise<Note[]> {
  const response = await fetch('/api/notes');
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
}


export async function updateNoteApi(id: number, content: string ) {
  // Guard: never send empty updates

  const res = await fetch(`/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}