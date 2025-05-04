'use client';

import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import VisualEditor from '@/components/visual-editor/visual-editor';
import Chatbox from '@/components/chatbox/chatbox';
import PropertiesPanel from '@/components/properties-panel/properties-panel';
import { type NodeData } from '@/types/nodes'; // Ensure this type exists and is defined

export default function Home() {
  const [selectedNodeData, setSelectedNodeData] = useState<NodeData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleNodeClick = (data: NodeData) => {
    setSelectedNodeData(data);
    setIsPanelOpen(true);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setSelectedNodeData(null);
  };

  return (
    <ReactFlowProvider>
      <div className="relative h-screen w-screen flex flex-col overflow-hidden">
        {/* Visual Editor */}
        <div className="flex-grow relative">
          <VisualEditor onNodeClick={handleNodeClick} />
        </div>

        {/* Chatbox */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-2xl px-4">
          <Chatbox />
        </div>

        {/* Properties Panel */}
        <PropertiesPanel
          isOpen={isPanelOpen}
          nodeData={selectedNodeData}
          onClose={handlePanelClose}
        />
      </div>
    </ReactFlowProvider>
  );
}
