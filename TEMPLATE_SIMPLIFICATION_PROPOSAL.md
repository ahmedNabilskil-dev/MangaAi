# Template System Simplification Proposal

## Current Issues with Templates

1. **Over-complexity** - Variations system might be overkill
2. **Too many fields** - Components, color schemes, materials add complexity
3. **Rigid structure** - Hard to make quick creative changes

## Proposed Simplified Templates

### Simplified Outfit Template

```typescript
interface OutfitTemplate {
  id: string;
  name: string;
  characterId: string;
  description: string; // Simple text description
  aiPrompt: string; // Complete AI generation prompt
  category: "casual" | "formal" | "school" | "special";
  season: "spring" | "summer" | "autumn" | "winter" | "all";
  isDefault: boolean;
  imageUrl?: string;
  mangaProjectId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Simplified Location Template

```typescript
interface LocationTemplate {
  id: string;
  name: string;
  description: string;
  basePrompt: string; // Core location description
  type: "indoor" | "outdoor";
  category: "school" | "home" | "public" | "nature" | "fantasy";
  cameraAngles: string[]; // Simple array of angle names
  imageUrl?: string;
  mangaProjectId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Benefits of Simplification

### Keep These Features:

- ✅ **Basic templates** for consistency
- ✅ **AI prompts** for generation
- ✅ **Default outfits** per character
- ✅ **Reusability** across scenes

### Remove These Complex Features:

- ❌ **Variations system** (too complex)
- ❌ **Component system** (over-engineered)
- ❌ **Color schemes** (include in AI prompt)
- ❌ **Materials system** (include in AI prompt)
- ❌ **Compatibility matrices** (too rigid)
- ❌ **Usage tracking** (unnecessary overhead)

## Alternative: Scene-Level Overrides

Allow direct customization at scene/panel level:

```typescript
interface Scene {
  sceneContext: {
    // Reference template but allow overrides
    locationId: string;
    locationOverrides?: {
      timeOfDay?: string;
      weather?: string;
      customPrompt?: string;
    };

    characterOutfits: {
      characterId: string;
      outfitId?: string; // Use template
      customOutfit?: {
        // OR define directly
        description: string;
        aiPrompt: string;
      };
    }[];
  };
}
```

## Migration Strategy

1. **Phase 1**: Simplify existing templates (remove variations, components)
2. **Phase 2**: Add scene-level override support
3. **Phase 3**: Clean up unused fields and update tools

This maintains consistency benefits while reducing complexity and allowing creative flexibility.
