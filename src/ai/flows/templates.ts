// Simplified Consistency System - Much Less Overhead

import { ai } from "@/ai/ai-instance";
import { z } from "zod";

export const SimpleOutfitPrompt = ai.definePrompt({
  name: "SimpleOutfitPrompt",
  input: {
    schema: z.object({
      userInput: z.string(),
      character: z.any().optional(),
      existingOutfits: z.array(z.any()).optional(),
      sceneContext: z.string().optional(),
    }),
  },
  tools: [],
  toolCall: true,
  prompt: `You help create and manage character outfits for manga consistency.

## Your Job
- Create simple, consistent outfit descriptions
- Generate reference images to show exactly how the outfit looks
- Make AI prompts that generate the same look every time
- Keep outfits appropriate for the character and story

## Rules
- Outfits should match the character's personality and situation
- Be specific enough for consistency but not overly detailed
- Focus on key visual elements that matter most
- Always create reference images so creators can see the outfit
- Make descriptions that work well with AI art generation

{{#if character}}
Character: {{character}}
{{/if}}

{{#if existingOutfits}}
Existing outfits: {{existingOutfits}}
{{/if}}

{{#if sceneContext}}
Scene context: {{sceneContext}}
{{/if}}


User request: {{userInput}}`,
});

export const SimpleLocationPrompt = ai.definePrompt({
  name: "SimpleLocationPrompt",
  input: {
    schema: z.object({
      userInput: z.string(),
      existingLocations: z.array(z.any()).optional(),
      storyContext: z.string().optional(),
      needMultipleAngles: z.boolean().optional(),
    }),
  },
  tools: [],
  toolCall: true,
  prompt: `You help create and manage location templates for manga consistency.

## Your Job  
- Create clear, consistent location descriptions
- Generate multiple camera angles for the same location that all look related
- Make AI prompts that maintain visual consistency across different views
- Keep locations appropriate for the story setting

## Rules
- Focus on key visual elements that define the space
- Create consistent colors, lighting, and mood across all angles
- Each camera angle should feel like the same location
- Always include common elements that connect different views
- Generate reference images for each angle
- Make descriptions that work well with AI art generation

## Camera Angle Strategy
When creating multiple angles for one location:
- Wide shot: Shows the overall space and layout
- Close shots: Focus on specific areas but include recognizable elements
- Different perspectives: Front, side, corner views as needed
- Consistent elements: Same colors, lighting, key objects in every angle

{{#if existingLocations}}
Existing locations: {{existingLocations}}
{{/if}}

{{#if storyContext}}
Story context: {{storyContext}}
{{/if}}

{{#if needMultipleAngles}}
IMPORTANT: Create multiple camera angles for this location. Each angle should look like the same place but from different viewpoints.
{{/if}}

User request: {{userInput}}`,
});
