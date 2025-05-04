import { create } from 'zustand';
import type { ShapeConfig } from '@/types/editor';
import { produce } from 'immer'; // For easier state updates

interface EditorState {
  shapes: ShapeConfig[];
  selectedShapeId: string | null;
  history: ShapeConfig[][]; // For undo/redo
  historyIndex: number;
  addShape: (shape: ShapeConfig) => void;
  updateShape: (id: string, updates: Partial<ShapeConfig> | { props: Record<string, any> }) => void;
  deleteShape: (id: string) => void;
  setSelectedShapeId: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  // Add other state properties like currentPage, zoomLevel etc. if needed
}

const MAX_HISTORY = 50; // Limit undo history

export const useEditorStore = create<EditorState>((set, get) => ({
  shapes: [],
  selectedShapeId: null,
  history: [[]], // Start with initial empty state
  historyIndex: 0,

  addShape: (shape) => set(produce((state: EditorState) => {
    state.shapes.push(shape);
    // Add to history
     const nextHistory = state.history.slice(0, state.historyIndex + 1);
     nextHistory.push([...state.shapes]); // Add deep copy
     state.history = nextHistory.slice(-MAX_HISTORY); // Limit history size
     state.historyIndex = state.history.length - 1;
     state.selectedShapeId = shape.id; // Select the newly added shape
  })),

  updateShape: (id, updates) => set(produce((state: EditorState) => {
    const shapeIndex = state.shapes.findIndex((s) => s.id === id);
    if (shapeIndex !== -1) {
        const currentShape = state.shapes[shapeIndex];

        // Check if updating props or top-level properties
        if ('props' in updates && updates.props) {
            // Merge new props with existing props
            state.shapes[shapeIndex].props = {
               ...currentShape.props,
               ...updates.props,
            };
             // Merge other top-level updates if provided alongside props
             Object.keys(updates).forEach(key => {
                if (key !== 'props') {
                    (state.shapes[shapeIndex] as any)[key] = (updates as any)[key];
                }
             });

        } else {
             // Merge top-level updates directly
             state.shapes[shapeIndex] = { ...currentShape, ...updates };
        }


       // Update history only if shape actually changed (simple check)
       // A more robust check might compare objects deeply
       if (JSON.stringify(currentShape) !== JSON.stringify(state.shapes[shapeIndex])) {
            const nextHistory = state.history.slice(0, state.historyIndex + 1);
            nextHistory.push([...state.shapes]); // Add deep copy
            state.history = nextHistory.slice(-MAX_HISTORY);
            state.historyIndex = state.history.length - 1;
       }
    }
  })),

  deleteShape: (id) => set(produce((state: EditorState) => {
    const initialLength = state.shapes.length;
    state.shapes = state.shapes.filter((s) => s.id !== id);
    if (state.selectedShapeId === id) {
      state.selectedShapeId = null;
    }
    // Update history if a shape was actually deleted
     if (state.shapes.length < initialLength) {
        const nextHistory = state.history.slice(0, state.historyIndex + 1);
        nextHistory.push([...state.shapes]); // Add deep copy
        state.history = nextHistory.slice(-MAX_HISTORY);
        state.historyIndex = state.history.length - 1;
     }
  })),

  setSelectedShapeId: (id) => set({ selectedShapeId: id }),

  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      return {
        historyIndex: newIndex,
        shapes: [...state.history[newIndex]], // Load state from history (deep copy)
        selectedShapeId: null, // Deselect on undo
      };
    }
    return {}; // No change if at the beginning of history
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      return {
        historyIndex: newIndex,
        shapes: [...state.history[newIndex]], // Load state from history (deep copy)
        selectedShapeId: null, // Deselect on redo
      };
    }
    return {}; // No change if at the end of history
  }),
}));

// Optional: Add middleware like persist for local storage saving
// import { persist } from 'zustand/middleware';
// export const useEditorStore = create(persist<EditorState>( (set, get) => ({ ... }), { name: 'editor-storage' } ));

// Add devtools middleware for debugging
// import { devtools } from 'zustand/middleware';
// export const useEditorStore = create(devtools<EditorState>( (set, get) => ({ ... }) ));

// Combine middleware
// export const useEditorStore = create(devtools(persist<EditorState>( (set, get) => ({ ... }), { name: 'editor-storage' } )));
