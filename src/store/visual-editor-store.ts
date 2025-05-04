import { create } from 'zustand';
import type { Node, Edge, Viewport } from 'reactflow';
import type { NodeData } from '@/types/nodes'; // Assuming NodeData definition

interface VisualEditorState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNode: Node<NodeData> | null;
  viewport: Viewport;
  viewportInitialized: boolean; // Track if fitView ran on initial load
  refreshCounter: number; // Counter to trigger data refresh
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node<NodeData> | null) => void;
  setViewport: (viewport: Viewport) => void;
  setViewportInitialized: (initialized: boolean) => void;
  refreshFlowData: () => void; // Action to increment counter
}

export const useVisualEditorStore = create<VisualEditorState>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  viewport: { x: 0, y: 0, zoom: 1 }, // Default viewport
  viewportInitialized: false,
  refreshCounter: 0, // Initial counter value
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setViewport: (viewport) => set({ viewport }),
   setViewportInitialized: (initialized) => set({ viewportInitialized: initialized }),
  refreshFlowData: () => set((state) => ({ refreshCounter: state.refreshCounter + 1 })),
}));
