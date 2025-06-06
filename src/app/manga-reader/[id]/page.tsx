"use client";
import { getProjectWithRelations } from "@/services/db";
import {
  Chapter,
  Character,
  MangaProject,
  PanelDialogue,
} from "@/types/entities";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit3,
  LayoutGrid,
  LayoutList,
  Maximize,
  Minimize,
  Moon,
  Save,
  Sun,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// ========== TYPES ==========
type ReadingMode = "normal" | "focus" | "cinematic";
type LayoutMode = "vertical" | "grid";
type EditPanelMode = "dialog" | "sfx" | "panel";

interface Position {
  x: number;
  y: number;
}

interface DragItem {
  type: string;
  id: string;
  panelId: string;
  initialX: number;
  initialY: number;
}

// ========== COMPONENTS ==========
const DialogBubble: React.FC<{
  dialogue: PanelDialogue;
  panelId: string;
  editMode: boolean;
  selected: boolean;
  onClick: () => void;
  character?: Character | null;
  onPositionChange: (id: string, x: number, y: number) => void;
}> = ({
  dialogue,
  panelId,
  editMode,
  selected,
  onClick,
  character,
  onPositionChange,
}) => {
  const bubbleClasses = {
    normal: "bg-white border-2 border-gray-800 text-gray-800",
    thought: "bg-blue-100 border-2 border-blue-400 text-blue-800 rounded-full",
    narration:
      "bg-yellow-100 border-2 border-yellow-600 text-yellow-800 italic",
    scream: "bg-red-100 border-2 border-red-500 text-red-800 font-bold",
    whisper: "bg-gray-100 border-2 border-gray-400 text-gray-600 text-sm",
  };

  const tailClasses = {
    normal: "border-t-white",
    thought: "", // No tail for thought bubbles
    narration: "border-t-yellow-100",
    scream: "border-t-red-100",
    whisper: "border-t-gray-100",
  };

  const bubbleType = dialogue.style?.bubbleType || "normal";
  const fontSizeMap = {
    "x-small": 10,
    small: 12,
    medium: 14,
    large: 16,
    "x-large": 18,
  };
  const fontSize = dialogue.style?.fontSize
    ? fontSizeMap[dialogue.style.fontSize]
    : 14;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "DIALOGUE",
    item: {
      type: "DIALOGUE",
      id: dialogue.id,
      panelId,
      initialX: dialogue.style?.position?.x || 50,
      initialY: dialogue.style?.position?.y || 50,
    },
    canDrag: editMode,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      data-dialogue-id={dialogue.id}
      className={`absolute max-w-xs p-3 rounded-lg shadow-lg z-10 ${
        editMode ? "cursor-grab active:cursor-grabbing" : ""
      } ${bubbleClasses[bubbleType]} ${
        editMode ? "hover:scale-105" : "animate-fade-in"
      } ${selected ? "ring-2 ring-blue-400" : ""} ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{
        left: `${dialogue.style?.position?.x || 50}%`,
        top: `${dialogue.style?.position?.y || 50}%`,
        fontSize: `${fontSize}px`,
        transform: `translate(-50%, -50%)`,
        userSelect: editMode ? "none" : "auto",
        fontFamily: dialogue.style?.fontType || "inherit",
        fontWeight: dialogue.style?.emphasis ? "bold" : "normal",
        textAlign: "left",
      }}
      onClick={onClick}
    >
      {character && bubbleType !== "narration" && (
        <div className="font-bold text-xs mb-1 opacity-75">
          {character.name}
        </div>
      )}
      <div>{dialogue.content}</div>

      {!editMode && bubbleType !== "thought" && (
        <div
          className={`absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent ${tailClasses[bubbleType]} left-1/2 transform -translate-x-1/2 -bottom-2`}
        />
      )}
    </div>
  );
};

const PanelDropArea: React.FC<{
  panelId: string;
  onDrop: (item: DragItem, x: number, y: number) => void;
  children: React.ReactNode;
}> = ({ panelId, onDrop, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop(() => ({
    accept: "DIALOGUE",
    drop: (item: DragItem, monitor) => {
      if (!ref.current) return;

      const offset = monitor.getClientOffset();
      if (!offset) return;

      const rect = ref.current.getBoundingClientRect();
      const x = ((offset.x - rect.left) / rect.width) * 100;
      const y = ((offset.y - rect.top) / rect.height) * 100;

      onDrop(item, x, y);
    },
  }));

  drop(ref);

  return (
    <div ref={ref} className="w-full h-full relative">
      {children}
    </div>
  );
};

const Header: React.FC<{
  chapters: Chapter[];
  currentChapterIndex: number;
  currentPanelIndex: number;
  darkMode: boolean;
  soundEnabled: boolean;
  autoScroll: boolean;
  layoutMode: LayoutMode;
  fullscreen: boolean;
  editMode: boolean;
  readingMode: ReadingMode;
  onScrollToPanel: (index: number) => void;
  onToggleDarkMode: () => void;
  onToggleSound: () => void;
  onToggleAutoScroll: () => void;
  onToggleLayout: () => void;
  onToggleFullscreen: () => void;
  onToggleEditMode: () => void;
  onSetReadingMode: (mode: ReadingMode) => void;
}> = ({
  chapters,
  currentChapterIndex,
  currentPanelIndex,
  darkMode,
  soundEnabled,
  autoScroll,
  layoutMode,
  fullscreen,
  editMode,
  readingMode,
  onScrollToPanel,
  onToggleDarkMode,
  onToggleSound,
  onToggleAutoScroll,
  onToggleLayout,
  onToggleFullscreen,
  onToggleEditMode,
  onSetReadingMode,
}) => {
  const currentChapter = chapters[currentChapterIndex];
  const panelCount =
    currentChapter?.scenes?.flatMap((s) => s.panels).length || 0;

  return (
    <div
      className={`sticky top-0 z-50 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
      } shadow-md border-b-4 border-red-500 transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onScrollToPanel(0)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
              title="First Panel"
            >
              <ChevronLeft
                className={darkMode ? "text-white" : "text-gray-700"}
              />
            </button>

            <div className="flex-1 text-center">
              <h1
                className={`text-2xl font-bold flex items-center justify-center gap-2 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                <Zap className="text-yellow-500" size={24} />
                <span>✨ {currentChapter?.title || "Manga"} ✨</span>
                <BookOpen className="text-blue-500" size={20} />
              </h1>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Chapter {currentChapter?.chapterNumber} • {panelCount} Panels •
                Panel {currentPanelIndex + 1}
              </p>
            </div>

            <button
              onClick={() => onScrollToPanel(panelCount - 1)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
              title="Last Panel"
            >
              <ChevronRight
                className={darkMode ? "text-white" : "text-gray-700"}
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-800 text-white"
              }`}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled
                  ? darkMode
                    ? "bg-green-700 text-green-100"
                    : "bg-green-100 text-green-600"
                  : darkMode
                  ? "bg-gray-700 text-gray-400"
                  : "bg-gray-100 text-gray-400"
              }`}
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={onToggleAutoScroll}
              className={`p-2 rounded-lg transition-colors ${
                autoScroll
                  ? darkMode
                    ? "bg-blue-700 text-blue-100"
                    : "bg-blue-100 text-blue-600"
                  : darkMode
                  ? "bg-gray-700 text-gray-400"
                  : "bg-gray-100 text-gray-400"
              }`}
              title="Auto Scroll"
            >
              <ChevronUp
                size={16}
                className={autoScroll ? "animate-bounce" : ""}
              />
            </button>

            <button
              onClick={onToggleLayout}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-gray-700 text-gray-100"
                  : "bg-gray-100 text-gray-600"
              }`}
              title={layoutMode === "vertical" ? "Grid View" : "Vertical View"}
            >
              {layoutMode === "vertical" ? (
                <LayoutGrid size={16} />
              ) : (
                <LayoutList size={16} />
              )}
            </button>

            <button
              onClick={onToggleFullscreen}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-gray-700 text-gray-100"
                  : "bg-gray-100 text-gray-600"
              }`}
              title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>

            <button
              onClick={onToggleEditMode}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                editMode
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {editMode ? <Save size={16} /> : <Edit3 size={16} />}
              {editMode ? "Save" : "Edit"}
            </button>
          </div>
        </div>

        <div className="mt-2 flex justify-between items-center">
          <div className="flex gap-2">
            {(["normal", "focus", "cinematic"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onSetReadingMode(mode)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  readingMode === mode
                    ? "bg-purple-500 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {editMode && (
        <div
          className={`px-4 py-2 ${
            darkMode
              ? "bg-blue-900 border-blue-800"
              : "bg-blue-50 border-blue-200"
          } border-t`}
        >
          <p
            className={`text-sm text-center ${
              darkMode ? "text-blue-200" : "text-blue-700"
            }`}
          >
            🎨 Edit Mode: Click elements to edit • Drag to reposition • Use
            panel below to customize
          </p>
        </div>
      )}
    </div>
  );
};

// ========== MAIN COMPONENT ==========
interface MangaWebtoonProps {
  mangaProject: MangaProject;
  initialChapterIndex?: number;
}

const MangaComponent: React.FC<MangaWebtoonProps> = ({
  mangaProject,
  initialChapterIndex = 0,
}) => {
  // State management
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDialogue, setSelectedDialogue] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [readingMode, setReadingMode] = useState<ReadingMode>("normal");
  const [autoScroll, setAutoScroll] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] =
    useState(initialChapterIndex);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("vertical");
  const [panels, setPanels] = useState(
    mangaProject.chapters?.[initialChapterIndex]?.scenes?.flatMap(
      (scene) => scene.panels || []
    ) || []
  );

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);

  // Get current chapter
  const currentChapter = mangaProject.chapters?.[currentChapterIndex];

  // Update panels when chapter changes
  useEffect(() => {
    setPanels(
      currentChapter?.scenes?.flatMap((scene) => scene.panels || []) || []
    );
  }, [currentChapter]);

  // Smooth auto-scroll functionality
  useEffect(() => {
    if (!autoScroll) {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      return;
    }

    const scrollStep = () => {
      const now = Date.now();
      const delta = now - lastScrollTimeRef.current;

      // Only scroll if at least 16ms have passed (60fps)
      if (delta >= 16) {
        window.scrollBy({ top: 1, behavior: "auto" });
        lastScrollTimeRef.current = now;
      }

      autoScrollRef.current = requestAnimationFrame(scrollStep);
    };

    lastScrollTimeRef.current = Date.now();
    autoScrollRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, [autoScroll]);

  // Track scroll position and current panel
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);

      if (containerRef.current && layoutMode === "vertical") {
        const panelElements = Array.from(
          document.querySelectorAll("[data-panel]")
        );

        panelElements.forEach((panel, index) => {
          const rect = panel.getBoundingClientRect();
          if (
            rect.top <= window.innerHeight * 0.3 &&
            rect.bottom >= window.innerHeight * 0.3
          ) {
            setCurrentPanelIndex(index);
          }
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [layoutMode]);

  // Navigation functions
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToPanel = (index: number) => {
    const panelElements = document.querySelectorAll("[data-panel]");
    if (panelElements[index]) {
      panelElements[index].scrollIntoView({ behavior: "smooth" });
    }
  };

  // Edit mode functions
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelectedDialogue(null);
  };

  const handleDialoguePositionChange = (
    dialogueId: string,
    panelId: string,
    x: number,
    y: number
  ) => {
    setPanels((prevPanels) =>
      prevPanels.map((panel) => {
        if (panel.id === panelId) {
          const updatedDialogues = panel.dialogues?.map((dialogue) => {
            if (dialogue.id === dialogueId) {
              return {
                ...dialogue,
                style: {
                  ...dialogue.style,
                  position: { x, y },
                },
              };
            }
            return dialogue;
          });
          return { ...panel, dialogues: updatedDialogues };
        }
        return panel;
      })
    );
  };

  const handleDrop = (item: DragItem, x: number, y: number) => {
    if (item.type === "DIALOGUE") {
      handleDialoguePositionChange(item.id, item.panelId, x, y);
    }
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
    } else {
      document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`min-h-screen transition-all duration-500 ${
          darkMode
            ? "bg-gray-900"
            : readingMode === "focus"
            ? "bg-black"
            : readingMode === "cinematic"
            ? "bg-gray-900"
            : "bg-gradient-to-b from-gray-100 to-gray-200"
        }`}
        ref={containerRef}
      >
        <Header
          chapters={mangaProject.chapters || []}
          currentChapterIndex={currentChapterIndex}
          currentPanelIndex={currentPanelIndex}
          darkMode={darkMode}
          soundEnabled={soundEnabled}
          autoScroll={autoScroll}
          layoutMode={layoutMode}
          fullscreen={fullscreen}
          editMode={editMode}
          readingMode={readingMode}
          onScrollToPanel={scrollToPanel}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
          onToggleLayout={() =>
            setLayoutMode(layoutMode === "vertical" ? "grid" : "vertical")
          }
          onToggleFullscreen={toggleFullscreen}
          onToggleEditMode={toggleEditMode}
          onSetReadingMode={setReadingMode}
        />

        {/* Main content */}
        <div
          className={`mx-auto transition-all duration-500 pb-24 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : readingMode === "focus"
              ? "bg-black"
              : "bg-white"
          } ${
            layoutMode === "vertical" ? "max-w-2xl shadow-2xl" : "max-w-6xl p-4"
          }`}
        >
          {layoutMode === "vertical" ? (
            // Vertical Layout
            panels.map((panel, index) => (
              <div
                key={panel.id}
                className="relative w-full overflow-hidden group"
                data-panel
              >
                {/* Panel image */}
                <PanelDropArea panelId={panel.id} onDrop={handleDrop}>
                  <div
                    className={`w-full bg-cover bg-center bg-no-repeat relative transition-all duration-1000 ${
                      panel.panelContext?.cameraAngle === "close-up"
                        ? "hover:scale-105"
                        : ""
                    }`}
                    style={{
                      backgroundImage: panel.imageUrl
                        ? `url(${panel.imageUrl})`
                        : "none",
                      height: "600px", // Fixed height for now
                      filter: `
                        brightness(100%) 
                        contrast(100%) 
                        saturate(100%) 
                        blur(0px)
                      `,
                    }}
                    onClick={() => {
                      if (editMode && !selectedDialogue) {
                        // Handle panel selection
                      }
                    }}
                  >
                    {/* Dynamic overlay */}
                    <div
                      className={`absolute inset-0 transition-all duration-300 ${
                        editMode
                          ? "bg-black bg-opacity-40"
                          : readingMode === "focus"
                          ? "bg-black bg-opacity-60"
                          : "bg-black bg-opacity-20"
                      }`}
                    />

                    {/* Edit mode grid overlay */}
                    {editMode && (
                      <div
                        className="absolute inset-0 opacity-30 pointer-events-none"
                        style={{
                          backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
                          `,
                          backgroundSize: "50px 50px",
                        }}
                      />
                    )}

                    {/* Dialogues */}
                    {panel.dialogues?.map((dialogue) => (
                      <DialogBubble
                        key={dialogue.id}
                        dialogue={dialogue}
                        panelId={panel.id}
                        editMode={editMode}
                        selected={selectedDialogue === dialogue.id}
                        onClick={() => {
                          if (editMode) {
                            setSelectedDialogue(dialogue.id);
                          }
                        }}
                        character={
                          panel.characters?.find(
                            (c) => c.id === dialogue.speakerId
                          ) || null
                        }
                        onPositionChange={(id, x, y) =>
                          handleDialoguePositionChange(id, panel.id, x, y)
                        }
                      />
                    ))}
                  </div>
                </PanelDropArea>

                {/* Dynamic Panel separator */}
                {index < panels.length - 1 && (
                  <div
                    className={`h-6 transition-all duration-500 ${
                      readingMode === "cinematic"
                        ? "bg-black"
                        : darkMode
                        ? "bg-gradient-to-r from-purple-900 via-pink-900 to-red-900"
                        : "bg-gradient-to-r from-red-400 via-purple-500 to-blue-500"
                    }`}
                  />
                )}
              </div>
            ))
          ) : (
            // Grid Layout
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {panels.map((panel, index) => (
                <div
                  key={panel.id}
                  className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer"
                  onClick={() => {
                    setLayoutMode("vertical");
                    setTimeout(() => scrollToPanel(index), 100);
                  }}
                >
                  <div
                    className="w-full h-64 bg-cover bg-center"
                    style={{
                      backgroundImage: panel.imageUrl
                        ? `url(${panel.imageUrl})`
                        : "none",
                    }}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${
                      darkMode ? "from-black" : "from-white"
                    } via-transparent to-transparent opacity-80`}
                  />
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <h3
                      className={`font-bold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {panel.panelContext?.action || `Panel ${index + 1}`}
                    </h3>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {panel.panelContext?.shotType || "Action Panel"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Action Buttons */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className={`fixed bottom-24 right-6 p-3 rounded-full shadow-lg z-40 transition-all ${
              darkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-white text-gray-800 hover:bg-gray-100"
            }`}
            title="Scroll to Top"
          >
            <ChevronUp size={24} />
          </button>
        )}
      </div>
    </DndProvider>
  );
};

const MangaReader = () => {
  const [mangaProject, setMangaProject] = useState<any>(null);
  const { id } = useParams();

  useEffect(() => {
    const getProject = async () => {
      const project = await getProjectWithRelations(id as string);
      setMangaProject(project);
    };
    getProject();
  }, [id]);

  if (!mangaProject) return null;
  return <MangaComponent mangaProject={mangaProject} />;
};

export default MangaReader;
