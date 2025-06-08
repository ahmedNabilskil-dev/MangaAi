"use client";

import ChatBox from "@/components/chatbox/chatbox";
import { RightPanel } from "@/components/right-panel/RightPanel";
import EnhancedSidebar from "@/components/sidenav/SideNav";
import VisualEditor from "@/components/visual-editor/visual-editor";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReactFlowProvider } from "reactflow";

// Types
interface NodeData {
  id: string;
  type: string;
  data: any;
  position: { x: number; y: number };
}

type ActiveTab = "chat" | "structure";

interface PanelState {
  isVisible: boolean;
  width: number;
}

// Constants
const PANEL_CONSTRAINTS = {
  LEFT: { min: 300, max: 600, default: 380 },
  RIGHT: { min: 400, max: 600, default: 500 },
} as const;

const ANIMATION_CONFIG = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export default function EnhancedMangaFlow(): JSX.Element {
  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [leftPanel, setLeftPanel] = useState<PanelState>({
    isVisible: true,
    width: PANEL_CONSTRAINTS.LEFT.default,
  });
  const [rightPanel, setRightPanel] = useState<PanelState>({
    isVisible: false,
    width: PANEL_CONSTRAINTS.RIGHT.default,
  });
  const [isLeftResizing, setIsLeftResizing] = useState<boolean>(false);
  const [isRightResizing, setIsRightResizing] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Refs
  const leftStartX = useRef<number>(0);
  const leftStartWidth = useRef<number>(0);
  const rightStartX = useRef<number>(0);
  const rightStartWidth = useRef<number>(0);

  // Left panel resize handlers
  const handleLeftMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!leftPanel.isVisible) return;

      setIsLeftResizing(true);
      leftStartX.current = e.clientX;
      leftStartWidth.current = leftPanel.width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [leftPanel.isVisible, leftPanel.width]
  );

  const handleLeftMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isLeftResizing) return;

      const delta = e.clientX - leftStartX.current;
      const newWidth = leftStartWidth.current + delta;
      const constrainedWidth = Math.min(
        Math.max(PANEL_CONSTRAINTS.LEFT.min, newWidth),
        PANEL_CONSTRAINTS.LEFT.max
      );

      setLeftPanel((prev) => ({ ...prev, width: constrainedWidth }));
    },
    [isLeftResizing]
  );

  const handleLeftMouseUp = useCallback(() => {
    setIsLeftResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  // Right panel resize handlers
  const handleRightMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!rightPanel.isVisible) return;

      setIsRightResizing(true);
      rightStartX.current = e.clientX;
      rightStartWidth.current = rightPanel.width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [rightPanel.isVisible, rightPanel.width]
  );

  const handleRightMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isRightResizing) return;

      const delta = rightStartX.current - e.clientX;
      const newWidth = rightStartWidth.current + delta;
      const constrainedWidth = Math.min(
        Math.max(PANEL_CONSTRAINTS.RIGHT.min, newWidth),
        PANEL_CONSTRAINTS.RIGHT.max
      );

      setRightPanel((prev) => ({ ...prev, width: constrainedWidth }));
    },
    [isRightResizing]
  );

  const handleRightMouseUp = useCallback(() => {
    setIsRightResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  // Panel visibility handlers
  const toggleLeftPanel = useCallback(() => {
    setLeftPanel((prev) => ({ ...prev, isVisible: !prev.isVisible }));
  }, []);

  const toggleRightPanel = useCallback(() => {
    setRightPanel((prev) => ({ ...prev, isVisible: !prev.isVisible }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const newFullscreen = !prev;
      if (newFullscreen) {
        // Hide both panels when entering fullscreen
        setLeftPanel((prev) => ({ ...prev, isVisible: false }));
        setRightPanel((prev) => ({ ...prev, isVisible: false }));
      }
      return newFullscreen;
    });
  }, []);

  const handleCloseDetails = useCallback(() => {
    setRightPanel((prev) => ({ ...prev, isVisible: false }));
  }, []);

  // Event listeners setup
  useEffect(() => {
    if (isLeftResizing) {
      document.addEventListener("mousemove", handleLeftMouseMove);
      document.addEventListener("mouseup", handleLeftMouseUp);
    }
    if (isRightResizing) {
      document.addEventListener("mousemove", handleRightMouseMove);
      document.addEventListener("mouseup", handleRightMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleLeftMouseMove);
      document.removeEventListener("mouseup", handleLeftMouseUp);
      document.removeEventListener("mousemove", handleRightMouseMove);
      document.removeEventListener("mouseup", handleRightMouseUp);
    };
  }, [
    isLeftResizing,
    isRightResizing,
    handleLeftMouseMove,
    handleLeftMouseUp,
    handleRightMouseMove,
    handleRightMouseUp,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            toggleLeftPanel();
            break;
          case "2":
            e.preventDefault();
            toggleRightPanel();
            break;
          case "f":
            e.preventDefault();
            toggleFullscreen();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleLeftPanel, toggleRightPanel, toggleFullscreen]);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden relative">
        {/* Left Panel */}
        <AnimatePresence>
          <motion.div
            initial={{ x: -leftPanel.width, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -leftPanel.width, opacity: 0 }}
            transition={ANIMATION_CONFIG}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col relative z-20"
            style={{ width: `${leftPanel.width}px` }}
          >
            {/* Enhanced Tab Navigation */}
            <div className="flex border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 relative group ${
                  activeTab === "chat"
                    ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <MessageSquare
                    className={`w-5 h-5 transition-colors ${
                      activeTab === "chat"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
                    }`}
                  />
                  <span className="font-semibold">AI Assistant</span>
                </div>
                {activeTab === "chat" && (
                  <motion.div
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full"
                    layoutId="activeTab"
                    transition={ANIMATION_CONFIG}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("structure")}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 relative group ${
                  activeTab === "structure"
                    ? "text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <LayoutGrid
                    className={`w-5 h-5 transition-colors ${
                      activeTab === "structure"
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
                    }`}
                  />
                  <span className="font-semibold">Structure</span>
                </div>
                {activeTab === "structure" && (
                  <motion.div
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-full"
                    layoutId="activeTab"
                    transition={ANIMATION_CONFIG}
                  />
                )}
              </button>
            </div>

            {/* Tab Content with Enhanced Animation */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="h-full"
                >
                  {activeTab === "chat" ? <ChatBox /> : <EnhancedSidebar />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Enhanced Resize Handle */}
            <div
              className="absolute top-0 right-0 w-2 h-full cursor-col-resize group flex items-center justify-center z-30"
              onMouseDown={handleLeftMouseDown}
            >
              <div className="w-1 h-16 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-blue-400 dark:group-hover:bg-blue-500 transition-colors duration-200" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Center Panel - Enhanced Visual Editor */}
        <div className="flex-1 min-w-0 relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <VisualEditor />
        </div>

        <RightPanel
          rightPanel={rightPanel}
          ANIMATION_CONFIG={ANIMATION_CONFIG}
        />
      </div>
    </ReactFlowProvider>
  );
}
