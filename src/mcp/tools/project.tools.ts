import { mangaProjectSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import { createOrUpdateProjectHandler } from "./handlers/batch-tools.js";

export const projectTools: RegisteredTool[] = [
  {
    name: "createOrUpdateProject",
    description: `Creates a brand new manga project from scratch OR updates an existing project.

## CREATE MODE (omit 'id' field)
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

## UPDATE MODE (include 'id' field)
Updates an existing project's title, description, genre, world details, or other metadata.

## Usage Examples:
- Create new: {title: "My Manga", description: "...", genre: "action", ...}
- Update existing: {id: "proj_123", title: "Updated Title", description: "..."}

Best practices:
- Provide a clear, inspiring concept as your foundation
- Consider your target audience for appropriate content development
- Think about the visual style you want to achieve`,
    inputSchema: zodSchemaToMcpSchema(
      mangaProjectSchema
        .omit({
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
        .extend({
          id: z
            .string()
            .optional()
            .describe("Include for updates, omit for new projects"),
        })
    ),
    handler: createOrUpdateProjectHandler,
  },
];
