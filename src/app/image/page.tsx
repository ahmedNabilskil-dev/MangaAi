"use client";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Bookmark,
  BookOpen,
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Focus,
  Grid3X3,
  Headphones,
  Heart,
  Layers,
  Maximize,
  Menu,
  Minimize,
  Palette,
  PauseCircle,
  PlayCircle,
  RotateCw,
  Settings,
  Share2,
  Star,
  Volume1,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Types
type ReadingMode =
  | "traditional"
  | "cinematic"
  | "scroll"
  | "immersive"
  | "story"
  | "dynamic";
type Theme = "dark" | "light" | "sepia" | "steampunk" | "neon";

interface Panel {
  id: string;
  order: number;
  imageUrl: string;
  panelContext: {
    action: string;
    cameraAngle: string;
    shotType: string;
    lighting: string;
    effects: string[];
    backgroundDescription: string;
    dramaticPurpose: string;
    narrativePosition: string;
  };
  layout: {
    shape: string;
    size: string;
    position: { x: number; y: number; width: number; height: number };
  };
  transitions: {
    entry: string;
    exit: string;
    duration: number;
  };
  interactiveElements?: {
    type: string;
    position: { x: number; y: number };
    action: string;
    content: string;
  }[];
  soundEffects?: string[];
  dialogues?: Dialogue[];
  parallaxLayers?: {
    depth: number;
    imageUrl: string;
  }[];
  cameraEffects?: {
    shake: { intensity: number; duration: number };
    zoom: { factor: number; duration: number };
  };
}

interface Dialogue {
  id: string;
  content: string;
  style: {
    bubbleType: string;
    fontSize: string;
    position: { x: number; y: number };
    animation: string;
    emphasis?: boolean;
  };
  emotion: string;
  speaker: { name: string; id: string };
  voiceOver?: {
    enabled: boolean;
    voice: string;
    speed: number;
    pitch: number;
  };
}

interface Scene {
  id: string;
  order: number;
  title: string;
  narrative: string;
  sceneContext: {
    setting: string;
    mood: string;
    timeOfDay: string;
    weather: string;
    presentCharacters: string[];
  };
  panels: Panel[];
}

interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  narrative: string;
  mood: string;
  readingTime: string;
  coverImageUrl: string;
  scenes: Scene[];
}

interface Soundscape {
  ambient: string;
  effects: Record<string, string>;
}

interface Manga {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  genre: string;
  targetAudience: string;
  viewCount: number;
  likeCount: number;
  rating: number;
  totalRatings: number;
  createdAt: Date;
  soundscape: Soundscape;
  chapters: Chapter[];
}

interface ThemeStyles {
  bg: string;
  text: string;
  panel: string;
  accent: string;
}

