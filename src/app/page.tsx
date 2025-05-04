
'use client';

import React from 'react';
// Removed ReactFlowProvider import as it's handled in VisualEditor
import VisualEditor from '@/components/visual-editor/visual-editor';
import Chatbox from '@/components/chatbox/chatbox';
import PropertiesPanel from '@/components/properties-panel/properties-panel';
import { useVisualEditorStore } from '@/store/visual-editor-store'; // Import the store

export default function Home() {
  // Get state and actions from the store
  const selectedNode = useVisualEditorStore((state) => state.selectedNode);
  const setSelectedNode = useVisualEditorStore((state) => state.setSelectedNode);

  // Panel state is derived directly from whether a node is selected in the store
  const isPanelOpen = !!selectedNode;

  const handlePanelClose = () => {
    setSelectedNode(null); // Clear selection in the store
  };

  // No default node selection logic needed here anymore

  return (
    // No need to wrap VisualEditor in ReactFlowProvider here, it's handled internally
    <div className="relative h-screen w-screen flex flex-col overflow-hidden">
      {/* Visual Editor */}
      <div className="flex-grow relative">
        {/* VisualEditor now gets selection state from the store */}
        <VisualEditor />
      </div>

      {/* Chatbox - adjusted positioning */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xl px-4"> {/* Adjusted max-width and positioning if needed */}
        {/* Chatbox also gets selection state from the store */}
        <Chatbox />
      </div>

      {/* Properties Panel */}
      <PropertiesPanel
        isOpen={isPanelOpen}
        // Pass the selected node *object* directly from the store
        node={selectedNode}
        onClose={handlePanelClose}
      />
    </div>
  );
}

    