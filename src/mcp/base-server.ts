import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodSchemaToMcpSchema } from "./utils/schema-converter.js";

// Import tool handlers
import {
  createChapterHandler,
  createCharacterHandler,
  createLocationTemplateHandler,
  createOutfitTemplateHandler,
  createPanelHandler,
  createProjectHandler,
  createSceneHandler,
} from "./tools/creation-tools.js";

import {
  deleteChapterHandler,
  deleteCharacterHandler,
  deleteLocationTemplateHandler,
  deleteOutfitTemplateHandler,
  deletePanelHandler,
  deleteProjectHandler,
  deleteSceneHandler,
} from "./tools/delete-tools.js";

import {
  getChapterHandler,
  getCharacterHandler,
  getLocationTemplateHandler,
  getOutfitTemplateHandler,
  getPanelHandler,
  getProjectHandler,
  getSceneHandler,
  listLocationTemplatesHandler,
  listOutfitTemplatesHandler,
  listProjectsHandler,
} from "./tools/fetch-tools.js";

import {
  updateChapterHandler,
  updateCharacterHandler,
  updateLocationTemplateHandler,
  updateOutfitTemplateHandler,
  updatePanelHandler,
  updateProjectHandler,
  updateSceneHandler,
} from "./tools/update-tools.js";

// Import schemas
import { z } from "zod";
import {
  chapterSchema,
  characterSchema,
  locationTemplateSchema,
  mangaProjectSchema,
  outfitTemplateSchema,
  panelSchema,
  sceneSchema,
} from "../types/schemas.js";
import { mangaCreationPrompts } from "./prompts/manga-prompts.js";
import {
  getChapterResourceHandler,
  getCharacterResourceHandler,
  getLocationTemplateResourceHandler,
  getOutfitTemplateResourceHandler,
  getPanelResourceHandler,
  getProjectResourceHandler,
  getSceneResourceHandler,
  listLocationTemplatesResourceHandler,
  listOutfitTemplatesResourceHandler,
  listProjectsResourceHandler,
} from "./resources/manga-resources.js";

export abstract class BaseMangaAiMcpServer {
  protected server: Server;
  protected sessionState: {
    currentProjectId?: string;
    projectName?: string;
  } = {};

  constructor() {
    this.server = new Server(
      {
        name: "manga-ai-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Session Management Tools
          {
            name: "setCurrentProject",
            description:
              "Sets the current project for the session. All subsequent operations will use this project context.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                projectId: z
                  .string()
                  .describe("ID of the project to set as current"),
              })
            ),
          },
          {
            name: "getCurrentProject",
            description:
              "Gets the current project information for the session.",
            inputSchema: zodSchemaToMcpSchema(z.object({})),
          },
          {
            name: "clearCurrentProject",
            description: "Clears the current project from the session.",
            inputSchema: zodSchemaToMcpSchema(z.object({})),
          },

