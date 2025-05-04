import { create } from 'zustand';
import type { ShapeConfig, Page } from '@/types/editor'; // Import Page type
import { produce } from 'immer'; // For easier state updates
import { v4 as uuidv4 } from 'uuid'; // For generating page IDs

interface EditorState {
  pages: Page[]; // Store multiple pages
  currentPageId: string | null; // Track the active page ID
  selectedShapeId: string | null;
  history: { pages: Page[]; currentPageId: string | null }[]; // History includes full page state
  historyIndex: number;
  addShape: (shape: Partial<ShapeConfig>) => void; // Allow partial shape for creation defaults
  updateShape: (id: string, updates: Partial<ShapeConfig> | { props: Record<string, any> }) => void;
  deleteShape: (id: string) => void;
  setSelectedShapeId: (id: string | null) => void;
  addPage: () => void;
  deletePage: (pageId: string) => void;
  setCurrentPageId: (pageId: string | null) => void;
  undo: () => void;
  redo: () => void;
  // Add other state properties like zoomLevel etc. if needed
}

const MAX_HISTORY = 50; // Limit undo history
const DEFAULT_FONT = 'Arial, sans-serif'; // Define default font

// Helper function to get the current page's shapes or an empty array
const getCurrentPageShapes = (state: EditorState): ShapeConfig[] => {
    if (!state.currentPageId) return [];
    const currentPage = state.pages.find(p => p.id === state.currentPageId);
    return currentPage ? currentPage.shapes : [];
};

// Helper function to get the index of the current page
const getCurrentPageIndex = (state: EditorState): number => {
    if (!state.currentPageId) return -1;
    return state.pages.findIndex(p => p.id === state.currentPageId);
};

// Helper to save state to history
const saveHistory = (state: EditorState) => {
    const nextHistory = state.history.slice(0, state.historyIndex + 1);
    // Deep copy the relevant state for history
    const stateToSave = {
        pages: JSON.parse(JSON.stringify(state.pages)), // Deep copy pages
        currentPageId: state.currentPageId,
    };
    nextHistory.push(stateToSave);
    state.history = nextHistory.slice(-MAX_HISTORY); // Limit history size
    state.historyIndex = state.history.length - 1;
    console.log("History saved, index:", state.historyIndex, "length:", state.history.length);
};

