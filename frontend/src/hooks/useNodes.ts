// src/hooks/useNodes.ts
import { useEffect } from 'react';
import { useNodesStore } from '../store/useNodesStore';

export function useNodes() {

  const store = useNodesStore();

  useEffect(() => {
    store.fetchNodes();
  }, []);

  return store;
}