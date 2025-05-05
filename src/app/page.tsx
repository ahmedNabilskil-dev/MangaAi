
'use client';

import React, { useState, useEffect, useRef } from 'react';
import VisualEditor from '@/components/visual-editor/visual-editor';
import Chatbox from '@/components/chatbox/chatbox';
// import PropertiesPanel from '@/components/properties-panel/properties-panel'; // Removed - Handled by EditorLayout now
import { useVisualEditorStore } from '@/store/visual-editor-store';
import TopBar from '@/components/layout/top-bar';
import Draggable from 'react-draggable';
import { useEditorStore } from '@/store/editor-store'; // Import editor store for selected shape (if needed elsewhere)

export default function Home() {
  // Get selected node from visual editor store (React Flow selection)
  const selectedFlowNode = useVisualEditorStore((state) => state.selectedNode);
  // Get selected shape ID from editor store (for properties panel, now handled in panel itself)
  // const selectedShapeId = useEditorStore((state) => state.selectedShapeId);
  // Use Zustand action to clear flow selection
  // const clearFlowSelection = useVisualEditorStore((state) => state.setSelectedNode);
  // Use Zustand action to clear editor shape selection
  // const clearShapeSelection = useEditorStore((state) => state.setSelectedShapeId);


  // State for default positions, calculated on client-side
  const [chatboxPos, setChatboxPos] = useState({ x: 100, y: 400 });
  // const [propertiesPanelPos, setPropertiesPanelPos] = useState({ x: 600, y: 70 }); // No longer needed here

  // Panel visibility controlled by selection from either store
  // const isPanelOpen = !!selectedFlowNode // || !!selectedShapeId; // Simplified - panel determines its own visibility

  // const handlePanelClose = () => {
  //    // Clear selection in both stores when panel is closed (Now handled by panel itself)
  //   clearFlowSelection(null);
  //   clearShapeSelection(null);
  // };

  const projectTitle = "MangaVerse AI"; // Updated Project Title

  const chatboxNodeRef = useRef(null);
  // const propertiesPanelNodeRef = useRef(null); // No longer needed here

  // Calculate better default positions on the client-side after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const chatWidth = 500; // Match default chatbox width
        const chatX = Math.max(0, window.innerWidth / 2 - chatWidth / 2); // Centered horizontally
        const chatY = Math.max(50, window.innerHeight - 250); // Near bottom
        setChatboxPos({ x: chatX, y: chatY });

        // Panel position is managed by its Draggable wrapper, no need to set here
        // const panelWidth = 384; // Match panel width
        // const panelX = Math.max(0, window.innerWidth - panelWidth - 20); // Right side with margin
        // const panelY = 70; // Below TopBar
        // setPropertiesPanelPos({ x: panelX, y: panelY });
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <TopBar projectTitle={projectTitle} />
      <div className="flex-grow relative overflow-hidden"> {/* This container holds the editor and panels */}
        {/* Visual Editor takes full space */}
        <div className="absolute inset-0">
          <VisualEditor />
        </div>

        {/* Chatbox - Unconditional Render */}
        <Draggable
          nodeRef={chatboxNodeRef}
          handle=".chatbox-drag-handle"
          defaultPosition={chatboxPos} // Use state for initial position
          bounds="parent" // Keep draggable within the parent container
        >
          <div ref={chatboxNodeRef} className="absolute z-10">
            <Chatbox />
          </div>
        </Draggable>

        {/* Properties Panel - Removed - Handled by EditorLayout if needed, or rendered conditionally based on selection */}
        {/* {isPanelOpen && (
          <Draggable
            nodeRef={propertiesPanelNodeRef}
            handle=".properties-panel-drag-handle"
            defaultPosition={propertiesPanelPos}
            bounds="parent"
          >
            <div ref={propertiesPanelNodeRef} className="absolute z-10">
              <PropertiesPanel
                 // Pass the selected Flow node (if any) or Shape ID to the panel
                 // The panel itself will decide how to use this info
                selectedItemId={selectedFlowNode?.id ?? selectedShapeId ?? null}
                selectedItemType={selectedFlowNode?.data?.type ?? (selectedShapeId ? useEditorStore.getState().shapes.find(s => s.id === selectedShapeId)?.type : null)}
              />
            </div>
          </Draggable>
        )} */}
      </div>
    </div>
  );
}
