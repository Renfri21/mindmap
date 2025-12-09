// src/api/notes.api.ts
import type { Note } from '../types/Note';

export async function fetchNotesApi(): Promise<Note[]> {
  const response = await fetch('/api/notes');
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
}

export async function createNoteApi(note: Note): Promise<Note> {
  const res = await fetch('/api/create-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });

  if (!res.ok) throw new Error('Failed to add note');
  return res.json();
}

export async function updateNoteApi(id: number, updates: Partial<Note>) {
  await fetch(`/api/notes/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export async function deleteNoteApi(id: number) {
  await fetch(`/api/notes/${id}`, {
    method: 'DELETE',
  });
}
