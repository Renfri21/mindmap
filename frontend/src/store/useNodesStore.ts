import { create } from 'zustand';
import type { Node } from '../types/Node';
import type { Note } from '../types/Note';
import type { Image } from '../types/Image';
import {
  fetchNodesApi,
  createNodeApi,
  updateNodeApi,
  deleteNodeApi,
} from '../api/nodes.api';


interface NodesStore {
  nodes: Node[];
  notes: Note[];
  images: Image[];
  selectedNodeId: number | null;
  addNode: (node: Node) => void;
  updateNode: (id: number, updates: Partial<Node>) => void;
  selectNode: (id: number | null) => void;
  updateNote: (id: number, updates: Partial<Note>) => void;
  updateImage: (id: number, updates: Partial<Image>) => void;
}

export const useNodesStore = create<NodesStore>((set, get) => ({
  nodes: [],
  notes: [],
  images: [],
  selectedNodeId: null,
  fetchNodes: async () => {
    try {
      set({ loading: true });
      const nodes = await fetchNodesApi();
      set({ nodes, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch nodes', loading: false });
    }
  },
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, ...updates } : n)
  })),
  selectNode: (id) => set({ selectedNodeId: id }),

  updateNote: (id, updates) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, ...updates } : n)
  })),

  updateImage: (id, updates) => set((state) => ({
    images: state.images.map(i => i.id === id ? { ...i, ...updates } : i)
  })),
}));