          // Creation Tools (now work within current project context)
          {
            name: "createProject",
            description:
              "Creates a new manga project and automatically sets it as the current project for the session.",
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
                initialPrompt: true,
                createdAt: true,
                updatedAt: true,
              })
            ),
          },
          {
            name: "createChapter",
            description:
              "Creates a new chapter within the current project. Requires a project to be set in the session.",
            inputSchema: zodSchemaToMcpSchema(
              chapterSchema.omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                scenes: true,
                coverImageUrl: true,
                isAiGenerated: true,
                isPublished: true,
                viewCount: true,
                mangaProjectId: true, // Removed since we'll use session context
              })
            ),
          },
          {
            name: "createScene",
            description: "Creates a new scene within a specific chapter.",
            inputSchema: zodSchemaToMcpSchema(
              sceneSchema
                .omit({
                  id: true,
                  createdAt: true,
                  updatedAt: true,
                  panels: true,
                  isAiGenerated: true,
                })
                .extend({
                  chapterId: z
                    .string()
                    .describe("The ID of the parent chapter."),
                })
            ),
          },
          {
            name: "createPanel",
            description: "Creates a new panel within a specific scene.",
            inputSchema: zodSchemaToMcpSchema(
              panelSchema
                .omit({
                  id: true,
                  createdAt: true,
                  updatedAt: true,
                  dialogues: true,
                  characters: true,
                  imageUrl: true,
                  isAiGenerated: true,
                  sceneId: true,
                })
                .extend({
                  sceneId: z.string().describe("The ID of the parent scene."),
                  characterNames: z
                    .array(z.string())
                    .optional()
                    .describe("Names of characters present in this panel."),
                })
            ),
          },
          {
            name: "createCharacter",
            description:
              "Creates a new character profile within the current project. Requires a project to be set in the session.",
            inputSchema: zodSchemaToMcpSchema(
              characterSchema.omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                isAiGenerated: true,
                mangaProjectId: true, // Removed since we'll use session context
              })
            ),
          },

          // Update Tools
          {
            name: "updateProject",
            description: "Updates fields of an existing manga project.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                projectId: z.string().describe("ID of the project to update"),
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
                  .describe("Fields to update"),
              })
            ),
          },
          {
            name: "updateChapter",
            description: "Updates fields of an existing chapter.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                chapterId: z.string().describe("ID of the chapter to update"),
                updates: chapterSchema
                  .omit({
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    scenes: true,
                    mangaProjectId: true,
                    coverImageUrl: true,
                    isAiGenerated: true,
                    isPublished: true,
                    viewCount: true,
                  })
                  .partial()
                  .describe("Fields to update"),
              })
            ),
          },
          {
            name: "updateScene",
            description: "Updates fields of an existing scene.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                sceneId: z.string().describe("ID of the scene to update"),
                updates: sceneSchema
                  .omit({
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    panels: true,
                    chapterId: true,
                    isAiGenerated: true,
                  })
                  .partial()
                  .describe("Fields to update"),
              })
            ),
          },
          {
            name: "updatePanel",
            description:
              "Updates fields of an existing panel (excluding character list).",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                panelId: z.string().describe("ID of the panel to update"),
                updates: panelSchema
                  .omit({
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    dialogues: true,
                    characters: true,
                    sceneId: true,
                    imageUrl: true,
                    isAiGenerated: true,
                  })
                  .partial()
                  .describe("Fields to update"),
              })
            ),
          },
          {
            name: "updateCharacter",
            description: "Updates fields of an existing character.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                characterId: z
                  .string()
                  .describe("ID of the character to update"),
                updates: characterSchema
                  .omit({
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    mangaProjectId: true,
                    isAiGenerated: true,
                  })
                  .partial()
                  .describe("Fields to update"),
              })
            ),
          },

          // Delete Tools
          {
            name: "deleteProject",
            description:
              "Deletes an entire manga project and ALL its associated data (chapters, scenes, characters, etc.). This action is IRREVERSIBLE.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                projectId: z.string().describe("ID of the project to delete"),
                confirmation: z
                  .boolean()
                  .describe("Must be true to confirm deletion"),
              })
            ),
          },
          {
            name: "deleteChapter",
            description:
              "Deletes a chapter and all its associated scenes and panels.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                chapterId: z.string().describe("ID of the chapter to delete"),
              })
            ),
          },
          {
            name: "deleteScene",
            description: "Deletes a scene and all its associated panels.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                sceneId: z.string().describe("ID of the scene to delete"),
              })
            ),
          },
          {
            name: "deletePanel",
            description: "Deletes a panel and all its associated dialogues.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                panelId: z.string().describe("ID of the panel to delete"),
              })
            ),
          },
          {
            name: "deleteCharacter",
            description:
              "Deletes a character and removes all references to it.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                characterId: z
                  .string()
                  .describe("ID of the character to delete"),
              })
            ),
          },

          // Fetch Tools
          {
            name: "getProject",
            description: "Retrieves complete details of a manga project by ID.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                projectId: z
                  .string()
                  .describe("ID of the manga project to retrieve"),
              })
            ),
          },
          {
            name: "getChapter",
            description: "Retrieves complete details of a chapter by ID.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                chapterId: z.string().describe("ID of the chapter to retrieve"),
              })
            ),
          },
          {
            name: "getScene",
            description: "Retrieves complete details of a scene by ID.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                sceneId: z.string().describe("ID of the scene to retrieve"),
              })
            ),
          },
          {
            name: "getPanel",
            description: "Retrieves complete details of a panel by ID.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                panelId: z.string().describe("ID of the panel to retrieve"),
              })
            ),
          },
          {
            name: "getCharacter",
            description: "Retrieves complete details of a character by ID.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                characterId: z
                  .string()
                  .describe("ID of the character to retrieve"),
              })
            ),
          },
          {
            name: "listProjects",
            description: "Retrieves a list of all manga projects.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                limit: z
                  .number()
                  .int()
                  .positive()
                  .optional()
                  .describe("Maximum number of projects to return"),
                offset: z
                  .number()
                  .int()
                  .nonnegative()
                  .optional()
                  .describe("Number of projects to skip"),
              })
            ),
          },

          // Outfit Template Tools
          {
            name: "createOutfitTemplate",
            description:
              "Creates a new outfit template for the current project. Requires a project to be set in the session.",
            inputSchema: zodSchemaToMcpSchema(
              outfitTemplateSchema.omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                variations: true,
                imageUrl: true,
                isActive: true,
                mangaProjectId: true, // Will use session context
              })
            ),
          },
          {
            name: "getOutfitTemplate",
            description:
              "Retrieves complete details of an outfit template by ID.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                outfitTemplateId: z
                  .string()
                  .describe("ID of the outfit template to retrieve"),
              })
            ),
          },
          {
            name: "updateOutfitTemplate",
            description: "Updates fields of an existing outfit template.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                outfitTemplateId: z
                  .string()
                  .describe("ID of the outfit template to update"),
                updates: outfitTemplateSchema
                  .omit({
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    mangaProjectId: true,
                  })
                  .partial()
                  .describe("Fields to update"),
              })
            ),
          },
          {
            name: "deleteOutfitTemplate",
            description: "Deletes an outfit template and all its variations.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                outfitTemplateId: z
                  .string()
                  .describe("ID of the outfit template to delete"),
              })
            ),
          },
          {
            name: "listOutfitTemplates",
            description: "Retrieves a list of outfit templates for a project.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                mangaProjectId: z
                  .string()
                  .optional()
                  .describe("ID of the manga project"),
                category: z
                  .string()
                  .optional()
                  .describe("Filter by outfit category"),
                gender: z.string().optional().describe("Filter by gender"),
                limit: z
                  .number()
                  .int()
                  .positive()
                  .optional()
                  .describe("Maximum number to return"),
                offset: z
                  .number()
                  .int()
                  .nonnegative()
                  .optional()
                  .describe("Number to skip"),
              })
            ),
          },

          // Location Template Tools
          {
            name: "createLocationTemplate",
            description:
              "Creates a new location template for the current project. Requires a project to be set in the session.",
            inputSchema: zodSchemaToMcpSchema(
              locationTemplateSchema.omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                variations: true,
                imageUrl: true,
                isActive: true,
                mangaProjectId: true, // Will use session context
              })
            ),
          },
          {
            name: "getLocationTemplate",
            description:
              "Retrieves complete details of a location template by ID.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                locationTemplateId: z
                  .string()
                  .describe("ID of the location template to retrieve"),
              })
            ),
          },
          {
            name: "updateLocationTemplate",
            description: "Updates fields of an existing location template.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                locationTemplateId: z
                  .string()
                  .describe("ID of the location template to update"),
                updates: locationTemplateSchema
                  .omit({
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    mangaProjectId: true,
                  })
                  .partial()
                  .describe("Fields to update"),
              })
            ),
          },
          {
            name: "deleteLocationTemplate",
            description: "Deletes a location template and all its variations.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                locationTemplateId: z
                  .string()
                  .describe("ID of the location template to delete"),
              })
            ),
          },
          {
            name: "listLocationTemplates",
            description:
              "Retrieves a list of location templates for a project.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                mangaProjectId: z
                  .string()
                  .optional()
                  .describe("ID of the manga project"),
                category: z
                  .string()
                  .optional()
                  .describe("Filter by location category"),
                style: z.string().optional().describe("Filter by art style"),
                limit: z
                  .number()
                  .int()
                  .positive()
                  .optional()
                  .describe("Maximum number to return"),
                offset: z
                  .number()
                  .int()
                  .nonnegative()
                  .optional()
                  .describe("Number to skip"),
              })
            ),
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Session management tools
          case "setCurrentProject":
            return await this.setCurrentProjectHandler(args);
          case "getCurrentProject":
            return await this.getCurrentProjectHandler(args);
          case "clearCurrentProject":
            return await this.clearCurrentProjectHandler(args);

          // Creation tools
          case "createProject":
            return await this.createProjectWithSession(args);
          case "createChapter":
            return await this.createChapterWithSession(args);
          case "createScene":
            return await createSceneHandler(args);
          case "createPanel":
            return await createPanelHandler(args);
          case "createCharacter":
            return await this.createCharacterWithSession(args);

          // Update tools
          case "updateProject":
            return await updateProjectHandler(args);
          case "updateChapter":
            return await updateChapterHandler(args);
          case "updateScene":
            return await updateSceneHandler(args);
          case "updatePanel":
            return await updatePanelHandler(args);
          case "updateCharacter":
            return await updateCharacterHandler(args);

          // Delete tools
          case "deleteProject":
            return await deleteProjectHandler(args);
          case "deleteChapter":
            return await deleteChapterHandler(args);
          case "deleteScene":
            return await deleteSceneHandler(args);
          case "deletePanel":
            return await deletePanelHandler(args);
          case "deleteCharacter":
            return await deleteCharacterHandler(args);

          // Fetch tools
          case "getProject":
            return await getProjectHandler(args);
          case "getChapter":
            return await getChapterHandler(args);
          case "getScene":
            return await getSceneHandler(args);
          case "getPanel":
            return await getPanelHandler(args);
          case "getCharacter":
            return await getCharacterHandler(args);
          case "listProjects":
            return await listProjectsHandler(args);

          // Outfit Template tools
          case "createOutfitTemplate":
            return await this.createOutfitTemplateWithSession(args);
          case "getOutfitTemplate":
            return await getOutfitTemplateHandler(args);
          case "updateOutfitTemplate":
            return await updateOutfitTemplateHandler(args);
          case "deleteOutfitTemplate":
            return await deleteOutfitTemplateHandler(args);
          case "listOutfitTemplates":
            return await listOutfitTemplatesHandler(args);

          // Location Template tools
          case "createLocationTemplate":
            return await this.createLocationTemplateWithSession(args);
          case "getLocationTemplate":
            return await getLocationTemplateHandler(args);
          case "updateLocationTemplate":
            return await updateLocationTemplateHandler(args);
          case "deleteLocationTemplate":
            return await deleteLocationTemplateHandler(args);
          case "listLocationTemplates":
            return await listLocationTemplatesHandler(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing tool ${name}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupResourceHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "manga://projects",
            name: "Manga Projects",
            description: "List of all manga projects",
            mimeType: "application/json",
          },
          {
            uri: "manga://outfit-templates",
            name: "Outfit Templates",
            description: "List of all outfit templates",
            mimeType: "application/json",
          },
          {
            uri: "manga://location-templates",
            name: "Location Templates",
            description: "List of all location templates",
            mimeType: "application/json",
          },
        ],
      };
    });

    // Handle resource requests
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const { uri } = request.params;

        try {
          if (uri === "manga://projects") {
            return await listProjectsResourceHandler();
          } else if (uri === "manga://outfit-templates") {
            return await listOutfitTemplatesResourceHandler(uri);
          } else if (uri === "manga://location-templates") {
            return await listLocationTemplatesResourceHandler(uri);
          } else if (uri.startsWith("manga://project/")) {
            return await getProjectResourceHandler(uri);
          } else if (uri.startsWith("manga://chapter/")) {
            return await getChapterResourceHandler(uri);
          } else if (uri.startsWith("manga://scene/")) {
            return await getSceneResourceHandler(uri);
          } else if (uri.startsWith("manga://panel/")) {
            return await getPanelResourceHandler(uri);
          } else if (uri.startsWith("manga://character/")) {
            return await getCharacterResourceHandler(uri);
          } else if (uri.startsWith("manga://outfit-template/")) {
            return await getOutfitTemplateResourceHandler(uri);
          } else if (uri.startsWith("manga://location-template/")) {
            return await getLocationTemplateResourceHandler(uri);
          } else {
            throw new Error(`Unknown resource: ${uri}`);
          }
        } catch (error) {
          throw new Error(
            `Failed to read resource ${uri}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    );
  }

  private setupPromptHandlers() {
    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      try {
        return {
          prompts: Object.entries(mangaCreationPrompts).map(
            ([key, prompt]) => ({
              name: key,
              description: prompt.description,
              arguments: prompt.arguments || [],
            })
          ),
        };
      } catch (error) {
        console.error("Error listing prompts:", error);
        throw new Error("Failed to list prompts");
      }
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      try {
        const promptTemplate =
          mangaCreationPrompts[
            request.params.name as keyof typeof mangaCreationPrompts
          ];

        if (!promptTemplate) {
          throw new Error(`Prompt not found: ${request.params.name}`);
        }

        // Call the prompt handler with arguments and session context
        const renderedPrompt = await promptTemplate.handler(
          request.params.arguments || {},
          this.sessionState
        );

        return {
          description: promptTemplate.description,
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: renderedPrompt,
              },
            },
          ],
        };
      } catch (error) {
        console.error("Error getting prompt:", error);
        throw new Error(
          `Failed to get prompt: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    });
  }

  // Session management methods
  private async setCurrentProjectHandler(args: any) {
    const { projectId } = args;

    // Verify the project exists
    try {
      const project = await getProjectHandler({ projectId });
      const projectData = JSON.parse(project.content[0].text);

      this.sessionState.currentProjectId = projectId;
      this.sessionState.projectName = projectData.name;

      return {
        content: [
          {
            type: "text",
            text: `Current project set to: ${projectData.name} (ID: ${projectId})`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Project ${projectId} not found: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async getCurrentProjectHandler(args: any) {
    if (!this.sessionState.currentProjectId) {
      return {
        content: [
          {
            type: "text",
            text: "No current project set. Use 'setCurrentProject' to set one.",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              projectId: this.sessionState.currentProjectId,
              projectName: this.sessionState.projectName,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async clearCurrentProjectHandler(args: any) {
    const previousProject =
      this.sessionState.projectName || this.sessionState.currentProjectId;
    this.sessionState.currentProjectId = undefined;
    this.sessionState.projectName = undefined;

    return {
      content: [
        {
          type: "text",
          text: `Cleared current project${
            previousProject ? ` (was: ${previousProject})` : ""
          }`,
        },
      ],
    };
  }

  // Session-aware creation methods
  private async createProjectWithSession(args: any) {
    const result = await createProjectHandler(args);

    // Extract project ID from the result and set as current
    try {
      const projectData = JSON.parse(result.content[0].text);
      this.sessionState.currentProjectId = projectData.id;
      this.sessionState.projectName = projectData.name;

      // Add session info to the response
      const updatedResult = {
        ...result,
        content: [
          result.content[0],
          {
            type: "text",
            text: `\n✓ Project automatically set as current session project.`,
          },
        ],
      };

      return updatedResult;
    } catch (error) {
      // If we can't parse the result, just return the original
      return result;
    }
  }

  private async createChapterWithSession(args: any) {
    if (!this.sessionState.currentProjectId) {
      throw new Error(
        "No current project set. Use 'setCurrentProject' first or create a new project."
      );
    }

    // Add the project ID from session to the args
    const argsWithProject = {
      ...args,
      mangaProjectId: this.sessionState.currentProjectId,
    };

    return await createChapterHandler(argsWithProject);
  }

  private async createCharacterWithSession(args: any) {
    if (!this.sessionState.currentProjectId) {
      throw new Error(
        "No current project set. Use 'setCurrentProject' first or create a new project."
      );
    }

    // Add the project ID from session to the args
    const argsWithProject = {
      ...args,
      mangaProjectId: this.sessionState.currentProjectId,
    };

    return await createCharacterHandler(argsWithProject);
  }

  private async createOutfitTemplateWithSession(args: any) {
    if (!this.sessionState.currentProjectId) {
      throw new Error(
        "No current project set. Use 'setCurrentProject' first or create a new project."
      );
    }

    // Add the project ID from session to the args
    const argsWithProject = {
      ...args,
      mangaProjectId: this.sessionState.currentProjectId,
    };

    return await createOutfitTemplateHandler(argsWithProject);
  }

  private async createLocationTemplateWithSession(args: any) {
    if (!this.sessionState.currentProjectId) {
      throw new Error(
        "No current project set. Use 'setCurrentProject' first or create a new project."
      );
    }

    // Add the project ID from session to the args
    const argsWithProject = {
      ...args,
      mangaProjectId: this.sessionState.currentProjectId,
    };

    return await createLocationTemplateHandler(argsWithProject);
  }

  // Abstract method that concrete implementations must provide
  abstract run(): Promise<void>;
}
