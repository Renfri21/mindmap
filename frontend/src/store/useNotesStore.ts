// src/store/useNotesStore.ts
import { create } from 'zustand';
import type { Note } from '../types/Note';
import {
  fetchNotesApi,
  createNoteApi,
  updateNoteApi,
  deleteNoteApi,
} from '../api/notes.api';

interface NotesStore {
  notes: Note[];
  loading: boolean;
  error: string | null;

  fetchNotes: () => Promise<void>;
  addNote: (x: number, y: number, scale: number) => Promise<void>;
  updateNote: (id: number, updates: Partial<Note>) => Promise<void>;
  removeNote: (id: number) => Promise<void>;
  selectNote: (id: number | null) => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  loading: true,
  error: null,

  fetchNotes: async () => {
    try {
      set({ loading: true });
      const notes = await fetchNotesApi();
      set({ notes, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch notes', loading: false });
    }
  },

  addNote: async (x, y, scale) => {
    const tempNote: Note = {
      id: Date.now(),
      x,
      y,
      width: 200,
      height: 200,
      content: '',
      color: '#ffd966',
      scale,
      isSelected: true,
    };

    set((s) => ({ notes: [...s.notes, tempNote] }));

    try {
      const saved = await createNoteApi(tempNote);
      set((s) => ({
        notes: s.notes.map((n) => (n.id === tempNote.id ? saved : n)),
      }));
    } catch {
      set((s) => ({
        notes: s.notes.filter((n) => n.id !== tempNote.id),
      }));
    }
  },

  updateNote: async (id, updates) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));

    try {
      await updateNoteApi(id, updates);
    } catch {}
  },

  removeNote: async (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    try {
      await deleteNoteApi(id);
    } catch {}
  },

  selectNote: (id) =>
    set((s) => ({
      notes: s.notes.map((n) => ({ ...n, isSelected: n.id === id })),
    })),
}));
