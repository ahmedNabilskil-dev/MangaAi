
'use client';

import React, { useState, useEffect, useRef } from 'react'; // Import useState and useEffect
import VisualEditor from '@/components/visual-editor/visual-editor';
import Chatbox from '@/components/chatbox/chatbox';
import PropertiesPanel from '@/components/properties-panel/properties-panel';
import { useVisualEditorStore } from '@/store/visual-editor-store'; // Import the store
import TopBar from '@/components/layout/top-bar'; // Import the new TopBar
import { DEFAULT_PROJECT_ID } from '@/config/constants'; // Import default project ID (for fetching title, though hardcoded for now)
import Draggable from 'react-draggable'; // Import Draggable

export default function Home() {
  // Get state and actions from the store
  const selectedNode = useVisualEditorStore((state) => state.selectedNode);
  const setSelectedNode = useVisualEditorStore((state) => state.setSelectedNode);

  // State for default positions, calculated on client-side
  const [chatboxPos, setChatboxPos] = useState({ x: 0, y: 400 }); // Initial safe default
  const [propertiesPanelPos, setPropertiesPanelPos] = useState({ x: 0, y: 70 }); // Initial safe default

  // Panel state is derived directly from whether a node is selected in the store
  const isPanelOpen = !!selectedNode; // Panel visibility controlled by selection

  const handlePanelClose = () => {
    setSelectedNode(null); // Clear selection in the store
  };

  // Placeholder for project title - replace with actual data fetching if needed
  const projectTitle = "Adventures in CodeLand"; // Sample title

  // Draggable nodeRef for preventing findDOMNode warnings in strict mode
  const chatboxNodeRef = useRef(null);
  const propertiesPanelNodeRef = useRef(null);

  // Calculate default positions on the client-side after mount
  useEffect(() => {
    // Check if window is defined (ensures client-side)
    if (typeof window !== 'undefined') {
        const chatX = 0; // Centered horizontally
        const chatY = window.innerHeight * 0.8 - 150; // Near bottom, adjust offset as needed
        setChatboxPos({ x: chatX, y: chatY });

        const panelX = window.innerWidth - 400 - 20; // Right side with margin, adjust width/margin as needed
        const panelY = 70; // Below TopBar
        setPropertiesPanelPos({ x: panelX, y: panelY });
    }
  }, []); // Empty dependency array ensures this runs only once on mount


  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <TopBar projectTitle={projectTitle} />

      {/* Main Content Area */}
      <div className="flex-grow relative overflow-hidden"> {/* Ensure this container handles overflow */}
        {/* Visual Editor takes remaining space */}
        <div className="h-full w-full">
          <VisualEditor />
        </div>

        {/* Chatbox - Wrapped in Draggable */}
        <Draggable
            nodeRef={chatboxNodeRef}
            handle=".chatbox-drag-handle"
            // Use state for default position
            defaultPosition={chatboxPos}
        >
             {/* Use absolute positioning and transform, initial position set by Draggable */}
             <div ref={chatboxNodeRef} className="absolute z-10 max-w-xl px-4" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                <Chatbox />
            </div>
        </Draggable>


        {/* Properties Panel - Wrapped in Draggable */}
        {/* Render only when a node is selected */}
        {isPanelOpen && (
            <Draggable
                nodeRef={propertiesPanelNodeRef}
                handle=".properties-panel-drag-handle"
                // Use state for default position
                defaultPosition={propertiesPanelPos}
            >
                <div
                    ref={propertiesPanelNodeRef}
                    className="absolute z-10" // Remove top/right, let Draggable handle it
                 >
                    <PropertiesPanel
                        node={selectedNode}
                        onClose={handlePanelClose}
                    />
                </div>
            </Draggable>
        )}
      </div>
    </div>
  );
}
