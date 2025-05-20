"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getProjectWithRelations } from "@/services/db";
import { Chapter, Character, MangaProject, Panel } from "@/types/entities";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Gauge,
  Layout,
  Maximize,
  Menu,
  MessageCircle,
  Minimize,
  Moon,
  Palette,
  RotateCw,
  Settings,
  Sparkles,
  Sun,
  Type,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface MangaReaderPageProps {
  params: {
    projectId: string;
    chapterId?: string;
  };
}

const MangaReaderPage: React.FC<MangaReaderPageProps> = ({ params }) => {
  // State
  const [currentProject, setCurrentProject] = useState<MangaProject | null>(
    null
  );
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(3);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCharacterInfoOpen, setIsCharacterInfoOpen] = useState(false);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(
    null
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [readingMode, setReadingMode] = useState<
    "vertical" | "horizontal" | "page"
  >("vertical");
  const [nightMode, setNightMode] = useState(false);
  const [textSize, setTextSize] = useState(1);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [showContextBanner, setShowContextBanner] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [showTransitions, setShowTransitions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showPanelDetails, setShowPanelDetails] = useState(false);
  const [activePanelDetails, setActivePanelDetails] = useState<Panel | null>(
    null
  );

  const mangaContainerRef = useRef<HTMLDivElement>(null);
  const charactersInScene = useRef<Set<Character>>(new Set());

  // Scroll animation
  const { scrollYProgress } = useScroll({
    target: mangaContainerRef,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0, 0, 1]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [1, 0.95, 0.95, 1]
  );

  // Fetch data
  useEffect(() => {
    const fetchMangaProject = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        const project = await getProjectWithRelations("proj-samurai-destiny");

        setCurrentProject(project);
        const initialChapter = params.chapterId
          ? project.chapters.find((c) => c.id === params.chapterId)
          : project.chapters[0];
        setCurrentChapter(initialChapter || project.chapters[0]);
      } catch (error) {
        console.error("Error fetching manga project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMangaProject();
  }, [params.projectId, params.chapterId]);

  // Track characters in current scene
  useEffect(() => {
    if (!currentChapter) return;

    const allCharacters = new Set<Character>();

    currentChapter.scenes.forEach((scene) => {
      scene.panels.forEach((panel) => {
        panel.characters?.forEach((character) => {
          allCharacters.add(character);
        });
      });
    });

    charactersInScene.current = allCharacters;
  }, [currentChapter]);

  // Auto-scroll effect
  useEffect(() => {
    let animationFrame: number;

    if (isAutoScrolling && mangaContainerRef.current) {
      const scroll = () => {
        if (mangaContainerRef.current) {
          mangaContainerRef.current.scrollTop += autoScrollSpeed;
          animationFrame = requestAnimationFrame(scroll);
        }
      };

      animationFrame = requestAnimationFrame(scroll);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isAutoScrolling, autoScrollSpeed]);

  // Sound effects simulation
  useEffect(() => {
    if (!soundEnabled || !currentChapter) return;


    return () => {
      // Clean up audio resources
    };
  }, [soundEnabled, currentPanelIndex, currentChapter]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Navigate to next panel
  const goToNextPanel = () => {
    if (!currentChapter || !currentProject) return;

    const totalPanels = currentChapter.scenes.reduce(
      (acc, scene) => acc + scene.panels.length,
      0
    );

    if (currentPanelIndex < totalPanels - 1) {
      setCurrentPanelIndex(currentPanelIndex + 1);
    } else {
      // Go to next chapter if available
      const currentChapterIndex = currentProject.chapters.findIndex(
        (c) => c.id === currentChapter.id
      );

      if (currentChapterIndex < currentProject.chapters.length - 1) {
        setCurrentChapter(currentProject.chapters[currentChapterIndex + 1]);
        setCurrentPanelIndex(0);
      }
    }
  };

  // Navigate to previous panel
  const goToPrevPanel = () => {
    if (!currentChapter || !currentProject) return;

    if (currentPanelIndex > 0) {
      setCurrentPanelIndex(currentPanelIndex - 1);
    } else {
      // Go to previous chapter if available
      const currentChapterIndex = currentProject.chapters.findIndex(
        (c) => c.id === currentChapter.id
      );

      if (currentChapterIndex > 0) {
        const prevChapter = currentProject.chapters[currentChapterIndex - 1];
        const totalPanelsInPrevChapter = prevChapter.scenes.reduce(
          (acc, scene) => acc + scene.panels.length,
          0
        );

        setCurrentChapter(prevChapter);
        setCurrentPanelIndex(totalPanelsInPrevChapter - 1);
      }
    }
  };

  // Toggle full screen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Zoom functions
  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));

  // Toggle character info panel
  const toggleCharacterInfo = (character: Character) => {
    if (activeCharacter && activeCharacter.id === character.id) {
      setIsCharacterInfoOpen(false);
      setActiveCharacter(null);
    } else {
      setActiveCharacter(character);
      setIsCharacterInfoOpen(true);
    }
  };

  // Show panel details
  const showPanelDetailsOverlay = (panel: Panel) => {
    setActivePanelDetails(panel);
    setShowPanelDetails(true);
  };

  // Get current panel and its details
  const getCurrentPanel = () => {
    if (!currentChapter) return null;

    let panelCounter = 0;

    for (const scene of currentChapter.scenes) {
      for (const panel of scene.panels) {
        if (panelCounter === currentPanelIndex) {
          return { panel, scene };
        }
        panelCounter++;
      }
    }

    return null;
  };

  const currentPanelContext = getCurrentPanel();

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
          <h2 className="text-2xl font-bold text-white mt-8">
            Loading your manga...
          </h2>
          <p className="text-gray-400 mt-2">
            Preparing an immersive experience
          </p>
        </div>
      </div>
    );
  }

  if (!currentProject || !currentChapter) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mt-8">
            Manga not found
          </h2>
          <p className="text-gray-400 mt-2">
            The requested manga could not be loaded
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden ${
        nightMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Top Navigation */}
      <AnimatePresence>
        {(!isFullscreen || isSidebarOpen) && (
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`px-6 py-4 flex justify-between items-center border-b ${
              nightMode
                ? "bg-gray-900 text-white border-gray-800"
                : "bg-white text-gray-900 border-gray-200"
            } z-50`}
          >
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <Menu className="h-6 w-6" />
              </Button>

              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  {currentProject.title}
                  <Sparkles className="h-4 w-4 text-pink-500 ml-2" />
                </h1>
                <p
                  className={`text-sm ${
                    nightMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Chapter {currentChapter.chapterNumber}: {currentChapter.title}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNightMode(!nightMode)}
                className="rounded-full"
              >
                {nightMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-full"
              >
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="rounded-full"
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomIn}
                  disabled={zoomLevel >= 2}
                  className="rounded-full"
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                className="rounded-full relative"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="rounded-full"
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="rounded-full"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Left Sidebar - Chapter Navigation */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`w-72 h-full overflow-y-auto border-r ${
                nightMode
                  ? "bg-gray-900 text-white border-gray-800"
                  : "bg-white text-gray-900 border-gray-200"
              } z-30`}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Chapters</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {currentProject.chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      onClick={() => {
                        setCurrentChapter(chapter);
                        setCurrentPanelIndex(0);
                        setIsSidebarOpen(false);
                        if (mangaContainerRef.current) {
                          mangaContainerRef.current.scrollTo(0, 0);
                        }
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        chapter.id === currentChapter.id
                          ? "bg-pink-100 dark:bg-pink-900"
                          : `hover:bg-gray-100 dark:hover:bg-gray-800 ${
                              nightMode ? "bg-gray-900" : "bg-white"
                            }`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3
                            className={`font-medium ${
                              chapter.id === currentChapter.id
                                ? "text-pink-700 dark:text-pink-300"
                                : ""
                            }`}
                          >
                            Chapter {chapter.chapterNumber}
                          </h3>
                          <p
                            className={`text-sm truncate ${
                              nightMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {chapter.title}
                          </p>
                        </div>

                        {chapter.id === currentChapter.id && (
                          <div className="bg-pink-500 h-2 w-2 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Characters in this chapter */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold mb-4">
                    Characters in This Chapter
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from(charactersInScene.current).map((character) => (
                      <button
                        key={character.id}
                        onClick={() => toggleCharacterInfo(character)}
                        className="flex flex-col items-center"
                      >
                        {character.imgUrl ? (
                          <Image
                            src={character.imgUrl}
                            alt={character.name}
                            width={64}
                            height={64}
                            className="rounded-full w-12 h-12 object-cover border-2 border-pink-500"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                            {character.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs mt-1 truncate w-full text-center">
                          {character.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Reading Area */}
        <div className="flex-1 flex flex-col h-full relative">
          {/* Chapter Context Banner */}
          <AnimatePresence>
            {showContextBanner && currentPanelContext && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className={`absolute top-0 left-0 right-0 z-20 p-4 ${
                  nightMode
                    ? "bg-gradient-to-b from-gray-900 via-gray-900/80 to-transparent"
                    : "bg-gradient-to-b from-white via-white/80 to-transparent"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    <span
                      className={nightMode ? "text-gray-300" : "text-gray-700"}
                    >
                      {currentPanelContext.scene.title} —
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {currentPanelContext.scene.sceneContext.setting},{" "}
                      {currentPanelContext.scene.sceneContext.timeOfDay}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowContextBanner(false)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Reader */}
          <div
            ref={mangaContainerRef}
            className={`flex-1 ${
              readingMode === "vertical"
                ? "overflow-y-auto overflow-x-hidden"
                : "overflow-hidden"
            } relative`}
            style={{
              backgroundColor: nightMode ? "#111" : "#fff",
            }}
          >
            {readingMode === "vertical" ? (
              // Vertical scrolling reader
              <div
                className="w-full pb-20"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "top center",
                }}
              >
                {currentChapter.scenes.map((scene, sceneIndex) => (
                  <div key={scene.id} className="relative">
                    {/* Scene transition effect */}
                    {sceneIndex > 0 && showTransitions && (
                      <div className="relative h-24 overflow-hidden my-12">
                        <div
                          className={`absolute inset-0 ${
                            nightMode ? "bg-black" : "bg-white"
                          }`}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p
                            className={`text-lg ${
                              nightMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {scene.sceneContext.timeOfDay} •{" "}
                            {scene.sceneContext.setting}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Scene content */}
                    <div className="mb-12">
                      {scene.panels.map((panel, panelIndex) => {
                        const isWidePanel =
                          panel.panelContext.shotType === "establishing" ||
                          panel.panelContext.cameraAngle === "wide";

                        return (
                          <motion.div
                            key={panel.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className={`relative mx-auto mb-6 ${
                              isWidePanel
                                ? "w-full max-w-5xl"
                                : "w-full max-w-3xl"
                            }`}
                          >
                            {/* Panel image */}
                            <div
                              className={`relative ${
                                isWidePanel
                                  ? "aspect-[16/9]"
                                  : panel.panelContext.cameraAngle ===
                                    "close-up"
                                  ? "aspect-square"
                                  : "aspect-[4/3]"
                              } rounded-lg overflow-hidden border-2 ${
                                nightMode
                                  ? "border-gray-800"
                                  : "border-gray-100"
                              } shadow-xl group`}
                              onClick={() => showPanelDetailsOverlay(panel)}
                            >
                              {panel.imageUrl ? (
                                <Image
                                  src={panel.imageUrl}
                                  alt={`Panel ${panelIndex + 1} from ${
                                    scene.title
                                  }`}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                // Placeholder for demo
                                <div
                                  className={`w-full h-full ${
                                    nightMode ? "bg-gray-800" : "bg-gray-100"
                                  } flex items-center justify-center`}
                                >
                                  <div className="text-center max-w-lg px-6">
                                    <p
                                      className={`text-lg ${
                                        nightMode
                                          ? "text-white"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {panel.panelContext.action}
                                    </p>
                                    <p
                                      className={`mt-2 text-sm ${
                                        nightMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {panel.panelContext.cameraAngle} shot -{" "}
                                      {panel.panelContext.lighting} lighting
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Panel details overlay */}
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="text-center text-white p-4">
                                  <h3 className="text-xl font-bold mb-2">
                                    Panel Details
                                  </h3>
                                  <p className="text-sm">
                                    {panel.panelContext.dramaticPurpose}
                                  </p>
                                  <p className="text-xs mt-2">
                                    Click for more info
                                  </p>
                                </div>
                              </div>

                              {/* Characters in panel indicator */}
                              <div className="absolute bottom-4 right-4 flex space-x-2">
                                {panel.characters &&
                                  panel.characters.map((character) => (
                                    <button
                                      key={character.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCharacterInfo(character);
                                      }}
                                      className="w-8 h-8 rounded-full bg-black/60 p-0.5 backdrop-blur-sm hover:bg-pink-500/80 transition-colors"
                                    >
                                      {character.imgUrl ? (
                                        <Image
                                          src={character.imgUrl}
                                          alt={character.name}
                                          width={32}
                                          height={32}
                                          className="rounded-full"
                                        />
                                      ) : (
                                        <div className="w-full h-full rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                          {character.name.charAt(0)}
                                        </div>
                                      )}
                                    </button>
                                  ))}
                              </div>
                            </div>

                            {/* Dialogues */}
                            <div className="mt-4 mx-4 space-y-3">
                              {panel.dialogues &&
                                panel.dialogues.map((dialogue) => (
                                  <div
                                    key={dialogue.id}
                                    className={`flex ${
                                      dialogue.speakerId
                                        ? "items-start"
                                        : "items-center justify-center"
                                    }`}
                                  >
                                    {dialogue.speakerId && dialogue.speaker && (
                                      <div className="flex-shrink-0 mr-3">
                                        {dialogue.speaker.imgUrl ? (
                                          <Image
                                            src={dialogue.speaker.imgUrl}
                                            alt={dialogue.speaker.name}
                                            width={40}
                                            height={40}
                                            className="rounded-full border-2 border-pink-500"
                                          />
                                        ) : (
                                          <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                                            {dialogue.speaker.name.charAt(0)}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <div
                                      className={`py-2 px-4 rounded-lg ${
                                        dialogue.style?.bubbleType === "thought"
                                          ? "rounded-tr-3xl rounded-bl-3xl"
                                          : dialogue.style?.bubbleType ===
                                            "scream"
                                          ? "rounded-xl shadow-lg"
                                          : dialogue.style?.bubbleType ===
                                            "whisper"
                                          ? "rounded-md border border-dashed"
                                          : dialogue.style?.bubbleType ===
                                            "narration"
                                          ? "border-l-4 pl-3"
                                          : "rounded-lg"
                                      } ${
                                        dialogue.speakerId
                                          ? `max-w-[85%] ${
                                              nightMode
                                                ? "bg-gray-800 text-white"
                                                : "bg-gray-100 text-gray-900"
                                            }`
                                          : dialogue.style?.bubbleType ===
                                            "narration"
                                          ? `italic max-w-xl mx-auto text-center ${
                                              nightMode
                                                ? "border-gray-700 text-gray-300"
                                                : "border-gray-300 text-gray-600"
                                            }`
                                          : ""
                                      }`}
                                      style={{
                                        fontSize:
                                          textSize *
                                            (dialogue.style?.fontSize ===
                                            "x-small"
                                              ? 0.8
                                              : dialogue.style?.fontSize ===
                                                "small"
                                              ? 0.9
                                              : dialogue.style?.fontSize ===
                                                "large"
                                              ? 1.2
                                              : dialogue.style?.fontSize ===
                                                "x-large"
                                              ? 1.4
                                              : 1) +
                                          "rem",
                                        fontStyle:
                                          dialogue.style?.bubbleType ===
                                          "narration"
                                            ? "italic"
                                            : "normal",
                                        fontWeight: dialogue.style?.emphasis
                                          ? "bold"
                                          : "normal",
                                      }}
                                    >
                                      {dialogue.speakerId && (
                                        <p className="font-bold text-sm text-pink-500 mb-1">
                                          {dialogue.speaker?.name}
                                          {dialogue.emotion && (
                                            <span className="ml-2 font-normal text-xs text-gray-500">
                                              ({dialogue.emotion})
                                            </span>
                                          )}
                                        </p>
                                      )}
                                      <p>{dialogue.content}</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* End of chapter */}
                <div className="text-center py-20">
                  <h3
                    className={`text-2xl font-bold mb-4 ${
                      nightMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    End of Chapter {currentChapter.chapterNumber}
                  </h3>

                  <div className="flex justify-center space-x-4">
                    {currentProject.chapters.findIndex(
                      (c) => c.id === currentChapter.id
                    ) <
                      currentProject.chapters.length - 1 && (
                      <Button
                        onClick={() => {
                          const nextChapterIndex =
                            currentProject.chapters.findIndex(
                              (c) => c.id === currentChapter.id
                            ) + 1;
                          setCurrentChapter(
                            currentProject.chapters[nextChapterIndex]
                          );
                          setCurrentPanelIndex(0);
                          if (mangaContainerRef.current) {
                            mangaContainerRef.current.scrollTo(0, 0);
                          }
                        }}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        Next Chapter
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : readingMode === "horizontal" ? (
              // Horizontal swipe reader
              <div className="h-full flex items-center justify-center">
                <motion.div
                  key={currentPanelIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="max-w-3xl mx-auto text-center"
                >
                  {currentPanelContext && (
                    <div
                      className="p-4"
                      style={{ transform: `scale(${zoomLevel})` }}
                    >
                      <div
                        className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-gray-200 shadow-xl mb-6 group"
                        onClick={() =>
                          showPanelDetailsOverlay(currentPanelContext.panel)
                        }
                      >
                        {currentPanelContext.panel.imageUrl ? (
                          <Image
                            src={currentPanelContext.panel.imageUrl}
                            alt={`Panel from ${currentPanelContext.scene.title}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          // Placeholder for demo
                          <div
                            className={`w-full h-full ${
                              nightMode ? "bg-gray-800" : "bg-gray-100"
                            } flex items-center justify-center`}
                          >
                            <div className="text-center max-w-lg px-6">
                              <p
                                className={`text-lg ${
                                  nightMode ? "text-white" : "text-gray-700"
                                }`}
                              >
                                {currentPanelContext.panel.panelContext.action}
                              </p>
                              <p
                                className={`mt-2 text-sm ${
                                  nightMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {
                                  currentPanelContext.panel.panelContext
                                    .cameraAngle
                                }{" "}
                                shot -{" "}
                                {
                                  currentPanelContext.panel.panelContext
                                    .lighting
                                }{" "}
                                lighting
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Panel details overlay */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center text-white p-4">
                            <h3 className="text-xl font-bold mb-2">
                              Panel Details
                            </h3>
                            <p className="text-sm">
                              {
                                currentPanelContext.panel.panelContext
                                  .dramaticPurpose
                              }
                            </p>
                            <p className="text-xs mt-2">Click for more info</p>
                          </div>
                        </div>
                      </div>

                      {/* Dialogues */}
                      <div className="mt-4 mx-4 space-y-3">
                        {currentPanelContext.panel.dialogues &&
                          currentPanelContext.panel.dialogues.map(
                            (dialogue) => (
                              <div
                                key={dialogue.id}
                                className={`flex ${
                                  dialogue.speakerId
                                    ? "items-start"
                                    : "items-center justify-center"
                                }`}
                              >
                                {dialogue.speakerId && dialogue.speaker && (
                                  <div className="flex-shrink-0 mr-3">
                                    {dialogue.speaker.imgUrl ? (
                                      <Image
                                        src={dialogue.speaker.imgUrl}
                                        alt={dialogue.speaker.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full border-2 border-pink-500"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                                        {dialogue.speaker.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div
                                  className={`py-2 px-4 rounded-lg ${
                                    dialogue.style?.bubbleType === "thought"
                                      ? "rounded-tr-3xl rounded-bl-3xl"
                                      : dialogue.style?.bubbleType === "scream"
                                      ? "rounded-xl shadow-lg"
                                      : dialogue.style?.bubbleType === "whisper"
                                      ? "rounded-md border border-dashed"
                                      : dialogue.style?.bubbleType ===
                                        "narration"
                                      ? "border-l-4 pl-3"
                                      : "rounded-lg"
                                  } ${
                                    dialogue.speakerId
                                      ? `max-w-[85%] ${
                                          nightMode
                                            ? "bg-gray-800 text-white"
                                            : "bg-gray-100 text-gray-900"
                                        }`
                                      : dialogue.style?.bubbleType ===
                                        "narration"
                                      ? `italic max-w-xl mx-auto text-center ${
                                          nightMode
                                            ? "border-gray-700 text-gray-300"
                                            : "border-gray-300 text-gray-600"
                                        }`
                                      : ""
                                  }`}
                                  style={{
                                    fontSize:
                                      textSize *
                                        (dialogue.style?.fontSize === "x-small"
                                          ? 0.8
                                          : dialogue.style?.fontSize === "small"
                                          ? 0.9
                                          : dialogue.style?.fontSize === "large"
                                          ? 1.2
                                          : dialogue.style?.fontSize ===
                                            "x-large"
                                          ? 1.4
                                          : 1) +
                                      "rem",
                                    fontStyle:
                                      dialogue.style?.bubbleType === "narration"
                                        ? "italic"
                                        : "normal",
                                    fontWeight: dialogue.style?.emphasis
                                      ? "bold"
                                      : "normal",
                                  }}
                                >
                                  {dialogue.speakerId && (
                                    <p className="font-bold text-sm text-pink-500 mb-1">
                                      {dialogue.speaker?.name}
                                      {dialogue.emotion && (
                                        <span className="ml-2 font-normal text-xs text-gray-500">
                                          ({dialogue.emotion})
                                        </span>
                                      )}
                                    </p>
                                  )}
                                  <p>{dialogue.content}</p>
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            ) : (
              // Page mode reader
              <div className="h-full flex items-center justify-center">
                <div className="flex items-center justify-center h-full w-full">
                  {currentPanelContext && (
                    <motion.div
                      key={currentPanelIndex}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="relative h-full w-full max-w-5xl flex items-center justify-center"
                      style={{ transform: `scale(${zoomLevel})` }}
                    >
                      <div
                        className="relative w-full h-full max-h-[90vh] rounded-lg overflow-hidden border-2 border-gray-200 shadow-xl group"
                        onClick={() =>
                          showPanelDetailsOverlay(currentPanelContext.panel)
                        }
                      >
                        {currentPanelContext.panel.imageUrl ? (
                          <Image
                            src={currentPanelContext.panel.imageUrl}
                            alt={`Panel from ${currentPanelContext.scene.title}`}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          // Placeholder for demo
                          <div
                            className={`w-full h-full ${
                              nightMode ? "bg-gray-800" : "bg-gray-100"
                            } flex items-center justify-center`}
                          >
                            <div className="text-center max-w-lg px-6">
                              <p
                                className={`text-lg ${
                                  nightMode ? "text-white" : "text-gray-700"
                                }`}
                              >
                                {currentPanelContext.panel.panelContext.action}
                              </p>
                              <p
                                className={`mt-2 text-sm ${
                                  nightMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {
                                  currentPanelContext.panel.panelContext
                                    .cameraAngle
                                }{" "}
                                shot -{" "}
                                {
                                  currentPanelContext.panel.panelContext
                                    .lighting
                                }{" "}
                                lighting
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Panel details overlay */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center text-white p-4">
                            <h3 className="text-xl font-bold mb-2">
                              Panel Details
                            </h3>
                            <p className="text-sm">
                              {
                                currentPanelContext.panel.panelContext
                                  .dramaticPurpose
                              }
                            </p>
                            <p className="text-xs mt-2">Click for more info</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <AnimatePresence>
            {(!isFullscreen || isSidebarOpen) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute bottom-4 left-0 right-0 flex justify-center space-x-4 z-20 ${
                  nightMode ? "text-white" : "text-gray-900"
                }`}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={goToPrevPanel}
                  className="rounded-full shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                  className={`rounded-full shadow-lg backdrop-blur-sm ${
                    isAutoScrolling
                      ? "bg-pink-500/80 text-white"
                      : "bg-white/80 dark:bg-gray-800/80"
                  }`}
                >
                  <RotateCw className="h-6 w-6" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={goToNextPanel}
                  className="rounded-full shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar - Character Info */}
        <AnimatePresence>
          {isCharacterInfoOpen && activeCharacter && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`w-80 h-full overflow-y-auto border-l ${
                nightMode
                  ? "bg-gray-900 text-white border-gray-800"
                  : "bg-white text-gray-900 border-gray-200"
              } z-30`}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Character Details</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCharacterInfoOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-col items-center mb-6">
                  {activeCharacter.imgUrl ? (
                    <Image
                      src={activeCharacter.imgUrl}
                      alt={activeCharacter.name}
                      width={160}
                      height={160}
                      className="rounded-full w-32 h-32 object-cover border-4 border-pink-500"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                      {activeCharacter.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mt-4">
                    {activeCharacter.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {activeCharacter.role}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">
                      Appearance
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Age</p>
                        <p>{activeCharacter.age || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Gender</p>
                        <p>{activeCharacter.gender || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Height</p>
                        <p>
                          {activeCharacter.bodyAttributes?.height || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Body Type</p>
                        <p>
                          {activeCharacter.bodyAttributes?.bodyType ||
                            "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">
                      Personality
                    </h4>
                    <p className="text-sm">
                      {activeCharacter.personality ||
                        "No personality description available."}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">
                      Abilities
                    </h4>
                    <p className="text-sm">
                      {activeCharacter.abilities || "No abilities listed."}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">
                      Backstory
                    </h4>
                    <p className="text-sm">
                      {activeCharacter.backstory || "No backstory available."}
                    </p>
                  </div>

                  {activeCharacter.expressionImages &&
                    Object.keys(activeCharacter.expressionImages).length >
                      0 && (
                      <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">
                          Expressions
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(activeCharacter.expressionImages).map(
                            ([expression, imgUrl]) => (
                              <div key={expression} className="text-center">
                                <div className="aspect-square w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                  <Image
                                    src={imgUrl}
                                    alt={`${activeCharacter.name} ${expression}`}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-xs mt-1 capitalize">
                                  {expression}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`w-80 h-full overflow-y-auto border-l ${
                nightMode
                  ? "bg-gray-900 text-white border-gray-800"
                  : "bg-white text-gray-900 border-gray-200"
              } z-30`}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Reader Settings</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold flex items-center mb-3">
                      <Layout className="h-4 w-4 mr-2" />
                      Reading Mode
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={
                          readingMode === "vertical" ? "default" : "outline"
                        }
                        onClick={() => setReadingMode("vertical")}
                        className="h-10"
                      >
                        Vertical
                      </Button>
                      <Button
                        variant={
                          readingMode === "horizontal" ? "default" : "outline"
                        }
                        onClick={() => setReadingMode("horizontal")}
                        className="h-10"
                      >
                        Horizontal
                      </Button>
                      <Button
                        variant={readingMode === "page" ? "default" : "outline"}
                        onClick={() => setReadingMode("page")}
                        className="h-10"
                      >
                        Page
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold flex items-center mb-3">
                      <Palette className="h-4 w-4 mr-2" />
                      Display
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Night Mode</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setNightMode(!nightMode)}
                          className="rounded-full"
                        >
                          {nightMode ? (
                            <Sun className="h-5 w-5" />
                          ) : (
                            <Moon className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Show Scene Transitions</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowTransitions(!showTransitions)}
                          className="rounded-full"
                        >
                          {showTransitions ? (
                            <Eye className="h-5 w-5" />
                          ) : (
                            <EyeOff className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Show Context Banner</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setShowContextBanner(!showContextBanner)
                          }
                          className="rounded-full"
                        >
                          {showContextBanner ? (
                            <Eye className="h-5 w-5" />
                          ) : (
                            <EyeOff className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold flex items-center mb-3">
                      <Type className="h-4 w-4 mr-2" />
                      Text Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Text Size
                        </label>
                        <Slider
                          value={[textSize]}
                          max={1.5}
                          min={0.8}
                          step={0.1}
                          onValueChange={(value) => setTextSize(value[0])}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Small</span>
                          <span>Large</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold flex items-center mb-3">
                      <Gauge className="h-4 w-4 mr-2" />
                      Auto-scroll
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Auto-scroll</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                          className="rounded-full"
                        >
                          {isAutoScrolling ? (
                            <RotateCw className="h-5 w-5 text-pink-500 animate-spin" />
                          ) : (
                            <RotateCw className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      {isAutoScrolling && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Speed
                          </label>
                          <Slider
                            value={[autoScrollSpeed]}
                            max={10}
                            min={1}
                            step={1}
                            onValueChange={(value) =>
                              setAutoScrollSpeed(value[0])
                            }
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Slow</span>
                            <span>Fast</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel Details Overlay */}
        <AnimatePresence>
          {showPanelDetails && activePanelDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPanelDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`relative max-w-4xl w-full max-h-[90vh] rounded-lg overflow-hidden ${
                  nightMode ? "bg-gray-900" : "bg-white"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 right-0 p-4 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPanelDetails(false)}
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="h-full overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="relative aspect-[4/3]">
                      {activePanelDetails.imageUrl ? (
                        <Image
                          src={activePanelDetails.imageUrl}
                          alt="Panel"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full ${
                            nightMode ? "bg-gray-800" : "bg-gray-100"
                          } flex items-center justify-center`}
                        >
                          <p
                            className={`text-lg ${
                              nightMode ? "text-white" : "text-gray-700"
                            }`}
                          >
                            {activePanelDetails.panelContext.action}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-4">Panel Details</h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">
                            Action
                          </h4>
                          <p>{activePanelDetails.panelContext.action}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">
                            Dramatic Purpose
                          </h4>
                          <p>
                            {activePanelDetails.panelContext.dramaticPurpose}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">
                            Technical Details
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm text-gray-500">
                                Camera Angle
                              </p>
                              <p>
                                {activePanelDetails.panelContext.cameraAngle ||
                                  "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Shot Type</p>
                              <p>
                                {activePanelDetails.panelContext.shotType ||
                                  "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Lighting</p>
                              <p>
                                {activePanelDetails.panelContext.lighting ||
                                  "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Effects</p>
                              <p>
                                {activePanelDetails.panelContext.effects?.join(
                                  ", "
                                ) || "None"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {activePanelDetails.dialogues &&
                          activePanelDetails.dialogues.length > 0 && (
                            <div>
                              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">
                                Dialogues
                              </h4>
                              <div className="space-y-2">
                                {activePanelDetails.dialogues.map(
                                  (dialogue) => (
                                    <div
                                      key={dialogue.id}
                                      className="border-l-2 border-pink-500 pl-3 py-1"
                                    >
                                      {dialogue.speaker && (
                                        <p className="font-bold text-pink-500">
                                          {dialogue.speaker.name}
                                        </p>
                                      )}
                                      <p>{dialogue.content}</p>
                                      {dialogue.emotion && (
                                        <p className="text-xs text-gray-500">
                                          Emotion: {dialogue.emotion}
                                        </p>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {activePanelDetails.characters &&
                          activePanelDetails.characters.length > 0 && (
                            <div>
                              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">
                                Characters in Panel
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {activePanelDetails.characters.map(
                                  (character) => (
                                    <button
                                      key={character.id}
                                      onClick={() => {
                                        setActiveCharacter(character);
                                        setIsCharacterInfoOpen(true);
                                        setShowPanelDetails(false);
                                      }}
                                      className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-pink-500 hover:text-white transition-colors"
                                    >
                                      {character.imgUrl ? (
                                        <Image
                                          src={character.imgUrl}
                                          alt={character.name}
                                          width={24}
                                          height={24}
                                          className="rounded-full"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                          {character.name.charAt(0)}
                                        </div>
                                      )}
                                      <span>{character.name}</span>
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MangaReaderPage;
