"use client";

import EnhancedChatbox from "@/components/chatbox/chatbox";
import EnhancedSidebar from "@/components/sidenav/SideNav";
import VisualEditor from "@/components/visual-editor/visual-editor";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ReactFlowProvider } from "reactflow";

export default function EnhancedMangaFlow() {
  const [activeTab, setActiveTab] = useState("chat");
  const [leftPanelWidth, setLeftPanelWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Handle mouse down for resizing
  const handleMouseDown = (e) => {
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = leftPanelWidth;
    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle mouse move during resize
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const newWidth = startWidth.current + e.clientX - startX.current;
    setLeftPanelWidth(Math.min(Math.max(300, newWidth), 600));
  };

  // Handle mouse up after resize
  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {/* Left Panel */}
        <div
          className="bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col relative z-10"
          style={{ width: `${leftPanelWidth}px` }}
        >
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "chat"
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare
                  className={`w-4 h-4 ${
                    activeTab === "chat"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                <span>AI Assistant</span>
              </div>
              {activeTab === "chat" && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 dark:bg-blue-400 rounded-t"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("structure")}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "structure"
                  ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <LayoutGrid
                  className={`w-4 h-4 ${
                    activeTab === "structure"
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                <span>Structure</span>
              </div>
              {activeTab === "structure" && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 dark:bg-purple-400 rounded-t"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === "chat" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === "chat" ? -20 : 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === "chat" ? (
                  <EnhancedChatbox />
                ) : (
                  <EnhancedSidebar />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Resize Handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-400 active:bg-blue-600 dark:active:bg-blue-500 transition-colors z-20"
            onMouseDown={handleMouseDown}
          />
        </div>

        {/* Right Panel - Editor */}
        <div className="flex-1 min-w-0 relative bg-white dark:bg-gray-900">
          <VisualEditor />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
