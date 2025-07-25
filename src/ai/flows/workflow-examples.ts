import {
  CompleteMangaWorkflow,
  QuickMangaWorkflow,
  getWorkflowProgress,
} from "@/ai/flows/generation-flows";

/**
 * Example usage of the Complete Manga Workflow
 * This demonstrates how to use the new workflow system with error handling and intelligent ordering
 */

// Example 1: Full manga creation with all features
export async function createFullManga(userPrompt: string) {
  try {
    console.log("🚀 Starting Full Manga Creation...");

    const result = await CompleteMangaWorkflow({
      userPrompt,
      includeOutfits: true, // Generate outfit templates for all characters
      includeLocations: true, // Generate location templates for the story
      numberOfChapters: 3, // Create 3 chapters
    });

    console.log(`✅ Full manga created successfully!`);
    console.log(`📁 Project ID: ${result.projectId}`);
    console.log(
      `⏱️ Total time: ${Math.round(result.workflowState.totalDuration / 1000)}s`
    );
    console.log(
      `✅ Completed: ${result.workflowState.completedSteps.join(", ")}`
    );

    if (result.workflowState.errors.length > 0) {
      console.log(
        `⚠️ Errors encountered: ${result.workflowState.errors.length}`
      );
      result.workflowState.errors.forEach((error) => {
        console.log(`   - ${error.step}: ${error.error}`);
      });
    }

    return result;
  } catch (error) {
    console.error("❌ Full manga creation failed:", error);
    throw error;
  }
}

// Example 2: Quick manga creation (story + characters only)
export async function createQuickManga(userPrompt: string) {
  try {
    console.log("⚡ Starting Quick Manga Creation...");

    const result = await QuickMangaWorkflow({
      userPrompt,
    });

    console.log(`✅ Quick manga created successfully!`);
    console.log(`📁 Project ID: ${result.projectId}`);

    return result;
  } catch (error) {
    console.error("❌ Quick manga creation failed:", error);
    throw error;
  }
}

// Example 3: Progressive manga creation with monitoring
export async function createMangaWithProgress(
  userPrompt: string,
  chapters: number = 2
) {
  try {
    console.log("📊 Starting Progressive Manga Creation...");

    // Start the workflow
    const workflowPromise = CompleteMangaWorkflow({
      userPrompt,
      includeOutfits: true,
      includeLocations: true,
      numberOfChapters: chapters,
    });

    // Monitor progress (in a real app, you might do this with intervals)
    // For now, we'll just wait for completion
    const result = await workflowPromise;

    // Check final progress
    const progress = await getWorkflowProgress(result.projectId);

    if (progress) {
      console.log("📈 Final Progress Report:");
      console.log(`   📖 Story: ${progress.hasStory ? "✅" : "❌"}`);
      console.log(`   👥 Characters: ${progress.characterCount} created`);
      console.log(`   📚 Chapters: ${progress.chapterCount} created`);
      console.log(`   🏗️ Locations: ${progress.locationCount} created`);
      console.log(`   👔 Outfits: ${progress.outfitCount} created`);
    }

    return result;
  } catch (error) {
    console.error("❌ Progressive manga creation failed:", error);
    throw error;
  }
}

// Example 4: Custom workflow configuration
export async function createCustomManga(config: {
  userPrompt: string;
  chapters: number;
  includeOutfits: boolean;
  includeLocations: boolean;
}) {
  try {
    console.log("⚙️ Starting Custom Manga Creation...");
    console.log(`   📖 Chapters: ${config.chapters}`);
    console.log(`   👔 Outfits: ${config.includeOutfits ? "Yes" : "No"}`);
    console.log(`   🏗️ Locations: ${config.includeLocations ? "Yes" : "No"}`);

    const result = await CompleteMangaWorkflow({
      userPrompt: config.userPrompt,
      includeOutfits: config.includeOutfits,
      includeLocations: config.includeLocations,
      numberOfChapters: config.chapters,
    });

    console.log(`✅ Custom manga created successfully!`);
    return result;
  } catch (error) {
    console.error("❌ Custom manga creation failed:", error);
    throw error;
  }
}

// Example 5: Workflow with error recovery
export async function createMangaWithRetry(
  userPrompt: string,
  maxRetries: number = 2
) {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Manga creation attempt ${attempt}/${maxRetries}`);

      const result = await CompleteMangaWorkflow({
        userPrompt,
        includeOutfits: true,
        includeLocations: true,
        numberOfChapters: 2,
      });

      console.log(`✅ Manga created successfully on attempt ${attempt}!`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        console.log(`⏳ Waiting before retry...`);
        await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay
      }
    }
  }

  throw new Error(
    `Failed to create manga after ${maxRetries} attempts. Last error: ${lastError?.message}`
  );
}

// Example usage in your application:
/*

// Basic usage:
const result = await createFullManga("Create a sci-fi manga about time travel");

// Quick creation:
const quickResult = await createQuickManga("Create a romance manga in high school");

// Progressive with monitoring:
const progressResult = await createMangaWithProgress("Create a fantasy manga with magic", 3);

// Custom configuration:
const customResult = await createCustomManga({
  userPrompt: "Create an action manga about ninjas",
  chapters: 5,
  includeOutfits: true,
  includeLocations: false, // Skip locations for faster creation
});

// With retry logic:
const retryResult = await createMangaWithRetry("Create a mystery manga in a small town");

*/

export default {
  createFullManga,
  createQuickManga,
  createMangaWithProgress,
  createCustomManga,
  createMangaWithRetry,
};
