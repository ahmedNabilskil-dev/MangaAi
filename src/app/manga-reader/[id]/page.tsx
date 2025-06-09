"use client";
import Frame from "@/components/bubble/Frame";
import Speech, {
  ROUNDED_RECT_BUBBLE_SHAPE,
  SPEECH_TYPE,
} from "@/components/bubble/speech";
import { updatePanelDialogue } from "@/services/data-service";
import { getProjectWithRelations } from "@/services/db";
import { Chapter, MangaProject } from "@/types/entities";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit3,
  LayoutGrid,
  LayoutList,
  Maximize,
  Menu,
  Minimize,
  Moon,
  Navigation,
  Save,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type LayoutMode = "vertical" | "grid";

const DEFAULT_CONFIG = {
  w: 160,
  h: 100,
  c: { x: 50, y: 50 },
  tail: {
    corners: [{ x: 100, y: 100 }],
    tip: { x: 200, y: 200 },
  },
  shape: ROUNDED_RECT_BUBBLE_SHAPE,
  type: SPEECH_TYPE,
  config: {
    fontSize: 16,
    lineHeight: 26,
    textPadding: 14,
    cornerRadius: 12,
    strokeWidth: 2,
    strokeColor: "#000000",
    fillColor: "#ffffff",
    textColor: "#000000",
    tailWidthFactor: 4,
  },
};

const deepMergeWithDefaults = (defaults: any, overrides: any) => {
  if (!overrides) return { ...defaults };
  const result = { ...defaults };
  for (const key in overrides) {
    if (typeof overrides[key] === "object" && !Array.isArray(overrides[key])) {
      result[key] = deepMergeWithDefaults(defaults[key] || {}, overrides[key]);
    } else if (overrides[key] !== undefined) {
      result[key] = overrides[key];
    }
  }
  return result;
};

interface DialogBubbleProps {
  dialogue: {
    id: string;
    content: string;
    config: any;
    style?: {
      bubbleType?: "normal" | "thought" | "scream" | "whisper" | "narration";
      fontSize?: "x-small" | "small" | "medium" | "large" | "x-large";
      fontType?: string;
      emphasis?: boolean;
      position?: { x: number; y: number };
    };
  };
  editMode: boolean;
  selected: boolean;
  character?: {
    name: string;
  };
  onConfigChange: (config: any) => void;
}

const DialogBubble = ({
  dialogue,
  editMode,
  selected,
  character,
  onConfigChange,
}: DialogBubbleProps) => {
  const config = dialogue.config;

  const handleUpdate = useCallback(
    (updates: Partial<typeof config>) => {
      onConfigChange({ ...config, ...updates });
    },
    [config, onConfigChange]
  );
  const bubbleType = dialogue.style?.bubbleType || "normal";
  const displayText =
    character && bubbleType !== "narration"
      ? `${character.name}: ${dialogue.content}`
      : dialogue.content;
  return (
    <Speech
      w={config.w || 100}
      h={config.h || 100}
      c={config.c}
      tail={config.tail}
      shape={config.shape}
      type={config.type}
      text={displayText}
      config={config.config}
      onUpdateCentre={
        editMode
          ? ({ dx, dy }: { dx: number; dy: number }) =>
              handleUpdate({
                c: { x: config.c.x + dx, y: config.c.y + dy },
              })
          : undefined
      }
      onUpdateControlPoint={
        editMode
          ? (index, { dx, dy }) => {
              const newCorners = [...config.tail.corners];
              newCorners[index] = {
                x: newCorners[index].x + dx,
                y: newCorners[index].y + dy,
              };
              handleUpdate({ tail: { ...config.tail, corners: newCorners } });
            }
          : undefined
      }
      onUpdateTip={
        editMode
          ? ({ dx, dy }) =>
              handleUpdate({
                tail: {
                  ...config.tail,
                  tip: {
                    x: config.tail.tip.x + dx,
                    y: config.tail.tip.y + dy,
                  },
                },
              })
          : undefined
      }
      onUpdateSize={editMode ? ({ w, h }) => handleUpdate({ w, h }) : undefined}
      conClick={() => {}}
    />
  );
};

