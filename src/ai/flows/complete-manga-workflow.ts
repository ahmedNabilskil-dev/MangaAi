import { Message } from "@/ai/adapters/type";
import { ai } from "@/ai/ai-instance";
import { getProjectWithRelations } from "@/services/db";
import { z } from "zod";
import {
  ChapterGenerationPrompt,
  CharacterGenerationPrompt,
  LocationTemplateGenerationPrompt,
  OutfitTemplateGenerationPrompt,
  StoryGenerationPrompt,
} from "./generation-flows";

// Configuration for rate limiting and retry logic
const WORKFLOW_CONFIG = {
  MAX_ITERATIONS: 3,
  DELAY_BETWEEN_REQUESTS: 2000, // 2 seconds between requests
  DELAY_BETWEEN_STAGES: 5000, // 5 seconds between major stages
  TIMEOUT_PER_REQUEST: 60000, // 60 seconds timeout per request
};

// Workflow state tracking
interface WorkflowState {
  currentStep: string;
  projectId?: string;
  completedSteps: string[];
  errors: Array<{
    step: string;
    iteration: number;
    error: string;
    timestamp: Date;
  }>;
  messages: Message[];
}

// Utility function for delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Error handling wrapper with retry logic
async function withRetry<T>(
  operation: () => Promise<T>,
  stepName: string,
  maxIterations: number = WORKFLOW_CONFIG.MAX_ITERATIONS
): Promise<T> {
  let lastError: any;

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    try {
      console.log(`[${stepName}] Attempt ${iteration}/${maxIterations}`);

      if (iteration > 1) {
        // Add delay before retry
        await delay(WORKFLOW_CONFIG.DELAY_BETWEEN_REQUESTS);
      }

      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Request timeout")),
            WORKFLOW_CONFIG.TIMEOUT_PER_REQUEST
          )
        ),
      ]);

      console.log(`[${stepName}] Success on attempt ${iteration}`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`[${stepName}] Attempt ${iteration} failed:`, error);

      if (iteration < maxIterations) {
        // Exponential backoff for retries
        const backoffDelay =
          WORKFLOW_CONFIG.DELAY_BETWEEN_REQUESTS * Math.pow(2, iteration - 1);
        console.log(`[${stepName}] Retrying in ${backoffDelay}ms...`);
        await delay(backoffDelay);
      }
    }
  }

  throw new Error(
    `${stepName} failed after ${maxIterations} attempts. Last error: ${
      lastError?.message || "Unknown error"
    }`
  );
}

