"use client";

import Chatbox from "@/components/chatbox/chatbox";
import TopBar from "@/components/layout/top-bar";
import PropertiesPanel from "@/components/properties-panel/properties-panel"; // Import unified panel
import VisualEditor from "@/components/visual-editor/visual-editor";
import { useEditorStore } from "@/store/editor-store";
import { useVisualEditorStore } from "@/store/visual-editor-store";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

export default function Home() {
  // Get selected node from visual editor store (React Flow selection)
  const selectedFlowNode = useVisualEditorStore((state) => state.selectedNode);
  // Get selected shape ID from editor store (for properties panel)
  const selectedShapeId = useEditorStore((state) => state.selectedShapeId);
  const shapes = useEditorStore((state) =>
    getCurrentPageShapes(useEditorStore.getState())
  ); // Helper to get shapes for current page
  const selectedShape = shapes.find((s) => s.id === selectedShapeId);

  // Determine the ID and type of the selected item (either Flow node or Fabric shape)
  const selectedItemId = selectedFlowNode?.id ?? selectedShapeId ?? null;
  const selectedItemType =
    selectedFlowNode?.data?.type ?? selectedShape?.type ?? null;

  // State for default positions, calculated on client-side
  const [chatboxPos, setChatboxPos] = useState({ x: 0, y: 0 }); // Will be updated in useEffect
  const [propertiesPanelPos, setPropertiesPanelPos] = useState({ x: 0, y: 0 }); // Will be updated

  const projectTitle = "MangaVerse AI"; // Updated Project Title

  const chatboxNodeRef = useRef(null);
  const propertiesPanelNodeRef = useRef(null); // Ref for draggable properties panel

  // Calculate better default positions on the client-side after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const chatWidth = 500; // Match default chatbox width
      const chatX = Math.max(0, window.innerWidth / 2 - chatWidth / 2); // Centered horizontally
      const chatY = Math.max(50, window.innerHeight - 250); // Near bottom
      setChatboxPos({ x: chatX, y: chatY });

      const panelWidth = 384; // Match panel width
      const panelX = Math.max(20, window.innerWidth - panelWidth - 20); // Right side with margin
      const panelY = 70; // Below TopBar, adjust as needed
      setPropertiesPanelPos({ x: panelX, y: panelY });
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <TopBar projectTitle={projectTitle} />
      <div className="flex-grow relative overflow-hidden">
        {" "}
        {/* This container holds the editor and panels */}
        {/* Visual Editor takes full space */}
        <div className="absolute inset-0">
          <VisualEditor />
        </div>
        {/* Chatbox - Unconditional Render & Draggable */}
        <Draggable
          nodeRef={chatboxNodeRef}
          handle=".chatbox-drag-handle"
          defaultPosition={chatboxPos} // Use state for initial position
          position={chatboxPos} // Control position explicitly if needed later
          onStop={(_, data) => setChatboxPos({ x: data.x, y: data.y })} // Update position on stop
          bounds="parent" // Keep draggable within the parent container
        >
          <div ref={chatboxNodeRef} className="absolute z-10">
            {/* Position is controlled by Draggable, inline style ensures initial placement */}
            <Chatbox />
          </div>
        </Draggable>
        {/* Properties Panel - Draggable and Conditional based on selection */}
        {/* The Panel itself will render based on selectedItemId */}
        <Draggable
          nodeRef={propertiesPanelNodeRef}
          handle=".properties-panel-drag-handle" // Add handle class to panel header
          defaultPosition={propertiesPanelPos}
          position={propertiesPanelPos}
          onStop={(_, data) => setPropertiesPanelPos({ x: data.x, y: data.y })}
          bounds="parent"
        >
          <div ref={propertiesPanelNodeRef} className="absolute z-10">
            {/* Render the panel conditionally WITHIN the draggable container */}
            {/* Pass selected item info */}
            <PropertiesPanel
              selectedItemId={selectedItemId}
              selectedItemType={selectedItemType}
            />
          </div>
        </Draggable>
      </div>
    </div>
  );
}

// Helper function (can be moved to utils or kept here if only used here)
function getCurrentPageShapes(state: any) {
  if (!state.currentPageId) return [];
  const currentPage = state.pages.find(
    (p: any) => p.id === state.currentPageId
  );
  return currentPage ? currentPage.shapes : [];
}
