// src/store/useNodesStore.ts
import { create } from 'zustand';
import type { Node } from '../types/Node';
import { useNotesStore } from './useNotesStore';
// import { useImagesStore } from './useImagesStore'; // when you add images
import {
  fetchNodesApi,
  createNodeApi,
  updateNodeApi,
  deleteNodeApi,
} from '../api/nodes.api';

interface NodesStore {
  nodes: Node[];
  selectedNodeId: number | null;
  loading: boolean;
  error: string | null;
  
  // Core actions
  fetchNodes: () => Promise<void>;
  addNode: (x: number, y: number, childType: 'note' | 'image' | 'folder') => Promise<void>;
  updateNode: (id: number, updates: Partial<Node>) => Promise<void>;
  removeNode: (id: number) => Promise<void>;
  selectNode: (id: number | null) => void;
}

let updateTimeout: NodeJS.Timeout | null = null;

export const useNodesStore = create<NodesStore>((set, get) => ({
  nodes: [],
  selectedNodeId: null,
  loading: true,
  error: null,

  fetchNodes: async () => {
    try {
      set({ loading: true });
      const response = await fetchNodesApi(); // Returns nodes WITH child data
      // response: [{ id: 1, x: 0, y: 0, child_type: 'note', child: { id: 1, content: '...' } }]
      
      // Separate nodes and children
      const nodes = response;
      const notes = response
        .filter(n => n.child_type === 'note' && n.child)
        .map(n => n.child);
      
      set({ nodes, loading: false });
      useNotesStore.getState().setNotes(notes); // Helper method to set notes
    } catch (err) {
      set({ error: 'Failed to fetch nodes', loading: false });
    }
  },

  addNode: async (x, y, childType) => {
    // Create temp IDs
    const tempNodeId = Date.now();
    const tempChildId = tempNodeId + 1;

    // Create temp node
    const tempNode: Node = {
      id: tempNodeId,
      x,
      y,
      width: 200,
      height: 200,
      child_type: childType,
      child_id: tempChildId,
      z_index: 0,
    };

    // Add to local state immediately (optimistic update)
    set((s) => ({ 
      nodes: [...s.nodes, tempNode],
      selectedNodeId: tempNodeId,
    }));

    // Add child to appropriate store
    if (childType === 'note') {
      useNotesStore.getState().addLocalNote({
        id: tempChildId,
        content: '',
      });
    } else if (childType === 'image') {
      // useImagesStore.getState().addLocalImage({
      //   id: tempChildId,
      //   url: '',
      // });
    }

    // Send to backend
    try {
      const response = await createNodeApi(x, y, childType);
      // Expected response: { node: {...}, child: {...} }

      // Replace temp node with real node from backend
      set((s) => ({
        nodes: s.nodes.map((n) => (n.id === tempNodeId ? response.node : n)),
        selectedNodeId: response.node.id,
      }));

      // Replace temp child with real child
      if (childType === 'note') {
        useNotesStore.getState().replaceNote(tempChildId, response.child);
      } else if (childType === 'image') {
        // useImagesStore.getState().replaceImage(tempChildId, response.child);
      }
    } catch (err) {
      console.error('Failed to create node:', err);
      
      // Remove temp node on failure
      set((s) => ({
        nodes: s.nodes.filter((n) => n.id !== tempNodeId),
        selectedNodeId: null,
      }));

      // Remove temp child
      if (childType === 'note') {
        useNotesStore.getState().removeLocalNote(tempChildId);
      } else if (childType === 'image') {
        // useImagesStore.getState().removeLocalImage(tempChildId);
      }
    }
  },

   updateNode: async (id, updates) => {
    // Optimistic update (immediate UI response)
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));

    // Debounce the API call (only save after 500ms of no movement)
    if (updateTimeout) clearTimeout(updateTimeout);
    
    updateTimeout = setTimeout(async () => {
      try {
        await updateNodeApi(id, updates);
      } catch (err) {
        console.error('Failed to update node:', err);
      }
    }, 500);
  },

  removeNode: async (id) => {
    const node = get().nodes.find((n) => n.id === id);
    
    // Remove from local state
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    }));

    // Remove child from appropriate store
    if (node) {
      if (node.child_type === 'note' && node.child_id) {
        useNotesStore.getState().removeLocalNote(node.child_id);
      } else if (node.child_type === 'image' && node.child_id) {
        // useImagesStore.getState().removeLocalImage(node.child_id);
      }
    }

    try {
      await deleteNodeApi(id);
    } catch (err) {
      console.error('Failed to delete node:', err);
    }
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },
}));