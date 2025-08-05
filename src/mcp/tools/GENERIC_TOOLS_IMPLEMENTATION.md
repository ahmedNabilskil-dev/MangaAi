# Generic Tools Strategy Implementation

## Overview

Implemented a new generic tools strategy that consolidates all `get`, `list`, and `delete` operations into three universal tools instead of having separate tools for each entity type.

## New Generic Tools

### 1. `getEntity`

**Description**: Retrieves complete details of any entity by its type and ID.

**Supported Entity Types**:

- `project`: Manga project details
- `chapter`: Chapter details with context
- `scene`: Scene details with context
- `panel`: Panel details with context
- `character`: Character details with context
- `dialogue`: Panel dialogue details with context
- `outfitTemplate`: Outfit template details
- `locationTemplate`: Location template details

**Usage Examples**:

```javascript
// Get project
{ entityType: "project", entityId: "proj_123" }

// Get chapter
{ entityType: "chapter", entityId: "ch_456" }

// Get character
{ entityType: "character", entityId: "char_789" }
```

### 2. `listEntities`

**Description**: Lists entities of a specified type with optional parent context.

**Supported Entity Types and Required Parent Context**:

- `projects`: Lists all projects (no parent needed)
- `chapters`: Lists chapters in a project (parentId = projectId)
- `scenes`: Lists scenes in a chapter (parentId = chapterId)
- `panels`: Lists panels in a scene (parentId = sceneId)
- `characters`: Lists characters in a project (parentId = projectId)
- `dialogues`: Lists dialogues in a panel (parentId = panelId)
- `outfitTemplates`: Lists outfit templates for a project (parentId = projectId)
- `locationTemplates`: Lists location templates for a project (parentId = projectId)

**Usage Examples**:

```javascript
// List all projects
{ entityType: "projects" }

// List chapters in a project
{ entityType: "chapters", parentId: "proj_123" }

// List scenes in a chapter
{ entityType: "scenes", parentId: "ch_456" }

// List characters in a project with filters
{ entityType: "characters", parentId: "proj_123", filters: { role: "protagonist" } }
```

### 3. `deleteEntity` ⭐ NEW

**Description**: Deletes any entity by its type and ID with optional confirmation requirements.

**Supported Entity Types**:

- `project`: Manga project (requires confirmation=true)
- `chapter`: Chapter and all its related scenes and panels
- `scene`: Scene and all its panels from the chapter
- `panel`: Panel and all its dialogues from the scene
- `character`: Character from the project
- `dialogue`: Panel dialogue from the panel
- `outfitTemplate`: Outfit template from the project
- `locationTemplate`: Location template from the project

**Usage Examples**:

```javascript
// Delete project (requires confirmation)
{ entityType: "project", entityId: "proj_123", confirmation: true }

// Delete chapter
{ entityType: "chapter", entityId: "ch_456" }

// Delete character
{ entityType: "character", entityId: "char_789" }

// Delete scene
{ entityType: "scene", entityId: "scene_101" }
```

**Special Notes**:

- Project deletion requires explicit `confirmation: true` parameter for safety
- Deletion operations cascade appropriately (e.g., deleting a chapter removes all its scenes and panels)
- All deletions check for entity existence before attempting deletion

## Removed Tools

The following specific get/list/delete tools have been removed and replaced by the generic ones:

### Chapter Tools

- ❌ `getChapter` → ✅ `getEntity` with `entityType: "chapter"`
- ❌ `listChapters` → ✅ `listEntities` with `entityType: "chapters"`
- ❌ `deleteChapter` → ✅ `deleteEntity` with `entityType: "chapter"`

### Scene Tools

- ❌ `getScene` → ✅ `getEntity` with `entityType: "scene"`
- ❌ `listScenes` → ✅ `listEntities` with `entityType: "scenes"`
- ❌ `deleteScene` → ✅ `deleteEntity` with `entityType: "scene"`

### Project Tools

- ❌ `getProject` → ✅ `getEntity` with `entityType: "project"`
- ❌ `deleteProject` → ✅ `deleteEntity` with `entityType: "project"` (requires confirmation)

### Character Tools

