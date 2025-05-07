"use client";

import Chatbox from "@/components/chatbox/chatbox";
import TopBar from "@/components/layout/top-bar";
import FlowPropertiesPanel from "@/components/properties-panel/flow-properties-panel"; // Renamed from PropertiesPanel
import VisualEditor from "@/components/visual-editor/visual-editor";
import { useVisualEditorStore } from "@/store/visual-editor-store";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { useIsMobile } from "@/hooks/use-mobile"; // Import hook

export default function Home() {
  // Get selected node from visual editor store (React Flow selection)
  const selectedFlowNode = useVisualEditorStore((state) => state.selectedNode);
  const isMobile = useIsMobile(); // Check if mobile

  // Determine the ID and type of the selected Flow node
  const selectedItemId = selectedFlowNode?.id ?? null;
  const selectedItemType = selectedFlowNode?.data?.type ?? null;

  // State for default positions, calculated on client-side
  const [chatboxPos, setChatboxPos] = useState({ x: 0, y: 0 }); // Default, updated in useEffect
  const [propertiesPanelPos, setPropertiesPanelPos] = useState({ x: 0, y: 0 }); // Default, updated

  const projectTitle = "MangaVerse AI - Story Flow"; // Updated Project Title for this view

  const chatboxNodeRef = useRef(null);
  const propertiesPanelNodeRef = useRef(null); // Ref for draggable properties panel

  // Calculate default positions on the client-side after mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isMobile) { // Only position freely on desktop
      const chatWidth = 500; // Match default chatbox width
      const chatX = Math.max(0, window.innerWidth / 2 - chatWidth / 2); // Centered horizontally
      const chatY = Math.max(50, window.innerHeight - 250); // Near bottom
      setChatboxPos({ x: chatX, y: chatY });

      const panelWidth = 384; // Match panel width
      const panelX = Math.max(20, window.innerWidth - panelWidth - 20); // Right side with margin
      const panelY = 70; // Below TopBar, adjust as needed
      setPropertiesPanelPos({ x: panelX, y: panelY });
    } else if (isMobile) {
        // Reset positions for mobile (they will be stacked or hidden)
        setChatboxPos({ x: 0, y: 0 });
        setPropertiesPanelPos({ x: 0, y: 0});
    }
  }, [isMobile]); // Rerun when mobile status changes

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <TopBar projectTitle={projectTitle} />
      <div className="flex-grow relative overflow-hidden">
        {/* Visual Editor takes full space */}
        <div className="absolute inset-0">
          <VisualEditor />
        </div>

        {/* Chatbox - Draggable on Desktop */}
        <Draggable
          nodeRef={chatboxNodeRef}
          handle=".chatbox-drag-handle"
          defaultPosition={chatboxPos}
          position={!isMobile ? chatboxPos : undefined} // Only control position on desktop
          onStop={(_, data) => !isMobile && setChatboxPos({ x: data.x, y: data.y })}
          bounds="parent"
          disabled={isMobile} // Disable dragging on mobile
        >
           {/* Apply different styles/positioning based on isMobile */}
          <div
            ref={chatboxNodeRef}
            className={
              isMobile
                ? "absolute bottom-4 left-4 right-4 z-20" // Example mobile positioning
                : "absolute z-10" // Default absolute for desktop Draggable
            }
            style={isMobile ? {} : { left: `${chatboxPos.x}px`, top: `${chatboxPos.y}px` }} // Control style on desktop
          >
            <Chatbox />
          </div>
        </Draggable>

        {/* Flow Properties Panel - Draggable on Desktop */}
        <Draggable
          nodeRef={propertiesPanelNodeRef}
          handle=".properties-panel-drag-handle" // Add handle class to panel header
          defaultPosition={propertiesPanelPos}
          position={!isMobile ? propertiesPanelPos : undefined} // Control position on desktop
          onStop={(_, data) => !isMobile && setPropertiesPanelPos({ x: data.x, y: data.y })}
          bounds="parent"
          disabled={isMobile} // Disable dragging on mobile
        >
           {/* Apply different styles/positioning based on isMobile */}
          <div
             ref={propertiesPanelNodeRef}
             className={
               isMobile
                 ? "absolute top-16 right-4 z-20" // Example mobile positioning (might overlap chat)
                 : "absolute z-10" // Default absolute for desktop Draggable
             }
             style={isMobile ? {} : { left: `${propertiesPanelPos.x}px`, top: `${propertiesPanelPos.y}px` }}
          >
             {/* Render the FLOW properties panel conditionally */}
             <FlowPropertiesPanel
               selectedItemId={selectedItemId}
               selectedItemType={selectedItemType}
             />
          </div>
        </Draggable>
      </div>
    </div>
  );
}
