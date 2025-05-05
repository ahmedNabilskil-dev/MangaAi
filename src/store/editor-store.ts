import { create } from 'zustand';
import type { ShapeConfig, Page, GridSettings, PageDimensions } from '@/types/editor'; // Import new types
import { produce } from 'immer'; // For easier state updates
import { v4 as uuidv4 } from 'uuid'; // For generating page IDs

interface EditorHistoryState {
    pages: Page[];
    currentPageId: string | null;
    // Add other state relevant to history if needed
}

interface EditorState {
  pages: Page[]; // Store multiple pages
  currentPageId: string | null; // Track the active page ID
  selectedShapeId: string | null;
  selectedShapeIds: string[]; // For multi-select
  history: EditorHistoryState[]; // History includes full page state
  historyIndex: number;
  zoom: number;
  gridSettings: GridSettings;
  // No need to store panOffset here, canvas manages its viewport

  // Actions
  addShape: (shape: Partial<ShapeConfig>) => void; // Allow partial shape for creation defaults
  updateShape: (id: string, updates: Partial<ShapeConfig> | { props: Record<string, any> } | { fabricProps: Record<string, any> }) => void;
  updateShapes: (ids: string[], updates: Partial<ShapeConfig> | { props: Record<string, any> } | { fabricProps: Record<string, any> }) => void; // For multi-update
  deleteShape: (id: string) => void;
  deleteShapes: (ids: string[]) => void; // For multi-delete
  setSelectedShapeId: (id: string | null) => void;
  setSelectedShapeIds: (ids: string[]) => void;
  addPage: () => void;
  deletePage: (pageId: string) => void;
  updatePage: (pageId: string, updates: Partial<Omit<Page, 'id' | 'shapes'>>) => void; // Update page settings like dimensions
  setCurrentPageId: (pageId: string | null) => void;
  setZoom: (zoom: number | ((prevZoom: number) => number)) => void;
  setGridSettings: (settings: Partial<GridSettings>) => void;
  undo: () => void;
  redo: () => void;
  groupShapes: (ids: string[]) => void; // Action for grouping
  ungroupShape: (id: string) => void; // Action for ungrouping
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  // Add other state properties like zoomLevel etc. if needed
}

const MAX_HISTORY = 50; // Limit undo history
const DEFAULT_FONT = 'Arial, sans-serif'; // Define default font
const DEFAULT_PAGE_DIMENSIONS: PageDimensions = { width: 850, height: 1100, unit: 'px', dpi: 96 }; // Approx A4 at 96 DPI
const DEFAULT_GRID_SETTINGS: GridSettings = { visible: false, spacing: 50, color: '#e0e0e0' };

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
    const stateToSave: EditorHistoryState = {
        pages: JSON.parse(JSON.stringify(state.pages)), // Deep copy pages
        currentPageId: state.currentPageId,
    };
    // Prevent saving identical state to the previous one
    if (state.history.length > 0 && JSON.stringify(state.history[state.historyIndex]) === JSON.stringify(stateToSave)) {
        console.log("History: State unchanged, not saving.");
        return;
    }
    nextHistory.push(stateToSave);
    state.history = nextHistory.slice(-MAX_HISTORY); // Limit history size
    state.historyIndex = state.history.length - 1;
    console.log("History saved, index:", state.historyIndex, "length:", state.history.length);
};

// --- Default Initial Page ---
const initialPageId = uuidv4();
const initialPage: Page = {
    id: initialPageId,
    name: 'Page 1',
    shapes: [],
    dimensions: { ...DEFAULT_PAGE_DIMENSIONS }
};

