import {
  LocationTemplate,
  LocationVariation,
  OutfitTemplate,
  OutfitVariation,
  Scene,
} from "@/types/entities";

/**
 * Template utility functions for smart location and outfit management
 */

// ===== LOCATION UTILITIES =====

/**
 * Get the effective location properties by combining template defaults with variation overrides
 */
export function getEffectiveLocationProperties(
  template: LocationTemplate,
  variationId?: string
): {
  timeOfDay: string;
  weather: string;
  mood: string;
  lighting?: any;
  props: string[];
  colors: string[];
  imagePrompt: string;
} {
  const variation = variationId
    ? template.variations?.find((v) => v.id === variationId)
    : null;

  return {
    timeOfDay: variation?.timeOfDay || template.defaultTimeOfDay || "any",
    weather: variation?.weather || template.defaultWeather || "any",
    mood: variation?.mood || template.defaultMood || "peaceful",
    lighting: variation?.lighting || template.baseLighting,
    props: [...template.props, ...(variation?.additionalProps || [])],
    colors: variation?.modifiedColors?.length
      ? variation.modifiedColors
      : template.colors,
    imagePrompt: buildLocationPrompt(template, variation),
  };
}

/**
 * Build a complete image prompt for a location with variation
 */
export function buildLocationPrompt(
  template: LocationTemplate,
  variation?: LocationVariation | null
): string {
  let prompt = template.baseImagePrompt || template.description;

  if (variation?.promptModifiers?.length) {
    prompt += ", " + variation.promptModifiers.join(", ");
  }

  return prompt;
}

/**
 * Find the best location variation for given scene context
 */
export function findBestLocationVariation(
  template: LocationTemplate,
  sceneContext: {
    timeOfDay?: string;
    weather?: string;
    mood?: string;
  }
): LocationVariation | null {
  if (!template.variations?.length) return null;

  // Score each variation based on context match
  const scoredVariations = template.variations.map((variation) => {
    let score = 0;

    if (
      sceneContext.timeOfDay &&
      variation.timeOfDay === sceneContext.timeOfDay
    ) {
      score += 3;
    }
    if (sceneContext.weather && variation.weather === sceneContext.weather) {
      score += 3;
    }
    if (sceneContext.mood && variation.mood === sceneContext.mood) {
      score += 2;
    }

    return { variation, score };
  });

  // Return the highest scoring variation, or null if no good match
  const best = scoredVariations.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.variation : null;
}

// ===== OUTFIT UTILITIES =====

/**
 * Get the effective outfit properties by combining template defaults with variation overrides
 */
export function getEffectiveOutfitProperties(
  template: OutfitTemplate,
  variationId?: string
): {
  components: any[];
  colors: string[];
  materials: string[];
  imagePrompt: string;
} {
  const variation = variationId
    ? template.variations?.find((v) => v.id === variationId)
    : null;

  let components = [...template.components];

  // Apply component overrides from variation
  if (variation?.componentOverrides) {
    components = components.map((component) => {
      const override = variation.componentOverrides?.find(
        (o) => o.componentType === component.type
      );

      if (override) {
        return {
          ...component,
          item: override.newItem,
          defaultColor: override.newColor || component.defaultColor,
          defaultMaterial: override.newMaterial || component.defaultMaterial,
          defaultPattern: override.newPattern || component.defaultPattern,
        };
      }

      return component;
    });
  }

  // Add additional components from variation
  if (variation?.additionalComponents) {
    components.push(...variation.additionalComponents);
  }

  return {
    components,
    colors: template.colorSchemes.map((cs) => cs.primary),
    materials: template.materials,
    imagePrompt: buildOutfitPrompt(template, variation),
  };
}

/**
 * Build a complete image prompt for an outfit with variation
 */
export function buildOutfitPrompt(
  template: OutfitTemplate,
  variation?: OutfitVariation | null
): string {
  let prompt = template.imagePrompt || template.description;

  if (variation?.promptModifiers?.length) {
    prompt += ", " + variation.promptModifiers.join(", ");
  }

  return prompt;
}

/**
 * Find the best outfit variation for given scene context
 */