// Main workflow definition
export const CompleteMangaWorkflow = ai.defineFlow(
  {
    name: "Complete Manga Workflow",
    inputSchema: z.object({
      userPrompt: z.string(),
      includeOutfits: z.boolean().default(true),
      includeLocations: z.boolean().default(true),
      numberOfChapters: z.number().min(1).max(10).default(3),
    }),
    outputSchema: z.object({
      projectId: z.string(),
      workflowState: z.object({
        completedSteps: z.array(z.string()),
        errors: z.array(z.any()),
        totalDuration: z.number(),
      }),
      initialMessages: z.array(z.any()),
    }),
  },
  async ({
    userPrompt,
    includeOutfits,
    includeLocations,
    numberOfChapters,
  }) => {
    const workflowStartTime = Date.now();
    const state: WorkflowState = {
      currentStep: "initialization",
      completedSteps: [],
      errors: [],
      messages: [],
    };

    try {
      console.log("🚀 Starting Complete Manga Workflow");
      console.log(`📝 User Prompt: ${userPrompt}`);
      console.log(`📖 Number of Chapters: ${numberOfChapters}`);
      console.log(`👔 Include Outfits: ${includeOutfits}`);
      console.log(`🏗️ Include Locations: ${includeLocations}`);

      // STEP 1: Project and Story Creation
      state.currentStep = "story_generation";
      console.log("\n=== STEP 1: Story Generation ===");

      const story = await withRetry(
        () => StoryGenerationPrompt({ userInput: userPrompt }),
        "Story Generation"
      );

      state.projectId = story.output?.projectId;
      state.messages.push(
        { role: "user", content: userPrompt },
        { role: "assistant", content: story.output }
      );
      state.completedSteps.push("story_generation");

      console.log(`✅ Project created with ID: ${state.projectId}`);

      // Delay before next major stage
      await delay(WORKFLOW_CONFIG.DELAY_BETWEEN_STAGES);

      // STEP 2: Character Creation
      state.currentStep = "character_generation";
      console.log("\n=== STEP 2: Character Generation ===");

      const characterPrompt = `Create a complete cast of characters for this manga:
      
      1. Create EXACTLY the following character types:
         - 1 Protagonist character (role: "protagonist")
         - 1 Antagonist character (role: "antagonist") 
         - 2-3 Supporting characters (role: "supporting")
         - 2-4 Minor characters (role: "minor")
      
      2. Ensure all characters:
         - Have realistic and culturally appropriate names for the manga setting
         - Have highly detailed and visually descriptive physical and stylistic information
         - Include deep personality descriptions and emotional range
         - Have meaningful backstories that align with the manga's themes
         - Have distinctive features and visual identity anchors to make them memorable
         - Fit consistently into the visual style and tone of the project
         - Have clear relationships and dynamics with other characters
      
      3. Character Distribution Strategy:
         - Protagonist: The main character driving the story
         - Antagonist: The primary opposing force with complex motivations
         - Supporting: Key characters who significantly impact the story
         - Minor: Characters who add depth and authenticity to the world
      
      Make sure all characters feel cohesive within the same world while having distinct personalities, emotional ranges, and visual designs.`;

      let projectContext = await getProjectWithRelations(state.projectId!);

      const characterRes = await withRetry(
        () =>
          CharacterGenerationPrompt({
            userInput: characterPrompt,
            projectContext: projectContext,
          }),
        "Character Generation"
      );

      state.messages.push(
        { role: "user", content: characterPrompt },
        { role: "assistant", content: characterRes.output }
      );
      state.completedSteps.push("character_generation");

      console.log("✅ Characters created successfully");

      // Refresh project context after character creation
      await delay(WORKFLOW_CONFIG.DELAY_BETWEEN_REQUESTS);
      projectContext = await getProjectWithRelations(state.projectId!);

      // STEP 3: Chapter Generation
      state.currentStep = "chapter_generation";
      console.log("\n=== STEP 3: Chapter Generation ===");

      for (let chapterNum = 1; chapterNum <= numberOfChapters; chapterNum++) {
        console.log(`📖 Generating Chapter ${chapterNum}/${numberOfChapters}`);

        const chapterPrompt = `Create Chapter ${chapterNum} of ${numberOfChapters} for this manga.
        
        Chapter Requirements:
        - This is chapter ${chapterNum} of a ${numberOfChapters}-chapter story arc
        - Build upon the established characters and world
        - Advance the main plot while developing character relationships
        - Include compelling dialogue and action sequences
        - End with appropriate pacing for chapter ${chapterNum} (${
          chapterNum === numberOfChapters
            ? "satisfying conclusion"
            : "engaging cliffhanger"
        })
        - Length: 500-800 words of narrative prose
        - Structure: Clear scene divisions suitable for manga panel breakdown
        
        ${
          chapterNum === 1
            ? "This is the opening chapter - establish the world, introduce key characters, and set the main conflict in motion."
            : ""
        }
        ${
          chapterNum === numberOfChapters
            ? "This is the final chapter - bring the current story arc to a satisfying conclusion while leaving room for potential continuation."
            : ""
        }
        
        Focus on creating vivid, panel-ready scenes with strong visual storytelling potential.`;

        const chapterRes = await withRetry(
          () =>
            ChapterGenerationPrompt({
              userInput: chapterPrompt,
              projectContext: projectContext,
              existingChapters: projectContext?.chapters || [],
              existingCharacters: projectContext?.characters || [],
            }),
          `Chapter ${chapterNum} Generation`
        );

        state.messages.push(
          { role: "user", content: chapterPrompt },
          { role: "assistant", content: chapterRes.output }
        );

        // Refresh project context after each chapter
        await delay(WORKFLOW_CONFIG.DELAY_BETWEEN_REQUESTS);
        projectContext = await getProjectWithRelations(state.projectId!);

        console.log(`✅ Chapter ${chapterNum} created successfully`);
      }

      state.completedSteps.push("chapter_generation");

      // Delay before template generation
      await delay(WORKFLOW_CONFIG.DELAY_BETWEEN_STAGES);

      // STEP 4: Location Template Generation (if enabled)
      if (includeLocations) {
        state.currentStep = "location_generation";
        console.log("\n=== STEP 4: Location Template Generation ===");

        const locationPrompt = `Create comprehensive location templates for this manga based on the story, characters, and chapters.
        
        Location Requirements:
        - Analyze the created chapters to identify key locations mentioned or needed
        - Create 5-8 essential locations that support the story
        - Include both interior and exterior locations
        - Prioritize locations where characters spend significant time
        - Ensure locations support the story's themes and atmosphere
        - Create multiple camera angles for each location (3-6 angles per location)
        
        Location Categories to Consider:
        - Main character living/working spaces
        - Important story event locations
        - Regular meeting/interaction places
        - Atmospheric/mood-setting environments
        - Conflict/action scene locations
        
        Focus on locations that will be reused across multiple scenes and chapters.`;

        const locationRes = await withRetry(
          () =>
            LocationTemplateGenerationPrompt({
              userInput: locationPrompt,
              projectContext: projectContext,
            }),
          "Location Template Generation"
        );

        state.messages.push(
          { role: "user", content: locationPrompt },
          { role: "assistant", content: locationRes.output }
        );
        state.completedSteps.push("location_generation");

        console.log("✅ Location templates created successfully");

        // Refresh project context after location creation
        await delay(WORKFLOW_CONFIG.DELAY_BETWEEN_REQUESTS);
        projectContext = await getProjectWithRelations(state.projectId!);
      }

      // STEP 5: Outfit Template Generation (if enabled)
      if (includeOutfits) {
        state.currentStep = "outfit_generation";
        console.log("\n=== STEP 5: Outfit Template Generation ===");

        // Generate outfits for each character
        const characters = projectContext?.characters || [];

        for (let i = 0; i < characters.length; i++) {
          const character = characters[i];
          console.log(
            `👔 Generating outfits for ${character.name} (${i + 1}/${
              characters.length
            })`
          );

          const outfitPrompt = `Create a comprehensive outfit template system for ${character.name}.
          
          Character Context:
          - Name: ${character.name}
          - Role: ${character.role}
          - Personality: ${character.personality}
          - Brief Description: ${character.briefDescription}
          - Backstory: ${character.backstory}
          
          Outfit Requirements:
          - Create 3-5 different outfit templates for this character
          - Include at least one default/signature outfit (set isDefault: true for one)
          - Consider the character's role, personality, and story context
          - Include outfits for different situations (casual, formal, special occasions)
          - Ensure visual consistency across all outfits
          - Make outfits appropriate for the manga's setting and genre
          
          Outfit Categories to Include:
          - Default/Signature outfit (most recognizable)
          - Casual everyday wear
          - Formal/special occasion (if relevant to story)
          - Activity-specific outfit (if character has specific hobbies/job)
          - Seasonal variation (if relevant)
          
          Focus on creating distinctive outfits that reflect the character's personality and role in the story.`;

          const outfitRes = await withRetry(
            () =>
              OutfitTemplateGenerationPrompt({
                userInput: outfitPrompt,
                projectContext: projectContext,
                characterContext: character,
                existingCharacters: characters,
              }),
            `Outfit Generation for ${character.name}`
          );

          state.messages.push(
            { role: "user", content: outfitPrompt },
            { role: "assistant", content: outfitRes.output }
          );

          // Add delay between character outfit generations
          if (i < characters.length - 1) {
            await delay(WORKFLOW_CONFIG.DELAY_BETWEEN_REQUESTS);
          }

          console.log(`✅ Outfits created for ${character.name}`);
        }

        state.completedSteps.push("outfit_generation");
      }

      // Final project refresh
      await delay(WORKFLOW_CONFIG.DELAY_BETWEEN_REQUESTS);
      const finalProjectContext = await getProjectWithRelations(
        state.projectId!
      );

      const workflowEndTime = Date.now();
      const totalDuration = workflowEndTime - workflowStartTime;

      console.log("\n🎉 Complete Manga Workflow Finished Successfully!");
      console.log(`⏱️ Total Duration: ${Math.round(totalDuration / 1000)}s`);
      console.log(`✅ Completed Steps: ${state.completedSteps.join(", ")}`);
      console.log(`❌ Errors: ${state.errors.length}`);

      if (finalProjectContext) {
        console.log(`📊 Final Project Stats:`);
        console.log(
          `   - Characters: ${finalProjectContext.characters?.length || 0}`
        );
        console.log(
          `   - Chapters: ${finalProjectContext.chapters?.length || 0}`
        );
        console.log(
          `   - Locations: ${
            finalProjectContext.locationTemplates?.length || 0
          }`
        );
        console.log(
          `   - Outfits: ${finalProjectContext.outfitTemplates?.length || 0}`
        );
      }

      return {
        projectId: state.projectId!,
        workflowState: {
          completedSteps: state.completedSteps,
          errors: state.errors,
          totalDuration,
        },
        initialMessages: state.messages,
      };
    } catch (error) {
      // Log the error and add it to state
      const workflowError = {
        step: state.currentStep,
        iteration: 1,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };

      state.errors.push(workflowError);

      console.error(`❌ Workflow failed at step: ${state.currentStep}`);
      console.error(`Error: ${workflowError.error}`);

      // Return partial results if we have a project ID
      if (state.projectId) {
        const workflowEndTime = Date.now();
        const totalDuration = workflowEndTime - workflowStartTime;

        return {
          projectId: state.projectId,
          workflowState: {
            completedSteps: state.completedSteps,
            errors: state.errors,
            totalDuration,
          },
          initialMessages: state.messages,
        };
      }

      // Re-throw if we don't have a project to return
      throw error;
    }
  }
);