export const useEditorStore = create<EditorState>((set, get) => ({
    pages: [initialPage],
    currentPageId: initialPageId, // Start with the first page selected
    selectedShapeId: null,
    selectedShapeIds: [],
    history: [{ pages: JSON.parse(JSON.stringify([initialPage])), currentPageId: initialPageId }], // Initial history state
    historyIndex: 0,
    zoom: 1,
    gridSettings: { ...DEFAULT_GRID_SETTINGS },


    // --- Shape Actions ---
    addShape: (shapeData) => set(produce((state: EditorState) => {
        const pageIndex = getCurrentPageIndex(state);
        if (pageIndex === -1) return;

        const newId = uuidv4();
        const newShapeWithDefaults: ShapeConfig = {
            id: newId,
            type: shapeData.type!,
            left: shapeData.left ?? 100 + Math.random() * 100,
            top: shapeData.top ?? 100 + Math.random() * 100,
            width: shapeData.width ?? (shapeData.type === 'bubble' || shapeData.type === 'text' ? 150 : 200),
            height: shapeData.height ?? (shapeData.type === 'bubble' || shapeData.type === 'text' ? 80 : 150),
            angle: shapeData.angle ?? 0,
            scaleX: shapeData.scaleX ?? 1,
            scaleY: shapeData.scaleY ?? 1,
            fill: shapeData.fill ?? (shapeData.type === 'panel' ? 'rgba(220, 220, 220, 0.5)' : (shapeData.type === 'bubble' ? 'white' : (shapeData.type === 'image' ? '#f0f0f0' : (shapeData.type === 'text' ? 'black' : 'transparent')))),
            stroke: shapeData.stroke ?? (shapeData.type === 'text' || shapeData.type === 'image' ? undefined : 'black'),
            strokeWidth: shapeData.strokeWidth ?? (shapeData.type === 'text' ? 0 : 1),
            opacity: shapeData.opacity ?? 1,
            visible: shapeData.visible ?? true,
            locked: false,
            fabricProps: {}, // Initialize fabricProps
            props: {
                ...shapeData.props,
                ...( (shapeData.type === 'text' || shapeData.type === 'bubble') && !shapeData.props?.fontFamily ? { fontFamily: DEFAULT_FONT } : {} ),
                ...( (shapeData.type === 'text' || shapeData.type === 'bubble') && !shapeData.props?.text ? { text: shapeData.type === 'text' ? 'New Text' : 'Bubble' } : {} ),
                ...( (shapeData.type === 'text' || shapeData.type === 'bubble') && !shapeData.props?.fontSize ? { fontSize: shapeData.type === 'text' ? 20 : 14 } : {} ),
                ...( shapeData.type === 'bubble' && !shapeData.props?.bubbleType ? { bubbleType: 'speech' } : {} ),
                ...( shapeData.type === 'bubble' && !shapeData.props?.textColor ? { textColor: 'black' } : {} ),
            },
            ...(shapeData.type === 'image' && !shapeData.src ? { src: `https://picsum.photos/seed/${newId.substring(0,6)}/150/100` } : { src: shapeData.src }),
        };
        state.pages[pageIndex].shapes.push(newShapeWithDefaults);
        state.selectedShapeId = newId; // Select the newly added shape
        state.selectedShapeIds = [newId];
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

            // Merge 'props' object specifically
            if ('props' in newUpdates && typeof newUpdates.props === 'object' && newUpdates.props !== null) {
                const mergedProps = { ...currentShape.props, ...newUpdates.props };
                if (JSON.stringify(currentShape.props) !== JSON.stringify(mergedProps)) {
                    state.pages[pageIndex].shapes[shapeIndex].props = mergedProps;
                    changed = true;
                }
                delete newUpdates.props;
            }

            // Merge 'fabricProps' object specifically
            if ('fabricProps' in newUpdates && typeof newUpdates.fabricProps === 'object' && newUpdates.fabricProps !== null) {
                const mergedFabricProps = { ...currentShape.fabricProps, ...newUpdates.fabricProps };
                 if (JSON.stringify(currentShape.fabricProps) !== JSON.stringify(mergedFabricProps)) {
                    state.pages[pageIndex].shapes[shapeIndex].fabricProps = mergedFabricProps;
                    // Update top-level 'locked' and 'visible' based on fabricProps if they exist
                    if (mergedFabricProps.selectable !== undefined) state.pages[pageIndex].shapes[shapeIndex].locked = !mergedFabricProps.selectable;
                    if (mergedFabricProps.visible !== undefined) state.pages[pageIndex].shapes[shapeIndex].visible = mergedFabricProps.visible;
                    changed = true;
                 }
                delete newUpdates.fabricProps;
            }


            // Apply remaining top-level updates
            for (const key in newUpdates) {
                if (Object.prototype.hasOwnProperty.call(newUpdates, key)) {
                    const updateKey = key as keyof ShapeConfig;
                    const newValue = (newUpdates as any)[updateKey];
                    if (currentShape[updateKey] !== newValue) {
                        (state.pages[pageIndex].shapes[shapeIndex] as any)[updateKey] = newValue;
                         // Sync fabricProps if top-level 'locked' or 'visible' is updated
                         if (updateKey === 'locked') {
                             state.pages[pageIndex].shapes[shapeIndex].fabricProps = {
                                 ...state.pages[pageIndex].shapes[shapeIndex].fabricProps,
                                 selectable: !newValue, // selectable is the inverse of locked
                                 evented: !newValue,    // also disable events when locked
                                 hasControls: !newValue,
                                 hasBorders: !newValue
                             };
                         }
                         if (updateKey === 'visible') {
                             state.pages[pageIndex].shapes[shapeIndex].fabricProps = {
                                 ...state.pages[pageIndex].shapes[shapeIndex].fabricProps,
                                 visible: newValue
                             };
                         }
                        changed = true;
                    }
                }
            }

            if (changed) {
                saveHistory(state);
            }
        }
    })),

     updateShapes: (ids, updates) => set(produce((state: EditorState) => {
         const pageIndex = getCurrentPageIndex(state);
         if (pageIndex === -1) return;
         let changed = false;

         ids.forEach(id => {
             const shapeIndex = state.pages[pageIndex].shapes.findIndex((s) => s.id === id);
             if (shapeIndex !== -1) {
                 const currentShape = state.pages[pageIndex].shapes[shapeIndex];
                 const newUpdates = { ...updates };

                 // Merge 'props'
                 if ('props' in newUpdates && typeof newUpdates.props === 'object' && newUpdates.props !== null) {
                     const mergedProps = { ...currentShape.props, ...newUpdates.props };
                     if (JSON.stringify(currentShape.props) !== JSON.stringify(mergedProps)) {
                         state.pages[pageIndex].shapes[shapeIndex].props = mergedProps;
                         changed = true;
                     }
                     delete newUpdates.props;
                 }

                 // Merge 'fabricProps'
                 if ('fabricProps' in newUpdates && typeof newUpdates.fabricProps === 'object' && newUpdates.fabricProps !== null) {
                     const mergedFabricProps = { ...currentShape.fabricProps, ...newUpdates.fabricProps };
                      if (JSON.stringify(currentShape.fabricProps) !== JSON.stringify(mergedFabricProps)) {
                        state.pages[pageIndex].shapes[shapeIndex].fabricProps = mergedFabricProps;
                         if (mergedFabricProps.selectable !== undefined) state.pages[pageIndex].shapes[shapeIndex].locked = !mergedFabricProps.selectable;
                         if (mergedFabricProps.visible !== undefined) state.pages[pageIndex].shapes[shapeIndex].visible = mergedFabricProps.visible;
                        changed = true;
                     }
                    delete newUpdates.fabricProps;
                 }

                 // Apply remaining top-level updates
                 for (const key in newUpdates) {
                     if (Object.prototype.hasOwnProperty.call(newUpdates, key)) {
                         const updateKey = key as keyof ShapeConfig;
                         const newValue = (newUpdates as any)[updateKey];
                          if (currentShape[updateKey] !== newValue) {
                            (state.pages[pageIndex].shapes[shapeIndex] as any)[updateKey] = newValue;
                             if (updateKey === 'locked') {
                                state.pages[pageIndex].shapes[shapeIndex].fabricProps = {
                                    ...state.pages[pageIndex].shapes[shapeIndex].fabricProps,
                                    selectable: !newValue, evented: !newValue, hasControls: !newValue, hasBorders: !newValue };
                            }
                            if (updateKey === 'visible') {
                                state.pages[pageIndex].shapes[shapeIndex].fabricProps = {
                                    ...state.pages[pageIndex].shapes[shapeIndex].fabricProps, visible: newValue };
                            }
                            changed = true;
                         }
                     }
                 }
             }
         });

         if (changed) {
             saveHistory(state);
         }
     })),


    deleteShape: (id) => get().deleteShapes([id]), // Delegate to multi-delete

    deleteShapes: (ids) => set(produce((state: EditorState) => {
        const pageIndex = getCurrentPageIndex(state);
        if (pageIndex === -1) return;

        const initialLength = state.pages[pageIndex].shapes.length;
        state.pages[pageIndex].shapes = state.pages[pageIndex].shapes.filter((s) => !ids.includes(s.id));

        const newSelectedIds = state.selectedShapeIds.filter(selectedId => !ids.includes(selectedId));

        if (state.pages[pageIndex].shapes.length < initialLength) {
            state.selectedShapeIds = newSelectedIds;
            state.selectedShapeId = newSelectedIds.length === 1 ? newSelectedIds[0] : null;
            saveHistory(state);
        }
    })),

    // --- Selection Actions ---
    setSelectedShapeId: (id) => set(produce((state: EditorState) => {
        state.selectedShapeId = id;
        state.selectedShapeIds = id ? [id] : [];
    })),

     setSelectedShapeIds: (ids) => set(produce((state: EditorState) => {
        state.selectedShapeIds = ids;
        state.selectedShapeId = ids.length === 1 ? ids[0] : null;
     })),

    // --- Page Actions ---
    addPage: () => set(produce((state: EditorState) => {
        const newPageId = uuidv4();
        const newPage: Page = {
            id: newPageId,
            name: `Page ${state.pages.length + 1}`,
            shapes: [],
            dimensions: { ...DEFAULT_PAGE_DIMENSIONS }, // Add default dimensions
        };
        state.pages.push(newPage);
        state.currentPageId = newPageId;
        state.selectedShapeId = null;
        state.selectedShapeIds = [];
        saveHistory(state);
        console.log("Page added:", newPageId, "CurrentPage:", state.currentPageId);
    })),

    deletePage: (pageId) => set(produce((state: EditorState) => {
        if (state.pages.length <= 1) return;

        const pageIndexToDelete = state.pages.findIndex(p => p.id === pageId);
        if (pageIndexToDelete === -1) return;

        state.pages.splice(pageIndexToDelete, 1);

        if (state.currentPageId === pageId) {
            const newCurrentIndex = Math.max(0, pageIndexToDelete - 1);
            state.currentPageId = state.pages[newCurrentIndex]?.id || null;
        }
        state.selectedShapeId = null;
        state.selectedShapeIds = [];
        saveHistory(state);
        console.log("Page deleted:", pageId, "CurrentPage:", state.currentPageId);
    })),

    updatePage: (pageId, updates) => set(produce((state: EditorState) => {
        const pageIndex = state.pages.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;
        let changed = false;
        const currentPage = state.pages[pageIndex];

        // Update dimensions specifically
        if (updates.dimensions) {
            const mergedDimensions = { ...currentPage.dimensions, ...updates.dimensions };
            if (JSON.stringify(currentPage.dimensions) !== JSON.stringify(mergedDimensions)) {
                 state.pages[pageIndex].dimensions = mergedDimensions;
                 changed = true;
            }
            delete updates.dimensions; // Remove from general updates
        }


        // Apply other potential page updates (like name)
        for (const key in updates) {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
                const updateKey = key as keyof Omit<Page, 'id' | 'shapes'>;
                 const newValue = (updates as any)[updateKey];
                 if (currentPage[updateKey] !== newValue) {
                    (state.pages[pageIndex] as any)[updateKey] = newValue;
                    changed = true;
                 }
            }
        }

        if (changed) {
            saveHistory(state);
        }
    })),


    setCurrentPageId: (pageId) => set(produce((state: EditorState) => {
        if (state.pages.some(p => p.id === pageId)) {
            if (state.currentPageId !== pageId) {
                state.currentPageId = pageId;
                state.selectedShapeId = null;
                state.selectedShapeIds = [];
                 console.log("Current page set to:", pageId);
            }
        } else if (state.pages.length > 0 && pageId === null) {
            state.currentPageId = state.pages[0].id;
            state.selectedShapeId = null;
            state.selectedShapeIds = [];
            console.log("Current page defaulted to first page:", state.currentPageId);
        } else if (state.pages.length === 0) {
            state.currentPageId = null;
            state.selectedShapeId = null;
            state.selectedShapeIds = [];
            console.log("No pages available, current page set to null");
        } else {
            console.warn(`Attempted to set current page to non-existent ID: ${pageId}`);
        }
    })),

    // --- Canvas Control Actions ---
    setZoom: (zoom) => set((state) => ({
        zoom: typeof zoom === 'function' ? zoom(state.zoom) : zoom,
    })),

    setGridSettings: (settings) => set((state) => ({
        gridSettings: { ...state.gridSettings, ...settings },
    })),


    // --- History Actions ---
    undo: () => set((state) => {
        if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1;
            const previousState = state.history[newIndex];
            console.log("Undo to index:", newIndex);
            return {
                historyIndex: newIndex,
                pages: JSON.parse(JSON.stringify(previousState.pages)),
                currentPageId: previousState.currentPageId,
                selectedShapeId: null,
                selectedShapeIds: [],
            };
        }
        console.log("Undo: Already at oldest state");
        return {};
    }),

    redo: () => set((state) => {
        if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1;
            const nextState = state.history[newIndex];
            console.log("Redo to index:", newIndex);
            return {
                historyIndex: newIndex,
                pages: JSON.parse(JSON.stringify(nextState.pages)),
                currentPageId: nextState.currentPageId,
                selectedShapeId: null,
                selectedShapeIds: [],
            };
        }
        console.log("Redo: Already at newest state");
        return {};
    }),

    // --- Layering Actions ---
    bringToFront: (id) => set(produce((state: EditorState) => {
        const pageIndex = getCurrentPageIndex(state);
        if (pageIndex === -1) return;
        const shapeIndex = state.pages[pageIndex].shapes.findIndex(s => s.id === id);
        if (shapeIndex !== -1 && shapeIndex < state.pages[pageIndex].shapes.length - 1) {
            const [shape] = state.pages[pageIndex].shapes.splice(shapeIndex, 1);
            state.pages[pageIndex].shapes.push(shape);
            saveHistory(state);
        }
    })),

    sendToBack: (id) => set(produce((state: EditorState) => {
        const pageIndex = getCurrentPageIndex(state);
        if (pageIndex === -1) return;
        const shapeIndex = state.pages[pageIndex].shapes.findIndex(s => s.id === id);
        if (shapeIndex > 0) {
            const [shape] = state.pages[pageIndex].shapes.splice(shapeIndex, 1);
            state.pages[pageIndex].shapes.unshift(shape);
            saveHistory(state);
        }
    })),

    bringForward: (id) => set(produce((state: EditorState) => {
        const pageIndex = getCurrentPageIndex(state);
        if (pageIndex === -1) return;
        const shapeIndex = state.pages[pageIndex].shapes.findIndex(s => s.id === id);
        if (shapeIndex !== -1 && shapeIndex < state.pages[pageIndex].shapes.length - 1) {
            const [shape] = state.pages[pageIndex].shapes.splice(shapeIndex, 1);
            state.pages[pageIndex].shapes.splice(shapeIndex + 1, 0, shape);
            saveHistory(state);
        }
    })),

    sendBackward: (id) => set(produce((state: EditorState) => {
        const pageIndex = getCurrentPageIndex(state);
        if (pageIndex === -1) return;
        const shapeIndex = state.pages[pageIndex].shapes.findIndex(s => s.id === id);
        if (shapeIndex > 0) {
            const [shape] = state.pages[pageIndex].shapes.splice(shapeIndex, 1);
            state.pages[pageIndex].shapes.splice(shapeIndex - 1, 0, shape);
            saveHistory(state);
        }
    })),

     // --- Grouping (Placeholder - Fabric handles grouping visually) ---
     groupShapes: (ids) => console.warn("Group shapes action called, needs Fabric implementation", ids),
     ungroupShape: (id) => console.warn("Ungroup shape action called, needs Fabric implementation", id),

}));

// Initialize current page ID after store creation if pages exist (redundant check removed as initial state handles it)
// const initialState = useEditorStore.getState();
// if (initialState.pages.length > 0 && !initialState.currentPageId) {
//   useEditorStore.setState({ currentPageId: initialState.pages[0].id });
//   useEditorStore.setState(produce((state: EditorState) => {
//        state.history[0].currentPageId = state.pages[0].id;
//    }));
// }
