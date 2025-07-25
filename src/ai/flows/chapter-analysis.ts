/**
 * CHAPTER ANALYSIS PROMPT
 *
 * Simple analysis prompt that checks if new outfit/location templates
 * or variations are needed after chapter creation.
 */

import { ai } from "@/ai/ai-instance";
import {
  createLocationTemplate,
  createLocationVariation,
  createOutfitTemplate,
  createOutfitVariation,
} from "@/services/data-service";
import { z } from "zod";

export const ChapterAnalysisPrompt = ai.definePrompt({
  name: "ChapterAnalysis",
  input: {
    schema: z.object({
      createdChapter: z.any().describe("The newly created chapter data"),
      projectContext: z.any().describe("The manga project context"),
      existingOutfitTemplates: z
        .array(z.any())
        .describe("Current outfit templates"),
      existingLocationTemplates: z
        .array(z.any())
        .describe("Current location templates"),
      existingCharacters: z.array(z.any()).describe("Existing characters"),
      mangaProjectId: z.string().describe("The project ID"),
    }),
  },
  output: {
    schema: z.object({
      needsNewTemplates: z
        .boolean()
        .describe("Whether new templates are needed"),
      analysis: z.string().describe("Analysis of what templates are needed"),

      // Structured output for new outfit templates
      newOutfitTemplates: z
        .array(
          z.object({
            characterId: z
              .string()
              .describe("ID of the character this outfit is for"),
            characterName: z.string().describe("Name of the character"),
            outfitName: z.string().describe("Name of the outfit template"),
            description: z.string().describe("Description of the outfit"),
            occasion: z.string().describe("When this outfit is worn"),
            season: z
              .enum(["spring", "summer", "fall", "winter", "any"])
              .describe("Appropriate season"),
            components: z
              .array(
                z.object({
                  type: z.string().describe("Type of clothing item"),
                  item: z.string().describe("Specific item name"),
                  defaultColor: z.string().optional().describe("Default color"),
                  defaultMaterial: z
                    .string()
                    .optional()
                    .describe("Default material"),
                })
              )
              .describe("Clothing components"),
          })
        )
        .describe("New outfit templates to create"),

      // Structured output for new location templates
      newLocationTemplates: z
        .array(
          z.object({
            locationName: z.string().describe("Name of the location"),
            description: z.string().describe("Description of the location"),
            locationType: z
              .enum(["indoor", "outdoor", "mixed"])
              .describe("Type of location"),
            mood: z.string().describe("Overall mood/atmosphere"),
            lightingConditions: z.string().describe("Default lighting"),
            keyElements: z.array(z.string()).describe("Key visual elements"),
            cameraAngles: z
              .array(
                z.object({
                  angleName: z.string().describe("Name of the camera angle"),
                  description: z.string().describe("Description of this angle"),
                  prompt: z.string().describe("AI prompt for this angle"),
                })
              )
              .describe("Available camera angles"),
          })
        )
        .describe("New location templates to create"),

      // Structured output for outfit variations
      outfitVariations: z
        .array(
          z.object({
            baseOutfitId: z.string().describe("ID of the base outfit to vary"),
            baseOutfitName: z.string().describe("Name of the base outfit"),
            variationType: z
              .enum([
                "seasonal",
                "weather",
                "mood",
                "activity",
                "formal",
                "casual",
              ])
              .describe("Type of variation"),
            variationName: z.string().describe("Name for this variation"),
            description: z.string().describe("How this differs from the base"),
            modifications: z.object({
              addComponents: z
                .array(
                  z.object({
                    type: z.string(),
                    item: z.string(),
                    defaultColor: z.string().optional(),
                    defaultMaterial: z.string().optional(),
                  })
                )
                .optional(),
              removeComponents: z.array(z.string()).optional(),
              modifyComponents: z
                .array(
                  z.object({
                    type: z.string(),
                    newItem: z.string().optional(),
                    newColor: z.string().optional(),
                    newMaterial: z.string().optional(),
                  })
                )
                .optional(),
              colorPaletteChanges: z.array(z.string()).optional(),
              materialChanges: z.array(z.string()).optional(),
              seasonOverride: z
                .enum(["spring", "summer", "fall", "winter", "any"])
                .optional(),
            }),
          })
        )
        .describe("Outfit variations to create"),

      // Structured output for location variations
      locationVariations: z
        .array(
          z.object({
            baseLocationId: z
              .string()
              .describe("ID of the base location to vary"),
            baseLocationName: z.string().describe("Name of the base location"),
            variationType: z
              .enum(["time", "weather", "seasonal", "event", "mood"])
              .describe("Type of variation"),
            variationName: z.string().describe("Name for this variation"),
            description: z.string().describe("How this differs from the base"),
            modifications: z.object({
              lightingChanges: z.string().optional(),
              weatherEffects: z.string().optional(),
              seasonalElements: z.string().optional(),
              additionalProps: z.array(z.string()).optional(),
              moodAdjustments: z.string().optional(),
              cameraAngleModifications: z
                .array(
                  z.object({
                    angleName: z.string(),
                    promptChanges: z.string(),
                  })
                )
                .optional(),
            }),
          })
        )
        .describe("Location variations to create"),
    }),
  },
  prompt: `You are analyzing a newly created chapter to determine if new outfit templates, location templates, or variations are needed for the manga project.

## ANALYSIS CONTEXT

**Project:** {{projectContext.title}}
**Genre:** {{projectContext.genre}}
**Art Style:** {{projectContext.artStyle}}

**Newly Created Chapter:**
{{createdChapter}}

**Existing Characters:**
{{#each existingCharacters}}
- {{name}} ({{role}}) - ID: {{id}}
{{/each}}

**Existing Outfit Templates:** {{existingOutfitTemplates.length}} templates
{{#each existingOutfitTemplates}}
- {{name}} for {{characterName}} (ID: {{id}}) - {{description}}
{{/each}}

**Existing Location Templates:** {{existingLocationTemplates.length}} templates  
{{#each existingLocationTemplates}}
- {{name}} (ID: {{id}}) - {{description}}
{{/each}}

## YOUR TASK

Analyze the newly created chapter and identify what templates or variations are needed. Return structured output that lists all required:

1. **New Outfit Templates** - For completely new outfits mentioned in the chapter
2. **New Location Templates** - For new locations mentioned in the chapter
3. **Outfit Variations** - Variations of existing outfits (seasonal, mood, activity)
4. **Location Variations** - Variations of existing locations (time, weather, seasonal)

## DECISION CRITERIA

**Create NEW templates when:**
- A completely new outfit or location is mentioned that doesn't exist
- The chapter introduces a new setting or character outfit concept
- There's a significant new visual element that needs to be standardized

**Create VARIATIONS when:**
- An existing template needs a different version (winter outfit, night scene, etc.)
- The chapter mentions different conditions for existing templates
- Characters need the same basic outfit but in different contexts

## OUTPUT REQUIREMENTS

Return detailed structured output for each needed template/variation. Include all necessary details so the tools can be called later.

**For new outfit templates:**
- Use exact character IDs from the existing characters list
- Provide detailed component breakdowns
- Specify season and occasion

**For new location templates:**
- Include comprehensive descriptions
- Define multiple camera angles
- Specify mood and lighting

**For variations:**
- Reference exact base template IDs from existing templates
- Detail specific modifications needed
- Explain the variation purpose

Be conservative - only suggest templates that are clearly needed and referenced in the chapter. Don't create speculative content.

Set needsNewTemplates to true if ANY templates or variations are needed, false otherwise.`,
});

