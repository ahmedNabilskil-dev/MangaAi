
'use client';

import React from 'react';
import VisualEditor from '@/components/visual-editor/visual-editor';
import Chatbox from '@/components/chatbox/chatbox';
import PropertiesPanel from '@/components/properties-panel/properties-panel';
import { useVisualEditorStore } from '@/store/visual-editor-store'; // Import the store
import TopBar from '@/components/layout/top-bar'; // Import the new TopBar
import { DEFAULT_PROJECT_ID } from '@/config/constants'; // Import default project ID (for fetching title, though hardcoded for now)


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

        {/* Chatbox - adjusted positioning */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xl px-4">
          <Chatbox />
        </div>

        {/* Properties Panel - Positioned relative to the main content area */}
        {/* Its `top-4 right-4` positioning is relative to this container */}
        <PropertiesPanel
          isOpen={isPanelOpen}
          node={selectedNode}
          onClose={handlePanelClose}
        />
      </div>
    </div>
  );
}
