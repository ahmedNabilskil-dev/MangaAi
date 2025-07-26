import { getProjectWithRelations } from "../../services/data-service";

/**
 * MCP Manga Creation Prompts
 *
 * These prompts work like MCP tools - client provides minimal args,
 * MCP handles all data reconstruction and context building internally.
 */
export const mangaCreationPrompts = {
  // ===== USER FACING PROMPTS =====

  "story-generation": {
    name: "story-generation",
    description: "Create a comprehensive manga project from user input",
    arguments: [
      {
        name: "user_input",
        description:
          "The user's concept, genre preferences, or inspiration for the manga",
        required: true,
      },
      {
        name: "target_audience",
        description: "Target demographic for the manga",
        required: false,
        type: "string",
        enum: ["children", "teen", "young-adult", "adult"],
      },
      {
        name: "preferred_genre",
        description: "Preferred genre classification",
        required: false,
        type: "string",
        enum: [
          "action",
          "romance",
          "comedy",
          "horror",
          "fantasy",
          "sci-fi",
          "slice-of-life",
          "drama",
          "adventure",
          "mystery",
          "supernatural",
          "sports",
        ],
      },
    ],
    handler: async (args: any) => {
      const context = {
        user_input: args.user_input,
        target_audience: args.target_audience || "",
        preferred_genre: args.preferred_genre || "",
      };

      return renderPrompt(
        `You are an elite manga creator and narrative worldbuilder with expertise in both Eastern and Western storytelling traditions. Your task is to develop a structured, professional-grade blueprint for a compelling, original manga project that will be stored in our database.

This is Phase 1 of our manga production pipeline. You are building this project from scratch based on the user's ideas, genre preferences, or inspiration.

## OUTPUT REQUIREMENTS
Your output MUST strictly align with our MangaProject entity structure for direct database integration. Include ALL required fields with detailed, creative content.

## PROJECT COMPONENTS

🧩 Core Concept & Metadata
- title: A distinctive, memorable title that encapsulates the core concept and appeals to the target audience.
- description: A concise yet comprehensive overview of the entire manga concept (150-200 words).
- concept: The bold, original premise that defines what makes this story special and distinguishes it from similar works.
- genre: The primary genre classification with potential subgenres (e.g., psychological shonen, dark fantasy seinen).
- targetAudience: MUST be one of ["children", "teen", "young-adult", "adult"].{{#if target_audience}} User preference: {{target_audience}}{{/if}}
- artStyle: Suggest a specific visual aesthetic that enhances the narrative (reference existing artists/styles if helpful).
- tags: An array of precise keywords for searchability (8-12 tags).

🌍 Worldbuilding (worldDetails object)
- summary: A rich overview of the world's unique elements and what makes it captivating (150 words).
- history: Key historical events, eras, and turning points that shaped the world and affect the present story.
- society: In-depth details on cultures, social structures, belief systems, political dynamics, or power hierarchies.
- uniqueSystems: Comprehensive explanation of special systems (magic, technology, supernatural abilities, laws) that define life in this world and their narrative implications.

🎭 Themes, Motifs & Symbols
- themes: Array of sophisticated central themes with depth and nuance (e.g., the corruption of power, sacrifice vs. selfishness).
- motifs: Array of recurring visual/narrative patterns that reinforce themes (e.g., broken mirrors, cherry blossoms).
- symbols: Array of key symbols with layered meanings relevant to character development or world concepts.

🧩 Plot Framework (plotStructure object)
- incitingIncident: The catalyst event that disrupts the status quo and launches the protagonist's journey.
- plotTwist: A major revelation or shift that fundamentally alters the protagonist's path or understanding.
- climax: The peak dramatic moment of the first major arc with high emotional stakes.
- resolution: The current resolution (even if temporary) that sets up future developments.

## CREATION STANDARDS
1. Originality: Develop genuinely fresh concepts while understanding genre traditions
2. Emotional Depth: Create a world and story that can sustain complex emotional narratives
3. Visual Potential: Consider how concepts translate to visual storytelling
4. Internal Consistency: Maintain logical coherence in all worldbuilding elements
5. Narrative Hooks: Build in compelling mysteries and questions that drive reader engagement
6. Cultural Sensitivity: Develop respectful, nuanced cultural elements
7. Commercial Viability: Balance artistic vision with market awareness

{{#if preferred_genre}}**Preferred Genre**: {{preferred_genre}}{{/if}}

Approach this as a professional manga intellectual property with franchise potential — emotionally resonant, narratively sophisticated, and visually distinctive.

user message: {{user_input}}`,
        context
      );
    },
  },

  // ===== CONTENT GENERATION PROMPTS =====

  "character-generation": {
    name: "character-generation",
    description: "Generate a detailed character for a manga project",
    arguments: [
      {
        name: "user_input",
        description: "User's request for character creation",
        required: true,
      },
      {
        name: "parent_id",
        description: "ID of the project where character will be created",
        required: true,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      // Handler reconstructs ALL context internally
      const project = await getProjectWithRelations(args.parent_id);
      if (!project) throw new Error(`Project ${args.parent_id} not found`);

      // Build rich context from project data
      const context = {
        user_input: args.user_input,
        project_title: project.title,
        project_genre: project.genre,
        project_concept: project.concept,
        art_style: project.artStyle,
        world_summary: project.worldDetails?.summary || "",
        world_society: project.worldDetails?.society || "",
        world_unique_systems: project.worldDetails?.uniqueSystems || "",
        project_themes: project.themes || [],
        existing_characters:
          project.characters?.map((ch) => ({
            name: ch.name,
            role: ch.role,
            brief_description: ch.briefDescription,
            age: ch.age,
            traits: ch.traits || [],
          })) || [],
      };

      return renderPrompt(
        `You are an expert manga character designer specializing in creating compelling, multi-dimensional characters.

## USER REQUEST
{{user_input}}

## PROJECT CONTEXT
**Project**: {{project_title}}
**Genre**: {{project_genre}}
**Concept**: {{project_concept}}
**Art Style**: {{art_style}}

**World Summary**: {{world_summary}}
**Society**: {{world_society}}
**Unique Systems**: {{world_unique_systems}}

**Themes**: {{#each project_themes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

## EXISTING CHARACTERS
{{#each existing_characters}}
- **{{name}}** ({{role}}) - {{brief_description}}
  Age: {{age}}, Traits: {{#each traits}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

## REQUIREMENTS
Create a comprehensive character profile including ALL required fields:
- name, age, gender, role
- personality, briefDescription, traits, abilities, backstory
- bodyAttributes, facialAttributes, hairAttributes, distinctiveFeatures
- physicalMannerisms, posture
- styleGuide, consistencyPrompt, negativePrompt
- arcs, relationships, motivations

Design a character that feels real, serves the narrative, and enhances the manga's world while being visually distinctive and emotionally compelling.`,
        context
      );
    },
  },

  "chapter-generation": {
    name: "chapter-generation",
    description: "Create a detailed chapter outline and structure",
    arguments: [
      {
        name: "user_input",
        description: "User's request for chapter creation",
        required: true,
      },
      {
        name: "parent_id",
        description: "ID of the project where chapter will be created",
        required: true,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(args.parent_id);
      if (!project) throw new Error(`Project ${args.parent_id} not found`);

      const context = {
        user_input: args.user_input,
        project_title: project.title,
        project_concept: project.concept,
        plot_structure: project.plotStructure,
        themes: project.themes || [],
        existing_chapters:
          project.chapters?.map((ch) => ({
            number: ch.chapterNumber,
            title: ch.title,
            narrative: ch.narrative,
          })) || [],
        available_characters:
          project.characters?.map((ch) => ({
            name: ch.name,
            role: ch.role,
          })) || [],
      };

      return renderPrompt(
        `You are an expert manga story architect specializing in chapter-level narrative design.

## USER REQUEST
{{user_input}}

## PROJECT CONTEXT
**Project**: {{project_title}}
**Concept**: {{project_concept}}
**Themes**: {{#each themes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

{{#if plot_structure}}
**Plot Structure**:
- Inciting Incident: {{plot_structure.incitingIncident}}
- Plot Twist: {{plot_structure.plotTwist}}
- Climax: {{plot_structure.climax}}
{{/if}}

## EXISTING CHAPTERS
{{#each existing_chapters}}
**Chapter {{number}}**: {{title}} - {{narrative}}
{{/each}}

## AVAILABLE CHARACTERS
{{#each available_characters}}
- **{{name}}** ({{role}})
{{/each}}

## REQUIREMENTS
Design a comprehensive chapter including:
- chapterNumber, title, narrative, themes, emotionalArc
- openingHook, risingAction, climax, resolution, cliffhanger
- characterFocus, relationshipDevelopment, characterGrowth
- keyVisualMoments, atmosphereNotes, panelSuggestions

Create a chapter that advances the story meaningfully while delivering a complete reading experience.`,
        context
      );
    },
  },

  "scene-generation": {
    name: "scene-generation",
    description: "Create a detailed scene with visual storytelling elements",
    arguments: [
      {
        name: "user_input",
        description: "User's request for scene creation",
        required: true,
      },
      {
        name: "parent_id",
        description: "ID of the chapter where scene will be created",
        required: true,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      // Find chapter and project
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      const chapter = project.chapters?.find((ch) => ch.id === args.parent_id);
      if (!chapter) throw new Error(`Chapter ${args.parent_id} not found`);

      const context = {
        user_input: args.user_input,
        chapter_title: chapter.title,
        chapter_narrative: chapter.narrative,
        project_genre: project.genre,
        art_style: project.artStyle,
        world_summary: project.worldDetails?.summary || "",
        available_characters:
          project.characters?.map((ch) => ({
            name: ch.name,
            role: ch.role,
            traits: ch.traits || [],
          })) || [],
      };

      return renderPrompt(
        `You are an expert manga scene director specializing in detailed scene construction.

## USER REQUEST
{{user_input}}

## CHAPTER CONTEXT
**Chapter**: {{chapter_title}}
**Narrative**: {{chapter_narrative}}
**Themes**: {{#each chapter_themes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

## PROJECT CONTEXT
**Genre**: {{project_genre}}
**Art Style**: {{art_style}}
**World**: {{world_summary}}

## AVAILABLE CHARACTERS
{{#each available_characters}}
- **{{name}}** ({{role}}) - Traits: {{#each traits}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

## REQUIREMENTS
Develop a comprehensive scene including:
- title, order, location, timeOfDay, weather
- sceneContext with setting, mood, dramaticPurpose, narrativePosition
- consistencyAnchors (characterClothing, environmentalElements, lightingSources, colorPalette)
- charactersPresent, characterMotivations, conflictPoints, emotionalBeats
- keyVisualElements, cameraWork, lightingMood, visualTransitions
- estimatedPanelCount, pacingNotes, visualHighlights

Create a scene that delivers outstanding visual storytelling and serves the chapter's goals.`,
        context
      );
    },
  },

  "panel-generation": {
    name: "panel-generation",
    description: "Generate detailed panel content and visual specifications",
    arguments: [
      {
        name: "user_input",
        description: "User's request for panel creation",
        required: true,
      },
      {
        name: "parent_id",
        description: "ID of the scene where panel will be created",
        required: true,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      // Find scene, chapter, and project
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      let scene = null;
      for (const chapter of project.chapters || []) {
        scene = chapter.scenes?.find((sc) => sc.id === args.parent_id);
        if (scene) break;
      }
      if (!scene) throw new Error(`Scene ${args.parent_id} not found`);

      const context = {
        user_input: args.user_input,
        scene_title: scene.title,
        scene_description: scene.description,
        scene_notes: scene.sceneContext?.sceneNotes || "",
        scene_mood: scene.sceneContext?.environmentOverrides?.mood || "",
        characters_present: scene.sceneContext?.presentCharacters || [],
        project_genre: project.genre,
        art_style: project.artStyle,
        available_characters:
          project.characters?.map((ch) => ({
            name: ch.name,
            physical_mannerisms: ch.physicalMannerisms,
            posture: ch.posture,
          })) || [],
      };

      return renderPrompt(
        `You are an expert manga panel designer specializing in visual composition and sequential storytelling.

## USER REQUEST
{{user_input}}

## SCENE CONTEXT
**Scene**: {{scene_title}}
**Setting**: {{scene_setting}}
**Mood**: {{scene_mood}}
**Characters Present**: {{#each characters_present}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

## PROJECT CONTEXT
**Genre**: {{project_genre}}
**Art Style**: {{art_style}}

## AVAILABLE CHARACTERS
{{#each available_characters}}
- **{{name}}** - Physical: {{physical_mannerisms}}, {{posture}}
{{/each}}

## REQUIREMENTS
Design a comprehensive panel including:
- order, panelType, layout
- panelContext with action, cameraAngle, shotType, emotion, lighting, backgroundDescription
- characterPoses with characterName, pose, expression, clothing, props, spatialPosition
- aiPrompt, visualDescription, compositionNotes, focusElements
- speechBubbles, soundEffects, narrativeText, textPlacement

Create a panel that delivers maximum visual and narrative impact while maintaining consistency.`,
        context
      );
    },
  },

  // ===== UPDATE PROMPTS =====

  "character-update": {
    name: "character-update",
    description: "Update specific aspects of an existing character",
    arguments: [
      {
        name: "user_input",
        description: "Specific update request for the character",
        required: true,
      },
      {
        name: "content_id",
        description: "ID of the character to update",
        required: true,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      const character = project.characters?.find(
        (ch) => ch.id === args.content_id
      );
      if (!character) throw new Error(`Character ${args.content_id} not found`);

      const context = {
        userInput: args.user_input,
        character: character,
        projectContext: {
          title: project.title,
          genre: project.genre,
          artStyle: project.artStyle,
          worldDetails: project.worldDetails,
          themes: project.themes,
        },
      };

      return renderPrompt(
        `You are an expert manga character designer specializing in precision updates to existing characters.
        
IMPORTANT: Always use the updateCharacterTool to save your changes or deleteCharacterTool if removal is requested.
Do not respond with direct JSON. Instead, invoke the appropriate tool with your complete updated character data.

## TASK
Carefully analyze the user's specific character update request and make targeted modifications to the character while maintaining overall consistency and integrity.

## IMPORTANT CONTEXT
Current character data: {{character}}
Project context for consistency: {{projectContext}}

## UPDATE REQUIREMENTS
1. Focus exclusively on the aspects mentioned in the user's request
2. Keep all other character attributes consistent with the original design
3. Ensure all updates align with the character's core identity and the manga project's established world
4. Maintain the exact data structure of the original character object
5. Return the complete updated character object, not just the modified parts

## CHARACTER IDENTITY PRESERVATION
When making updates:
- Preserve the character's fundamental personality unless explicitly asked to change it
- Ensure visual updates maintain the character's recognizability
- Keep backstory elements consistent unless modifications are specifically requested
- Maintain internal logic between character traits, abilities, and design elements

Consider how your changes might impact other aspects of the character and make small adjustments to maintain coherence if necessary.

user request: {{userInput}}`,
        context
      );
    },
  },

  "chapter-update": {
    name: "chapter-update",
    description: "Update specific aspects of an existing chapter",
    arguments: [
      {
        name: "user_input",
        description: "Specific update request for the chapter",
        required: true,
      },
      {
        name: "content_id",
        description: "ID of the chapter to update",
        required: true,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      const chapter = project.chapters?.find((ch) => ch.id === args.content_id);
      if (!chapter) throw new Error(`Chapter ${args.content_id} not found`);

      const context = {
        userInput: args.user_input,
        chapter: chapter,
        projectContext: {
          title: project.title,
          concept: project.concept,
          worldDetails: project.worldDetails,
          themes: project.themes,
        },
        characterReferences:
          project.characters?.map((ch) => ({
            id: ch.id,
            name: ch.name,
            role: ch.role,
            traits: ch.traits,
          })) || [],
      };

      return renderPrompt(
        `You are an expert manga story editor specializing in precision updates to existing chapters and scenes.
        
IMPORTANT: Always use the updateChapterTool to save your changes or deleteChapterTool if removal is requested.
Do not respond with direct JSON. Instead, invoke the appropriate tool with your complete updated chapter data.

## TASK
Carefully analyze the user's specific chapter update request and make targeted modifications while preserving narrative integrity and continuity.

## IMPORTANT CONTEXT
Current chapter data: {{chapter}}
Project context for consistency: {{projectContext}}
Character references: {{characterReferences}}

## UPDATE REQUIREMENTS
1. Focus exclusively on the aspects mentioned in the user's request
2. Maintain narrative continuity with unmodified parts of the chapter
3. Preserve the exact data structure of the original chapter object
4. Return the complete updated chapter object, not just the modified parts
5. If updating scenes, ensure scene order and flow remain logical

## NARRATIVE INTEGRITY PRESERVATION
When making updates:
- Preserve character consistency unless changes are specifically requested
- Maintain thematic coherence with the broader manga project
- Ensure emotional arcs remain believable and compelling
- Check that cause-and-effect relationships remain logical

Consider the potential ripple effects of your changes on subsequent scenes or chapters and make minimal adjustments to maintain coherence if necessary.

user request: {{userInput}}`,
        context
      );
    },
  },

  "dialogue-generation": {
    name: "dialogue-generation",
    description: "Generate dialogue for a specific panel",
    arguments: [
      {
        name: "user_input",
        description: "User's request for dialogue creation",
        required: true,
      },
      {
        name: "parent_id",
        description: "ID of the panel where dialogue will be created",
        required: true,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      let panel = null;
      let parentScene = null;
      for (const chapter of project.chapters || []) {
        for (const scene of chapter.scenes || []) {
          panel = scene.panels?.find((p) => p.id === args.parent_id);
          if (panel) {
            parentScene = scene;
            break;
          }
        }
        if (panel) break;
      }
      if (!panel) throw new Error(`Panel ${args.parent_id} not found`);

      const context = {
        user_input: args.user_input,
        panel_action: panel.panelContext?.action || "",
        panel_emotion:
          panel.panelContext?.environmentOverrides?.atmosphere || "",
        character_poses:
          panel.panelContext?.characterPoses?.map((cp) => ({
            name: cp.characterName,
            pose: cp.pose,
            expression: cp.expression,
          })) || [],
        scene_title: parentScene?.title || "",
        scene_mood: parentScene?.sceneContext?.environmentOverrides?.mood || "",
        available_characters:
          project.characters?.map((ch) => ({
            name: ch.name,
            traits: ch.traits || [],
            personality: ch.personality || "",
          })) || [],
      };

      return renderPrompt(
        `You are an expert manga dialogue writer specializing in authentic character voice and emotional expression.

## USER REQUEST
{{user_input}}

## PANEL CONTEXT
**Action**: {{panel_action}}
**Emotion**: {{panel_emotion}}

**Characters in Panel**:
{{#each character_poses}}
- **{{name}}**: {{pose}}, expression: {{expression}}
{{/each}}

## SCENE CONTEXT
**Scene**: {{scene_title}}
**Mood**: {{scene_mood}}

## AVAILABLE CHARACTERS
{{#each available_characters}}
- **{{name}}**: {{personality}}
  Traits: {{#each traits}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

## REQUIREMENTS
Create authentic dialogue including:
- order, emotion, content, speakerId
- Match character's established voice and personality
- Align with panel's visual action and emotion
- Support scene's narrative progression
- Consider speech bubble placement and length

Generate dialogue that enhances the visual storytelling and feels natural for each character.`,
        context
      );
    },
  },

  "dialogue-update": {
    name: "dialogue-update",
    description: "Update specific aspects of existing dialogue",
    arguments: [
      {
        name: "user_input",
        description: "Specific update request for the dialogue",
        required: true,
      },
      {
        name: "content_id",
        description: "ID of the dialogue to update",
        required: true,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      let dialogue: any = null;
      let panelContext: any = null;
      let sceneContext: any = null;
      let speakerCharacter: any = null;

      for (const chapter of project.chapters || []) {
        for (const scene of chapter.scenes || []) {
          for (const panel of scene.panels || []) {
            dialogue = panel.dialogues?.find((d) => d.id === args.content_id);
            if (dialogue) {
              panelContext = panel;
              sceneContext = scene;
              speakerCharacter = project.characters?.find(
                (ch) => ch.id === dialogue.speakerId
              );
              break;
            }
          }
          if (dialogue) break;
        }
        if (dialogue) break;
      }
      if (!dialogue) throw new Error(`Dialogue ${args.content_id} not found`);

      const context = {
        userInput: args.user_input,
        dialogue: dialogue,
        projectContext: {
          title: project.title,
          genre: project.genre,
        },
        panelInfo: {
          id: panelContext?.id || "",
          action: panelContext?.panelContext?.action || "",
        },
        sceneInfo: {
          id: sceneContext?.id || "",
          title: sceneContext?.title || "",
        },
        speakerInfo: speakerCharacter
          ? {
              id: speakerCharacter.id,
              name: speakerCharacter.name,
              traits: speakerCharacter.traits || [],
            }
          : null,
      };

      return renderPrompt(
        `You are an expert manga dialogue editor specializing in precision updates to existing panel dialogues.
        
IMPORTANT: Always use the updatePanelDialogueTool to save your changes or deletePanelDialogueTool if removal is requested.
Do not respond with direct JSON. Instead, invoke the appropriate tool with your complete updated dialogue data.

## TASK
Carefully analyze the user's specific dialogue update request and make targeted modifications while maintaining character consistency and narrative flow.

## IMPORTANT CONTEXT
Current dialogue data: {{dialogue}}
Parent panel information: {{panelInfo}}
Parent scene information: {{sceneInfo}}
Project context for consistency: {{projectContext}}
{{#if speakerInfo}}Character speaking: {{speakerInfo}}{{/if}}

## UPDATE REQUIREMENTS
1. Focus exclusively on the aspects mentioned in the user's request
2. Preserve character voice and personality in any content changes
3. Maintain the exact data structure of the original dialogue object
4. Return the complete updated dialogue object, not just the modified parts
5. Ensure updates align with the panel's visual content

## DIALOGUE INTEGRITY PRESERVATION
When making updates:
- Match the emotional tone to the character's visual expression in the panel
- Maintain consistency with the character's established speech patterns
- Ensure dialogue length is appropriate for the panel size and bubble type
- Verify that dialogue modifications properly advance the narrative and make logical sense in sequence

Consider how your changes might affect reader understanding of characters or plot, and make minimal adjustments to ensure clarity.

user request: {{userInput}}`,
        context
      );
    },
  },

  "scene-update": {
    name: "scene-update",
    description: "Update specific aspects of an existing scene",
    arguments: [
      {
        name: "user_input",
        description: "Specific update request for the scene",
        required: true,
      },
      {
        name: "content_id",
        description: "ID of the scene to update",
        required: true,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      let scene = null;
      let parentChapter = null;
      for (const chapter of project.chapters || []) {
        scene = chapter.scenes?.find((sc) => sc.id === args.content_id);
        if (scene) {
          parentChapter = chapter;
          break;
        }
      }
      if (!scene) throw new Error(`Scene ${args.content_id} not found`);

      const context = {
        userInput: args.user_input,
        scene: scene,
        projectContext: {
          title: project.title,
          genre: project.genre,
          worldDetails: project.worldDetails,
        },
        chapterInfo: {
          id: parentChapter?.id || "",
          title: parentChapter?.title || "",
        },
        characterReferences:
          project.characters?.map((ch) => ({
            id: ch.id,
            name: ch.name,
            role: ch.role,
          })) || [],
      };

      return renderPrompt(
        `You are an expert manga scene director specializing in precision updates to existing scenes.
        
IMPORTANT: Always use the updateSceneTool to save your changes or deleteSceneTool if removal is requested.
Do not respond with direct JSON. Instead, invoke the appropriate tool with your complete updated scene data.

## TASK
Carefully analyze the user's specific scene update request and make targeted modifications while maintaining narrative flow and visual coherence.

## IMPORTANT CONTEXT
Current scene data: {{scene}}
Parent chapter information: {{chapterInfo}}
Project context for consistency: {{projectContext}}
Character references: {{characterReferences}}

## UPDATE REQUIREMENTS
1. Focus exclusively on the aspects mentioned in the user's request
2. Maintain consistency with unmodified elements of the scene
3. Preserve the exact data structure of the original scene object
4. Return the complete updated scene object, not just the modified parts
5. Ensure updates align with the scene's position in the broader chapter narrative

## SCENE INTEGRITY PRESERVATION
When making updates:
- Preserve the scene's core dramatic purpose unless explicitly asked to change it
- Maintain character consistency in dialogue and actions
- Ensure setting details remain coherent with established locations
- Verify emotional progression makes sense within the chapter's arc

Consider how your changes might affect panel creation in later production stages and optimize for visual storytelling.

user request: {{userInput}}`,
        context
      );
    },
  },

  "panel-update": {
    name: "panel-update",
    description: "Update specific aspects of an existing panel",
    arguments: [
      {
        name: "user_input",
        description: "Specific update request for the panel",
        required: true,
      },
      {
        name: "content_id",
        description: "ID of the panel to update",
        required: true,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      let panel = null;
      let parentScene = null;
      for (const chapter of project.chapters || []) {
        for (const scene of chapter.scenes || []) {
          panel = scene.panels?.find((p) => p.id === args.content_id);
          if (panel) {
            parentScene = scene;
            break;
          }
        }
        if (panel) break;
      }
      if (!panel) throw new Error(`Panel ${args.content_id} not found`);

      const context = {
        user_input: args.user_input,
        panel_order: panel.order,
        panel_action: panel.panelContext?.action || "",
        camera_angle: panel.panelContext?.cameraSettings?.angle || "",
        shot_type: panel.panelContext?.cameraSettings?.shotType || "",
        current_characters:
          panel.panelContext?.characterPoses?.map((cp) => cp.characterName) ||
          [],
        scene_title: parentScene?.title || "",
        scene_description: parentScene?.description || "",
        project_art_style: project.artStyle,
        project_genre: project.genre,
      };

      return renderPrompt(
        `You are an expert manga visual editor specializing in precision panel updates while maintaining visual coherence.

## UPDATE REQUEST
{{user_input}}

## PANEL CONTEXT
**Panel Order**: {{panel_order}}
**Action**: {{panel_action}}
**Camera**: {{camera_angle}}
**Shot Type**: {{shot_type}}
**Characters**: {{#each current_characters}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

## SCENE CONTEXT
**Scene**: {{scene_title}}
**Setting**: {{scene_setting}}

## PROJECT CONTEXT
**Art Style**: {{project_art_style}}
**Genre**: {{project_genre}}

## REQUIREMENTS
Make targeted modifications while maintaining:
1. Visual continuity with adjacent panels
2. Character consistency and spatial relationships
3. Narrative flow and sequential logic
4. Technical quality and composition

Provide the complete updated panel object with ALL fields, focusing only on requested changes while preserving visual narrative coherence.`,
        context
      );
    },
  },

  // ===== IMAGE GENERATION PROMPTS =====

  "character-image": {
    name: "character-image",
    description: "Generate an image for a character",
    arguments: [
      {
        name: "content_id",
        description: "ID of the character to generate image for",
        required: true,
      },
      {
        name: "image_description",
        description: "Optional specific description for the image",
        required: false,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      const character = project.characters?.find(
        (ch) => ch.id === args.content_id
      );
      if (!character) throw new Error(`Character ${args.content_id} not found`);

      // Return the character's existing consistency prompt for image generation
      return (
        character.consistencyPrompt ||
        `Generate an image of ${character.name}: ${character.briefDescription}`
      );
    },
  },

  "panel-image": {
    name: "panel-image",
    description: "Generate an image for a panel",
    arguments: [
      {
        name: "content_id",
        description: "ID of the panel to generate image for",
        required: true,
      },
      {
        name: "image_mode",
        description: "Image generation mode (promptOnly, withReferences)",
        required: false,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      let panel: any = null;
      let parentScene: any = null;
      let parentChapter: any = null;

      for (const chapter of project.chapters || []) {
        for (const scene of chapter.scenes || []) {
          panel = scene.panels?.find((p) => p.id === args.content_id);
          if (panel) {
            parentScene = scene;
            parentChapter = chapter;
            break;
          }
        }
        if (panel) break;
      }
      if (!panel) throw new Error(`Panel ${args.content_id} not found`);

      // Get characters in this panel
      const charactersInPanel =
        panel.panelContext?.characterPoses?.map(
          (cp: any) => cp.characterName
        ) || [];
      const characters =
        project.characters?.filter((ch) =>
          charactersInPanel.includes(ch.name)
        ) || [];

      const context = {
        panel: panel,
        scene: parentScene,
        characters: characters,
        artStyle: project.artStyle,
        additionalContext: args.image_mode || "",
      };

      return renderPrompt(
        `You are an expert AI image prompt engineer specializing in high-quality anime/manga art generation. Your task is to enhance existing prompts to ensure that **characters are the central focus**, maintaining perfect fidelity to their references, with the background playing a supportive, non-dominant role unless explicitly required.

## QUALITY & STYLE FOUNDATION
**MANDATORY OPENING**: Every imagePrompt must begin with:
"masterpiece, best quality, high resolution, ultra detailed, anime style, manga art style, Japanese animation, 2D anime art, cel-shaded animation style, professional manga illustration, detailed line art, cinematic composition"

---

## PANEL DATA EXTRACTION

**Base Prompt**:
{{panel.aiPrompt}}

### PANEL CONTEXT
- Action: {{panel.panelContext.action}}
- Camera Angle: {{panel.panelContext.cameraAngle}}
- Shot Type: {{panel.panelContext.shotType}}
- Emotion: {{panel.panelContext.emotion}}
- Lighting: {{panel.panelContext.lighting}}
- Background: {{panel.panelContext.backgroundDescription}}
- Effects: {{panel.panelContext.effects}}
- Dramatic Purpose: {{panel.panelContext.dramaticPurpose}}
- Narrative Position: {{panel.panelContext.narrativePosition}}

**Character Details**:
{{#each panel.panelContext.characterPoses}}
- {{characterName}}: pose = {{pose}}, expression = {{expression}}, clothing = {{clothing}}{{#if props}}, props: {{props}}{{/if}}{{#if spatialPosition}}, position: {{spatialPosition}}{{/if}}
{{/each}}

**Scene Context**:
- Setting: {{scene.sceneContext.setting}}
- Mood: {{scene.sceneContext.mood}}
- Time of Day: {{scene.sceneContext.timeOfDay}}
- Weather: {{scene.sceneContext.weather}}
{{#if scene.sceneContext.consistencyAnchors}}
- Consistency Anchors:
  - Character Clothing: {{scene.sceneContext.consistencyAnchors.characterClothing}}
  - Environmental Elements: {{scene.sceneContext.consistencyAnchors.environmentalElements}}
  - Lighting Sources: {{scene.sceneContext.consistencyAnchors.lightingSources}}
  - Color Palette: {{scene.sceneContext.consistencyAnchors.colorPalette}}
  - Atmospheric Effects: {{scene.sceneContext.consistencyAnchors.atmosphericEffects}}
{{/if}}

**Available Characters**:
{{#if characters}}
{{#each characters}}
- {{name}}: {{description}}
{{/each}}
{{/if}}

## PROMPT GENERATION STRATEGY

### 1. CHARACTER FOCUS (Top Priority)
- Integrate: "(use previous character reference image for [CHARACTER_NAME])"
- NEVER describe facial traits; instead focus on:
  - Body posture & pose
  - Expression
  - Props
  - Clothing
  - Interaction & position in space
  - Perspective from camera angle

✅ Use anatomical precision: detailed hands, feet, fingers, proportions  
✅ Include spatial layering: foreground/background depth  

### 2. COMPOSITION & CAMERA
- Apply cinematic composition techniques according to:
  - Shot Type (e.g. close-up = facial focus, wide = group scene, etc.)
  - Camera Angle (low-angle = heroic, high-angle = vulnerable)

### 3. ENVIRONMENT (Supportive Role)
- Only enhance environmental details **when required by shot type**
- Extract architectural and mood details from:
  - 'backgroundDescription', 'setting', 'weather', and 'consistencyAnchors'
- If camera is focused on characters (close-up, medium shot), background should be minimal, blurred, or stylistically light to keep character focus

### 4. LIGHTING INTEGRATION
- Base it on:
  - 'scene.sceneContext.timeOfDay', 'lightingSources', 'effects'
  - Enhance contrast and mood according to panel emotion
- Include lighting realism via:
  - Material interaction
  - Shadow softness or harshness
  - Directional lighting from props (lamps, sun)

### 5. EMOTIONAL EXPRESSION
- Adjust image tone, color temperature, and composition around:
  - 'panel.panelContext.emotion'
  - Dramatic Purpose
  - Character interaction & expression

## NEGATIVE PROMPT RULES

Use this comprehensive default negative prompt, with modifications per panel:

**Negative Prompt**:  
"blurry, low quality, distorted anatomy, amateur art, poor anatomy, bad anatomy, realistic photography, western comic style, 3D render, photorealistic, deformed hands, extra fingers, missing limbs, distorted proportions, malformed anatomy, inconsistent clothing, mismatched lighting, cluttered composition, oversaturated colors, photographic shading, non-anime style, artifacts, noise, compression errors, unclear focus, poor framing, continuity errors, character inconsistency, multiple heads, duplicate characters, realistic facial features, photorealistic lighting, live action, impossible architecture, floating objects"

### Panel-Specific Additions
- If camera is close-up: exclude "distant background, wide scenery"
- If emotional: exclude "neutral expressions"
- If dramatic: exclude "lighthearted tone, soft color palette"
- If action: exclude "motion blur, awkward posing"

## GENERATION COMMAND
Using the provided aiPrompt, panelContext, scene context, and character data, enhance and optimize the aiPrompt to create a comprehensive imagePrompt and negativePrompt. Prioritize character fidelity and reference accuracy while supporting visual storytelling through background and lighting only as needed. Build upon the existing prompt rather than replacing it.

{{#if additionalContext}}
**Additional Context**: {{additionalContext}}
{{/if}}`,
        context
      );
    },
  },

  "outfit-template-update": {
    name: "outfit-template-update",
    description: "Update specific aspects of an existing outfit template",
    arguments: [
      {
        name: "user_input",
        description: "Specific update request for the outfit template",
        required: true,
      },
      {
        name: "content_id",
        description: "ID of the outfit template to update",
        required: true,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      const outfitTemplate = project.outfitTemplates?.find(
        (ot) => ot.id === args.content_id
      );
      if (!outfitTemplate)
        throw new Error(`Outfit template ${args.content_id} not found`);

      const context = {
        user_input: args.user_input,
        template_name: outfitTemplate.name,
        current_description: outfitTemplate.description,
        current_category: outfitTemplate.category,
        current_style: outfitTemplate.style,
        current_colors:
          outfitTemplate.colorSchemes?.map((cs: any) => cs.name).join(", ") ||
          "",
        current_materials: outfitTemplate.materials || [],
        project_genre: project.genre,
        art_style: project.artStyle,
      };

      return renderPrompt(
        `You are an expert manga costume designer specializing in outfit template updates.

## UPDATE REQUEST
{{user_input}}

## OUTFIT TEMPLATE CONTEXT
**Template**: {{template_name}}
**Description**: {{current_description}}
**Category**: {{current_category}}
**Style**: {{current_style}}
**Colors**: {{#each current_colors}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
**Materials**: {{#each current_materials}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

## PROJECT CONTEXT
**Genre**: {{project_genre}}
**Art Style**: {{art_style}}

## REQUIREMENTS
Make targeted modifications while maintaining:
1. Visual coherence with established art style
2. Internal consistency between materials and colors
3. Category appropriateness and style integrity
4. Character compatibility considerations

Provide the complete updated outfit template with ALL fields, focusing on requested changes while preserving design coherence.`,
        context
      );
    },
  },

  "location-image": {
    name: "location-image",
    description: "Generate an image for a location template",
    arguments: [
      {
        name: "content_id",
        description: "ID of the location template to generate image for",
        required: true,
      },
      {
        name: "camera_angle",
        description: "Specific camera angle to render",
        required: false,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      const locationTemplate = project.locationTemplates?.find(
        (lt) => lt.id === args.content_id
      );
      if (!locationTemplate)
        throw new Error(`Location template ${args.content_id} not found`);

      const context = {
        location_name: locationTemplate.name,
        location_description: locationTemplate.description,
        camera_angle: args.camera_angle || "standard",
        available_angles: locationTemplate.cameraAngles || [],
        lighting_conditions: locationTemplate.lighting
          ? [locationTemplate.lighting.type || "natural"]
          : [],
        atmosphere: locationTemplate.mood || "",
        art_style: project.artStyle,
        genre: project.genre,
      };

      return renderPrompt(
        `You are an expert background artist specializing in manga/anime location art.

## LOCATION CONTEXT
**Location**: {{location_name}}
**Description**: {{location_description}}
**Atmosphere**: {{atmosphere}}
**Camera Angle**: {{camera_angle}}

**Available Angles**: {{#each available_angles}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
**Lighting Conditions**: {{#each lighting_conditions}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

## PROJECT STYLE
**Art Style**: {{art_style}}
**Genre**: {{genre}}

## REQUIREMENTS
Generate a comprehensive location image prompt including:
- Architectural and environmental details
- Atmospheric conditions and lighting
- Camera perspective and composition
- Art style specifications for backgrounds
- Mood and genre-appropriate elements

Create a prompt optimized for detailed, immersive location artwork.`,
        context
      );
    },
  },

  "character-with-templates": {
    name: "character-with-templates",
    description:
      "Generate character image using specific outfit/pose templates",
    arguments: [
      {
        name: "content_id",
        description: "ID of the character to generate image for",
        required: true,
      },
      {
        name: "outfit_template_id",
        description: "ID of specific outfit template to use",
        required: false,
      },
      {
        name: "context_description",
        description: "Additional context (location, mood, lighting)",
        required: false,
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      const character = project.characters?.find(
        (ch) => ch.id === args.content_id
      );
      if (!character) throw new Error(`Character ${args.content_id} not found`);

      let outfitTemplate: any = null;
      if (args.outfit_template_id) {
        outfitTemplate = project.outfitTemplates?.find(
          (ot) => ot.id === args.outfit_template_id
        );
      }

      const context = {
        character_name: character.name,
        character_description: character.briefDescription,
        character_traits: character.traits || [],
        base_prompt: character.consistencyPrompt || "",
        outfit_name: outfitTemplate?.name || "default",
        outfit_description: outfitTemplate?.description || "",
        outfit_colors:
          outfitTemplate?.colorSchemes?.map((cs: any) => cs.name).join(", ") ||
          "",
        context_description: args.context_description || "",
        art_style: project.artStyle,
      };

      return renderPrompt(
        `You are an expert character artist specializing in template-based character illustration.

## CHARACTER CONTEXT
**Character**: {{character_name}}
**Description**: {{character_description}}
**Traits**: {{#each character_traits}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
**Base Prompt**: {{base_prompt}}

## OUTFIT TEMPLATE
**Outfit**: {{outfit_name}}
**Description**: {{outfit_description}}
**Colors**: {{#each outfit_colors}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

## ADDITIONAL CONTEXT
{{context_description}}

## PROJECT STYLE
**Art Style**: {{art_style}}

## REQUIREMENTS
Generate a character image prompt that:
- Maintains character consistency using base prompt
- Accurately represents the specified outfit template
- Incorporates additional context elements
- Follows established art style guidelines
- Ensures high-quality character focus

Create a prompt that combines character identity with template specifications.`,
        context
      );
    },
  },
};

// Simple template engine
export function renderPrompt(
  template: string,
  args: Record<string, any>
): string {
  let rendered = template;

  // Replace {{variable}} with values
  rendered = rendered.replace(
    /\{\{(\w+)\}\}/g,
    (match: string, varName: string) => {
      return args[varName] || match;
    }
  );

  // Handle conditional blocks {{#if variable}}...{{/if}}
  rendered = rendered.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match: string, varName: string, content: string) => {
      return args[varName] ? content : "";
    }
  );

  // Handle each blocks {{#each array}}...{{/each}}
  rendered = rendered.replace(
    /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (match: string, varName: string, content: string) => {
      const array = args[varName];
      if (Array.isArray(array)) {
        return array
          .map((item, index) => {
            let itemContent = content;
            // Replace {{this}} with the current item
            itemContent = itemContent.replace(/\{\{this\}\}/g, item);
            // Replace {{@last}} for last item logic
            itemContent = itemContent.replace(
              /\{\{#unless @last\}\}(.*?)\{\{\/unless\}\}/g,
              index === array.length - 1 ? "" : "$1"
            );
            return itemContent;
          })
          .join("");
      }
      return "";
    }
  );

  return rendered;
}