export function findBestOutfitVariation(
  template: OutfitTemplate,
  sceneContext: {
    timeOfDay?: string;
    weather?: string;
    mood?: string;
    activity?: string;
  }
): OutfitVariation | null {
  if (!template.variations?.length) return null;

  // Score each variation based on context match
  const scoredVariations = template.variations.map((variation) => {
    let score = 0;

    if (
      sceneContext.timeOfDay &&
      variation.conditions?.timeOfDay?.includes(sceneContext.timeOfDay)
    ) {
      score += 2;
    }
    if (
      sceneContext.weather &&
      variation.conditions?.weather?.includes(sceneContext.weather)
    ) {
      score += 3;
    }
    if (
      sceneContext.mood &&
      variation.conditions?.mood?.includes(sceneContext.mood)
    ) {
      score += 2;
    }
    if (
      sceneContext.activity &&
      variation.conditions?.activity?.includes(sceneContext.activity)
    ) {
      score += 2;
    }

    return { variation, score };
  });

  // Return the highest scoring variation, or null if no good match
  const best = scoredVariations.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.variation : null;
}

// ===== SCENE INTEGRATION =====

/**
 * Automatically assign best template variations to a scene based on its context
 */
export function autoAssignTemplateVariations(
  scene: Scene,
  availableLocationTemplates: LocationTemplate[],
  availableOutfitTemplates: OutfitTemplate[]
): {
  recommendedLocationVariation?: { templateId: string; variationId: string };
  recommendedOutfitVariations?: {
    characterId: string;
    templateId: string;
    variationId: string;
  }[];
} {
  const result: any = {};

  // Find best location variation
  const locationTemplate = availableLocationTemplates.find(
    (t) => t.id === scene.sceneContext.locationId
  );

  if (locationTemplate) {
    const sceneOverrides = scene.sceneContext.environmentOverrides;
    const bestVariation = findBestLocationVariation(locationTemplate, {
      timeOfDay: sceneOverrides?.timeOfDay,
      weather: sceneOverrides?.weather,
      mood: sceneOverrides?.mood,
    });

    if (bestVariation) {
      result.recommendedLocationVariation = {
        templateId: locationTemplate.id,
        variationId: bestVariation.id,
      };
    }
  }

  // Find best outfit variations for characters
  if (scene.sceneContext.characterOutfits?.length) {
    result.recommendedOutfitVariations = scene.sceneContext.characterOutfits
      .map((outfit) => {
        const outfitTemplate = availableOutfitTemplates.find(
          (t) => t.id === outfit.outfitId
        );

        if (outfitTemplate) {
          const sceneOverrides = scene.sceneContext.environmentOverrides;
          const bestVariation = findBestOutfitVariation(outfitTemplate, {
            timeOfDay: sceneOverrides?.timeOfDay,
            weather: sceneOverrides?.weather,
            mood: sceneOverrides?.mood,
          });

          return {
            characterId: outfit.characterId,
            templateId: outfitTemplate.id,
            variationId: bestVariation?.id || outfit.outfitVariationId,
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  return result;
}

/**
 * Generate example variations for a location template
 */
export function generateLocationVariationExamples(
  template: LocationTemplate
): LocationVariation[] {
  const variations: LocationVariation[] = [];
  const now = new Date();

  // Time-based variations
  const timeVariations = [
    {
      time: "morning",
      modifiers: ["golden morning light", "fresh atmosphere"],
      mood: "energetic" as const,
    },
    {
      time: "evening",
      modifiers: ["warm evening glow", "peaceful ambiance"],
      mood: "peaceful" as const,
    },
    {
      time: "night",
      modifiers: ["moonlight", "mysterious shadows"],
      mood: "mysterious" as const,
    },
  ];

  timeVariations.forEach((tv, index) => {
    variations.push({
      id: `${template.id}_time_${tv.time}`,
      name: `${template.name} (${tv.time})`,
      timeOfDay: tv.time as any,
      mood: tv.mood,
      promptModifiers: tv.modifiers,
      isActive: true,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  });

  return variations;
}

/**
 * Generate example variations for an outfit template
 */
export function generateOutfitVariationExamples(
  template: OutfitTemplate
): OutfitVariation[] {
  const variations: OutfitVariation[] = [];
  const now = new Date();

  // Weather-based variations
  if (template.compatibility.weather.includes("rainy")) {
    variations.push({
      id: `${template.id}_weather_rainy`,
      name: `${template.name} (Rainy Day)`,
      additionalComponents: [
        {
          type: "outerwear",
          item: "raincoat",
          isRequired: false,
          defaultColor: template.colorSchemes[0]?.primary || "blue",
        },
      ],
      conditions: {
        weather: ["rainy"],
      },
      promptModifiers: ["wearing raincoat", "rain protection"],
      isActive: true,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  return variations;
}
