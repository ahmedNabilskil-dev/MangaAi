import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import {
  deleteEntityHandler,
  getEntityHandler,
  listEntitiesHandler,
} from "./handlers/generic-tools.js";

export const genericTools: RegisteredTool[] = [
  {
    name: "getEntity",
    description: `Retrieves complete details of any entity by its type and ID.

Supported entity types:
- project: Manga project details
- chapter: Chapter details with context  
- scene: Scene details with context
- panel: Panel details with context
- character: Character details with context
- dialogue: Panel dialogue details with context
- outfitTemplate: Outfit template details
- locationTemplate: Location template details

Examples:
- Get project: entityType="project", entityId="proj_123"
- Get chapter: entityType="chapter", entityId="ch_456"  
- Get character: entityType="character", entityId="char_789"`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        entityType: z
          .enum([
            "project",
            "chapter",
            "scene",
            "panel",
            "character",
            "dialogue",
            "outfitTemplate",
            "locationTemplate",
          ])
          .describe("The type of entity to retrieve"),
        entityId: z
          .string()
          .describe("The unique identifier of the entity to retrieve"),
      })
    ),
    handler: getEntityHandler,
  },
  {
    name: "listEntities",
    description: `Lists entities of a specified type with optional parent context.

Supported entity types and their required parent context:
- projects: Lists all projects (no parent needed)
- chapters: Lists chapters in a project (parentId = projectId)
- scenes: Lists scenes in a chapter (parentId = chapterId)  
- panels: Lists panels in a scene (parentId = sceneId)
- characters: Lists characters in a project (parentId = projectId)
- dialogues: Lists dialogues in a panel (parentId = panelId)
- outfitTemplates: Lists outfit templates for a project (parentId = projectId)
- locationTemplates: Lists location templates for a project (parentId = projectId)

Examples:
- List all projects: entityType="projects"
- List chapters: entityType="chapters", parentId="proj_123"
- List scenes: entityType="scenes", parentId="ch_456"
- List characters: entityType="characters", parentId="proj_123"`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        entityType: z
          .enum([
            "projects",
            "chapters",
            "scenes",
            "panels",
            "characters",
            "dialogues",
            "outfitTemplates",
            "locationTemplates",
          ])
          .describe("The type of entities to list (plural form)"),
        parentId: z
          .string()
          .optional()
          .describe(
            "Parent entity ID when required (e.g., projectId for chapters, chapterId for scenes)"
          ),
        filters: z
          .record(z.any())
          .optional()
          .describe(
            "Additional filters to apply (e.g., publishedOnly, role, etc.)"
          ),
      })
    ),
    handler: listEntitiesHandler,
  },
  {
    name: "deleteEntity",
    description: `Deletes any entity by its type and ID with optional confirmation requirements.

Supported entity types:
- project: Manga project (requires confirmation=true)
- chapter: Chapter and all its related scenes and panels
- scene: Scene and all its panels from the chapter
- panel: Panel and all its dialogues from the scene
- character: Character from the project
- dialogue: Panel dialogue from the panel
- outfitTemplate: Outfit template from the project
- locationTemplate: Location template from the project

Examples:
- Delete project: entityType="project", entityId="proj_123", confirmation=true
- Delete chapter: entityType="chapter", entityId="ch_456"
- Delete character: entityType="character", entityId="char_789"

Note: Project deletion requires explicit confirmation=true parameter for safety.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        entityType: z
          .enum([
            "project",
            "chapter",
            "scene",
            "panel",
            "character",
            "dialogue",
            "outfitTemplate",
            "locationTemplate",
          ])
          .describe("The type of entity to delete"),
        entityId: z
          .string()
          .describe("The unique identifier of the entity to delete"),
        confirmation: z
          .boolean()
          .optional()
          .describe(
            "Required confirmation for project deletion (set to true for projects)"
          ),
      })
    ),
    handler: deleteEntityHandler,
  },
];
