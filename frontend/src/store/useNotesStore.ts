// src/store/useNotesStore.ts
import { create } from 'zustand';
import type { Note } from '../types/Note';
import {
  fetchNotesApi,
  updateNoteApi,
} from '../api/notes.api';

interface NotesStore {
  notes: Note[];
  loading: boolean;
  error: string | null;
  
  // Main actions
  fetchNotes: () => Promise<void>;
  updateNote: (id: number, updates: Partial<Note>) => Promise<void>;
  
  // Helper actions (called by NodesStore)
  addLocalNote: (note: Note) => void;
  replaceNote: (tempId: number, realNote: Note) => void;
  removeLocalNote: (id: number) => void;
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

  updateNote: async (id, updates) => {
    // Optimistic update
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));

    try {
      await updateNoteApi(id, updates);
    } catch (err) {
      console.error('Failed to update note:', err);
      // Could revert here if needed
    }
  },

  // --- Helper methods for NodesStore ---

  addLocalNote: (note) => {
    set((s) => ({ notes: [...s.notes, note] }));
  },

  replaceNote: (tempId, realNote) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === tempId ? realNote : n)),
    }));
  },

  removeLocalNote: (id) => {
    set((s) => ({
      notes: s.notes.filter((n) => n.id !== id),
    }));
  },
}));