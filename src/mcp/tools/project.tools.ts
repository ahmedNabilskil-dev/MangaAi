import { mangaProjectSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import { createProjectHandler } from "./handlers/creation-tools";
import { deleteProjectHandler } from "./handlers/delete-tools";
import { getProjectHandler } from "./handlers/fetch-tools";
import { updateProjectHandler } from "./handlers/update-tools";

export const projectTools: RegisteredTool[] = [
  {
    name: "createProject",
    description: `Creates a brand new manga project from scratch and automatically sets it as your current working project.

This is your starting point for any new manga creation. The tool takes your core concept and builds a complete project structure with world-building details, themes, plot structure, and metadata.

Perfect for when you have:
- A new story idea you want to develop
- Characters or world concepts you want to explore
- A genre or theme you want to work with
- An artistic vision you want to bring to life

What this tool creates:
- Complete project metadata (title, description, genre targeting)
- Rich world-building foundation (history, society, unique systems)
- Thematic framework (themes, motifs, symbols)
- Basic plot structure (inciting incident, twists, climax, resolution)
- Art style guidelines for consistent visual development
- Searchable tags for organization

The tool automatically becomes your current project, so you can immediately start creating characters and chapters.

Best practices:
- Provide a clear, inspiring concept as your foundation
- Consider your target audience for appropriate content development
- Think about the visual style you want to achieve`,
    inputSchema: zodSchemaToMcpSchema(
      mangaProjectSchema.omit({
        id: true,
        chapters: true,
        characters: true,
        outfitTemplates: true,
        locationTemplates: true,
        coverImageUrl: true,
        status: true,
        tags: true,
        creatorId: true,
        createdAt: true,
        updatedAt: true,
        likeCount: true,
        viewCount: true,
        published: true,
        messages: true,
      })
    ),
    handler: createProjectHandler,
  },
  {
    name: "updateProject",
    description:
      "Updates a project's title, description, genre, world details, or other metadata.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        projectId: z
          .string()
          .describe(
            "Unique identifier of the manga project to update - use listProjects to find project IDs"
          ),
        updates: mangaProjectSchema
          .omit({
            id: true,
            chapters: true,
            characters: true,
            coverImageUrl: true,
            initialPrompt: true,
            status: true,
          })
          .partial()
          .describe(
            "Object containing only the fields you want to update - leave unchanged fields undefined"
          ),
      })
    ),
    handler: updateProjectHandler,
  },
  {
    name: "deleteProject",
    description:
      "Permanently deletes a project and all its content including chapters, scenes, and characters.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        projectId: z
          .string()
          .describe(
            "ID of the project to permanently remove - verify carefully"
          ),
        confirmation: z
          .boolean()
          .describe(
            "Must be explicitly set to true to confirm understanding of irreversible deletion"
          ),
      })
    ),
    handler: deleteProjectHandler,
  },
  {
    name: "getProject",
    description: "Retrieves complete details of a manga project by ID.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        projectId: z.string().describe("ID of the manga project to retrieve"),
      })
    ),
    handler: getProjectHandler,
  },
];
