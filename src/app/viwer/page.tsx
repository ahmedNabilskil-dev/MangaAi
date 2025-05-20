"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Chapter,
  Character,
  MangaProject,
  Panel,
  PanelDialogue,
  Scene,
} from "@/types/entities";

import { MangaStatus } from "@/types/enums";
import {
  BookMarked,
  Clock,
  Eye,
  Heart,
  Info,
  Layout,
  MessageSquare,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Mock data for all entity types
const mockProject: MangaProject = {
  id: "proj-123",
  title: "Cyber Emotion: The Last Smuggler",
  description:
    "In a cyberpunk world where emotions are traded as currency, a smuggler accidentally gets infected with the rarest emotion.",
  status: MangaStatus.DRAFT,
  initialPrompt:
    "Create a cyberpunk manga where emotions are traded as currency.",
  genre: "Cyberpunk, Sci-Fi, Drama",
  artStyle: "Neo-noir with vibrant neon accents",
  coverImageUrl: "/images/hero-bg.png",
  targetAudience: "young-adult",
  worldDetails: {
    summary: "A dystopian future where corporations have monopolized emotions.",
    history:
      "After the Great Emotional Collapse of 2157, emotions became rare and commodified.",
    society:
      "Stratified between the emotion-rich elite and emotion-starved masses.",
    uniqueSystems:
      "Emotion transfer technology, black market emotion smuggling networks",
  },
  concept:
    "Exploring the value of authentic human connection in a world where feelings are bought and sold.",
  plotStructure: {
    incitingIncident:
      "Kira accidentally absorbs 'hope' during a routine smuggling job.",
    plotTwist:
      "The emotion wasn't stolen but created through a forbidden human connection.",
    climax:
      "Kira must choose between selling the emotion for a fortune or releasing it to the world.",
    resolution: "Kira sacrifices wealth to free emotions back to humanity.",
  },
  themes: [
    "Authenticity vs Artifice",
    "Freedom vs Control",
    "Human Connection",
  ],
  motifs: ["Neon lights", "Rain", "Masks", "Digital interfaces"],
  symbols: ["Empty glass vials", "Cherry blossoms", "Broken mirrors"],
  tags: ["cyberpunk", "emotional", "philosophical", "action"],
  creatorId: "user-456",
  viewCount: 1287,
  likeCount: 347,
  published: false,
  createdAt: new Date("2025-05-01"),
  updatedAt: new Date("2025-05-15"),
};

const mockCharacter: Character = {
  id: "char-789",
  name: "Kira Nakamura",
  age: 27,
  gender: "Female",
  bodyAttributes: {
    height: "5'8\"",
    bodyType: "Athletic, lean",
    proportions: "Slightly broad shoulders, long limbs",
  },
  facialAttributes: {
    faceShape: "Heart-shaped with strong jawline",
    skinTone: "Olive with cybernetic implant scars",
    eyeColor: "Electric blue (enhanced)",
    eyeShape: "Almond, slightly upturned",
    noseType: "Straight, medium bridge",
    mouthType: "Full lips, often pressed thin",
    jawline: "Defined but feminine",
  },
  hairAttributes: {
    hairColor: "Black with electric blue streaks",
    hairstyle: "Undercut with long top, often in messy ponytail",
    hairLength: "Long on top, shaved sides",
    hairTexture: "Straight, thick",
    specialHairFeatures: "Glowing blue circuit patterns when emotional",
  },
  distinctiveFeatures: [
    "Circuit-like scars along neck",
    "Small neural port behind left ear",
    "Retractable data jack in right wrist",
  ],
  expressionStyle: {
    defaultExpression: "Guarded, alert, slightly sardonic",
    emotionalRange: "Controlled but intense when barriers break",
    facialTics: [
      "Left eyebrow raise when skeptical",
      "Slight jaw clench when focused",
    ],
  },
  style: {
    defaultOutfit:
      "High-collar leather jacket with hidden pockets, combat pants, reinforced boots, fingerless gloves",
    outfitVariations: [
      "Formal infiltration wear",
      "Street disguise",
      "Combat gear with extra protection",
    ],
    colorPalette: ["Black", "Midnight blue", "Silver", "Electric blue accents"],
    accessories: [
      "Multi-tool necklace",
      "Hidden blade bracelets",
      "Tech-glasses with AR display",
    ],
    signatureItem: "Modified emotion collector disguised as an ornate lighter",
  },
  physicalMannerisms: [
    "Constantly scanning environment",
    "Light-footed movement",
    "Tendency to stay near exits",
  ],
  posture: "Alert and straight but can switch to casual slouch when undercover",
  styleGuide: {
    artStyle: "Clean linework with detailed tech elements",
    lineweight: "Medium to fine lines, heavier for emotional moments",
    shadingStyle: "Strong contrasts with cyberpunk noir lighting",
    colorStyle: "Limited palette with vibrant neon accents",
  },
  consistencyPrompt:
    "Always include the neural port and blue hair streaks. Eyes should glow brighter with emotional intensity.",
  role: "protagonist",
  briefDescription:
    "A skilled emotion smuggler with a troubled past who accidentally absorbs hope during a job gone wrong.",
  personality:
    "Cynical but secretly idealistic. Resourceful, adaptable, and fiercely independent with trust issues.",
  abilities:
    "Enhanced reflexes, expert in stealth and infiltration, technical genius with emotion-capture devices, street-fighting skills.",
  backstory:
    "Former corporate emotion engineer who escaped after discovering her emotions were being harvested. Lost her family in the process and turned to smuggling rare emotions to survive.",
  imgUrl: "/images/hero-bg.png",
  expressionImages: {
    neutral: "/images/hero-bg.png",
    angry: "/images/hero-bg.png",
    surprised: "/images/hero-bg.png",
  },
  traits: ["Resourceful", "Cynical", "Loyal", "Haunted", "Adaptable"],
  arcs: [
    "Learning to trust again",
    "Accepting emotional vulnerability as strength",
  ],
  isAiGenerated: true,
  aiGenerationPrompt:
    "Create a female cyberpunk protagonist who smuggles emotions in a dystopian future.",
  mangaProjectId: "proj-123",
  createdAt: new Date("2025-05-02"),
  updatedAt: new Date("2025-05-12"),
};

const mockChapter: Chapter = {
  id: "chap-101",
  chapterNumber: 1,
  title: "The Last Spark",
  narrative:
    "Kira takes on what seems to be a routine job stealing a rare emotion from a corporate vault, but the job goes sideways when she accidentally absorbs the emotion—pure hope—herself. Now pursued by corporate enforcers, she must find a way to extract the emotion before it changes her forever.",
  purpose:
    "Establish the world and protagonist while setting up the central conflict.",
  tone: "Tense, mysterious, with moments of unexpected beauty",
  keyCharacters: ["Kira Nakamura", "Dr. Emerson Chen", "Ghost (informant)"],
  coverImageUrl: "/images/hero-bg.png",
  mangaProjectId: "proj-123",
  isAiGenerated: true,
  isPublished: false,
  viewCount: 562,
  createdAt: new Date("2025-05-03"),
  updatedAt: new Date("2025-05-13"),
};

const mockScene: Scene = {
  id: "scene-334",
  order: 2,
  title: "Corporate Infiltration",
  narrative:
    "Kira infiltrates the heavily-guarded Emo-Corp central vault using stolen credentials and her stealth skills. The tension builds as security systems nearly detect her several times.",
  sceneContext: {
    setting: "Emo-Corp headquarters, 157th floor secure vault",
    mood: "Tense, suspenseful",
    presentCharacters: [
      "Kira Nakamura",
      "Security Guards",
      "Dr. Emerson Chen (monitoring remotely)",
    ],
    timeOfDay: "Night",
    weather: "Heavy rain against glass windows",
  },
  chapterId: "chap-101",
  dialogueOutline:
    "Minimal dialogue, mostly internal thoughts from Kira and occasional comms with Dr. Chen giving directions.",
  isAiGenerated: true,
  createdAt: new Date("2025-05-04"),
  updatedAt: new Date("2025-05-14"),
};

const mockPanel: Panel = {
  id: "panel-556",
  order: 3,
  imageUrl: "/images/hero-bg.png",
  panelContext: {
    action:
      "Kira carefully extracts a glowing blue vial from a secure container, her expression tense and focused.",
    pose: "Crouched, reaching with precise movements",
    characterPoses: [
      {
        characterName: "Kira Nakamura",
        pose: "Crouched, balanced on fingertips, reaching with right hand",
        expression: "Intense focus, biting lower lip",
      },
    ],
    emotion: "Tension, concentration",
    cameraAngle: "close-up",
    shotType: "detail",
    backgroundDescription:
      "High-tech vault with glowing containment units and security systems",
    backgroundImageUrl: "/images/bg-corp-vault.jpg",
    lighting: "Low blue security lights with the vial casting bright glow",
    effects: [
      "Steam from cooling systems",
      "Digital readouts in background",
      "Reflections on smooth surfaces",
    ],
    dramaticPurpose: "Highlight the risk and value of what Kira is stealing",
    narrativePosition: "Moment of commitment to the dangerous mission",
  },
  sceneId: "scene-334",
  characterIds: ["char-789"],
  isAiGenerated: true,
  aiPrompt:
    "Close-up of female cyberpunk character carefully extracting a glowing emotion vial from a high-tech vault, tense expression, blue security lighting.",
  createdAt: new Date("2025-05-05"),
  updatedAt: new Date("2025-05-15"),
};

const mockDialogue: PanelDialogue = {
  id: "dial-778",
  content:
    "One drop of this on the black market could buy a whole sector. Pure, undiluted hope... haven't seen this since before the Collapse.",
  order: 1,
  style: {
    bubbleType: "thought",
    fontSize: "medium",
    fontType: "Manga Speak",
    emphasis: false,
    position: { x: 120, y: 80 },
  },
  emotion: "Awe mixed with professional assessment",
  subtextNote:
    "Kira's professional facade briefly breaks at the rare find, showing her deeper emotional connection to what she's stealing",
  panelId: "panel-556",
  speakerId: "char-789",
  isAiGenerated: true,
  createdAt: new Date("2025-05-06"),
  updatedAt: new Date("2025-05-16"),
};

// Project Viewer Component
const ProjectViewerDialog = ({
  project = mockProject,
  isOpen = true,
  onClose = () => {},
}: {
  project: MangaProject;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700 p-0">
        <div className="relative w-full h-64">
          {project.coverImageUrl ? (
            <Image
              src={project.coverImageUrl}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-900 to-purple-900 flex items-center justify-center">
              <BookMarked className="w-16 h-16 text-pink-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-gray-900/40 hover:bg-gray-900/60 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-white" />
          </Button>
        </div>

        <div className="px-6 -mt-16 relative z-10">
          <Badge
            className={`mb-2 ${
              project.status === MangaStatus.DRAFT
                ? "bg-amber-600"
                : project.status === MangaStatus.PUBLISHED
                ? "bg-green-600"
                : "bg-blue-600"
            }`}
          >
            {project.status}
          </Badge>

          <h1 className="text-3xl font-bold mb-2">{project.title}</h1>

          <div className="flex items-center gap-4 text-gray-300 text-sm mb-6">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{project.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{project.likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{project.createdAt.toLocaleDateString()}</span>
            </div>
          </div>

          <p className="text-gray-200 mb-8">{project.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <DetailBlock title="Genre" content={project.genre} />
              <DetailBlock title="Art Style" content={project.artStyle} />
              <DetailBlock
                title="Target Audience"
                content={project.targetAudience}
              />
              <DetailBlock title="Concept" content={project.concept} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Layout className="w-5 h-5 text-pink-400" />
                Plot Structure
              </h3>
              {project.plotStructure && (
                <div className="space-y-2 text-gray-200">
                  <p>
                    <span className="font-medium text-pink-400">
                      Inciting Incident:
                    </span>{" "}
                    {project.plotStructure.incitingIncident}
                  </p>
                  <p>
                    <span className="font-medium text-pink-400">
                      Plot Twist:
                    </span>{" "}
                    {project.plotStructure.plotTwist}
                  </p>
                  <p>
                    <span className="font-medium text-pink-400">Climax:</span>{" "}
                    {project.plotStructure.climax}
                  </p>
                  <p>
                    <span className="font-medium text-pink-400">
                      Resolution:
                    </span>{" "}
                    {project.plotStructure.resolution}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              World Details
            </h3>
            {project.worldDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-pink-400 mb-2">Summary</h4>
                  <p>{project.worldDetails.summary}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-pink-400 mb-2">History</h4>
                  <p>{project.worldDetails.history}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-pink-400 mb-2">Society</h4>
                  <p>{project.worldDetails.society}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-pink-400 mb-2">
                    Unique Systems
                  </h4>
                  <p>{project.worldDetails.uniqueSystems}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <DetailBlockWithTags title="Themes" tags={project.themes} />
            <DetailBlockWithTags title="Motifs" tags={project.motifs} />
            <DetailBlockWithTags title="Symbols" tags={project.symbols} />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags?.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gray-800 hover:bg-gray-700"
              >
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="flex justify-end mb-4">
            <Button
              className="bg-pink-600 hover:bg-pink-700"
              onClick={() => console.log("Edit project")}
            >
              Edit Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Character Viewer Component
const CharacterViewerDialog = ({
  character = mockCharacter,
  isOpen = true,
  onClose,
}: {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "appearance" | "personality"
  >("profile");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700 p-0">
        <div className="flex flex-col md:flex-row">
          {/* Character image and basic info */}
          <div className="md:w-1/3 bg-gray-800">
            <div className="relative h-80 md:h-full min-h-[300px]">
              {character.imgUrl ? (
                <Image
                  src={character.imgUrl}
                  alt={character.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 384px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                  <User className="w-16 h-16 text-pink-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-gray-900/40 hover:bg-gray-900/60 rounded-full"
                onClick={onClose}
              >
                <X className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>

          {/* Character details */}
          <div className="md:w-2/3 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className={`${
                  character.role === "protagonist"
                    ? "bg-blue-600"
                    : character.role === "antagonist"
                    ? "bg-red-600"
                    : character.role === "supporting"
                    ? "bg-purple-600"
                    : "bg-gray-600"
                }`}
              >
                {character.role}
              </Badge>
              {character.isAiGenerated && (
                <Badge className="bg-pink-600">
                  <Sparkles className="w-3 h-3 mr-1" /> AI Generated
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-4">{character.name}</h1>

            <div className="flex items-center gap-4 text-gray-300 text-sm mb-6">
              {character.age && (
                <div>
                  <span className="font-medium">Age:</span> {character.age}
                </div>
              )}
              {character.gender && (
                <div>
                  <span className="font-medium">Gender:</span>{" "}
                  {character.gender}
                </div>
              )}
            </div>

            <p className="text-gray-200 mb-6">{character.briefDescription}</p>

            {/* Tab navigation */}
            <div className="flex border-b border-gray-700 mb-6">
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === "profile"
                    ? "text-pink-400 border-b-2 border-pink-400"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === "appearance"
                    ? "text-pink-400 border-b-2 border-pink-400"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("appearance")}
              >
                Appearance
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === "personality"
                    ? "text-pink-400 border-b-2 border-pink-400"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("personality")}
              >
                Personality & History
              </button>
            </div>

            {/* Profile tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Character Traits</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.traits?.map((trait, index) => (
                      <Badge
                        key={index}
                        className="bg-indigo-900/60 hover:bg-indigo-800"
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Character Arcs</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-200">
                    {character.arcs?.map((arc, index) => (
                      <li key={index}>{arc}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Abilities</h3>
                  <p className="text-gray-200">{character.abilities}</p>
                </div>

                {character.expressionImages &&
                  Object.keys(character.expressionImages).length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-3">Expressions</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(character.expressionImages).map(
                          ([expression, url]) => (
                            <div
                              key={expression}
                              className="flex flex-col items-center"
                            >
                              <div className="relative w-full h-32 mb-1">
                                <Image
                                  src={url}
                                  alt={`${character.name} - ${expression}`}
                                  fill
                                  className="object-cover rounded"
                                  sizes="(max-width: 768px) 33vw, 150px"
                                />
                              </div>
                              <span className="text-sm capitalize">
                                {expression}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Appearance tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                {character.bodyAttributes && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">
                      Physical Attributes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
                      <div>
                        <p>
                          <span className="font-medium text-pink-400">
                            Height:
                          </span>{" "}
                          {character.bodyAttributes.height}
                        </p>
                        <p>
                          <span className="font-medium text-pink-400">
                            Body Type:
                          </span>{" "}
                          {character.bodyAttributes.bodyType}
                        </p>
                        <p>
                          <span className="font-medium text-pink-400">
                            Proportions:
                          </span>{" "}
                          {character.bodyAttributes.proportions}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium text-pink-400">
                            Posture:
                          </span>{" "}
                          {character.posture}
                        </p>
                        <div className="mt-2">
                          <p className="font-medium text-pink-400 mb-1">
                            Mannerisms:
                          </p>
                          <ul className="list-disc list-inside">
                            {character.physicalMannerisms?.map(
                              (mannerism, index) => (
                                <li key={index}>{mannerism}</li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {character.facialAttributes && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">Facial Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
                      <div>
                        <p>
                          <span className="font-medium text-pink-400">
                            Face Shape:
                          </span>{" "}
                          {character.facialAttributes.faceShape}
                        </p>
                        <p>
                          <span className="font-medium text-pink-400">
                            Skin Tone:
                          </span>{" "}
                          {character.facialAttributes.skinTone}
                        </p>
                        <p>
                          <span className="font-medium text-pink-400">
                            Eye Color:
                          </span>{" "}
                          {character.facialAttributes.eyeColor}
                        </p>
                        <p>
                          <span className="font-medium text-pink-400">
                            Eye Shape:
                          </span>{" "}
                          {character.facialAttributes.eyeShape}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium text-pink-400">
                            Nose Type:
                          </span>{" "}
                          {character.facialAttributes.noseType}
                        </p>
                        <p>
                          <span className="font-medium text-pink-400">
                            Mouth Type:
                          </span>{" "}
                          {character.facialAttributes.mouthType}
                        </p>
                        <p>
                          <span className="font-medium text-pink-400">
                            Jawline:
                          </span>{" "}
                          {character.facialAttributes.jawline}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {character.hairAttributes && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">Hair</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
                      <div>
                        <p>
                          <span className="font-medium text-pink-400">
                            Hair Color:
                          </span>{" "}
                          {character.hairAttributes.hairColor}
                        </p>
                        <p>
                          <span className="font-medium text-pink-400">
                            Hairstyle:
                          </span>{" "}
                          {character.hairAttributes.hairstyle}
                        </p>
                        <p>
                          <span className="font-medium text-pink-400">
                            Hair Length:
                          </span>{" "}
                          {character.hairAttributes.hairLength}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium text-pink-400">
                            Hair Texture:
                          </span>{" "}
                          {character.hairAttributes.hairTexture}
                        </p>
                        <p>
                          <span className="font-medium text-pink-400">
                            Special Features:
                          </span>{" "}
                          {character.hairAttributes.specialHairFeatures}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {character.distinctiveFeatures &&
                  character.distinctiveFeatures.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-3">
                        Distinctive Features
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-200">
                        {character.distinctiveFeatures.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {character.style && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">Style & Clothing</h3>
                    <div className="space-y-3 text-gray-200">
                      <p>
                        <span className="font-medium text-pink-400">
                          Default Outfit:
                        </span>{" "}
                        {character.style.defaultOutfit}
                      </p>

                      <div>
                        <p className="font-medium text-pink-400 mb-1">
                          Outfit Variations:
                        </p>
                        <ul className="list-disc list-inside">
                          {character.style.outfitVariations?.map(
                            (outfit, index) => (
                              <li key={index}>{outfit}</li>
                            )
                          )}
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium text-pink-400 mb-1">
                          Color Palette:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {character.style.colorPalette?.map((color, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 rounded-full bg-gray-800 text-sm"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="font-medium text-pink-400 mb-1">
                          Accessories:
                        </p>
                        <ul className="list-disc list-inside">
                          {character.style.accessories?.map(
                            (accessory, index) => (
                              <li key={index}>{accessory}</li>
                            )
                          )}
                        </ul>
                      </div>

                      <p>
                        <span className="font-medium text-pink-400">
                          Signature Item:
                        </span>{" "}
                        {character.style.signatureItem}
                      </p>
                    </div>
                  </div>
                )}

                {character.styleGuide && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">Art Style Guide</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
                      <div>
                        <p>
                          <span className="font-medium text-pink-400">
                            Art Style:
                          </span>{" "}
                          {character.styleGuide.artStyle}
                        </p>
                        <p>
                          <span className="font-medium text-pink-400">
                            Line Weight:
                          </span>{" "}
                          {character.styleGuide.lineweight}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium text-pink-400">
                            Shading Style:
                          </span>{" "}
                          {character.styleGuide.shadingStyle}
                        </p>
                        <p>
                          <span className="font-medium text-pink-400">
                            Color Style:
                          </span>{" "}
                          {character.styleGuide.colorStyle}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Personality & History tab */}
            {activeTab === "personality" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Personality</h3>
                  <p className="text-gray-200">{character.personality}</p>
                </div>

                {character.expressionStyle && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">Expression Style</h3>
                    <div className="text-gray-200">
                      <p>
                        <span className="font-medium text-pink-400">
                          Default Expression:
                        </span>{" "}
                        {character.expressionStyle.defaultExpression}
                      </p>
                      <p>
                        <span className="font-medium text-pink-400">
                          Emotional Range:
                        </span>{" "}
                        {character.expressionStyle.emotionalRange}
                      </p>

                      <div className="mt-2">
                        <p className="font-medium text-pink-400 mb-1">
                          Facial Tics:
                        </p>
                        <ul className="list-disc list-inside">
                          {character.expressionStyle.facialTics?.map(
                            (tic, index) => (
                              <li key={index}>{tic}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold mb-3">Backstory</h3>
                  <p className="text-gray-200">{character.backstory}</p>
                </div>

                {character.consistencyPrompt && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">
                      Consistency Notes
                    </h3>
                    <p className="text-gray-200">
                      {character.consistencyPrompt}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end mt-8">
              <Button className="bg-pink-600 hover:bg-pink-700">
                Edit Character
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Chapter Viewer Component
const ChapterViewerDialog = ({
  chapter = mockChapter,
  isOpen = true,
  onClose,
}: {
  chapter: Chapter;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700 p-0">
        <div className="relative w-full h-48">
          {chapter.coverImageUrl ? (
            <Image
              src={chapter.coverImageUrl}
              alt={chapter.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-900 to-pink-800 flex items-center justify-center">
              <BookMarked className="w-12 h-12 text-pink-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-gray-900/40 hover:bg-gray-900/60 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-white" />
          </Button>
        </div>

        <div className="px-6 -mt-12 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-purple-600">
              Chapter {chapter.chapterNumber}
            </Badge>
            {chapter.isPublished ? (
              <Badge className="bg-green-600">Published</Badge>
            ) : (
              <Badge className="bg-amber-600">Draft</Badge>
            )}
            {chapter.isAiGenerated && (
              <Badge className="bg-pink-600">
                <Sparkles className="w-3 h-3 mr-1" /> AI Generated
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{chapter.title}</h1>

          <div className="flex items-center gap-4 text-gray-300 text-sm mb-6">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{chapter.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{chapter.createdAt.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="bg-gray-800/50 p-5 rounded-lg mb-8">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-400" />
              Narrative
            </h3>
            <p className="text-gray-200">{chapter.narrative}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-3">Purpose</h3>
              <p className="text-gray-200">{chapter.purpose}</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Tone</h3>
              <p className="text-gray-200">{chapter.tone}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Key Characters</h3>
            <div className="flex flex-wrap gap-3">
              {chapter.keyCharacters?.map((character, index) => (
                <Badge
                  key={index}
                  className="bg-indigo-900/60 hover:bg-indigo-800 px-3 py-2"
                >
                  <User className="w-3 h-3 mr-2" />
                  {character}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="font-bold text-pink-400">Total Scenes</h4>
                <p className="text-2xl">{chapter.scenes?.length || 0}</p>
              </div>
              <Layout className="w-10 h-10 text-pink-400/30" />
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="font-bold text-pink-400">Creation Date</h4>
                <p>{chapter.createdAt.toLocaleDateString()}</p>
              </div>
              <Clock className="w-10 h-10 text-pink-400/30" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mb-4">
            <Button
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              View Scenes
            </Button>
            <Button className="bg-pink-600 hover:bg-pink-700">
              Edit Chapter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Scene Viewer Component
const SceneViewerDialog = ({
  scene = mockScene,
  isOpen = true,
  onClose,
}: {
  scene: Scene;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-900 w-12 h-12 rounded-full flex items-center justify-center">
              <Layout className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <Badge className="mb-1">{`Scene ${scene.order}`}</Badge>
              <h2 className="text-2xl font-bold">{scene.title}</h2>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="bg-gray-800/50 p-5 rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-3">Narrative</h3>
          <p className="text-gray-200">{scene.narrative}</p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            Scene Context
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-bold text-pink-400 mb-2">Setting</h4>
              <p className="text-gray-200">{scene.sceneContext.setting}</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-bold text-pink-400 mb-2">Mood</h4>
              <p className="text-gray-200">{scene.sceneContext.mood}</p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-bold text-pink-400 mb-2">Time of Day</h4>
              <p className="text-gray-200">
                {scene.sceneContext.timeOfDay || "Not specified"}
              </p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-bold text-pink-400 mb-2">Weather</h4>
              <p className="text-gray-200">
                {scene.sceneContext.weather || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-3">Present Characters</h3>
          <div className="flex flex-wrap gap-2">
            {scene.sceneContext.presentCharacters.map((character, index) => (
              <div
                key={index}
                className="bg-gray-800/70 rounded-lg px-4 py-2 flex items-center gap-2"
              >
                <Avatar className="h-8 w-8 border border-pink-500/50">
                  <AvatarFallback className="bg-gray-700 text-pink-400">
                    {character.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span>{character}</span>
              </div>
            ))}
          </div>
        </div>

        {scene.dialogueOutline && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Dialogue Outline</h3>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-200">{scene.dialogueOutline}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h4 className="font-bold text-pink-400">Total Panels</h4>
              <p className="text-2xl">{scene.panels?.length || 0}</p>
            </div>
            <Layout className="w-10 h-10 text-pink-400/30" />
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h4 className="font-bold text-pink-400">Creation Date</h4>
              <p>{scene.createdAt.toLocaleDateString()}</p>
            </div>
            <Clock className="w-10 h-10 text-pink-400/30" />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            View Panels
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700">Edit Scene</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Panel Viewer Component
export const PanelViewerDialog = ({
  panel = mockPanel,
  isOpen = true,
  onClose,
}: {
  panel: Panel;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700 p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Panel image section */}
          <div className="lg:w-1/2 relative bg-black">
            <div className="relative w-full h-72 lg:h-full min-h-[400px]">
              {panel.imageUrl ? (
                <Image
                  src={panel.imageUrl}
                  alt={`Panel ${panel.order}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 512px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <Layout className="w-16 h-16 text-pink-400/40" />
                </div>
              )}
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-gray-900/40 hover:bg-gray-900/60 rounded-full"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>

          {/* Panel details section */}
          <div className="lg:w-1/2 p-6 overflow-y-auto max-h-[600px]">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-purple-600">Panel {panel.order}</Badge>
              {panel.isAiGenerated && (
                <Badge className="bg-pink-600">
                  <Sparkles className="w-3 h-3 mr-1" /> AI Generated
                </Badge>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Action</h3>
              <p className="text-gray-200">{panel.panelContext.action}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold mb-2">Panel Details</h3>
                <div className="space-y-2 text-gray-200">
                  <p>
                    <span className="font-medium text-pink-400">
                      Camera Angle:
                    </span>{" "}
                    {panel.panelContext.cameraAngle}
                  </p>
                  <p>
                    <span className="font-medium text-pink-400">
                      Shot Type:
                    </span>{" "}
                    {panel.panelContext.shotType}
                  </p>
                  <p>
                    <span className="font-medium text-pink-400">Lighting:</span>{" "}
                    {panel.panelContext.lighting}
                  </p>
                  <p>
                    <span className="font-medium text-pink-400">Emotion:</span>{" "}
                    {panel.panelContext.emotion}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">Narrative Purpose</h3>
                <div className="space-y-2 text-gray-200">
                  <p>
                    <span className="font-medium text-pink-400">
                      Dramatic Purpose:
                    </span>{" "}
                    {panel.panelContext.dramaticPurpose}
                  </p>
                  <p>
                    <span className="font-medium text-pink-400">
                      Narrative Position:
                    </span>{" "}
                    {panel.panelContext.narrativePosition}
                  </p>
                </div>
              </div>
            </div>

            {panel.panelContext.characterPoses &&
              panel.panelContext.characterPoses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">Character Poses</h3>
                  <div className="space-y-3">
                    {panel.panelContext.characterPoses.map(
                      (charPose, index) => (
                        <div
                          key={index}
                          className="bg-gray-800/50 p-3 rounded-lg"
                        >
                          <h4 className="font-medium text-pink-400">
                            {charPose.characterName}
                          </h4>
                          <p className="text-gray-200">
                            <span className="font-medium">Pose:</span>{" "}
                            {charPose.pose}
                          </p>
                          {charPose.expression && (
                            <p className="text-gray-200">
                              <span className="font-medium">Expression:</span>{" "}
                              {charPose.expression}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Background</h3>
              <p className="text-gray-200">
                {panel.panelContext.backgroundDescription}
              </p>
            </div>

            {panel.panelContext.effects &&
              panel.panelContext.effects.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">Visual Effects</h3>
                  <div className="flex flex-wrap gap-2">
                    {panel.panelContext.effects.map((effect, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-pink-500/30"
                      >
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {panel.dialogues && panel.dialogues.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-pink-400" />
                  Dialogue
                </h3>
                <div className="space-y-3">
                  {panel.dialogues.map((dialogue) => (
                    <div
                      key={dialogue.id}
                      className="bg-gray-800/50 p-3 rounded-lg"
                    >
                      {dialogue.speakerId && (
                        <h4 className="font-medium text-pink-400 mb-1">
                          {dialogue.speaker?.name || "Character"}:
                        </h4>
                      )}
                      <p className="text-gray-200 italic">
                        "{dialogue.content}"
                      </p>
                      {dialogue.style?.bubbleType && (
                        <p className="text-sm text-gray-400 mt-1">
                          {dialogue.style.bubbleType} bubble
                          {dialogue.style.emphasis ? ", emphasized" : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {panel.aiPrompt && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">AI Generation Prompt</h3>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-gray-200">{panel.aiPrompt}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              {panel.dialogues && panel.dialogues.length > 0 && (
                <Button
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  View Dialogues
                </Button>
              )}
              <Button className="bg-pink-600 hover:bg-pink-700">
                Edit Panel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Dialogue Viewer Component
export const DialogueViewerDialog = ({
  dialogue = mockDialogue,
  isOpen = true,
  onClose,
}: {
  dialogue: PanelDialogue;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-900 w-12 h-12 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <Badge className="mb-1">Dialogue {dialogue.order}</Badge>
              {dialogue.speaker && (
                <h2 className="text-2xl font-bold">{dialogue.speaker.name}</h2>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="bg-gray-800/50 p-5 rounded-lg mb-8">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold mb-3">Content</h3>
            <Badge
              className={`
              ${
                dialogue.style?.bubbleType === "thought"
                  ? "bg-blue-600"
                  : dialogue.style?.bubbleType === "scream"
                  ? "bg-red-600"
                  : dialogue.style?.bubbleType === "whisper"
                  ? "bg-purple-600"
                  : dialogue.style?.bubbleType === "narration"
                  ? "bg-green-600"
                  : "bg-gray-600"
              }
            `}
            >
              {dialogue.style?.bubbleType || "normal"}
            </Badge>
          </div>
          <p className="text-gray-100 text-xl italic mb-4">
            "{dialogue.content}"
          </p>

          {dialogue.emotion && (
            <div className="flex items-center gap-2 text-gray-300 mt-2">
              <span className="font-medium">Emotion:</span>
              <span>{dialogue.emotion}</span>
            </div>
          )}
        </div>

        {dialogue.style && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Style Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
              {dialogue.style.fontSize && (
                <p>
                  <span className="font-medium text-pink-400">Font Size:</span>{" "}
                  {dialogue.style.fontSize}
                </p>
              )}
              {dialogue.style.fontType && (
                <p>
                  <span className="font-medium text-pink-400">Font Type:</span>{" "}
                  {dialogue.style.fontType}
                </p>
              )}
              {dialogue.style.emphasis !== undefined && (
                <p>
                  <span className="font-medium text-pink-400">Emphasis:</span>{" "}
                  {dialogue.style.emphasis ? "Yes" : "No"}
                </p>
              )}
              {dialogue.style.position && (
                <p>
                  <span className="font-medium text-pink-400">Position:</span>{" "}
                  x: {dialogue.style.position.x}, y: {dialogue.style.position.y}
                </p>
              )}
            </div>
          </div>
        )}

        {dialogue.subtextNote && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Subtext Note</h3>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-200">{dialogue.subtextNote}</p>
            </div>
          </div>
        )}

        {dialogue.speaker && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-pink-400" />
              Speaker
            </h3>
            <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
              <Avatar className="h-12 w-12 border-2 border-pink-500/50">
                {dialogue.speaker.imgUrl ? (
                  <AvatarImage
                    src={dialogue.speaker.imgUrl}
                    alt={dialogue.speaker.name}
                  />
                ) : (
                  <AvatarFallback className="bg-gray-700 text-pink-400">
                    {dialogue.speaker.name.slice(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h4 className="font-bold">{dialogue.speaker.name}</h4>
                <p className="text-sm text-gray-300">
                  {dialogue.speaker.briefDescription}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h4 className="font-bold text-pink-400">Created</h4>
              <p>{dialogue.createdAt.toLocaleDateString()}</p>
            </div>
            <Clock className="w-8 h-8 text-pink-400/30" />
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h4 className="font-bold text-pink-400">Generated By</h4>
              <p>{dialogue.isAiGenerated ? "AI" : "Manual"}</p>
            </div>
            <Sparkles className="w-8 h-8 text-pink-400/30" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="bg-pink-600 hover:bg-pink-700">
            Edit Dialogue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DetailBlock = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => (
  <div>
    <h3 className="font-medium text-pink-400 flex items-center gap-2">
      <Info className="w-4 h-4" />
      {title}
    </h3>
    <p className="text-gray-200">{content}</p>
  </div>
);

const DetailBlockWithTags = ({
  title,
  tags,
}: {
  title: string;
  tags: string[];
}) => (
  <div>
    <h3 className="font-medium text-pink-400 mb-2">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {tags?.map((tag, index) => (
        <Badge key={index} variant="outline" className="bg-gray-800/40">
          {tag}
        </Badge>
      ))}
    </div>
  </div>
);

export default SceneViewerDialog;
