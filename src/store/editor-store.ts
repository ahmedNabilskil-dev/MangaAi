import { create } from 'zustand';
import type { ShapeConfig } from '@/types/editor';
import { produce } from 'immer'; // For easier state updates

interface EditorState {
  shapes: ShapeConfig[];
  selectedShapeId: string | null;
  history: ShapeConfig[][]; // For undo/redo
  historyIndex: number;
  addShape: (shape: ShapeConfig) => void;
  // Update signature to reflect potential Fabric properties directly
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
    // Ensure default Fabric properties if not provided
    const newShapeWithDefaults: ShapeConfig = {
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        opacity: 1,
        visible: true,
        ...shape,
        left: shape.left ?? 100 + Math.random() * 100, // Default position
        top: shape.top ?? 100 + Math.random() * 100,
    };
    state.shapes.push(newShapeWithDefaults);
    // Add to history
     const nextHistory = state.history.slice(0, state.historyIndex + 1);
     nextHistory.push([...state.shapes]); // Add deep copy
     state.history = nextHistory.slice(-MAX_HISTORY); // Limit history size
     state.historyIndex = state.history.length - 1;
     state.selectedShapeId = newShapeWithDefaults.id; // Select the newly added shape
  })),

  updateShape: (id, updates) => set(produce((state: EditorState) => {
    const shapeIndex = state.shapes.findIndex((s) => s.id === id);
    if (shapeIndex !== -1) {
        const currentShape = state.shapes[shapeIndex];
        let changed = false;

        // Apply updates intelligently
        const newUpdates = { ...updates }; // Clone updates to avoid modifying the original object

        // Handle nested 'props' update first if present
        if ('props' in newUpdates && typeof newUpdates.props === 'object' && newUpdates.props !== null) {
            const mergedProps = { ...currentShape.props, ...newUpdates.props };
            if (JSON.stringify(currentShape.props) !== JSON.stringify(mergedProps)) {
                state.shapes[shapeIndex].props = mergedProps;
                changed = true;
            }
            delete newUpdates.props; // Remove props from top-level updates
        }

        // Apply remaining top-level updates (left, top, width, height, angle, fill, etc.)
        for (const key in newUpdates) {
            if (Object.prototype.hasOwnProperty.call(newUpdates, key)) {
                const updateKey = key as keyof ShapeConfig;
                 // Type assertion needed as newUpdates is Partial<ShapeConfig>
                 const newValue = (newUpdates as any)[updateKey];
                if (currentShape[updateKey] !== newValue) {
                     // Type assertion needed for dynamic assignment
                    (state.shapes[shapeIndex] as any)[updateKey] = newValue;
                    changed = true;
                }
            }
        }


       // Update history only if shape actually changed
       if (changed) {
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
