// Update the MangaFlow component
"use client";

import Chatbox from "@/components/chatbox/chatbox";
import TopBar from "@/components/layout/top-bar";
import FlowPropertiesPanel from "@/components/properties-panel/flow-properties-panel";
import VisualEditor from "@/components/visual-editor/visual-editor";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVisualEditorStore } from "@/store/visual-editor-store";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

const PANEL_WIDTH = 384;
const CHATBOX_WIDTH = 500;
const PROJECT_TITLE = "MangaVerse AI - Story Flow";

export default function MangaFlow() {
  const chatboxNodeRef = useRef(null);
  const propertiesPanelNodeRef = useRef(null);
  const [chatboxPos, setChatboxPos] = useState({ x: 0, y: 0 });
  const [propertiesPanelPos, setPropertiesPanelPos] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();
  const selectedFlowNode = useVisualEditorStore((state) => state.selectedNode);

  const selectedItemId = selectedFlowNode?.id ?? null;
  const selectedItemType = selectedFlowNode?.data?.type ?? null;

  useEffect(() => {
    if (typeof window !== "undefined" && !isMobile) {
      setChatboxPos({
        x: Math.max(0, window.innerWidth / 2 - CHATBOX_WIDTH / 2),
        y: Math.max(50, window.innerHeight - 250),
      });

      setPropertiesPanelPos({
        x: Math.max(20, window.innerWidth - PANEL_WIDTH - 20),
        y: 70,
      });
    } else {
      setChatboxPos({ x: 0, y: 0 });
      setPropertiesPanelPos({ x: 0, y: 0 });
    }
  }, [isMobile]);

  const handleChatboxDragStop = (_: any, data: { x: number; y: number }) => {
    if (!isMobile) {
      setChatboxPos({ x: data.x, y: data.y });
    }
  };

  const handlePropertiesPanelDragStop = (
    _: any,
    data: { x: number; y: number }
  ) => {
    if (!isMobile) {
      setPropertiesPanelPos({ x: data.x, y: data.y });
    }
  };

  const renderChatbox = () => (
    <Draggable
      nodeRef={chatboxNodeRef}
      handle=".chatbox-drag-handle"
      defaultPosition={chatboxPos}
      position={!isMobile ? chatboxPos : undefined}
      onStop={handleChatboxDragStop}
      bounds="parent"
      disabled={isMobile}
    >
      <div
        ref={chatboxNodeRef}
        className={
          isMobile ? "absolute bottom-4 left-4 right-4 z-20" : "absolute z-10"
        }
      >
        <Chatbox />
      </div>
    </Draggable>
  );

  const renderPropertiesPanel = () => (
    <Draggable
      nodeRef={propertiesPanelNodeRef}
      handle=".properties-panel-drag-handle"
      defaultPosition={propertiesPanelPos}
      position={!isMobile ? propertiesPanelPos : undefined}
      onStop={handlePropertiesPanelDragStop}
      bounds="parent"
      disabled={isMobile}
    >
      <div
        ref={propertiesPanelNodeRef}
        className={isMobile ? "absolute top-16 right-4 z-20" : "absolute z-10"}
      >
        <FlowPropertiesPanel
          selectedItemId={selectedItemId}
          selectedItemType={selectedItemType}
        />
      </div>
    </Draggable>
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <TopBar projectTitle={PROJECT_TITLE} />

      <div className="flex-grow relative overflow-hidden">
        {/* Side Navigation */}

        {/* Visual Editor (Canvas) */}
        <div className="absolute inset-0">
          <VisualEditor />
        </div>

        {/* Floating UI Elements */}
        {renderChatbox()}
        {renderPropertiesPanel()}
      </div>
    </div>
  );
}