- ❌ `getCharacter` → ✅ `getEntity` with `entityType: "character"`
- ❌ `listCharacters` → ✅ `listEntities` with `entityType: "characters"`
- ❌ `deleteCharacter` → ✅ `deleteEntity` with `entityType: "character"`

### Panel Tools

- ❌ `getPanel` → ✅ `getEntity` with `entityType: "panel"`
- ❌ `listPanels` → ✅ `listEntities` with `entityType: "panels"`
- ❌ `deletePanel` → ✅ `deleteEntity` with `entityType: "panel"`

### Dialogue Tools

- ❌ `getPanelDialogue` → ✅ `getEntity` with `entityType: "dialogue"`
- ❌ `listPanelDialogues` → ✅ `listEntities` with `entityType: "dialogues"`
- ❌ `deletePanelDialogue` → ✅ `deleteEntity` with `entityType: "dialogue"`

### Template Tools

- ❌ `getOutfitTemplate` → ✅ `getEntity` with `entityType: "outfitTemplate"`
- ❌ `listOutfitTemplates` → ✅ `listEntities` with `entityType: "outfitTemplates"`
- ❌ `deleteOutfitTemplate` → ✅ `deleteEntity` with `entityType: "outfitTemplate"`
- ❌ `getLocationTemplate` → ✅ `getEntity` with `entityType: "locationTemplate"`
- ❌ `listLocationTemplates` → ✅ `listEntities` with `entityType: "locationTemplates"`
- ❌ `deleteLocationTemplate` → ✅ `deleteEntity` with `entityType: "locationTemplate"`

## Benefits

1. **Reduced Tool Count**: From 24+ specific get/list/delete tools down to 3 generic tools
2. **Consistent Interface**: Same parameters and response format for all entity types
3. **Easier Maintenance**: Single point of logic for all get/list/delete operations
4. **Better Type Safety**: Centralized entity type validation
5. **Flexible Filtering**: Consistent filtering approach across all entity types
6. **Safety Features**: Built-in confirmation requirements for destructive operations

## Implementation Details

### Files Created/Modified:

- ✅ `src/mcp/tools/generic.tools.ts` - New generic tools definitions
- ✅ `src/mcp/tools/handlers/generic-tools.ts` - New generic handlers implementation
- ✅ `src/mcp/tool-registry.ts` - Updated to include generic tools
- ✅ Updated all entity-specific tool files to remove get/list tools and update references

### Handler Mapping:

The generic handlers use mapping objects to route to the appropriate service functions:

- `entityGetters`: Maps entity types to their respective getter functions
- `entityListers`: Maps entity types to their respective lister functions

### Response Formatting:

Each entity type maintains its specific response format and summary transformations, ensuring backward compatibility with existing consumers.

## Migration Guide

To migrate from old tools to new generic tools:

### Before:

```javascript
// Old way - multiple specific tools
await callTool("getChapter", { chapterId: "ch_123" });
await callTool("listCharacters", { projectId: "proj_456" });
await callTool("deleteScene", { sceneId: "scene_789" });
await callTool("getOutfitTemplate", { outfitTemplateId: "outfit_101" });
```

### After:

```javascript
// New way - single generic tools
await callTool("getEntity", { entityType: "chapter", entityId: "ch_123" });
await callTool("listEntities", {
  entityType: "characters",
  parentId: "proj_456",
});
await callTool("deleteEntity", { entityType: "scene", entityId: "scene_789" });
await callTool("getEntity", {
  entityType: "outfitTemplate",
  entityId: "outfit_101",
});

// Delete with confirmation (for projects)
await callTool("deleteEntity", {
  entityType: "project",
  entityId: "proj_456",
  confirmation: true,
});
```

## Status: ✅ COMPLETED

All tools have been successfully migrated and are passing TypeScript compilation. The system now includes:\*\*

- ✅ **3 generic tools** (`getEntity`, `listEntities`, `deleteEntity`)
- ✅ **24+ specific tools consolidated** into generic equivalents
- ✅ **Safety features** for destructive operations
- ✅ **Cascading deletion** support
- ✅ **Type-safe implementation** with full TypeScript support
