"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NodeType } from "@/components/visual-editor/custom-node";
import { useVisualEditorStore } from "@/store/visual-editor-store";
import {
  Chapter,
  Character,
  MangaProject,
  Panel,
  PanelDialogue,
  Scene,
} from "@/types/entities";
import { MangaStatus } from "@/types/enums";
import { NodeData } from "@/types/nodes";
import { AnimatePresence, motion } from "framer-motion";
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
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Node } from "reactflow";

// Project Viewer Panel Component
export const ProjectViewerPanel = ({ project }: { project: MangaProject }) => {
  console.log({ project });
  return (
    <div className="fixed right-0 top-0 h-full bg-gray-900 text-white border-l border-gray-700 overflow-y-auto z-50">
      <div className="relative w-full h-64">
        {project.coverImageUrl ? (
          <Image
            src={project.coverImageUrl}
            alt={project.title}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-900 to-purple-900 flex items-center justify-center">
            <BookMarked className="w-16 h-16 text-pink-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
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
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {project.description && (
          <p className="text-gray-200 mb-8">{project.description}</p>
        )}

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="space-y-4">
            {project.genre && (
              <DetailBlock title="Genre" content={project.genre} />
            )}
            {project.artStyle && (
              <DetailBlock title="Art Style" content={project.artStyle} />
            )}
            {project.targetAudience && (
              <DetailBlock
                title="Target Audience"
                content={project.targetAudience}
              />
            )}
            {project.concept && (
              <DetailBlock title="Concept" content={project.concept} />
            )}
          </div>

          {project.plotStructure && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Layout className="w-5 h-5 text-pink-400" />
                Plot Structure
              </h3>
              <div className="space-y-2 text-gray-200">
                <p>
                  <span className="font-medium text-pink-400">
                    Inciting Incident:
                  </span>{" "}
                  {project.plotStructure.incitingIncident}
                </p>
                <p>
                  <span className="font-medium text-pink-400">Plot Twist:</span>{" "}
                  {project.plotStructure.plotTwist}
                </p>
                <p>
                  <span className="font-medium text-pink-400">Climax:</span>{" "}
                  {project.plotStructure.climax}
                </p>
                <p>
                  <span className="font-medium text-pink-400">Resolution:</span>{" "}
                  {project.plotStructure.resolution}
                </p>
              </div>
            </div>
          )}
        </div>

        {project.worldDetails && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              World Details
            </h3>
            <div className="grid grid-cols-1 gap-4 text-gray-200">
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
                <h4 className="font-bold text-pink-400 mb-2">Unique Systems</h4>
                <p>{project.worldDetails.uniqueSystems}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 mb-8">
          {project.themes && project.themes.length > 0 && (
            <DetailBlockWithTags title="Themes" tags={project.themes} />
          )}
          {project.motifs && project.motifs.length > 0 && (
            <DetailBlockWithTags title="Motifs" tags={project.motifs} />
          )}
          {project.symbols && project.symbols.length > 0 && (
            <DetailBlockWithTags title="Symbols" tags={project.symbols} />
          )}
        </div>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gray-800 hover:bg-gray-700"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ChapterViewerPanel = ({ chapter }: { chapter: Chapter }) => {
  return (
    <div className="fixed right-0 top-0 h-full bg-gray-900 text-white border-l border-gray-700 overflow-y-auto z-50">
      <div className="relative w-full h-48">
        {chapter.coverImageUrl ? (
          <Image
            src={chapter.coverImageUrl}
            alt={chapter.title}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-900 to-pink-800 flex items-center justify-center">
            <BookMarked className="w-12 h-12 text-pink-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
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
            <span>{new Date(chapter.createdAt!).toLocaleDateString()}</span>
          </div>
        </div>

        {chapter.narrative && (
          <div className="bg-gray-800/50 p-5 rounded-lg mb-8">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-400" />
              Narrative
            </h3>
            <p className="text-gray-200">{chapter.narrative}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 mb-8">
          {chapter.purpose && (
            <div>
              <h3 className="text-xl font-bold mb-3">Purpose</h3>
              <p className="text-gray-200">{chapter.purpose}</p>
            </div>
          )}
          {chapter.tone && (
            <div>
              <h3 className="text-xl font-bold mb-3">Tone</h3>
              <p className="text-gray-200">{chapter.tone}</p>
            </div>
          )}
        </div>

        {chapter.keyCharacters && chapter.keyCharacters.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Key Characters</h3>
            <div className="flex flex-wrap gap-3">
              {chapter.keyCharacters.map((character, index) => (
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
        )}

        <div className="grid grid-cols-1 gap-4 mb-8">
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
              <p>{new Date(chapter.createdAt!).toLocaleDateString()}</p>
            </div>
            <Clock className="w-10 h-10 text-pink-400/30" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SceneViewerPanel = ({ scene }: { scene: Scene }) => {
  return (
    <div className="fixed right-0 top-0 h-full bg-gray-900 text-white border-l border-gray-700 overflow-y-auto z-50 p-6">
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
      </div>

      {scene.visualSequence && (
        <div className="bg-gray-800/50 p-5 rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-3">visual Sequence</h3>
          <p className="text-gray-200">{scene.visualSequence}</p>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          Scene Context
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-bold text-pink-400 mb-2">Setting</h4>
            <p className="text-gray-200">{scene.sceneContext.setting}</p>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-bold text-pink-400 mb-2">Mood</h4>
            <p className="text-gray-200">{scene.sceneContext.mood}</p>
          </div>

          {scene.sceneContext.timeOfDay && (
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-bold text-pink-400 mb-2">Time of Day</h4>
              <p className="text-gray-200">{scene.sceneContext.timeOfDay}</p>
            </div>
          )}

          {scene.sceneContext.weather && (
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-bold text-pink-400 mb-2">Weather</h4>
              <p className="text-gray-200">{scene.sceneContext.weather}</p>
            </div>
          )}
        </div>
      </div>

      {scene.sceneContext.presentCharacters &&
        scene.sceneContext.presentCharacters.length > 0 && (
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
        )}

      {scene.dialogueOutline && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-3">Dialogue Outline</h3>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-gray-200">{scene.dialogueOutline}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-8">
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
            <p>{new Date(scene.createdAt).toLocaleDateString()}</p>
          </div>
          <Clock className="w-10 h-10 text-pink-400/30" />
        </div>
      </div>
    </div>
  );
};

export const PanelViewerPanel = ({ panel }: { panel: Panel }) => {
  return (
    <div className="fixed right-0 top-0 h-full bg-gray-900 text-white border-l border-gray-700 overflow-y-auto z-50">
      <div className="flex flex-col">
        {/* Panel image section */}
        <div className="relative bg-black">
          <div className="relative w-full h-72 min-h-[400px]">
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
        </div>

        {/* Panel details section */}
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-purple-600">Panel {panel.order}</Badge>
            {panel.isAiGenerated && (
              <Badge className="bg-pink-600">
                <Sparkles className="w-3 h-3 mr-1" /> AI Generated
              </Badge>
            )}
          </div>

          {panel.panelContext.action && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Action</h3>
              <p className="text-gray-200">{panel.panelContext.action}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold mb-2">Panel Details</h3>
              <div className="space-y-2 text-gray-200">
                {panel.panelContext.cameraAngle && (
                  <p>
                    <span className="font-medium text-pink-400">
                      Camera Angle:
                    </span>{" "}
                    {panel.panelContext.cameraAngle}
                  </p>
                )}
                {panel.panelContext.shotType && (
                  <p>
                    <span className="font-medium text-pink-400">
                      Shot Type:
                    </span>{" "}
                    {panel.panelContext.shotType}
                  </p>
                )}
                {panel.panelContext.lighting && (
                  <p>
                    <span className="font-medium text-pink-400">Lighting:</span>{" "}
                    {panel.panelContext.lighting}
                  </p>
                )}
                {panel.panelContext.emotion && (
                  <p>
                    <span className="font-medium text-pink-400">Emotion:</span>{" "}
                    {panel.panelContext.emotion}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">Narrative Purpose</h3>
              <div className="space-y-2 text-gray-200">
                {panel.panelContext.dramaticPurpose && (
                  <p>
                    <span className="font-medium text-pink-400">
                      Dramatic Purpose:
                    </span>{" "}
                    {panel.panelContext.dramaticPurpose}
                  </p>
                )}
                {panel.panelContext.narrativePosition && (
                  <p>
                    <span className="font-medium text-pink-400">
                      Narrative Position:
                    </span>{" "}
                    {panel.panelContext.narrativePosition}
                  </p>
                )}
              </div>
            </div>
          </div>

          {panel.panelContext.characterPoses &&
            panel.panelContext.characterPoses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Character Poses</h3>
                <div className="space-y-3">
                  {panel.panelContext.characterPoses.map((charPose, index) => (
                    <div key={index} className="bg-gray-800/50 p-3 rounded-lg">
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
                  ))}
                </div>
              </div>
            )}

          {panel.panelContext.backgroundDescription && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Background</h3>
              <p className="text-gray-200">
                {panel.panelContext.backgroundDescription}
              </p>
            </div>
          )}

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
                    {dialogue.speaker && (
                      <h4 className="font-medium text-pink-400 mb-1">
                        {dialogue.speaker.name}:
                      </h4>
                    )}
                    <p className="text-gray-200 italic">"{dialogue.content}"</p>
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
        </div>
      </div>
    </div>
  );
};

export const DialogueViewerPanel = ({
  dialogue,
}: {
  dialogue: PanelDialogue;
}) => {
  return (
    <div className="fixed right-0 top-0 h-full w-full bg-gray-900 text-white border-l border-gray-700 overflow-y-auto z-50 p-6">
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
      </div>

      <div className="bg-gray-800/50 p-5 rounded-lg mb-8">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold mb-3">Content</h3>
          {dialogue.style?.bubbleType && (
            <Badge
              className={`
                ${
                  dialogue.style.bubbleType === "thought"
                    ? "bg-blue-600"
                    : dialogue.style.bubbleType === "scream"
                    ? "bg-red-600"
                    : dialogue.style.bubbleType === "whisper"
                    ? "bg-purple-600"
                    : dialogue.style.bubbleType === "narration"
                    ? "bg-green-600"
                    : "bg-gray-600"
                }
              `}
            >
              {dialogue.style.bubbleType}
            </Badge>
          )}
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
          <div className="grid grid-cols-1 gap-4 text-gray-200">
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
                <span className="font-medium text-pink-400">Position:</span> x:{" "}
                {dialogue.style.position.x}, y: {dialogue.style.position.y}
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
              {dialogue.speaker.briefDescription && (
                <p className="text-sm text-gray-300">
                  {dialogue.speaker.briefDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between">
          <div>
            <h4 className="font-bold text-pink-400">Created</h4>
            <p>{new Date(dialogue.createdAt).toLocaleDateString()}</p>
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
    </div>
  );
};

export const CharacterViewerPanel = ({
  character,
}: {
  character: Character;
}) => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "appearance" | "personality"
  >("profile");

  return (
    <div className="fixed right-0 top-0 h-full bg-gray-900 text-white border-l border-gray-700 overflow-y-auto z-50">
      <div className="flex flex-col">
        {/* Character image and basic info */}
        <div className="bg-gray-800">
          <div className="relative h-80 min-h-[300px]">
            {character.imgUrl ? (
              <Image
                src={character.imgUrl}
                alt={character.name}
                fill
                className="object-contain object-top"
                sizes="(max-width: 768px) 100vw, 384px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                <User className="w-16 h-16 text-pink-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          </div>
        </div>

        {/* Character details */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            {character.role && (
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
            )}
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
                <span className="font-medium">Gender:</span> {character.gender}
              </div>
            )}
          </div>

          {character.briefDescription && (
            <p className="text-gray-200 mb-6">{character.briefDescription}</p>
          )}

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
              {character.traits && character.traits.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Character Traits</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.traits.map((trait, index) => (
                      <Badge
                        key={index}
                        className="bg-indigo-900/60 hover:bg-indigo-800"
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {character.arcs && character.arcs.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Character Arcs</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-200">
                    {character.arcs.map((arc, index) => (
                      <li key={index}>{arc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {character.abilities && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Abilities</h3>
                  <p className="text-gray-200">{character.abilities}</p>
                </div>
              )}

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
                                className="object-contain rounded"
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
                  <div className="grid grid-cols-1 gap-4 text-gray-200">
                    <div>
                      {character.bodyAttributes.height && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Height:
                          </span>{" "}
                          {character.bodyAttributes.height}
                        </p>
                      )}
                      {character.bodyAttributes.bodyType && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Body Type:
                          </span>{" "}
                          {character.bodyAttributes.bodyType}
                        </p>
                      )}
                      {character.bodyAttributes.proportions && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Proportions:
                          </span>{" "}
                          {character.bodyAttributes.proportions}
                        </p>
                      )}
                    </div>
                    <div>
                      {character.posture && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Posture:
                          </span>{" "}
                          {character.posture}
                        </p>
                      )}
                      {character.physicalMannerisms &&
                        character.physicalMannerisms.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-pink-400 mb-1">
                              Mannerisms:
                            </p>
                            <ul className="list-disc list-inside">
                              {character.physicalMannerisms.map(
                                (mannerism, index) => (
                                  <li key={index}>{mannerism}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {character.facialAttributes && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Facial Features</h3>
                  <div className="grid grid-cols-1 gap-4 text-gray-200">
                    <div>
                      {character.facialAttributes.faceShape && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Face Shape:
                          </span>{" "}
                          {character.facialAttributes.faceShape}
                        </p>
                      )}
                      {character.facialAttributes.skinTone && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Skin Tone:
                          </span>{" "}
                          {character.facialAttributes.skinTone}
                        </p>
                      )}
                      {character.facialAttributes.eyeColor && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Eye Color:
                          </span>{" "}
                          {character.facialAttributes.eyeColor}
                        </p>
                      )}
                      {character.facialAttributes.eyeShape && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Eye Shape:
                          </span>{" "}
                          {character.facialAttributes.eyeShape}
                        </p>
                      )}
                    </div>
                    <div>
                      {character.facialAttributes.noseType && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Nose Type:
                          </span>{" "}
                          {character.facialAttributes.noseType}
                        </p>
                      )}
                      {character.facialAttributes.mouthType && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Mouth Type:
                          </span>{" "}
                          {character.facialAttributes.mouthType}
                        </p>
                      )}
                      {character.facialAttributes.jawline && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Jawline:
                          </span>{" "}
                          {character.facialAttributes.jawline}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {character.hairAttributes && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Hair</h3>
                  <div className="grid grid-cols-1 gap-4 text-gray-200">
                    <div>
                      {character.hairAttributes.hairColor && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Hair Color:
                          </span>{" "}
                          {character.hairAttributes.hairColor}
                        </p>
                      )}
                      {character.hairAttributes.hairstyle && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Hairstyle:
                          </span>{" "}
                          {character.hairAttributes.hairstyle}
                        </p>
                      )}
                      {character.hairAttributes.hairLength && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Hair Length:
                          </span>{" "}
                          {character.hairAttributes.hairLength}
                        </p>
                      )}
                    </div>
                    <div>
                      {character.hairAttributes.hairTexture && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Hair Texture:
                          </span>{" "}
                          {character.hairAttributes.hairTexture}
                        </p>
                      )}
                      {character.hairAttributes.specialHairFeatures && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Special Features:
                          </span>{" "}
                          {character.hairAttributes.specialHairFeatures}
                        </p>
                      )}
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
                    {character.style.defaultOutfit && (
                      <p>
                        <span className="font-medium text-pink-400">
                          Default Outfit:
                        </span>{" "}
                        {character.style.defaultOutfit}
                      </p>
                    )}
                    {character.style.outfitVariations &&
                      character.style.outfitVariations.length > 0 && (
                        <div>
                          <p className="font-medium text-pink-400 mb-1">
                            Outfit Variations:
                          </p>
                          <ul className="list-disc list-inside">
                            {character.style.outfitVariations.map(
                              (outfit, index) => (
                                <li key={index}>{outfit}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    =
                    {character.style.accessories &&
                      character.style.accessories.length > 0 && (
                        <div>
                          <p className="font-medium text-pink-400 mb-1">
                            Accessories:
                          </p>
                          <ul className="list-disc list-inside">
                            {character.style.accessories.map(
                              (accessory, index) => (
                                <li key={index}>{accessory}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    {character.style.signatureItem && (
                      <p>
                        <span className="font-medium text-pink-400">
                          Signature Item:
                        </span>{" "}
                        {character.style.signatureItem}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {character.styleGuide && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Art Style Guide</h3>
                  <div className="grid grid-cols-1 gap-4 text-gray-200">
                    <div>
                      {character.styleGuide.artStyle && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Art Style:
                          </span>{" "}
                          {character.styleGuide.artStyle}
                        </p>
                      )}
                      {character.styleGuide.lineweight && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Line Weight:
                          </span>{" "}
                          {character.styleGuide.lineweight}
                        </p>
                      )}
                    </div>
                    <div>
                      {character.styleGuide.shadingStyle && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Shading Style:
                          </span>{" "}
                          {character.styleGuide.shadingStyle}
                        </p>
                      )}
                      {character.styleGuide.colorStyle && (
                        <p>
                          <span className="font-medium text-pink-400">
                            Color Style:
                          </span>{" "}
                          {character.styleGuide.colorStyle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Personality & History tab */}
          {activeTab === "personality" && (
            <div className="space-y-6">
              {character.personality && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Personality</h3>
                  <p className="text-gray-200">{character.personality}</p>
                </div>
              )}

              {character.expressionStyle && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Expression Style</h3>
                  <div className="text-gray-200">
                    {character.expressionStyle.defaultExpression && (
                      <p>
                        <span className="font-medium text-pink-400">
                          Default Expression:
                        </span>{" "}
                        {character.expressionStyle.defaultExpression}
                      </p>
                    )}
                    {character.expressionStyle.emotionalRange && (
                      <p>
                        <span className="font-medium text-pink-400">
                          Emotional Range:
                        </span>{" "}
                        {character.expressionStyle.emotionalRange}
                      </p>
                    )}

                    {character.expressionStyle.facialTics &&
                      character.expressionStyle.facialTics.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium text-pink-400 mb-1">
                            Facial Tics:
                          </p>
                          <ul className="list-disc list-inside">
                            {character.expressionStyle.facialTics.map(
                              (tic, index) => (
                                <li key={index}>{tic}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {character.backstory && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Backstory</h3>
                  <p className="text-gray-200">{character.backstory}</p>
                </div>
              )}

              {character.consistencyPrompt && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Consistency Notes</h3>
                  <p className="text-gray-200">{character.consistencyPrompt}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper components
export const DetailBlock = ({
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

export const DetailBlockWithTags = ({
  title,
  tags,
}: {
  title: string;
  tags: string[];
}) => (
  <div>
    <h3 className="font-medium text-pink-400 mb-2">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <Badge key={index} variant="outline" className="bg-gray-800/40">
          {tag}
        </Badge>
      ))}
    </div>
  </div>
);

export const RightPanelContent = ({
  selectedNode,
}: {
  selectedNode: Node<NodeData<NodeType>>;
}) => {
  switch (selectedNode?.type) {
    case "dialogue":
      return (
        <DialogueViewerPanel
          dialogue={selectedNode.data.properties as unknown as PanelDialogue}
        />
      );
    case "panel":
      return (
        <PanelViewerPanel
          panel={selectedNode.data.properties as unknown as Panel}
        />
      );
    case "scene":
      return (
        <SceneViewerPanel
          scene={selectedNode.data.properties as unknown as Scene}
        />
      );
    case "chapter":
      return (
        <ChapterViewerPanel
          chapter={selectedNode.data.properties as unknown as Chapter}
        />
      );
    case "project":
      return (
        <ProjectViewerPanel
          project={selectedNode.data.properties as unknown as MangaProject}
        />
      );
    case "character":
      return (
        <CharacterViewerPanel
          character={selectedNode.data.properties as unknown as Character}
        />
      );
    default:
      return null;
  }
};

export class RightPanelProps {
  ANIMATION_CONFIG: any;
  rightPanel: any;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  ANIMATION_CONFIG,
  rightPanel,
}) => {
  const { selectedNode } = useVisualEditorStore();

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          key="right-panel"
          initial={{ x: rightPanel.width, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: rightPanel.width, opacity: 0 }}
          transition={ANIMATION_CONFIG}
          className="fixed right-0 top-0 h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border-l border-gray-200/50 dark:border-gray-700/50 flex flex-col z-20"
          style={{ width: `${rightPanel.width}px` }}
        >
          {/* Content */}
          <RightPanelContent selectedNode={selectedNode} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
