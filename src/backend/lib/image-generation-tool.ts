import { ImageStorage } from "./image-storage";

export interface ImageGenerationTool {
  name: "generate_image";
  description: "Generate manga-style images for characters, locations, panels, or outfits and update the entity with the image URL";
  parameters: {
    type: "object";
    properties: {
      prompt: {
        type: "string";
        description: "Detailed description of what to generate (character, location, panel, outfit)";
      };
      type: {
        type: "string";
        enum: ["character", "location", "panel", "outfit"];
        description: "Type of content to generate";
      };
      entityId?: {
        type: "string";
        description: "Optional ID of the existing entity to update with the generated image";
      };
      entityName?: {
        type: "string";
        description: "Optional name of the existing entity to update (used if entityId not provided)";
      };
      style?: {
        type: "string";
        description: "Specific manga style or artistic direction";
      };
    };
    required: ["prompt", "type"];
  };
}

export const imageGenerationTool: ImageGenerationTool = {
  name: "generate_image",
  description:
    "Generate manga-style images for characters, locations, panels, or outfits and update the entity with the image URL",
  parameters: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description:
          "Detailed description of what to generate (character, location, panel, outfit)",
      },
      type: {
        type: "string",
        enum: ["character", "location", "panel", "outfit"],
        description: "Type of content to generate",
      },
      entityId: {
        type: "string",
        description:
          "Optional ID of the existing entity to update with the generated image",
      },
      entityName: {
        type: "string",
        description:
          "Optional name of the existing entity to update (used if entityId not provided)",
      },
      style: {
        type: "string",
        description: "Specific manga style or artistic direction",
      },
    },
    required: ["prompt", "type"],
  },
};

export async function executeImageGeneration(
  args: {
    prompt: string;
    type: string;
    style?: string;
    entityId?: string;
    entityName?: string;
  },
  mcpActions?: any
): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string;
  entityUpdated?: boolean;
}> {
  try {
    // Use backend AI service directly
    const { aiService } = await import(
      "@/backend/services/ai-service-instance"
    ); // Get API key from localStorage (or wherever it's stored)
    const apiKey =
      typeof window !== "undefined" ? localStorage.getItem("api-key") : null;
    if (!apiKey) {
      throw new Error("API key not found. Please set your API key first.");
    }

    // Configure AI service
    aiService.setApiKey(apiKey);
    aiService.setProvider("gemini");

    // Create enhanced prompt based on type and style
    let enhancedPrompt = args.prompt;

    // Add type-specific enhancements
    switch (args.type) {
      case "character":
        enhancedPrompt = `Create a detailed manga-style character: ${args.prompt}. Use clean line art, expressive features, and dynamic poses typical of manga illustration.`;
        break;
      case "location":
        enhancedPrompt = `Create a detailed manga-style background/location: ${args.prompt}. Use perspective, atmospheric effects, and detailed environmental elements.`;
        break;
      case "panel":
        enhancedPrompt = `Create a manga panel/scene: ${args.prompt}. Include proper composition, action lines, and visual storytelling elements.`;
        break;
      case "outfit":
        enhancedPrompt = `Create a detailed manga-style outfit design: ${args.prompt}. Focus on clothing details, fabric textures, and fashion elements.`;
        break;
    }

    // Add style if specified
    if (args.style) {
      enhancedPrompt += ` Style: ${args.style}`;
    }

    // Generate image using AI service
    const result = await aiService.generateImage(enhancedPrompt, []);

    if (!result.image46) {
      throw new Error("No image generated");
    }

    // Convert base64 to full data URL
    const imageDataUrl = `data:image/jpeg;base64,${result.image46}`;

    // Upload to ImgBB using ImageStorage
    const permanentUrl = await ImageStorage.uploadImage(
      imageDataUrl,
      `manga_${args.type}_${Date.now()}`
    );

    let entityUpdated = false;

    // Update entity with generated image URL if entityId or entityName provided
    if (mcpActions && (args.entityId || args.entityName)) {
      try {
        const updateData = {
          [`${args.type === "character" ? "imgUrl" : "imageUrl"}`]:
            permanentUrl,
        };

        if (args.entityId) {
          // Update by ID
          switch (args.type) {
            case "character":
              await mcpActions.callTool("updateCharacter", {
                characterId: args.entityId,
                updates: updateData,
              });
              break;
            case "location":
              await mcpActions.callTool("updateLocationTemplate", {
                locationTemplateId: args.entityId,
                updates: updateData,
              });
              break;
            case "outfit":
              await mcpActions.callTool("updateOutfitTemplate", {
                outfitTemplateId: args.entityId,
                updates: updateData,
              });
              break;
          }
          entityUpdated = true;
        } else if (args.entityName) {
          // Find entity by name and update
          // This would require additional list/search functionality
          console.log(
            `Would update ${args.type} named "${args.entityName}" with image URL`
          );
        }
      } catch (error) {
        console.error("Failed to update entity with image URL:", error);
        // Don't fail the whole operation if entity update fails
      }
    }

    return {
      success: true,
      imageUrl: permanentUrl,
      entityUpdated,
    };
  } catch (error: any) {
    console.error("Image generation error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate image",
      entityUpdated: false,
    };
  }
}