// Mock Data
const mockManga: Manga = {
  id: "1",
  title: "The Clockwork Chronicles",
  description:
    "A steampunk adventure through mechanical realms where time itself bends to the will of ancient gears.",
  coverImageUrl:
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
  genre: "Steampunk Fantasy",
  targetAudience: "teen",
  viewCount: 15420,
  likeCount: 2847,
  rating: 4.8,
  totalRatings: 1240,
  createdAt: new Date(),
  soundscape: {
    ambient: "https://example.com/steampunk-ambient.mp3",
    effects: {
      "gear-turn": "https://example.com/gear.mp3",
      "steam-hiss": "https://example.com/steam.mp3",
    },
  },
  chapters: [
    {
      id: "c1",
      chapterNumber: 1,
      title: "The Brass Discovery",
      narrative:
        "In the depths of Professor Thornfield's workshop, young Eliza discovers a device that will change everything she knows about reality.",
      mood: "mysterious",
      readingTime: "8 min",
      coverImageUrl:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      scenes: [
        {
          id: "s1",
          order: 1,
          title: "The Workshop Discovery",
          narrative: "The workshop holds secrets beyond imagination",
          sceneContext: {
            setting: "Victorian Workshop",
            mood: "mysterious",
            timeOfDay: "twilight",
            weather: "foggy",
            presentCharacters: ["Eliza", "Magnus"],
          },
          panels: [
            {
              id: "p1",
              order: 1,
              imageUrl:
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
              panelContext: {
                action: "Character discovers mysterious device",
                cameraAngle: "close-up",
                shotType: "detail",
                lighting: "dramatic shadows with golden highlights",
                effects: ["dust particles", "lens flare"],
                backgroundDescription:
                  "Victorian workshop filled with brass instruments and clockwork",
                dramaticPurpose: "Introduction of the mysterious device",
                narrativePosition: "opening hook",
              },
              layout: {
                shape: "traditional",
                size: "large",
                position: { x: 0, y: 0, width: 100, height: 60 },
              },
              transitions: {
                entry: "fade-zoom",
                exit: "slide-left",
                duration: 800,
              },
              interactiveElements: [
                {
                  type: "hotspot",
                  position: { x: 60, y: 40 },
                  action: "reveal-detail",
                  content:
                    "This device was crafted in 1847 by the legendary clockmaker Aldous Pendleton",
                },
              ],
              soundEffects: ["gear-turn", "mysterious-hum"],
              dialogues: [
                {
                  id: "d1",
                  content:
                    "What... what is this contraption? The gears seem to pulse with their own heartbeat.",
                  style: {
                    bubbleType: "thought",
                    fontSize: "medium",
                    position: { x: 20, y: 10 },
                    animation: "typewriter",
                  },
                  emotion: "curiosity",
                  speaker: { name: "Eliza", id: "char1" },
                  voiceOver: {
                    enabled: true,
                    voice: "female-young",
                    speed: 1.0,
                    pitch: 1.2,
                  },
                },
              ],
            },
            {
              id: "p2",
              order: 2,
              imageUrl:
                "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
              panelContext: {
                action: "Wide reveal of mechanical garden",
                cameraAngle: "wide",
                shotType: "establishing",
                lighting: "golden hour with magical sparkles",
                effects: ["particle systems", "depth blur"],
                backgroundDescription:
                  "Vast steampunk garden with clockwork trees and mechanical flowers",
                dramaticPurpose: "World building revelation",
                narrativePosition: "plot expansion",
              },
              layout: {
                shape: "cinematic",
                size: "extra-large",
                position: { x: 0, y: 60, width: 100, height: 40 },
              },
              transitions: {
                entry: "panoramic-sweep",
                exit: "zoom-out",
                duration: 1200,
              },
              parallaxLayers: [
                { depth: 0.1, imageUrl: "background-far.jpg" },
                { depth: 0.5, imageUrl: "background-mid.jpg" },
                { depth: 1.0, imageUrl: "background-near.jpg" },
              ],
              dialogues: [
                {
                  id: "d2",
                  content:
                    "Welcome to the Clockwork Garden, young Thornfield. Here, time itself blooms eternal.",
                  style: {
                    bubbleType: "normal",
                    fontSize: "large",
                    position: { x: 70, y: 20 },
                    animation: "fade-in-scale",
                  },
                  emotion: "wise",
                  speaker: { name: "Magnus", id: "char2" },
                  voiceOver: {
                    enabled: true,
                    voice: "male-elderly",
                    speed: 0.9,
                    pitch: 0.8,
                  },
                },
              ],
            },
            {
              id: "p3",
              order: 3,
              imageUrl:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
              panelContext: {
                action: "Character emotional reaction",
                cameraAngle: "close-up",
                shotType: "reaction",
                lighting: "dramatic side lighting",
                effects: ["emotional aura", "speed lines"],
                backgroundDescription: "Blurred garden with bokeh effects",
                dramaticPurpose: "Emotional climax",
                narrativePosition: "scene climax",
              },
              layout: {
                shape: "burst",
                size: "medium",
                position: { x: 25, y: 25, width: 50, height: 50 },
              },
              cameraEffects: {
                shake: { intensity: 0.3, duration: 500 },
                zoom: { factor: 1.2, duration: 300 },
              },
              dialogues: [
                {
                  id: "d3",
                  content:
                    "This... this defies everything I thought I knew about the world!",
                  style: {
                    bubbleType: "scream",
                    fontSize: "x-large",
                    position: { x: 10, y: 80 },
                    animation: "shake-burst",
                  },
                  emotion: "shock",
                  speaker: { name: "Eliza", id: "char1" },
                  voiceOver: {
                    enabled: true,
                    voice: "female-young",
                    speed: 1.3,
                    pitch: 1.5,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const READING_MODES: Record<string, ReadingMode> = {
  TRADITIONAL: "traditional",
  CINEMATIC: "cinematic",
  SCROLL: "scroll",
  IMMERSIVE: "immersive",
  STORY: "story",
  DYNAMIC: "dynamic",
};

const THEMES: Record<string, Theme> = {
  DARK: "dark",
  LIGHT: "light",
  SEPIA: "sepia",
  STEAMPUNK: "steampunk",
  NEON: "neon",
};

const RevolutionaryMangaReader: React.FC = () => {
  // Core State
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [currentPanel, setCurrentPanel] = useState<number>(0);
  const [readingMode, setReadingMode] = useState<ReadingMode>(
    READING_MODES.TRADITIONAL
  );
  const [theme, setTheme] = useState<Theme>(THEMES.DARK);

  // UI State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showUI, setShowUI] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Reading Features
  const [showDialogues, setShowDialogues] = useState<boolean>(true);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState<number>(3000);
  const [readingSpeed, setReadingSpeed] = useState<number>(1.0);

  // Audio Features
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [voiceOverEnabled, setVoiceOverEnabled] = useState<boolean>(false);
  const [ambientSoundEnabled, setAmbientSoundEnabled] =
    useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(0.7);

  // Visual Features
  const [showEffects, setShowEffects] = useState<boolean>(true);
  const [motionEnabled, setMotionEnabled] = useState<boolean>(true);
  const [parallaxEnabled, setParallaxEnabled] = useState<boolean>(true);
  const [immersiveMode, setImmersiveMode] = useState<boolean>(false);

  // Analytics & Social
  const [readingProgress, setReadingProgress] = useState<Record<string, any>>(
    {}
  );
  const [userRating, setUserRating] = useState<number>(0);
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  // Refs
  const readerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { scrollY } = useScroll();

  // Data
  const currentChapterData = mockManga.chapters[currentChapter];
  const allPanels =
    currentChapterData?.scenes?.flatMap((scene) => scene.panels) || [];
  const currentPanelData = allPanels[currentPanel];

  // Theme Styles
  const getThemeStyles = (theme: Theme): ThemeStyles => {
    const themes: Record<Theme, ThemeStyles> = {
      [THEMES.DARK]: {
        bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
        text: "text-white",
        panel: "bg-slate-800/50",
        accent: "from-blue-500 to-purple-500",
      },
      [THEMES.LIGHT]: {
        bg: "bg-gradient-to-br from-gray-100 via-white to-gray-100",
        text: "text-gray-900",
        panel: "bg-white/80",
        accent: "from-blue-600 to-indigo-600",
      },
      [THEMES.SEPIA]: {
        bg: "bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100",
        text: "text-amber-900",
        panel: "bg-amber-50/80",
        accent: "from-amber-600 to-orange-600",
      },
      [THEMES.STEAMPUNK]: {
        bg: "bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900",
        text: "text-amber-100",
        panel: "bg-amber-800/50",
        accent: "from-amber-400 to-yellow-400",
      },
      [THEMES.NEON]: {
        bg: "bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900",
        text: "text-cyan-100",
        panel: "bg-purple-800/50",
        accent: "from-cyan-400 to-pink-400",
      },
    };
    return themes[theme] || themes[THEMES.DARK];
  };

  const currentTheme = getThemeStyles(theme);

  // Auto-play with smart timing
  useEffect(() => {
    if (isAutoPlay && currentPanelData) {
      const dialogueCount = currentPanelData.dialogues?.length || 0;
      const dynamicSpeed = autoPlaySpeed + dialogueCount * 1000 * readingSpeed;

      autoPlayRef.current = setTimeout(() => {
        nextPanel();
      }, dynamicSpeed);
    }

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [isAutoPlay, autoPlaySpeed, readingSpeed, currentPanel]);

  // Keyboard Navigation with advanced shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          nextPanel();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevPanel();
          break;
        case "ArrowUp":
          e.preventDefault();
          prevChapter();
          break;
        case "ArrowDown":
          e.preventDefault();
          nextChapter();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "h":
        case "H":
          setShowUI(!showUI);
          break;
        case "m":
        case "M":
          setIsMenuOpen(!isMenuOpen);
          break;
        case "d":
        case "D":
          setShowDialogues(!showDialogues);
          break;
        case "s":
        case "S":
          setSoundEnabled(!soundEnabled);
          break;
        case "a":
        case "A":
          setIsAutoPlay(!isAutoPlay);
          break;
        case "Escape":
          if (isFullscreen) toggleFullscreen();
          if (isMenuOpen) setIsMenuOpen(false);
          if (showSettings) setShowSettings(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPanel, isFullscreen, showUI, isMenuOpen, showSettings]);

  // Navigation Functions
  const nextPanel = useCallback(() => {
    if (currentPanel < allPanels.length - 1) {
      setCurrentPanel((prev) => prev + 1);
      playTransitionSound();
    } else if (currentChapter < mockManga.chapters.length - 1) {
      setCurrentChapter((prev) => prev + 1);
      setCurrentPanel(0);
      playChapterSound();
    }
  }, [currentPanel, currentChapter, allPanels.length]);

  const prevPanel = useCallback(() => {
    if (currentPanel > 0) {
      setCurrentPanel((prev) => prev - 1);
      playTransitionSound();
    } else if (currentChapter > 0) {
      setCurrentChapter((prev) => prev - 1);
      const prevChapterPanels =
        mockManga.chapters[currentChapter - 1]?.scenes?.flatMap(
          (scene) => scene.panels
        ) || [];
      setCurrentPanel(prevChapterPanels.length - 1);
      playChapterSound();
    }
  }, [currentPanel, currentChapter]);

  const nextChapter = () => {
    if (currentChapter < mockManga.chapters.length - 1) {
      setCurrentChapter((prev) => prev + 1);
      setCurrentPanel(0);
      playChapterSound();
    }
  };

  const prevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter((prev) => prev - 1);
      setCurrentPanel(0);
      playChapterSound();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Audio Functions
  const playTransitionSound = () => {
    if (soundEnabled && mockManga.soundscape.effects["gear-turn"]) {
      // In a real implementation, we would play the sound here
      // For now, we'll just log it
      console.log(
        "Playing transition sound:",
        mockManga.soundscape.effects["gear-turn"]
      );
    }
  };

  const playChapterSound = () => {
    if (soundEnabled && mockManga.soundscape.ambient) {
      // In a real implementation, we would play the ambient sound here
      console.log(
        "Playing chapter ambient sound:",
        mockManga.soundscape.ambient
      );
    }
  };

  const speakDialogue = (dialogue: Dialogue) => {
    if (voiceOverEnabled && dialogue.voiceOver?.enabled) {
      // In a real implementation, we would use the Web Speech API here
      console.log("Speaking dialogue:", dialogue.content);
    }
  };

  // Layout Components
  const TraditionalLayout: React.FC<{ panel: Panel }> = ({ panel }) => (
    <motion.div
      key={`traditional-${panel.id}`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
    >
      <img
        src={panel.imageUrl}
        alt={`Panel ${currentPanel + 1}`}
        className="w-full h-full object-contain"
      />
      {renderDialogues(panel)}
      {renderInteractiveElements(panel)}
    </motion.div>
  );

  const CinematicLayout: React.FC<{ panel: Panel }> = ({ panel }) => (
    <motion.div
      key={`cinematic-${panel.id}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
    >
      {panel.parallaxLayers?.map((layer, index) => (
        <motion.div
          key={index}
          style={{
            transform: useTransform(
              scrollY,
              [0, 1000],
              [0, -layer.depth * 100]
            ),
          }}
          className="absolute inset-0"
        >
          <img
            src={layer.imageUrl}
            alt={`Layer ${index}`}
            className="w-full h-full object-cover"
          />
        </motion.div>
      ))}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <img
          src={panel.imageUrl}
          alt={`Panel ${currentPanel + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      {renderDialogues(panel, true)}
    </motion.div>
  );

  const ImmersiveLayout: React.FC<{ panel: Panel }> = ({ panel }) => (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110"
        style={{ backgroundImage: `url(${panel.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-black/30" />
      <motion.div
        key={`immersive-${panel.id}`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="relative z-10 w-full h-full flex items-center justify-center p-8"
      >
        <div className="relative max-w-6xl w-full">
          <img
            src={panel.imageUrl}
            alt={`Panel ${currentPanel + 1}`}
            className="w-full h-auto rounded-3xl shadow-2xl"
          />
          {renderDialogues(panel, true)}
        </div>
      </motion.div>
    </div>
  );

  const StoryLayout: React.FC<{ chapter: Chapter }> = ({ chapter }) => (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Chapter {chapter.chapterNumber}: {chapter.title}
        </h1>
        <p className="text-xl text-gray-400 leading-relaxed">
          {chapter.narrative}
        </p>
      </div>

      {chapter.scenes?.map((scene, sceneIndex) => (
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sceneIndex * 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-center">{scene.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scene.panels?.map((panel, panelIndex) => (
              <motion.div
                key={panel.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: panelIndex * 0.1 }}
                className="relative group cursor-pointer"
                onClick={() => {
                  const panelIndex = allPanels.findIndex(
                    (p) => p.id === panel.id
                  );
                  if (panelIndex !== -1) {
                    setCurrentPanel(panelIndex);
                    setReadingMode(READING_MODES.TRADITIONAL);
                  }
                }}
              >
                <img
                  src={panel.imageUrl}
                  alt={`Panel ${panelIndex + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {panel.dialogues?.map((dialogue) => (
                    <p key={dialogue.id} className="text-sm truncate">
                      {dialogue.speaker?.name}: {dialogue.content}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderDialogues = (panel: Panel, cinematic: boolean = false) => {
    if (!showDialogues || !panel.dialogues) return null;

    return (
      <AnimatePresence>
        {panel.dialogues.map((dialogue, index) => (
          <motion.div
            key={dialogue.id}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: index * 0.3 }}
            className={getBubbleStyle(dialogue.style, cinematic)}
            style={{
              top: dialogue.style?.position?.y
                ? `${dialogue.style.position.y}%`
                : `${20 + index * 15}%`,
              left: dialogue.style?.position?.x
                ? `${dialogue.style.position.x}%`
                : `${10 + index * 10}%`,
            }}
            onClick={() => speakDialogue(dialogue)}
          >
            <div className="text-gray-800 font-medium">
              {dialogue.speaker && (
                <div className="text-xs text-gray-600 mb-1 font-bold">
                  {dialogue.speaker.name}
                  {dialogue.emotion && (
                    <span className="ml-2 text-blue-600">
                      ({dialogue.emotion})
                    </span>
                  )}
                </div>
              )}
              <div
                className={`${
                  dialogue.style?.fontSize === "x-large" ? "text-lg" : "text-sm"
                } ${dialogue.style?.emphasis ? "font-bold" : ""}`}
              >
                {dialogue.content}
              </div>
            </div>

            {/* Enhanced bubble tail with different styles */}
            <div
              className={`absolute -bottom-2 left-4 w-0 h-0 ${getBubbleTail(
                dialogue.style?.bubbleType
              )}`}
            />

            {/* Voice indicator */}
            {voiceOverEnabled && dialogue.voiceOver?.enabled && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  const renderInteractiveElements = (panel: Panel) => {
    if (!panel.interactiveElements) return null;

    return panel.interactiveElements.map((element, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute w-6 h-6 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-400 transition-colors animate-pulse"
        style={{
          top: `${element.position.y}%`,
          left: `${element.position.x}%`,
        }}
        title={element.content}
      />
    ));
  };

  const getBubbleStyle = (
    style: Dialogue["style"] | undefined,
    cinematic: boolean = false
  ): string => {
    const baseStyle = cinematic
      ? "absolute bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border-2 max-w-sm"
      : "absolute bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg border-2 max-w-xs";

    switch (style?.bubbleType) {
      case "thought":
        return `${baseStyle} border-dashed border-purple-300 bg-purple-50/95`;
      case "scream":
        return `${baseStyle} border-red-400 bg-red-50/95 font-bold transform rotate-1`;
      case "whisper":
        return `${baseStyle} border-gray-300 bg-gray-50/95 text-sm opacity-80`;
      case "narration":
        return `${baseStyle} border-amber-400 bg-amber-50/95 italic rounded-none`;
      default:
        return `${baseStyle} border-blue-300 bg-blue-50/95`;
    }
  };

  const getBubbleTail = (bubbleType?: string): string => {
    switch (bubbleType) {
      case "thought":
        return "border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-50";
      case "scream":
        return "border-l-4 border-r-4 border-t-4 border-transparent border-t-red-50";
      case "whisper":
        return "border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-50";
      case "narration":
        return "";
      default:
        return "border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-50";
    }
  };

  const renderCurrentLayout = () => {
    if (readingMode === READING_MODES.STORY) {
      return <StoryLayout chapter={currentChapterData} />;
    }

    if (!currentPanelData) return null;

    switch (readingMode) {
      case READING_MODES.TRADITIONAL:
        return <TraditionalLayout panel={currentPanelData} />;
      case READING_MODES.CINEMATIC:
        return <CinematicLayout panel={currentPanelData} />;
      case READING_MODES.IMMERSIVE:
        return <ImmersiveLayout panel={currentPanelData} />;
      default:
        return <TraditionalLayout panel={currentPanelData} />;
    }
  };

  return (
    <div
      ref={readerRef}
      className={`manga-reader ${currentTheme.bg} ${
        currentTheme.text
      } transition-all duration-500 ${
        isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"
      }`}
    >
      {/* Revolutionary Header */}
      <AnimatePresence>
        {showUI && (
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Menu size={20} />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {mockManga.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>
                        Ch. {currentChapterData?.chapterNumber}:{" "}
                        {currentChapterData?.title}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{mockManga.rating}</span>
                      </div>
                      <span>•</span>
                      <span>{currentChapterData?.readingTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Reading Mode Switcher */}
                  <div className="hidden md:flex items-center space-x-1 bg-white/10 rounded-lg p-1">
                    {Object.entries(READING_MODES).map(([key, mode]) => (
                      <button
                        key={mode}
                        onClick={() => setReadingMode(mode)}
                        className={`p-2 rounded transition-colors ${
                          readingMode === mode
                            ? "bg-blue-600"
                            : "hover:bg-white/10"
                        }`}
                        title={key}
                      >
                        {mode === READING_MODES.TRADITIONAL && (
                          <Grid3X3 size={16} />
                        )}
                        {mode === READING_MODES.CINEMATIC && (
                          <Camera size={16} />
                        )}
                        {mode === READING_MODES.IMMERSIVE && (
                          <Focus size={16} />
                        )}
                        {mode === READING_MODES.STORY && <BookOpen size={16} />}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${
                      bookmarked ? "text-red-400" : "text-gray-400"
                    }`}
                  >
                    <Bookmark
                      size={20}
                      fill={bookmarked ? "currentColor" : "none"}
                    />
                  </button>

                  <button
                    onClick={() => setShowDialogues(!showDialogues)}
                    className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${
                      showDialogues ? "text-blue-400" : "text-gray-400"
                    }`}
                  >
                    {showDialogues ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>

                  <button
                    onClick={() => setVoiceOverEnabled(!voiceOverEnabled)}
                    className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${
                      voiceOverEnabled ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    {voiceOverEnabled ? (
                      <Headphones size={20} />
                    ) : (
                      <Volume2 size={20} />
                    )}
                  </button>

                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Settings size={20} />
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isFullscreen ? (
                      <Minimize size={20} />
                    ) : (
                      <Maximize size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Revolutionary Side Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              className="w-96 h-full bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Library</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Enhanced Manga Info */}
                <div className="mb-8">
                  <div className="relative mb-4">
                    <img
                      src={mockManga.coverImageUrl}
                      alt={mockManga.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {mockManga.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                        <div className="flex items-center space-x-1">
                          <Eye size={14} />
                          <span>{mockManga.viewCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart size={14} />
                          <span>{mockManga.likeCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star
                            size={14}
                            className="text-yellow-400 fill-current"
                          />
                          <span>{mockManga.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {mockManga.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                      {mockManga.genre}
                    </span>
                    <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs">
                      {mockManga.targetAudience}
                    </span>
                  </div>

                  {/* Social Actions */}
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Heart size={16} />
                      <span>Like</span>
                    </button>
                    <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Share2 size={16} />
                      <span>Share</span>
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                {/* Enhanced Chapter List */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Chapters</h4>
                    <span className="text-sm text-gray-400">
                      {mockManga.chapters.length} chapters
                    </span>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                    {mockManga.chapters.map((chapter, index) => (
                      <motion.button
                        key={chapter.id}
                        onClick={() => {
                          setCurrentChapter(index);
                          setCurrentPanel(0);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                          currentChapter === index
                            ? "bg-blue-600/50 border border-blue-400 transform scale-105"
                            : "hover:bg-white/5 border border-transparent hover:border-white/10"
                        }`}
                        whileHover={{
                          scale: currentChapter === index ? 1.05 : 1.02,
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={chapter.coverImageUrl}
                            alt={chapter.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium">
                              Chapter {chapter.chapterNumber}
                            </div>
                            <div className="text-sm text-gray-400 mb-1">
                              {chapter.title}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{chapter.readingTime}</span>
                              <span>•</span>
                              <span
                                className={`px-2 py-1 rounded ${
                                  chapter.mood === "mysterious"
                                    ? "bg-purple-600/20 text-purple-300"
                                    : chapter.mood === "action"
                                    ? "bg-red-600/20 text-red-300"
                                    : "bg-blue-600/20 text-blue-300"
                                }`}
                              >
                                {chapter.mood}
                              </span>
                            </div>
                          </div>
                          {currentChapter === index && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Reading Progress */}
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-semibold mb-3">
                    Reading Progress
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>
                        {Math.round(
                          ((currentChapter + 1) / mockManga.chapters.length) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            ((currentChapter + 1) / mockManga.chapters.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>
                        Chapter {currentChapter + 1} of{" "}
                        {mockManga.chapters.length}
                      </span>
                      <span>
                        Panel {currentPanel + 1} of {allPanels.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Settings */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Quick Settings</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      className={`p-3 rounded-lg border transition-all ${
                        isAutoPlay
                          ? "bg-blue-600/20 border-blue-400 text-blue-300"
                          : "bg-white/5 border-gray-600 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {isAutoPlay ? (
                          <PauseCircle size={20} />
                        ) : (
                          <PlayCircle size={20} />
                        )}
                        <span className="text-sm">Auto Play</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setImmersiveMode(!immersiveMode)}
                      className={`p-3 rounded-lg border transition-all ${
                        immersiveMode
                          ? "bg-purple-600/20 border-purple-400 text-purple-300"
                          : "bg-white/5 border-gray-600 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Focus size={20} />
                        <span className="text-sm">Immersive</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Advanced Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Theme Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Palette size={20} />
                    <span>Theme</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(THEMES).map(([key, themeValue]) => (
                      <button
                        key={themeValue}
                        onClick={() => setTheme(themeValue)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          themeValue === THEMES.DARK
                            ? "bg-slate-900 border-slate-700"
                            : themeValue === THEMES.LIGHT
                            ? "bg-gray-100 border-gray-300"
                            : themeValue === THEMES.SEPIA
                            ? "bg-amber-100 border-amber-300"
                            : themeValue === THEMES.STEAMPUNK
                            ? "bg-amber-900 border-amber-700"
                            : "bg-purple-900 border-purple-700"
                        } ${
                          theme === themeValue ? "ring-2 ring-blue-400" : ""
                        }`}
                      >
                        <div className="text-sm font-medium capitalize">
                          {key.toLowerCase()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reading Preferences */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Reading Preferences
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center justify-between">
                        <span>Auto Play Speed</span>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={autoPlaySpeed / 1000}
                            onChange={(e) =>
                              setAutoPlaySpeed(Number(e.target.value) * 1000)
                            }
                            className="w-32"
                          />
                          <span className="text-sm w-16">
                            {autoPlaySpeed / 1000}s
                          </span>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center justify-between">
                        <span>Reading Speed Multiplier</span>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={readingSpeed}
                            onChange={(e) =>
                              setReadingSpeed(Number(e.target.value))
                            }
                            className="w-32"
                          />
                          <span className="text-sm w-16">{readingSpeed}x</span>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center justify-between">
                        <span>Audio Volume</span>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={audioVolume}
                            onChange={(e) =>
                              setAudioVolume(Number(e.target.value))
                            }
                            className="w-32"
                          />
                          <span className="text-sm w-16">
                            {Math.round(audioVolume * 100)}%
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Visual Effects */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Visual Effects</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "showEffects", label: "Panel Effects", icon: Zap },
                      {
                        key: "motionEnabled",
                        label: "Motion Blur",
                        icon: RotateCw,
                      },
                      {
                        key: "parallaxEnabled",
                        label: "Parallax Scrolling",
                        icon: Layers,
                      },
                      {
                        key: "ambientSoundEnabled",
                        label: "Ambient Audio",
                        icon: Volume1,
                      },
                    ].map(({ key, label, icon: Icon }) => (
                      <label
                        key={key}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <Icon size={20} className="text-blue-400" />
                        <span className="flex-1">{label}</span>
                        <button
                          onClick={() => {
                            if (key === "showEffects")
                              setShowEffects(!showEffects);
                            if (key === "motionEnabled")
                              setMotionEnabled(!motionEnabled);
                            if (key === "parallaxEnabled")
                              setParallaxEnabled(!parallaxEnabled);
                            if (key === "ambientSoundEnabled")
                              setAmbientSoundEnabled(!ambientSoundEnabled);
                          }}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            (key === "showEffects" && showEffects) ||
                            (key === "motionEnabled" && motionEnabled) ||
                            (key === "parallaxEnabled" && parallaxEnabled) ||
                            (key === "ambientSoundEnabled" &&
                              ambientSoundEnabled)
                              ? "bg-blue-600"
                              : "bg-gray-600"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              (key === "showEffects" && showEffects) ||
                              (key === "motionEnabled" && motionEnabled) ||
                              (key === "parallaxEnabled" && parallaxEnabled) ||
                              (key === "ambientSoundEnabled" &&
                                ambientSoundEnabled)
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Keyboard Shortcuts
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { key: "← →", action: "Navigate panels" },
                      { key: "↑ ↓", action: "Navigate chapters" },
                      { key: "F", action: "Toggle fullscreen" },
                      { key: "H", action: "Toggle UI" },
                      { key: "M", action: "Open menu" },
                      { key: "D", action: "Toggle dialogues" },
                      { key: "S", action: "Toggle sound" },
                      { key: "A", action: "Toggle auto-play" },
                    ].map(({ key, action }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2 bg-white/5 rounded"
                      >
                        <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs">
                          {key}
                        </span>
                        <span className="text-gray-400">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Reader Area with Revolutionary Layouts */}
      <main
        className={`flex-1 transition-all duration-300 ${
          showUI ? "pt-20 pb-24" : "pt-4 pb-4"
        } ${immersiveMode ? "bg-black" : ""}`}
        onClick={() => setShowUI(!showUI)}
      >
        <AnimatePresence mode="wait">{renderCurrentLayout()}</AnimatePresence>
      </main>

      {/* Enhanced Navigation Controls */}
      <AnimatePresence>
        {showUI && readingMode !== READING_MODES.STORY && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-4">
              {/* Enhanced Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <div className="flex items-center space-x-4">
                    <span>
                      Panel {currentPanel + 1} of {allPanels.length}
                    </span>
                    <span>
                      Chapter {currentChapter + 1}/{mockManga.chapters.length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>
                      {Math.round(
                        ((currentPanel + 1) / allPanels.length) * 100
                      )}
                      %
                    </span>
                    {isAutoPlay && (
                      <div className="flex items-center space-x-1 text-blue-400">
                        <PlayCircle size={16} />
                        <span>Auto</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full"
                    style={{
                      width: `${
                        ((currentPanel + 1) / allPanels.length) * 100
                      }%`,
                    }}
                    animate={{
                      width: `${
                        ((currentPanel + 1) / allPanels.length) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  {/* Chapter markers */}
                  {mockManga.chapters.map((_, index) => (
                    <div
                      key={index}
                      className="absolute top-0 bottom-0 w-0.5 bg-white/30"
                      style={{
                        left: `${(index / mockManga.chapters.length) * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Enhanced Navigation Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={prevChapter}
                    disabled={currentChapter === 0}
                    className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all hover:scale-105"
                    title="Previous Chapter"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={prevPanel}
                    disabled={currentChapter === 0 && currentPanel === 0}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all hover:scale-105 shadow-lg"
                  >
                    <ChevronLeft size={24} />
                  </button>
                </div>

                {/* Center Info */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400">Chapter</div>
                    <div className="font-semibold">
                      {currentChapterData?.chapterNumber}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gray-600" />
                  <div className="text-center">
                    <div className="text-gray-400">Panel</div>
                    <div className="font-semibold">
                      {currentPanel + 1}/{allPanels.length}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gray-600" />
                  <div className="text-center">
                    <div className="text-gray-400">Time Left</div>
                    <div className="font-semibold">
                      {Math.max(
                        0,
                        Math.ceil(
                          ((allPanels.length - currentPanel - 1) *
                            autoPlaySpeed) /
                            60000
                        )
                      )}
                      m
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={nextPanel}
                    disabled={
                      currentChapter === mockManga.chapters.length - 1 &&
                      currentPanel === allPanels.length - 1
                    }
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all hover:scale-105 shadow-lg"
                  >
                    <ChevronRight size={24} />
                  </button>

                  <button
                    onClick={nextChapter}
                    disabled={currentChapter === mockManga.chapters.length - 1}
                    className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all hover:scale-105"
                    title="Next Chapter"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30 space-y-3">
        <AnimatePresence>
          {isAutoPlay && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsAutoPlay(false)}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
            >
              <PauseCircle size={24} />
            </motion.button>
          )}

          {voiceOverEnabled && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-12 h-12 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center"
            >
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.8);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 1);
        }
      `}</style>
    </div>
  );
};

export default RevolutionaryMangaReader;