export const useEditorStore = create<EditorState>((set, get) => ({
    // Initialize with one default page
    pages: [{ id: uuidv4(), name: 'Page 1', shapes: [] }],
    currentPageId: null, // Start with no page selected explicitly, set on mount
    selectedShapeId: null,
    history: [{ pages: [{ id: 'initial', name: 'Page 1', shapes: [] }], currentPageId: null }], // Initial history state
    historyIndex: 0,

    // Initialize currentPageId on mount if needed (e.g., in a useEffect in the layout)
    // For now, let's assume the first page is selected initially by the UI logic
    // setCurrentPageId: (pageId) => set({ currentPageId: pageId, selectedShapeId: null }), // Clear shape selection on page change


  addShape: (shapeData) => set(produce((state: EditorState) => {
    const pageIndex = getCurrentPageIndex(state);
    if (pageIndex === -1) return; // No current page

    const newId = uuidv4(); // Generate ID here
    // Apply defaults for potentially missing properties
    const newShapeWithDefaults: ShapeConfig = {
        id: newId,
        type: shapeData.type!, // Assume type is always provided
        left: shapeData.left ?? 100 + Math.random() * 100, // Default position
        top: shapeData.top ?? 100 + Math.random() * 100,
        width: shapeData.width ?? (shapeData.type === 'bubble' || shapeData.type === 'text' ? 150 : 200), // Default dimensions based on type
        height: shapeData.height ?? (shapeData.type === 'bubble' || shapeData.type === 'text' ? 80 : 150),
        angle: shapeData.angle ?? 0,
        scaleX: shapeData.scaleX ?? 1,
        scaleY: shapeData.scaleY ?? 1,
        fill: shapeData.fill ?? (shapeData.type === 'panel' ? 'rgba(220, 220, 220, 0.5)' : (shapeData.type === 'bubble' ? 'white' : (shapeData.type === 'image' ? '#f0f0f0' : (shapeData.type === 'text' ? 'black' : 'transparent')))), // Type-specific default fill
        stroke: shapeData.stroke ?? (shapeData.type === 'text' || shapeData.type === 'image' ? undefined : 'black'), // No default stroke for text/image
        strokeWidth: shapeData.strokeWidth ?? (shapeData.type === 'text' ? 0 : 1), // No default strokeWidth for text
        opacity: shapeData.opacity ?? 1,
        visible: shapeData.visible ?? true,
        props: {
            ...shapeData.props,
            // Add default font family if it's text or bubble and font family isn't provided
            ...( (shapeData.type === 'text' || shapeData.type === 'bubble') && !shapeData.props?.fontFamily
                ? { fontFamily: DEFAULT_FONT }
                : {}
             ),
             // Add default text if it's text or bubble and text isn't provided
              ...( (shapeData.type === 'text' || shapeData.type === 'bubble') && !shapeData.props?.text
                  ? { text: shapeData.type === 'text' ? 'New Text' : 'Bubble' }
                  : {}
              ),
              // Add default fontSize if it's text or bubble and fontSize isn't provided
              ...( (shapeData.type === 'text' || shapeData.type === 'bubble') && !shapeData.props?.fontSize
                  ? { fontSize: shapeData.type === 'text' ? 20 : 14 }
                  : {}
              ),
               // Add default bubbleType if it's bubble and bubbleType isn't provided
              ...( shapeData.type === 'bubble' && !shapeData.props?.bubbleType
                  ? { bubbleType: 'speech' }
                  : {}
              ),
              // Add default textColor if it's bubble and textColor isn't provided
              ...( shapeData.type === 'bubble' && !shapeData.props?.textColor
                  ? { textColor: 'black' }
                  : {}
              ),
        },
         // Add src for image if not provided (placeholder)
         ...(shapeData.type === 'image' && !shapeData.src ? { src: `https://picsum.photos/seed/${newId.substring(0,6)}/150/100` } : { src: shapeData.src }),
    };
    state.pages[pageIndex].shapes.push(newShapeWithDefaults);
    state.selectedShapeId = newId; // Select the newly added shape
    saveHistory(state);
  })),

  updateShape: (id, updates) => set(produce((state: EditorState) => {
    const pageIndex = getCurrentPageIndex(state);
    if (pageIndex === -1) return;

    const shapeIndex = state.pages[pageIndex].shapes.findIndex((s) => s.id === id);
    if (shapeIndex !== -1) {
        const currentShape = state.pages[pageIndex].shapes[shapeIndex];
        let changed = false;
        const newUpdates = { ...updates };

        // Merge 'props' object specifically if present in updates
        if ('props' in newUpdates && typeof newUpdates.props === 'object' && newUpdates.props !== null) {
            const mergedProps = { ...currentShape.props, ...newUpdates.props };
            // Check if props actually changed before marking as changed
            if (JSON.stringify(currentShape.props) !== JSON.stringify(mergedProps)) {
                state.pages[pageIndex].shapes[shapeIndex].props = mergedProps;
                changed = true;
            }
            delete newUpdates.props; // Remove props from newUpdates after merging
        }

        // Apply remaining top-level updates
        for (const key in newUpdates) {
            if (Object.prototype.hasOwnProperty.call(newUpdates, key)) {
                const updateKey = key as keyof ShapeConfig;
                 const newValue = (newUpdates as any)[updateKey];
                 // Only update if the value is different
                 if (currentShape[updateKey] !== newValue) {
                    (state.pages[pageIndex].shapes[shapeIndex] as any)[updateKey] = newValue;
                    changed = true;
                }
            }
        }

       if (changed) {
            saveHistory(state);
       }
    }
  })),

  deleteShape: (id) => set(produce((state: EditorState) => {
    const pageIndex = getCurrentPageIndex(state);
    if (pageIndex === -1) return;

    const initialLength = state.pages[pageIndex].shapes.length;
    state.pages[pageIndex].shapes = state.pages[pageIndex].shapes.filter((s) => s.id !== id);

    if (state.selectedShapeId === id) {
      state.selectedShapeId = null;
    }
     if (state.pages[pageIndex].shapes.length < initialLength) {
        saveHistory(state);
     }
  })),

  setSelectedShapeId: (id) => set({ selectedShapeId: id }),

  addPage: () => set(produce((state: EditorState) => {
      const newPageId = uuidv4();
      const newPage: Page = {
          id: newPageId,
          name: `Page ${state.pages.length + 1}`,
          shapes: [],
      };
      state.pages.push(newPage);
      state.currentPageId = newPageId; // Switch to the new page
      state.selectedShapeId = null; // Deselect shape
      saveHistory(state);
      console.log("Page added:", newPageId, "CurrentPage:", state.currentPageId);
  })),

  deletePage: (pageId) => set(produce((state: EditorState) => {
      if (state.pages.length <= 1) return; // Don't delete the last page

      const pageIndexToDelete = state.pages.findIndex(p => p.id === pageId);
      if (pageIndexToDelete === -1) return;

      state.pages.splice(pageIndexToDelete, 1);

      // If the deleted page was the current page, switch to another page
      if (state.currentPageId === pageId) {
          const newCurrentIndex = Math.max(0, pageIndexToDelete - 1);
          state.currentPageId = state.pages[newCurrentIndex]?.id || null;
      }
      state.selectedShapeId = null; // Deselect shape
      saveHistory(state);
      console.log("Page deleted:", pageId, "CurrentPage:", state.currentPageId);
  })),

  setCurrentPageId: (pageId) => set(produce((state: EditorState) => {
    // Check if pageId exists before setting
    if (state.pages.some(p => p.id === pageId)) {
        if (state.currentPageId !== pageId) {
            state.currentPageId = pageId;
            state.selectedShapeId = null; // Deselect shape when switching pages
            // Optionally save history on page switch? Depends on desired undo behavior.
            // saveHistory(state);
             console.log("Current page set to:", pageId);
        }
    } else if (state.pages.length > 0 && pageId === null) {
        // Allow setting to null or handle defaulting
        state.currentPageId = state.pages[0].id; // Default to first page if set to null explicitly?
        state.selectedShapeId = null;
         console.log("Current page defaulted to first page:", state.currentPageId);
    } else if (state.pages.length === 0) {
         state.currentPageId = null;
         state.selectedShapeId = null;
         console.log("No pages available, current page set to null");
    } else {
         console.warn(`Attempted to set current page to non-existent ID: ${pageId}`);
    }
  })),


  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const previousState = state.history[newIndex];
       console.log("Undo to index:", newIndex);
      return {
        historyIndex: newIndex,
        // Restore pages and currentPageId from history (ensure deep copy)
        pages: JSON.parse(JSON.stringify(previousState.pages)),
        currentPageId: previousState.currentPageId,
        selectedShapeId: null, // Deselect on undo
      };
    }
    console.log("Undo: Already at oldest state");
    return {}; // No change if at the beginning of history
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const nextState = state.history[newIndex];
      console.log("Redo to index:", newIndex);
      return {
        historyIndex: newIndex,
         // Restore pages and currentPageId from history (ensure deep copy)
         pages: JSON.parse(JSON.stringify(nextState.pages)),
         currentPageId: nextState.currentPageId,
        selectedShapeId: null, // Deselect on redo
      };
    }
    console.log("Redo: Already at newest state");
    return {}; // No change if at the end of history
  }),
}));

// Initialize current page ID after store creation if pages exist
const initialState = useEditorStore.getState();
if (initialState.pages.length > 0 && !initialState.currentPageId) {
  useEditorStore.setState({ currentPageId: initialState.pages[0].id });
  // Update initial history state as well
   useEditorStore.setState(produce((state: EditorState) => {
       state.history[0].currentPageId = state.pages[0].id;
   }));
}
