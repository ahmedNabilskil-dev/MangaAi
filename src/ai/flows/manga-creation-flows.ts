import { ai } from "@/ai/ai-instance";
import { getProjectWithRelations } from "@/services/db";
import { z } from "zod";
import {
  CharacterGenerationPrompt,
  LocationTemplateGenerationPrompt,
  OutfitTemplateGenerationPrompt,
  StoryGenerationPrompt,
} from "./generation-flows";

// Main Manga Creation Flow - Creates project with characters, locations, and outfits
export const CreateMangaFlow = ai.defineFlow(
  {
    name: "Create Manga Project",
    inputSchema: z.object({
      storyIdea: z.string().describe("The user's story idea or concept"),
    }),
    outputSchema: z.object({
      projectId: z.string(),
      initialMessages: z.array(z.any()),
      summary: z.object({
        charactersCreated: z.number(),
        locationsCreated: z.number(),
        outfitsCreated: z.number(),
        totalDuration: z.number(),
      }),
    }),
  },
  async ({ storyIdea }) => {
    const startTime = Date.now();
    const messages: any[] = [];

    try {
      console.log("🚀 Starting Manga Project Creation");
      console.log(`� Story Idea: ${storyIdea}`);

      // Phase 1: Create Project Foundation
      console.log("\n=== Phase 1: Creating Project Foundation ===");
      const story = await StoryGenerationPrompt({ userInput: storyIdea });

      if (!story.output?.projectId) {
        throw new Error("Failed to create project foundation");
      }

      const projectId = story.output.projectId;
      messages.push(
        { role: "user", content: storyIdea },
        { role: "assistant", content: story.output }
      );

      console.log(`✅ Project created: ${projectId}`);

      // Phase 2: Create Main Characters
      console.log("\n=== Phase 2: Creating Main Characters ===");
      const projectContext = await getProjectWithRelations(projectId);

      const characterPrompt = `Create the main character cast for this manga project:

MAIN CHARACTER REQUIREMENTS:
1. **Protagonist** (role: "protagonist") - The main character who drives the story
2. **Antagonist** (role: "antagonist") - The primary opposing force or rival
3. **Supporting Characters** (role: "supporting") - 2-3 key supporting characters who play important roles

CHARACTER DESIGN SPECIFICATIONS:
- Create characters with detailed visual descriptions and personalities
- Ensure each character has a unique role and purpose in the story
- Design characters that fit the manga's genre, setting, and themes
- Include detailed physical descriptions for consistent visual representation
- Create characters with clear relationships and dynamics
- Ensure characters are visually distinctive and memorable

Focus on quality over quantity - create essential characters that will drive the story forward.`;

      const characterRes = await CharacterGenerationPrompt({
        userInput: characterPrompt,
        projectContext: projectContext,
      });

      messages.push(
        { role: "user", content: "Create main character cast" },
        { role: "assistant", content: characterRes.output }
      );

      console.log("✅ Main characters created");

      // Phase 3: Create Essential Locations
      console.log("\n=== Phase 3: Creating Essential Locations ===");
      const updatedProject = await getProjectWithRelations(projectId);

      const locationPrompt = `Create essential location templates for this manga project:

PROJECT CONTEXT:
- Title: ${updatedProject?.title}
- Genre: ${updatedProject?.genre}
- Setting: ${updatedProject?.worldDetails?.summary}

LOCATION REQUIREMENTS:
Create 3-5 essential locations that will be central to the story:

1. **Main Setting** - The primary location where most of the story takes place
2. **Character Home/Base** - Where main characters live or gather
3. **Conflict Location** - Where major confrontations or important events occur
4. **Social/Interaction Space** - Where characters meet and interact
5. **Unique Story Location** - A location specific to this manga's world or plot

DESIGN SPECIFICATIONS:
- Create locations that support the story's themes and atmosphere
- Include both interior and exterior locations for variety
- Design locations that can be reused across multiple scenes
- Ensure locations fit the established world and genre
- Create detailed descriptions for consistent visual representation
- Include multiple camera angles for each location (3-5 angles per location)

Focus on creating a solid foundation of memorable, reusable locations.`;

      const locationRes = await LocationTemplateGenerationPrompt({
        userInput: locationPrompt,
        projectContext: updatedProject,
      });

      messages.push(
        { role: "user", content: "Create essential locations" },
        { role: "assistant", content: locationRes.output }
      );

      console.log("✅ Essential locations created");

      // Phase 4: Create Default Outfits for Main Characters
      console.log("\n=== Phase 4: Creating Default Outfits ===");
      const finalProject = await getProjectWithRelations(projectId);
      const characters = finalProject?.characters || [];
      let outfitsCreated = 0;

      // Create default outfits for protagonist and antagonist
      const mainCharacters = characters.filter(
        (c) => c.role === "protagonist" || c.role === "antagonist"
      );

      for (const character of mainCharacters) {
        try {
          console.log(`👔 Creating default outfit for ${character.name}`);

          const outfitPrompt = `Create a default outfit template for ${character.name}:

CHARACTER CONTEXT:
- Name: ${character.name}
- Role: ${character.role}
- Age: ${character.age}
- Personality: ${character.personality}
- Description: ${character.briefDescription}

OUTFIT REQUIREMENTS:
- Design the character's signature/default outfit
- This will be their most recognizable appearance
- Make the outfit reflect their personality and role in the story
- Ensure it fits the manga's setting and genre
- Create detailed specifications for consistent reproduction
- Consider practicality for the character's activities and lifestyle

This should be the outfit readers immediately associate with this character.`;

          const outfitRes = await OutfitTemplateGenerationPrompt({
            userInput: outfitPrompt,
            projectContext: finalProject,
            characterContext: character,
            existingCharacters: characters,
          });

          messages.push(
            {
              role: "user",
              content: `Create default outfit for ${character.name}`,
            },
            { role: "assistant", content: outfitRes.output }
          );

          outfitsCreated++;
          console.log(`✅ Default outfit created for ${character.name}`);
        } catch (error) {
          console.warn(
            `⚠️ Failed to create outfit for ${character.name}:`,
            error
          );
        }
      }

      const totalDuration = Date.now() - startTime;

      console.log("\n🎉 Manga Project Creation Completed Successfully!");
      console.log(`⏱️ Total Duration: ${Math.round(totalDuration / 1000)}s`);
      console.log(`📊 Summary:`);
      console.log(`   - Characters: ${characters.length}`);
      console.log(
        `   - Locations: ${finalProject?.locationTemplates?.length || 0}`
      );
      console.log(`   - Outfits: ${outfitsCreated}`);

      return {
        projectId,
        initialMessages: messages,
        summary: {
          charactersCreated: characters.length,
          locationsCreated: finalProject?.locationTemplates?.length || 0,
          outfitsCreated,
          totalDuration,
        },
      };
    } catch (error: any) {
      console.error("❌ Manga Project Creation failed:", error);
      throw new Error(`Failed to create manga project: ${error.message}`);
    }
  }
);

// Alias for backwards compatibility
export const CreateMangaFlowEnhanced = CreateMangaFlow;
