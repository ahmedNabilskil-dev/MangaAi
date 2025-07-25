# Complete Manga Workflow System

This document explains the new comprehensive manga generation workflow that handles errors, implements intelligent ordering, respects rate limits, and provides step-by-step manga creation.

## 🌟 Features

### ✅ Intelligent Error Handling

- **Automatic Retries**: Each step retries up to 3 times with exponential backoff
- **Graceful Failures**: Partial results are saved if workflow fails mid-process
- **Error Tracking**: Complete error logging with timestamps and context
- **Timeout Protection**: 60-second timeout per request to prevent hanging

### ✅ Rate Limiting & Timing

- **Request Delays**: 2-second delays between individual requests
- **Stage Delays**: 5-second delays between major workflow stages
- **Exponential Backoff**: Increasing delays for retries (2s, 4s, 8s)
- **Configurable Timing**: Easy to adjust timing for different model providers

### ✅ Intelligent Generation Order

1. **Project & Story Creation** - Foundation for everything else
2. **Character Generation** - Core cast with relationships and personalities
3. **Chapter Generation** - Narrative content in logical sequence
4. **Location Templates** - Environmental settings based on story needs
5. **Outfit Templates** - Character-specific clothing after character creation

### ✅ Flexible Configuration

- **Chapter Count**: Generate 1-10 chapters
- **Template Options**: Enable/disable outfits and locations independently
- **Quick Mode**: Story + characters only for rapid prototyping
- **Full Mode**: Complete manga with all components

## 🚀 Available Workflows

### 1. CompleteMangaWorkflow

The main comprehensive workflow that generates everything step by step.

```typescript
const result = await CompleteMangaWorkflow({
  userPrompt: "Create a sci-fi manga about time travel",
  includeOutfits: true, // Generate outfit templates
  includeLocations: true, // Generate location templates
  numberOfChapters: 3, // Create 3 chapters
});
```

**Output includes:**

- Project ID
- Workflow state (completed steps, errors, duration)
- Complete message history

### 2. QuickMangaWorkflow

Streamlined workflow for rapid prototyping (story + characters only).

```typescript
const result = await QuickMangaWorkflow({
  userPrompt: "Create a romance manga in high school",
});
```

### 3. CreateMangaFlowEnhanced

Unified interface that can use either quick or complete workflow.

```typescript
const result = await CreateMangaFlowEnhanced({
  userPrompt: "Create an action manga about ninjas",
  fullWorkflow: true, // Use complete workflow
  numberOfChapters: 2,
});
```

## 📊 Progress Monitoring

### getWorkflowProgress

Track what's been created for any project:

```typescript
const progress = await getWorkflowProgress(projectId);

console.log(progress);
// {
//   projectId: "...",
//   hasStory: true,
//   hasCharacters: true,
//   hasChapters: true,
//   hasLocations: true,
//   hasOutfits: true,
//   characterCount: 6,
//   chapterCount: 3,
//   locationCount: 8,
//   outfitCount: 24
// }
```

## ⚙️ Configuration Options

### Timing Configuration

```typescript
const WORKFLOW_CONFIG = {
  MAX_ITERATIONS: 3, // Maximum retries per step
  DELAY_BETWEEN_REQUESTS: 2000, // 2s between requests
  DELAY_BETWEEN_STAGES: 5000, // 5s between major stages
  TIMEOUT_PER_REQUEST: 60000, // 60s timeout per request
};
```

### Workflow Parameters

- `userPrompt`: The creative input for manga generation
- `includeOutfits`: Whether to generate outfit templates (default: true)
- `includeLocations`: Whether to generate location templates (default: true)
- `numberOfChapters`: How many chapters to create (1-10, default: 3)

## 🎯 Best Practices

### 1. Start Small

```typescript
// Begin with quick workflow for testing
const quick = await QuickMangaWorkflow({ userPrompt: "..." });

// Then extend with full workflow if needed
const full = await CompleteMangaWorkflow({
  userPrompt: "...",
  numberOfChapters: 1, // Start with 1 chapter
  includeOutfits: false, // Add complexity gradually
  includeLocations: false,
});
```

### 2. Handle Errors Gracefully

```typescript
try {
  const result = await CompleteMangaWorkflow({...});
  console.log(`✅ Success! Completed: ${result.workflowState.completedSteps.join(", ")}`);

  if (result.workflowState.errors.length > 0) {
    console.log(`⚠️ With ${result.workflowState.errors.length} recoverable errors`);
  }
} catch (error) {
  console.error("❌ Workflow failed completely:", error);
}
```

### 3. Monitor Progress

```typescript
// For long-running workflows, check progress periodically
const result = await CompleteMangaWorkflow({...});
const progress = await getWorkflowProgress(result.projectId);

console.log(`Progress: ${progress.characterCount} characters, ${progress.chapterCount} chapters`);
```

### 4. Customize for Your Needs

```typescript
// Fast content creation
const quick = await CompleteMangaWorkflow({
  userPrompt: "...",
  numberOfChapters: 1,
  includeOutfits: false,
  includeLocations: false,
});

// Comprehensive world building
const detailed = await CompleteMangaWorkflow({
  userPrompt: "...",
  numberOfChapters: 5,
  includeOutfits: true,
  includeLocations: true,
});
```

## 🔧 Error Recovery

The workflow system provides several layers of error recovery:

### 1. Automatic Retries

Each step automatically retries up to 3 times with exponential backoff.

### 2. Partial Success

If a workflow fails partway through, you still get:

- The project ID
- All completed steps
- Complete error log
- Message history up to the failure point

### 3. Resume Capability

You can check what's been completed and potentially resume manually:

```typescript
const progress = await getWorkflowProgress(projectId);

if (!progress.hasLocations && progress.hasCharacters) {
  // Manually add locations to existing project
  const locationResult = await LocationTemplateGenerationPrompt({
    userInput: "Create locations for this manga",
    projectContext: await getProjectWithRelations(projectId),
  });
}
```

## 📝 Example Usage Patterns

See `workflow-examples.ts` for complete examples of:

- Full manga creation with all features
- Quick manga creation for prototyping
- Progressive creation with monitoring
- Custom configuration
- Error recovery with retry logic

## 🚦 Rate Limiting Considerations

The workflow respects model rate limits through:

- Built-in delays between requests
- Exponential backoff on retries
- Configurable timing parameters
- Timeout protection

Adjust `WORKFLOW_CONFIG` based on your model provider's limits:

- **OpenAI**: Default settings work well
- **Claude**: May need longer delays
- **Local models**: Can reduce delays
- **Free tiers**: Increase delays significantly

## 🎉 Benefits

1. **Reliability**: Robust error handling prevents total failures
2. **Efficiency**: Intelligent ordering minimizes context switching
3. **Flexibility**: Multiple workflow options for different needs
4. **Transparency**: Complete logging and progress tracking
5. **Scalability**: Rate limiting prevents API exhaustion
6. **Maintainability**: Clean separation of concerns and modular design
