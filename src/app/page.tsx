
'use client';

import React from 'react';
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

  // Panel state is derived directly from whether a node is selected in the store
  const isPanelOpen = !!selectedNode;

  const handlePanelClose = () => {
    setSelectedNode(null); // Clear selection in the store
  };

  // Placeholder for project title - replace with actual data fetching if needed
  const projectTitle = "Adventures in CodeLand"; // Sample title

  // Draggable nodeRef for preventing findDOMNode warnings in strict mode
  const chatboxNodeRef = React.useRef(null);
  const propertiesPanelNodeRef = React.useRef(null);

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
        {/* Note: Default position is handled by Draggable. Position is relative to parent. */}
        <Draggable nodeRef={chatboxNodeRef} handle=".chatbox-drag-handle">
            <div ref={chatboxNodeRef} className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xl px-4" style={{ cursor: 'move' }}>
                 {/* Pass handle class down or manage state */}
                <Chatbox />
            </div>
        </Draggable>


        {/* Properties Panel - Wrapped in Draggable */}
        {/* Initial position set via style, draggable will manage from there */}
        {/* Render only when isOpen */}
        {isOpen && (
            <Draggable nodeRef={propertiesPanelNodeRef} handle=".properties-panel-drag-handle">
                <div
                    ref={propertiesPanelNodeRef}
                    className="absolute top-16 right-4 z-10" // Initial position, Draggable takes over
                    style={{ cursor: 'move' }}
                 >
                    <PropertiesPanel
                        isOpen={isPanelOpen} // Pass isOpen to conditionally render internally if needed
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
