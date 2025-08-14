"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getChapters,
  getProject,
  getScenes,
  listCharacters,
} from "@/services/data-service";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Image,
  MapPin,
  Palette,
  Settings,
  Shirt,
  Users,
  Wand2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ManualPanelGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

function ManualPanelGenerator({
  isOpen,
  onClose,
  projectId,
}: ManualPanelGeneratorProps) {
  const [step, setStep] = useState(1);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedScene, setSelectedScene] = useState("");
  const [panelOrder, setPanelOrder] = useState(1);
  const [maxPanelOrder, setMaxPanelOrder] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);

  // Panel settings with enhanced visual structure
  const [panelSettings, setPanelSettings] = useState({
    description: "",
    artStyle: "modern, clean anime style",
    lighting: "soft, diffused lighting",
    cameraAngle: "medium shot",
    location: "",
    characters: [] as {
      id: string;
      name: string;
      pose: string;
      expression: string;
      outfit: string;
      customPose?: string;
      customExpression?: string;
      customOutfit?: string;
    }[],
    dialogue: "",
    qualityKeywords: [] as string[],
    customArtStyle: "",
    customLighting: "",
    customCameraAngle: "",
    customLocation: "",
  });

  // Enhanced predefined options with visual appeal
  const predefinedOptions = {
    artStyles: [
      {
        label: "Modern Anime",
        value: "modern, clean anime style",
        image:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        description: "Clean, contemporary anime aesthetic",
      },
      {
        label: "Pastel Anime",
        value: "soft, pastel anime illustration",
        image:
          "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop",
        description: "Soft, dreamy pastel colors",
      },
      {
        label: "Dynamic Shonen",
        value: "dynamic shonen anime style",
        image:
          "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
        description: "Action-packed, energetic style",
      },
      {
        label: "Detailed Fantasy",
        value: "detailed fantasy anime",
        image:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        description: "Intricate fantasy elements",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own art style",
      },
    ],
    locations: [
      {
        label: "School Classroom",
        value: "bright school classroom with desks and blackboard",
        image:
          "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop",
        description: "Traditional learning environment",
      },
      {
        label: "Library",
        value: "quiet library with tall bookshelves",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        description: "Peaceful study space",
      },
      {
        label: "Shopping District",
        value: "busy shopping district with neon signs",
        image:
          "https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=400&h=300&fit=crop",
        description: "Vibrant commercial area",
      },
      {
        label: "Beach Sunset",
        value: "peaceful beach at sunset",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
        description: "Romantic coastal scene",
      },
      {
        label: "Mountain Path",
        value: "winding mountain hiking trail",
        image:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
        description: "Adventure outdoor setting",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own location",
      },
    ],
    lighting: [
      {
        label: "Soft Diffused",
        value: "soft, diffused lighting",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        description: "Gentle, even illumination",
      },
      {
        label: "Golden Hour",
        value: "evening golden hour",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        description: "Warm sunset glow",
      },
      {
        label: "Dramatic Backlighting",
        value: "dramatic backlighting",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        description: "Striking silhouette effect",
      },
      {
        label: "Bright Sunlight",
        value: "bright, natural sunlight",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        description: "Vibrant natural light",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own lighting",
      },
    ],
    cameraAngles: [
      {
        label: "Medium Shot",
        value: "medium shot",
        image:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
        description: "Balanced character framing",
      },
      {
        label: "Close-up Portrait",
        value: "close-up portrait",
        image:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
        description: "Intimate facial focus",
      },
      {
        label: "Full Body Shot",
        value: "full body shot",
        image:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
        description: "Complete character view",
      },
      {
        label: "Bird's Eye View",
        value: "bird's eye view from above",
        image:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
        description: "Top-down perspective",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own camera angle",
      },
    ],
    poses: [
      {
        label: "Confident Stance",
        value: "confident standing pose",
        image:
          "https://images.unsplash.com/photo-1494790108755-2616c2e7e9ae?w=400&h=300&fit=crop",
        description: "Strong, assertive posture",
      },
      {
        label: "Graceful Sitting",
        value: "sitting gracefully",
        image:
          "https://images.unsplash.com/photo-1494790108755-2616c2e7e9ae?w=400&h=300&fit=crop",
        description: "Elegant seated position",
      },
      {
        label: "Dynamic Action",
        value: "dynamic action pose",
        image:
          "https://images.unsplash.com/photo-1494790108755-2616c2e7e9ae?w=400&h=300&fit=crop",
        description: "Energetic movement",
      },
      {
        label: "Shy & Bashful",
        value: "shy, bashful posture",
        image:
          "https://images.unsplash.com/photo-1494790108755-2616c2e7e9ae?w=400&h=300&fit=crop",
        description: "Timid, endearing stance",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own pose",
      },
    ],
    expressions: [
      {
        label: "Serene Smile",
        value: "soft, serene smile",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        description: "Peaceful, gentle expression",
      },
      {
        label: "Determined Gaze",
        value: "determined, focused gaze",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        description: "Strong, resolute look",
      },
      {
        label: "Playful Wink",
        value: "playful wink",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        description: "Mischievous, fun expression",
      },
      {
        label: "Surprised Wonder",
        value: "wide-eyed surprise",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        description: "Amazed, curious look",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own expression",
      },
    ],
    outfits: [
      {
        label: "School Uniform",
        value: "crisp school uniform",
        image:
          "https://images.unsplash.com/photo-1594736797933-d0f1bb155a63?w=400&h=300&fit=crop",
        description: "Classic student attire",
      },
      {
        label: "Casual Wear",
        value: "casual modern clothing",
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop",
        description: "Everyday comfortable outfit",
      },
      {
        label: "Formal Dress",
        value: "elegant formal dress",
        image:
          "https://images.unsplash.com/photo-1594736797933-d0f1bb155a63?w=400&h=300&fit=crop",
        description: "Sophisticated formal wear",
      },
      {
        label: "Traditional Kimono",
        value: "traditional Japanese kimono",
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop",
        description: "Beautiful traditional garment",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own outfit",
      },
    ],
    qualityKeywords: [
      "high-resolution",
      "8k",
      "detailed",
      "intricate details",
      "masterpiece",
      "best quality",
      "cinematic lighting",
      "photorealistic",
      "ultra-detailed",
      "studio quality",
      "professional artwork",
      "vibrant colors",
      "sharp focus",
    ],
  };

  // Load actual project data
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        // Load project, chapters, and characters separately since there's no single function
        const [project, chapters, characters] = await Promise.all([
          getProject(projectId),
          getChapters(projectId),
          listCharacters(projectId),
        ]);

        // Load scenes for each chapter
        const chaptersWithScenes = await Promise.all(
          (chapters || []).map(async (chapter: any) => {
            const scenes = await getScenes(chapter.id);
            return { ...chapter, scenes: scenes || [] };
          })
        );

        // Create a combined structure with the data we have
        const projectWithRelations = {
          ...project,
          chapters: chaptersWithScenes,
          characters: characters || [],
        };

        setProjectData(projectWithRelations);
      } catch (error) {
        console.error("Failed to load project data:", error);
      }
    };

    if (projectId && isOpen) {
      loadProjectData();
    }
  }, [projectId, isOpen]);

  // Update max panel order when scene changes
  useEffect(() => {
    if (selectedChapter && selectedScene && projectData) {
      const chapter = projectData.chapters?.find(
        (c: any) => c.id === selectedChapter
      );
      const scene = chapter?.scenes?.find((s: any) => s.id === selectedScene);
      if (scene) {
        const newMaxOrder = (scene.panels?.length || 0) + 1;
        setMaxPanelOrder(newMaxOrder);
        setPanelOrder(newMaxOrder); // Default to adding at the end
      }
    }
  }, [selectedChapter, selectedScene, projectData]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCharacterToggle = (characterId: string) => {
    const character = projectData?.characters?.find(
      (c: any) => c.id === characterId
    );
    if (!character) return;

    const isSelected = panelSettings.characters.some(
      (c) => c.id === characterId
    );

    if (isSelected) {
      // Remove character
      setPanelSettings((prev) => ({
        ...prev,
        characters: prev.characters.filter((c) => c.id !== characterId),
      }));
    } else {
      // Add character with default settings
      setPanelSettings((prev) => ({
        ...prev,
        characters: [
          ...prev.characters,
          {
            id: characterId,
            name: character.name,
            pose: "confident standing pose",
            expression: "soft, serene smile",
            outfit: character.defaultOutfitId || "crisp school uniform",
          },
        ],
      }));
    }
  };

  const updateCharacterSetting = (
    characterId: string,
    field: string,
    value: string
  ) => {
    setPanelSettings((prev) => ({
      ...prev,
      characters: prev.characters.map((char) =>
        char.id === characterId ? { ...char, [field]: value } : char
      ),
    }));
  };

  const handleQualityKeywordToggle = (keyword: string) => {
    setPanelSettings((prev) => ({
      ...prev,
      qualityKeywords: prev.qualityKeywords.includes(keyword)
        ? prev.qualityKeywords.filter((k) => k !== keyword)
        : [...prev.qualityKeywords, keyword],
    }));
  };

  const generatePanel = async () => {
    setIsGenerating(true);
    try {
      // Structure data according to Panel interface
      const panelData = {
        order: panelOrder,
        panelContext: {
          action: panelSettings.description,
          characterPoses: panelSettings.characters.map((char) => ({
            characterName: char.name,
            characterId: char.id,
            pose: char.customPose || char.pose,
            expression: char.customExpression || char.expression,
            outfitId: char.customOutfit || char.outfit, // This should be the actual outfit ID
          })),
          cameraAngle:
            panelSettings.customCameraAngle || panelSettings.cameraAngle,
          locationId: panelSettings.customLocation || panelSettings.location, // This should be the actual location ID
          lighting: panelSettings.customLighting || panelSettings.lighting,
          effects: [], // Could be derived from qualityKeywords or other settings
        },
        sceneId: selectedScene,
        isAiGenerated: true,
        // Other fields would be set by the actual creation function
      };

      // Actual panel generation logic here
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Generating panel with structure:", panelData);
      onClose();
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetDialog = () => {
    setStep(1);
    setSelectedChapter("");
    setSelectedScene("");
    setPanelOrder(1);
    setPanelSettings({
      description: "",
      artStyle: "modern, clean anime style",
      lighting: "soft, diffused lighting",
      cameraAngle: "medium shot",
      location: "",
      characters: [],
      dialogue: "",
      qualityKeywords: [],
      customArtStyle: "",
      customLighting: "",
      customCameraAngle: "",
      customLocation: "",
    });
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const currentScenes =
    selectedChapter && projectData
      ? projectData.chapters?.find((c: any) => c.id === selectedChapter)
          ?.scenes || []
      : [];

  const canProceed = {
    step1: selectedChapter && selectedScene,
    step2: panelOrder > 0,
    step3: panelSettings.description.trim().length > 0,
  };

  // Character configuration panel component
  const CharacterConfigPanel = ({
    character,
    onUpdate,
    predefinedOptions,
  }: any) => {
    return (
      <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
        <h5 className="font-medium text-white mb-3">{character.name}</h5>
        <div className="space-y-3">
          <VisualSelector
            title="Pose"
            options={predefinedOptions.poses}
            selectedValue={character.pose}
            onSelect={(value: string) => onUpdate(character.id, "pose", value)}
            customValue={character.customPose}
            onCustomChange={(value: string) =>
              onUpdate(character.id, "customPose", value)
            }
            icon={<Users className="w-4 h-4" />}
          />
          <VisualSelector
            title="Expression"
            options={predefinedOptions.expressions}
            selectedValue={character.expression}
            onSelect={(value: string) =>
              onUpdate(character.id, "expression", value)
            }
            customValue={character.customExpression}
            onCustomChange={(value: string) =>
              onUpdate(character.id, "customExpression", value)
            }
            icon={<Eye className="w-4 h-4" />}
          />
          <VisualSelector
            title="Outfit"
            options={predefinedOptions.outfits}
            selectedValue={character.outfit}
            onSelect={(value: string) =>
              onUpdate(character.id, "outfit", value)
            }
            customValue={character.customOutfit}
            onCustomChange={(value: string) =>
              onUpdate(character.id, "customOutfit", value)
            }
            icon={<Shirt className="w-4 h-4" />}
          />
        </div>
      </div>
    );
  };

  // Visual selector component for enhanced UI
  const VisualSelector = ({
    title,
    options,
    selectedValue,
    onSelect,
    customValue,
    onCustomChange,
    icon,
  }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCustom, setShowCustom] = useState(selectedValue === "custom");

    return (
      <div className="space-y-3">
        <button
          className="flex items-center justify-between w-full p-4 bg-gray-800 rounded-xl shadow-sm border border-gray-600 hover:border-purple-400 transition-all hover:shadow-md"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-800 to-blue-800 text-purple-400">
              {icon}
            </div>
            <span className="font-medium text-white">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {selectedValue && selectedValue !== "custom" && (
              <Badge
                variant="secondary"
                className="text-xs bg-gray-700 text-gray-300"
              >
                {options.find((o: any) => o.value === selectedValue)?.label}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in slide-in-from-top-2 duration-200">
            {options.map((option: any) => (
              <div
                key={option.value}
                className={`relative group cursor-pointer transition-all duration-200 ${
                  selectedValue === option.value
                    ? "ring-2 ring-purple-400 ring-offset-2 ring-offset-gray-900 rounded-xl"
                    : "hover:ring-1 hover:ring-purple-400 ring-offset-gray-900 rounded-xl"
                }`}
                onClick={() => {
                  onSelect(option.value);
                  if (option.value === "custom") {
                    setShowCustom(true);
                  } else {
                    setShowCustom(false);
                  }
                }}
              >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 aspect-square">
                  {option.image ? (
                    <img
                      src={option.image}
                      alt={option.label}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
                      <Wand2 className="w-6 h-6 text-purple-400" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {selectedValue === option.value && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-semibold text-white text-sm mb-1">
                      {option.label}
                    </h3>
                    <p className="text-xs text-white/90 line-clamp-2">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCustom && onCustomChange && (
          <div className="mt-3 p-4 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-600">
            <Textarea
              className="w-full bg-gray-700 border-purple-400 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
              placeholder={`Describe your custom ${title.toLowerCase()}...`}
              value={customValue || ""}
              onChange={(e) => onCustomChange(e.target.value)}
              rows={2}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col bg-gray-900 dark:bg-gray-900 border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-6 flex-shrink-0">
          <DialogTitle className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Generate Panel Manually
              </span>
              <DialogDescription className="mt-1 text-gray-400">
                Step {step} of 3:{" "}
                {step === 1
                  ? "Select Location"
                  : step === 2
                  ? "Set Panel Order"
                  : "Configure Panel Details"}
              </DialogDescription>
            </div>
          </DialogTitle>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    i <= step
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 rounded-full transition-all ${
                      i < step ? "bg-purple-600" : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Step 1: Chapter and Scene Selection */}
          {step === 1 && (
            <div className="p-6 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Choose Chapter and Scene
                </h2>
                <p className="text-gray-400">
                  Select where you want to add your new panel
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-2 border-dashed border-gray-600 hover:border-purple-500 transition-all bg-gray-800">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Chapter
                    </Label>
                    <Select
                      value={selectedChapter}
                      onValueChange={setSelectedChapter}
                    >
                      <SelectTrigger className="w-full h-12 border-2 border-gray-600 bg-gray-700 text-white">
                        <SelectValue placeholder="Select a chapter" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {projectData?.chapters?.map((chapter: any) => (
                          <SelectItem
                            key={chapter.id}
                            value={chapter.id}
                            className="text-white hover:bg-gray-700"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">
                                {chapter.title}
                              </span>
                              <Badge
                                variant="secondary"
                                className="ml-2 bg-gray-600 text-gray-200"
                              >
                                {chapter.scenes?.length || 0} scenes
                              </Badge>
                            </div>
                          </SelectItem>
                        )) || (
                          <SelectItem
                            value="no-chapters"
                            disabled
                            className="text-gray-400"
                          >
                            No chapters available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-600 hover:border-purple-500 transition-all bg-gray-800">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <Image className="w-5 h-5 text-purple-400" />
                      Scene
                    </Label>
                    <Select
                      value={selectedScene}
                      onValueChange={setSelectedScene}
                      disabled={!selectedChapter}
                    >
                      <SelectTrigger className="w-full h-12 border-2 border-gray-600 bg-gray-700 text-white">
                        <SelectValue placeholder="Select a scene" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {currentScenes.map((scene: any) => (
                          <SelectItem
                            key={scene.id}
                            value={scene.id}
                            className="text-white hover:bg-gray-700"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{scene.title}</span>
                              <Badge
                                variant="outline"
                                className="ml-2 border-gray-500 text-gray-300"
                              >
                                {scene.panels?.length || 0} panels
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                        {currentScenes.length === 0 && selectedChapter && (
                          <SelectItem
                            value="no-scenes"
                            disabled
                            className="text-gray-400"
                          >
                            No scenes available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>

              {selectedChapter && selectedScene && (
                <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-600 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 text-blue-300 mb-2">
                      <FileText className="w-5 h-5" />
                      <span className="font-semibold text-lg">
                        Selected Location
                      </span>
                    </div>
                    <p className="text-blue-200 text-lg">
                      {
                        projectData?.chapters?.find(
                          (c: any) => c.id === selectedChapter
                        )?.title
                      }{" "}
                      →{" "}
                      {
                        currentScenes.find((s: any) => s.id === selectedScene)
                          ?.title
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Panel Order */}
          {step === 2 && (
            <div className="p-6 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Set Panel Order
                </h2>
                <p className="text-gray-400">
                  Choose where to insert the new panel in the scene
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <Card className="border-2 border-dashed border-gray-600 bg-gray-800">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <Settings className="w-5 h-5 text-purple-400" />
                      Panel Position
                    </Label>
                    <Select
                      value={panelOrder.toString()}
                      onValueChange={(value) => setPanelOrder(parseInt(value))}
                    >
                      <SelectTrigger className="w-full h-12 border-2 border-gray-600 bg-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {Array.from(
                          { length: maxPanelOrder },
                          (_, i) => i + 1
                        ).map((order) => (
                          <SelectItem
                            key={order}
                            value={order.toString()}
                            className="text-white hover:bg-gray-700"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">
                                Position {order}
                              </span>
                              {order === maxPanelOrder && (
                                <Badge className="ml-2 bg-green-800 text-green-300">
                                  New
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-3">
                      Current scene has {maxPanelOrder - 1} panels. Adding at
                      position {panelOrder}.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-600 shadow-lg max-w-md mx-auto">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-green-300 mb-2">
                    <Settings className="w-5 h-5" />
                    <span className="font-semibold text-lg">
                      Panel Order Confirmed
                    </span>
                  </div>
                  <p className="text-green-400 text-lg">
                    Panel will be inserted at position {panelOrder} of{" "}
                    {maxPanelOrder}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Enhanced Panel Configuration */}
          {step === 3 && (
            <div className="p-6 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Configure Panel Details
                </h2>
                <p className="text-gray-400">
                  Set up the visual and narrative elements
                </p>
              </div>

              <div className="space-y-8">
                {/* Description */}
                <Card className="border-2 border-dashed border-gray-600 bg-gray-800 hover:border-purple-400 transition-all">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Panel Description *
                    </Label>
                    <Textarea
                      placeholder="Describe what happens in this panel in detail..."
                      value={panelSettings.description}
                      onChange={(e) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="min-h-[120px] border-2 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500"
                    />
                  </CardContent>
                </Card>

                {/* Characters */}
                <Card className="border-2 border-dashed border-gray-600 bg-gray-800 hover:border-purple-400 transition-all">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <Users className="w-5 h-5 text-purple-400" />
                      Characters & Configurations
                    </Label>
                    <div className="space-y-4">
                      {/* Available Characters */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-3">
                          Select Characters:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {projectData?.characters?.map((character: any) => (
                            <button
                              key={character.id}
                              onClick={() =>
                                handleCharacterToggle(character.id)
                              }
                              className={`p-3 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                                panelSettings.characters.some(
                                  (c) => c.id === character.id
                                )
                                  ? "border-purple-500 bg-purple-900/50 text-purple-300 shadow-md"
                                  : "border-gray-600 bg-gray-700 text-white hover:border-purple-400"
                              }`}
                            >
                              <div className="font-semibold text-sm">
                                {character.name}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {character.briefDescription ||
                                  character.description}
                              </div>
                            </button>
                          )) || (
                            <p className="text-gray-400 col-span-full text-center py-4">
                              No characters available in this project
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Character Configurations */}
                      {panelSettings.characters.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-300 border-t border-gray-600 pt-4">
                            Character Configurations:
                          </h4>
                          {panelSettings.characters.map((character) => (
                            <CharacterConfigPanel
                              key={character.id}
                              character={character}
                              onUpdate={updateCharacterSetting}
                              predefinedOptions={predefinedOptions}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Visual Selectors */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <VisualSelector
                      title="Location"
                      options={predefinedOptions.locations}
                      selectedValue={panelSettings.location}
                      onSelect={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          location: value,
                        }))
                      }
                      customValue={panelSettings.customLocation}
                      onCustomChange={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          customLocation: value,
                        }))
                      }
                      icon={<MapPin className="w-5 h-5" />}
                    />

                    <VisualSelector
                      title="Art Style"
                      options={predefinedOptions.artStyles}
                      selectedValue={panelSettings.artStyle}
                      onSelect={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          artStyle: value,
                        }))
                      }
                      customValue={panelSettings.customArtStyle}
                      onCustomChange={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          customArtStyle: value,
                        }))
                      }
                      icon={<Palette className="w-5 h-5" />}
                    />
                  </div>

                  <div className="space-y-6">
                    <VisualSelector
                      title="Lighting"
                      options={predefinedOptions.lighting}
                      selectedValue={panelSettings.lighting}
                      onSelect={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          lighting: value,
                        }))
                      }
                      customValue={panelSettings.customLighting}
                      onCustomChange={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          customLighting: value,
                        }))
                      }
                      icon={<Eye className="w-5 h-5" />}
                    />

                    <VisualSelector
                      title="Camera Angle"
                      options={predefinedOptions.cameraAngles}
                      selectedValue={panelSettings.cameraAngle}
                      onSelect={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          cameraAngle: value,
                        }))
                      }
                      customValue={panelSettings.customCameraAngle}
                      onCustomChange={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          customCameraAngle: value,
                        }))
                      }
                      icon={<Settings className="w-5 h-5" />}
                    />
                  </div>
                </div>

                {/* Dialogue */}
                <Card className="border-2 border-dashed border-gray-600 bg-gray-800 hover:border-purple-400 transition-all">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <Users className="w-5 h-5 text-purple-400" />
                      Dialogue (Optional)
                    </Label>
                    <Textarea
                      placeholder="Add any dialogue or speech bubbles..."
                      value={panelSettings.dialogue}
                      onChange={(e) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          dialogue: e.target.value,
                        }))
                      }
                      className="min-h-[100px] border-2 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500"
                    />
                  </CardContent>
                </Card>

                {/* Quality Keywords */}
                <Card className="border-2 border-dashed border-gray-600 bg-gray-800 hover:border-purple-400 transition-all">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <Wand2 className="w-5 h-5 text-purple-400" />
                      Quality Enhancers (Optional)
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {predefinedOptions.qualityKeywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant={
                            panelSettings.qualityKeywords.includes(keyword)
                              ? "default"
                              : "outline"
                          }
                          className={`cursor-pointer transition-all hover:scale-105 ${
                            panelSettings.qualityKeywords.includes(keyword)
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                              : "hover:bg-purple-900/50 hover:text-purple-400 border-2 border-gray-600 text-gray-300"
                          }`}
                          onClick={() => handleQualityKeywordToggle(keyword)}
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400 font-medium">
              Step {step} of 3{" "}
              {step === 3 && canProceed.step3 && "- Ready to Generate!"}
            </div>
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Back
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Cancel
              </Button>
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !canProceed.step1) ||
                    (step === 2 && !canProceed.step2)
                  }
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={generatePanel}
                  disabled={!canProceed.step3 || isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all min-w-[140px]"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Generate Panel
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ManualPanelGenerator;
