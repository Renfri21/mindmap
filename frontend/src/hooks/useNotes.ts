// src/hooks/useNotes.ts
import { useEffect } from 'react';
import { useNotesStore } from '../store/useNotesStore';

export function useNotes() {
  const store = useNotesStore();

  useEffect(() => {
    store.fetchNotes();
  }, []);

  return store;
}