const Header: React.FC<{
  chapters: Chapter[];
  currentChapterIndex: number;
  currentPanelIndex: number;
  darkMode: boolean;
  autoScroll: boolean;
  layoutMode: LayoutMode;
  fullscreen: boolean;
  editMode: boolean;
  onChapterChange: (index: number) => void;
  onScrollToPanel: (index: number) => void;
  onToggleDarkMode: () => void;
  onToggleAutoScroll: () => void;
  onToggleLayout: () => void;
  onToggleFullscreen: () => void;
  onToggleEditMode: () => void;
}> = ({
  chapters,
  currentChapterIndex,
  currentPanelIndex,
  darkMode,
  autoScroll,
  layoutMode,
  fullscreen,
  editMode,
  onChapterChange,
  onScrollToPanel,
  onToggleDarkMode,
  onToggleAutoScroll,
  onToggleLayout,
  onToggleFullscreen,
  onToggleEditMode,
}) => {
  const currentChapter = chapters[currentChapterIndex];
  const panelCount =
    currentChapter?.scenes?.flatMap((s) => s.panels).length || 0;

  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modern color scheme
  const headerBg = darkMode
    ? "bg-gray-900/95 border-gray-800"
    : "bg-white/95 border-gray-200";

  const cardBg = darkMode
    ? "bg-gray-800/80 hover:bg-gray-700/80 border-gray-700/50"
    : "bg-white/80 hover:bg-gray-50/80 border-gray-300/50";

  const primaryText = darkMode ? "text-white" : "text-gray-900";
  const secondaryText = darkMode ? "text-gray-300" : "text-gray-600";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";

  const accentColor = darkMode ? "text-blue-400" : "text-blue-600";
  const accentBg = darkMode
    ? "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
    : "bg-blue-50 hover:bg-blue-100 border-blue-200";

  return (
    <>
      {/* Main Header */}
      <div
        className={`sticky top-0 z-50 ${headerBg} backdrop-blur-xl border-b shadow-sm`}
      >
        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Top Row - Main Navigation */}
            <div className="flex items-center justify-between mb-4">
              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${accentBg}`}>
                  <BookOpen className={accentColor} size={20} />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${primaryText}`}>
                    {currentChapter?.title || "Manga Reader"}
                  </h1>
                  <p className={`text-sm ${mutedText}`}>
                    Chapter {currentChapter?.chapterNumber}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleEditMode}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    editMode
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : `${accentBg} ${accentColor} hover:scale-105`
                  }`}
                >
                  {editMode ? <Save size={16} /> : <Edit3 size={16} />}
                  <span>{editMode ? "Save Changes" : "Edit Mode"}</span>
                </button>

                <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <button
                    onClick={onToggleDarkMode}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-700 text-yellow-400"
                        : "text-gray-600 hover:bg-white"
                    }`}
                    title={darkMode ? "Light Mode" : "Dark Mode"}
                  >
                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  </button>

                  <button
                    onClick={onToggleFullscreen}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      fullscreen
                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                        : "text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                    title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {fullscreen ? (
                      <Minimize size={16} />
                    ) : (
                      <Maximize size={16} />
                    )}
                  </button>

                  <button
                    onClick={onToggleLayout}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      layoutMode === "grid"
                        ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                        : "text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                    title={
                      layoutMode === "vertical" ? "Grid View" : "Vertical View"
                    }
                  >
                    {layoutMode === "vertical" ? (
                      <LayoutGrid size={16} />
                    ) : (
                      <LayoutList size={16} />
                    )}
                  </button>

                  <button
                    onClick={onToggleAutoScroll}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      autoScroll
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                    title="Auto Scroll"
                  >
                    <ChevronUp
                      size={16}
                      className={autoScroll ? "animate-pulse" : ""}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row - Navigation & Progress */}
            <div className="flex items-center justify-between">
              {/* Navigation Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onScrollToPanel(0)}
                    className={`p-2 rounded-lg ${cardBg} border backdrop-blur-sm transition-all duration-200 hover:scale-105`}
                    title="First Panel"
                  >
                    <ChevronLeft className={secondaryText} size={16} />
                  </button>
                  <button
                    onClick={() => onScrollToPanel(panelCount - 1)}
                    className={`p-2 rounded-lg ${cardBg} border backdrop-blur-sm transition-all duration-200 hover:scale-105`}
                    title="Last Panel"
                  >
                    <ChevronRight className={secondaryText} size={16} />
                  </button>
                </div>

                {/* Chapter Selector */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsChapterDropdownOpen(!isChapterDropdownOpen)
                    }
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg ${cardBg} border backdrop-blur-sm transition-all duration-200 hover:scale-105`}
                  >
                    <div className="text-left">
                      <div className={`text-sm font-medium ${primaryText}`}>
                        Chapter {currentChapter?.chapterNumber}
                      </div>
                      <div className={`text-xs ${mutedText} truncate max-w-32`}>
                        {currentChapter?.title}
                      </div>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`${mutedText} transition-transform duration-200 ${
                        isChapterDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isChapterDropdownOpen && (
                    <div
                      className={`absolute left-0 mt-2 w-72 ${cardBg} border backdrop-blur-xl rounded-xl shadow-xl z-50 overflow-hidden`}
                    >
                      <div className="p-2 max-h-64 overflow-y-auto">
                        {chapters.map((chapter, index) => (
                          <button
                            key={chapter.id}
                            onClick={() => {
                              onChapterChange(index);
                              setIsChapterDropdownOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-150 ${
                              index === currentChapterIndex
                                ? `${accentBg} ${accentColor}`
                                : `hover:bg-gray-100 dark:hover:bg-gray-700 ${primaryText}`
                            }`}
                          >
                            <div className="font-medium">
                              Chapter {chapter.chapterNumber}
                            </div>
                            <div className={`text-sm ${mutedText} truncate`}>
                              {chapter.title}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              <div className="flex items-center gap-6">
                <div className={`text-sm ${secondaryText} font-medium`}>
                  Panel {currentPanelIndex + 1} of {panelCount}
                </div>

                {panelCount > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                        style={{
                          width: `${
                            ((currentPanelIndex + 1) / panelCount) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${accentColor} min-w-[3rem]`}
                    >
                      {Math.round(((currentPanelIndex + 1) / panelCount) * 100)}
                      %
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header - Keep existing mobile design */}
        <div className="md:hidden px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`${cardBg} border p-2 rounded-lg transition-all duration-200 hover:scale-105`}
            >
              <Menu className={primaryText} size={18} />
            </button>

            <div className="flex-1 text-center px-3">
              <h1
                className={`text-lg font-bold ${primaryText} flex items-center justify-center gap-2`}
              >
                <BookOpen className={accentColor} size={16} />
                <span className="">{currentChapter?.title || "Manga"}</span>
              </h1>
              <div
                className={`text-xs ${mutedText} flex items-center justify-center gap-2`}
              >
                <span>Ch.{currentChapter?.chapterNumber}</span>
                <span>•</span>
                <span>
                  {currentPanelIndex + 1}/{panelCount}
                </span>
              </div>
            </div>

            <button
              onClick={onToggleEditMode}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm ${
                editMode
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : `${accentBg} ${accentColor}`
              }`}
            >
              {editMode ? "Save" : "Edit"}
            </button>
          </div>

          {/* Mobile progress bar */}
          {panelCount > 0 && (
            <div className="mt-3">
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{
                    width: `${((currentPanelIndex + 1) / panelCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Edit Mode Banner */}
        {editMode && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800 px-6 py-3">
            <p className="text-emerald-700 dark:text-emerald-300 text-sm text-center flex items-center justify-center gap-2">
              <Edit3 size={16} />
              <span className="font-medium">Edit Mode Active</span>
              <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400">
                • Click elements to edit • Drag to reposition
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay - Keep existing mobile menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div
            className={`fixed inset-y-0 left-0 w-80 ${headerBg} z-50 md:hidden transform transition-all duration-300 shadow-xl border-r`}
          >
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-lg font-bold ${primaryText} flex items-center gap-2`}
                >
                  <Menu size={18} />
                  Menu
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${cardBg} border p-2 rounded-lg transition-all duration-200 hover:scale-105`}
                >
                  <X className={primaryText} size={16} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Navigation */}
                <div>
                  <h3
                    className={`${secondaryText} font-medium mb-3 flex items-center gap-2 text-sm`}
                  >
                    <Navigation size={16} />
                    Navigation
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onScrollToPanel(0);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${cardBg} border p-3 rounded-lg text-center transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronLeft
                        className={`${primaryText} mx-auto mb-1`}
                        size={16}
                      />
                      <div className={`${primaryText} text-xs`}>First</div>
                    </button>
                    <button
                      onClick={() => {
                        onScrollToPanel(panelCount - 1);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${cardBg} border p-3 rounded-lg text-center transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronRight
                        className={`${primaryText} mx-auto mb-1`}
                        size={16}
                      />
                      <div className={`${primaryText} text-xs`}>Last</div>
                    </button>
                  </div>
                </div>

                {/* Chapter Selection */}
                <div>
                  <h3
                    className={`${secondaryText} font-medium mb-3 flex items-center gap-2 text-sm`}
                  >
                    <BookOpen size={16} />
                    Chapters
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {chapters.map((chapter, index) => (
                      <button
                        key={chapter.id}
                        onClick={() => {
                          onChapterChange(index);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 text-sm ${
                          index === currentChapterIndex
                            ? `${accentBg} ${accentColor}`
                            : `${cardBg} border ${primaryText} hover:bg-gray-100 dark:hover:bg-gray-700`
                        }`}
                      >
                        <div className="font-medium">
                          Chapter {chapter.chapterNumber}
                        </div>
                        <div className={`text-xs ${mutedText} truncate`}>
                          {chapter.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div>
                  <h3
                    className={`${secondaryText} font-medium mb-3 flex items-center gap-2 text-sm`}
                  >
                    <Settings size={16} />
                    Controls
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onToggleDarkMode();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${cardBg} border p-3 rounded-lg text-center transition-all duration-200 hover:scale-105`}
                    >
                      {darkMode ? (
                        <Sun
                          className="text-yellow-500 mx-auto mb-1"
                          size={18}
                        />
                      ) : (
                        <Moon
                          className="text-indigo-500 mx-auto mb-1"
                          size={18}
                        />
                      )}
                      <div className={`${primaryText} text-xs`}>
                        {darkMode ? "Light" : "Dark"}
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onToggleAutoScroll();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${cardBg} border p-3 rounded-lg text-center transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronUp
                        className={`mx-auto mb-1 ${
                          autoScroll
                            ? "text-blue-500 animate-pulse"
                            : secondaryText
                        }`}
                        size={18}
                      />
                      <div className={`${primaryText} text-xs`}>Auto</div>
                    </button>

                    <button
                      onClick={() => {
                        onToggleLayout();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${cardBg} border p-3 rounded-lg text-center transition-all duration-200 hover:scale-105`}
                    >
                      {layoutMode === "vertical" ? (
                        <LayoutGrid
                          className="text-purple-500 mx-auto mb-1"
                          size={18}
                        />
                      ) : (
                        <LayoutList
                          className="text-purple-500 mx-auto mb-1"
                          size={18}
                        />
                      )}
                      <div className={`${primaryText} text-xs`}>Layout</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
interface MangaWebtoonProps {
  mangaProject: MangaProject;
  initialChapterIndex?: number;
}

interface MangaWebtoonProps {
  mangaProject: MangaProject;
  initialChapterIndex?: number;
}

const MangaComponent: React.FC<MangaWebtoonProps> = ({
  mangaProject,
  initialChapterIndex = 0,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDialogue, setSelectedDialogue] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] =
    useState(initialChapterIndex);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("vertical");
  const [panels, setPanels] = useState<any[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);

  const updateDialogueConfig = (
    panelId: string,
    dialogueId: string,
    newConfig: any
  ) => {
    setPanels((prevPanels) =>
      prevPanels.map((panel) => {
        if (panel.id !== panelId) return panel;
        return {
          ...panel,
          dialogues:
            panel.dialogues?.map((dialogue: any) => {
              if (dialogue.id !== dialogueId) return dialogue;
              return { ...dialogue, config: newConfig };
            }) || [],
        };
      })
    );
  };

  const handleSave = async () => {
    try {
      const allDialogues = panels.flatMap((panel) => panel.dialogues || []);
      const updatePromises = allDialogues.map((dialogue) =>
        updatePanelDialogue(dialogue.id, { config: dialogue.config })
      );
      await Promise.all(updatePromises);
      console.log("All dialogues saved successfully");
      setEditMode(false);
    } catch (error) {
      console.error("Failed to save dialogues:", error);
    }
  };

  const toggleEditMode = async () => {
    if (editMode) {
      await handleSave();
    } else {
      setEditMode(true);
    }
  };

  // Update panels when chapter changes
  useEffect(() => {
    setPanels(
      mangaProject.chapters?.[currentChapterIndex]?.scenes?.flatMap(
        (scene) =>
          scene.panels?.map((panel) => ({
            ...panel,
            dialogues: panel.dialogues?.map((dialogue) => ({
              ...dialogue,
              config: deepMergeWithDefaults(
                DEFAULT_CONFIG,
                dialogue.config || {}
              ),
            })),
          })) || []
      ) || []
    );
    setCurrentPanelIndex(0); // Reset panel index when chapter changes
    scrollToTop(); // Scroll to top when chapter changes
  }, [currentChapterIndex]);

  // Handle chapter change
  const handleChapterChange = (index: number) => {
    if (index >= 0 && index < (mangaProject.chapters?.length || 0)) {
      setCurrentChapterIndex(index);
    }
  };

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
  }, [layoutMode, panels]); // Add panels to dependencies to update when chapter changes

  // Navigation functions
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToPanel = useCallback((index: number) => {
    const panelElements = document.querySelectorAll("[data-panel]");
    if (panelElements[index]) {
      panelElements[index].scrollIntoView({ behavior: "smooth" });
      setCurrentPanelIndex(index);
      console.log(index);
    }
  }, []);

  const handleGridPanelClick = useCallback(
    (index: number) => {
      setLayoutMode("vertical");
      setTimeout(() => {
        scrollToPanel(index);
      }, 600);
    },
    [scrollToPanel]
  );

  const toggleFullscreen = () => {
    if (!fullscreen) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
    } else {
      document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  const renderPanel = (panel: any, index: number) => (
    <div
      key={panel.id}
      className="relative w-full overflow-visible group"
      data-panel
    >
      <div
        className={`w-full bg-cover bg-no-repeat relative transition-all duration-1000`}
        style={{
          backgroundImage: panel.imageUrl ? `url(${panel.imageUrl})` : "none",
          // Dynamic height based on viewport
          height: "calc(100vh - 100px)", // Adjust 100px as needed
          // Smart background positioning
          backgroundPosition: "center center",
          // Ensure important content is always visible
          backgroundAttachment: "local",
          // Fallback background size
          backgroundSize: "cover",
          // Visual effects
          filter: "brightness(100%) contrast(100%) saturate(100%) blur(0px)",
          // Safe area padding if needed
          padding:
            "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100% 100%" // Changed to 100% to match container
          className="absolute inset-0 pointer-events-none"
          style={{ pointerEvents: editMode ? "auto" : "none" }}
        >
          {panel.dialogues?.map((dialogue: any) => (
            <Frame key={dialogue.id}>
              <DialogBubble
                dialogue={dialogue}
                editMode={editMode}
                selected={selectedDialogue === dialogue.id}
                character={
                  panel.characters?.find(
                    (c: any) => c.id === dialogue.speakerId
                  ) || null
                }
                onConfigChange={(newConfig) => {
                  updateDialogueConfig(panel.id, dialogue.id, newConfig);
                }}
              />
            </Frame>
          ))}
        </svg>
      </div>
      {index < panels.length - 1 && (
        <div className={`h-6 transition-all duration-500 ${`bg-black`}`} />
      )}
    </div>
  );

  // Render grid panel with preview
  const renderGridPanel = (panel: any, index: number) => (
    <div
      key={panel.id}
      className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer transform transition-all duration-300 hover:scale-105"
      onClick={() => handleGridPanelClick(index)}
    >
      <div
        className="w-full h-64 bg-cover bg-center relative"
        style={{
          backgroundImage: panel.imageUrl ? `url(${panel.imageUrl})` : "none",
        }}
      >
        {/* Preview overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            darkMode ? "from-black" : "from-white"
          } via-transparent to-transparent opacity-80`}
        />

        {/* Preview dialog bubbles (simplified) */}
        <div className="absolute inset-0">
          {panel.dialogues
            ?.slice(0, 2)
            .map((dialogue: any, dialogueIndex: number) => (
              <div
                key={dialogue.id}
                className="absolute bg-white bg-opacity-90 rounded-lg px-2 py-1 text-xs max-w-24 truncate shadow-md"
                style={{
                  left: `${20 + dialogueIndex * 30}%`,
                  top: `${30 + dialogueIndex * 20}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {dialogue.content.substring(0, 20)}...
              </div>
            ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 p-4 w-full">
        <h3
          className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
        >
          {panel.panelContext?.action || `Panel ${index + 1}`}
        </h3>
        <p
          className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          {panel.panelContext?.shotType || "Action Panel"} •{" "}
          {panel.dialogues?.length || 0} dialogs
        </p>
      </div>
    </div>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`min-h-screen transition-all duration-500 ${
          darkMode
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
          autoScroll={autoScroll}
          layoutMode={layoutMode}
          fullscreen={fullscreen}
          editMode={editMode}
          onChapterChange={handleChapterChange}
          onScrollToPanel={scrollToPanel}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
          onToggleLayout={() =>
            setLayoutMode(layoutMode === "vertical" ? "grid" : "vertical")
          }
          onToggleFullscreen={toggleFullscreen}
          onToggleEditMode={toggleEditMode}
        />

        {/* Main content */}
        <div
          className={`mx-auto transition-all duration-500 pb-24 ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
          } ${
            layoutMode === "vertical" ? "max-w-2xl shadow-2xl" : "max-w-6xl p-4"
          }`}
        >
          {layoutMode === "vertical" ? (
            // Vertical Layout with SVG dialog system
            <div className="space-y-0">
              {panels.map((panel, index) => renderPanel(panel, index))}
            </div>
          ) : (
            // Grid Layout with dialog previews
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {panels.map((panel, index) => renderGridPanel(panel, index))}
            </div>
          )}
        </div>

        {/* Floating Action Buttons */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className={`fixed bottom-24 right-6 p-3 rounded-full shadow-lg z-40 transition-all transform hover:scale-110 ${
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