/**
 * Process the analysis results and create all needed templates/variations
 */
export async function processChapterAnalysisResults(
  analysisResult: any,
  mangaProjectId: string
) {
  const results = {
    success: true,
    createdOutfitTemplates: [] as string[],
    createdLocationTemplates: [] as string[],
    createdOutfitVariations: [] as string[],
    createdLocationVariations: [] as string[],
    errors: [] as string[],
  };

  // Create new outfit templates
  for (const outfit of analysisResult.newOutfitTemplates || []) {
    try {
      const outfitData = {
        name: outfit.outfitName,
        description: outfit.description,
        category: "casual" as const, // Default, can be improved based on analysis
        gender: "unisex" as const, // Default, should be determined from character
        ageGroup: "teen" as const, // Default, should be determined from character
        season: outfit.season,
        style: "manga" as const,
        components: outfit.components.map((comp: any) => ({
          type: comp.type,
          item: comp.item,
          isRequired: true,
          defaultColor: comp.defaultColor,
          defaultMaterial: comp.defaultMaterial,
        })),
        colorSchemes: [], // Default empty
        materials: outfit.components
          .map((comp: any) => comp.defaultMaterial)
          .filter(Boolean),
        occasions: [outfit.occasion],
        compatibility: {
          weather: ["sunny", "cloudy"] as (
            | "sunny"
            | "cloudy"
            | "rainy"
            | "stormy"
            | "snowy"
            | "foggy"
          )[],
          timeOfDay: ["morning", "afternoon", "evening"] as (
            | "dawn"
            | "morning"
            | "noon"
            | "afternoon"
            | "evening"
            | "night"
          )[],
          activities: ["walking", "sitting"],
        },
        tags: [outfit.outfitName.toLowerCase()],
        isActive: true,
        mangaProjectId,
      };

      const createdOutfit = await createOutfitTemplate(outfitData);
      results.createdOutfitTemplates.push(createdOutfit.id);
      console.log(`✅ Created outfit template: ${outfit.outfitName}`);
    } catch (error: any) {
      const errorMsg = `Failed to create outfit template ${outfit.outfitName}: ${error.message}`;
      results.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  // Create new location templates
  for (const location of analysisResult.newLocationTemplates || []) {
    try {
      const locationData = {
        name: location.locationName,
        description: location.description,
        category: (location.locationType === "indoor"
          ? "indoor"
          : "outdoor") as
          | "indoor"
          | "outdoor"
          | "fantasy"
          | "futuristic"
          | "urban"
          | "rural"
          | "historical"
          | "natural"
          | "architectural",
        style: "manga" as const,
        defaultTimeOfDay: "morning" as const,
        defaultWeather: "sunny" as const,
        defaultMood: location.mood || "peaceful",
        cameraAngles: location.cameraAngles?.map(
          (angle: any) => angle.angleName
        ) || ["wide-shot", "medium-shot"],
        props: location.keyElements || [],
        colors: [], // Default empty
        tags: [location.locationName.toLowerCase()],
        isActive: true,
        mangaProjectId,
      };

      const createdLocation = await createLocationTemplate(locationData);
      results.createdLocationTemplates.push(createdLocation.id);
      console.log(`✅ Created location template: ${location.locationName}`);
    } catch (error: any) {
      const errorMsg = `Failed to create location template ${location.locationName}: ${error.message}`;
      results.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  // Create outfit variations
  for (const variation of analysisResult.outfitVariations || []) {
    try {
      const variationData = {
        name: variation.variationName,
        description: variation.description,
        componentOverrides:
          variation.modifications.modifyComponents?.map((mod: any) => ({
            componentType: mod.type,
            newItem: mod.newItem || mod.item,
            newColor: mod.newColor,
            newMaterial: mod.newMaterial,
          })) || [],
        additionalComponents:
          variation.modifications.addComponents?.map((comp: any) => ({
            type: comp.type,
            item: comp.item,
            isRequired: false, // Additional components are typically optional
            defaultColor: comp.defaultColor,
            defaultMaterial: comp.defaultMaterial,
          })) || [],
        conditions: {
          weather: variation.modifications.seasonOverride ? [] : undefined,
          activity: [variation.variationType], // Use variation type as activity context
        },
        promptModifiers: [
          ...(variation.modifications.colorPaletteChanges || []),
          ...(variation.modifications.materialChanges || []),
        ],
        isActive: true,
      };

      const createdVariation = await createOutfitVariation(
        variation.baseOutfitId,
        variationData
      );
      results.createdOutfitVariations.push(createdVariation.id);
      console.log(`✅ Created outfit variation: ${variation.variationName}`);
    } catch (error: any) {
      const errorMsg = `Failed to create outfit variation ${variation.variationName}: ${error.message}`;
      results.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  // Create location variations
  for (const variation of analysisResult.locationVariations || []) {
    try {
      const variationData = {
        name: variation.variationName,
        timeOfDay:
          variation.variationType === "time" ? ("evening" as const) : undefined,
        weather:
          variation.variationType === "weather"
            ? ("rainy" as const)
            : undefined,
        mood: variation.modifications.moodAdjustments
          ? ("mysterious" as const)
          : undefined,
        lighting: variation.modifications.lightingChanges
          ? {
              type: "natural" as const,
              intensity: "dim" as const,
              color: variation.modifications.lightingChanges,
            }
          : undefined,
        additionalProps: variation.modifications.additionalProps || [],
        modifiedColors: [], // Could be extracted from modifications
        promptModifiers: [
          variation.modifications.lightingChanges,
          variation.modifications.weatherEffects,
          variation.modifications.seasonalElements,
          variation.modifications.moodAdjustments,
        ].filter(Boolean) as string[],
        isActive: true,
      };

      const createdVariation = await createLocationVariation(
        variation.baseLocationId,
        variationData
      );
      results.createdLocationVariations.push(createdVariation.id);
      console.log(`✅ Created location variation: ${variation.variationName}`);
    } catch (error: any) {
      const errorMsg = `Failed to create location variation ${variation.variationName}: ${error.message}`;
      results.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  results.success = results.errors.length === 0;
  return results;
}