// Quick workflow for basic manga creation (story + characters only)
export const QuickMangaWorkflow = ai.defineFlow(
  {
    name: "Quick Manga Workflow",
    inputSchema: z.object({
      userPrompt: z.string(),
    }),
    outputSchema: z.object({
      projectId: z.string(),
      initialMessages: z.array(z.any()),
    }),
  },
  async ({ userPrompt }) => {
    console.log("🚀 Starting Quick Manga Workflow (Story + Characters only)");

    const result = await CompleteMangaWorkflow({
      userPrompt,
      includeOutfits: false,
      includeLocations: false,
      numberOfChapters: 1,
    });

    return {
      projectId: result.projectId,
      initialMessages: result.initialMessages,
    };
  }
);

// Utility function to get workflow progress
export async function getWorkflowProgress(projectId: string) {
  const project = await getProjectWithRelations(projectId);

  if (!project) {
    return null;
  }

  return {
    projectId,
    hasStory: !!project.title && !!project.description,
    hasCharacters: (project.characters?.length || 0) > 0,
    hasChapters: (project.chapters?.length || 0) > 0,
    hasLocations: (project.locationTemplates?.length || 0) > 0,
    hasOutfits: (project.outfitTemplates?.length || 0) > 0,
    characterCount: project.characters?.length || 0,
    chapterCount: project.chapters?.length || 0,
    locationCount: project.locationTemplates?.length || 0,
    outfitCount: project.outfitTemplates?.length || 0,
  };
}
