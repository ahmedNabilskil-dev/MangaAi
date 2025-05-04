'use client';

import React, { useState, useEffect, useRef } from 'react';
import VisualEditor from '@/components/visual-editor/visual-editor';
import Chatbox from '@/components/chatbox/chatbox';
import PropertiesPanel from '@/components/properties-panel/properties-panel';
import { useVisualEditorStore } from '@/store/visual-editor-store';
import TopBar from '@/components/layout/top-bar';
import Draggable from 'react-draggable';

export default function Home() {
  const selectedNode = useVisualEditorStore((state) => state.selectedNode);
  const setSelectedNode = useVisualEditorStore((state) => state.setSelectedNode);

  // State for default positions, calculated on client-side
  // Use simpler initial defaults first, useEffect will refine
  const [chatboxPos, setChatboxPos] = useState({ x: 100, y: 400 });
  const [propertiesPanelPos, setPropertiesPanelPos] = useState({ x: 600, y: 70 });

  // Panel visibility controlled by selection
  const isPanelOpen = !!selectedNode;

  const handlePanelClose = () => {
    setSelectedNode(null);
  };

  const projectTitle = "Adventures in CodeLand";

  const chatboxNodeRef = useRef(null);
  const propertiesPanelNodeRef = useRef(null);

  // Calculate better default positions on the client-side after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const chatX = Math.max(0, window.innerWidth / 2 - 250); // Centered horizontally, ensure >= 0
        const chatY = Math.max(50, window.innerHeight - 250); // Near bottom, ensure >= 50
        setChatboxPos({ x: chatX, y: chatY });

        const panelWidth = 384; // Match panel width
        const panelX = Math.max(0, window.innerWidth - panelWidth - 20); // Right side with margin, ensure >= 0
        const panelY = 70; // Below TopBar
        setPropertiesPanelPos({ x: panelX, y: panelY });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <TopBar projectTitle={projectTitle} />
      <div className="flex-grow relative overflow-hidden"> {/* This container holds the editor and panels */}
        {/* Visual Editor takes full space */}
        <div className="absolute inset-0"> {/* Position editor absolutely to allow panels over it */}
          <VisualEditor />
        </div>

        {/* Chatbox - Unconditional Render */}
        <Draggable
          nodeRef={chatboxNodeRef}
          handle=".chatbox-drag-handle"
          defaultPosition={chatboxPos} // Use state for initial position
          bounds="parent" // Keep draggable within the parent container
        >
          {/* Let Draggable control position entirely */}
          <div ref={chatboxNodeRef} className="absolute z-10">
            <Chatbox />
          </div>
        </Draggable>

        {/* Properties Panel - Conditional Render */}
        {isPanelOpen && (
          <Draggable
            nodeRef={propertiesPanelNodeRef}
            handle=".properties-panel-drag-handle"
            defaultPosition={propertiesPanelPos} // Use state for initial position
            bounds="parent" // Keep draggable within the parent container
          >
            {/* Let Draggable control position entirely */}
            <div ref={propertiesPanelNodeRef} className="absolute z-10">
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