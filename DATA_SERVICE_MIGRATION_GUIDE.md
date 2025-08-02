# Data Service Migration to API-First Architecture

This document outlines the migration of the MangaAI application's data service from direct database access to an API-first architecture.

## Overview

The data service has been migrated from direct Supabase/database access to a server-side API architecture, providing better security, scalability, and separation of concerns.

## Architecture Changes

### Before (Direct Database Access)

```
Client/Server → Data Service → Supabase Client → Database
```

### After (API-First)

```
Client → API Data Service → API Endpoints → Supabase Service → Database
```

## New Components

### 1. API Endpoints Structure

```
/api/data/
├── projects/
│   ├── route.ts                    # GET (all), POST (create)
│   ├── [id]/
│   │   ├── route.ts               # GET, PUT, DELETE
│   │   └── with-relations/
│   │       └── route.ts           # GET project with all relations
├── chapters/
│   ├── route.ts                   # GET (by projectId), POST
│   └── [id]/
│       └── route.ts               # GET, PUT, DELETE
├── scenes/
│   ├── route.ts                   # GET (by chapterId), POST
│   └── [id]/
│       └── route.ts               # GET, PUT, DELETE
├── panels/
│   ├── route.ts                   # GET (by sceneId), POST
│   └── [id]/
│       ├── route.ts               # GET, PUT, DELETE
│       └── characters/
│           ├── route.ts           # POST (assign character)
│           └── [characterId]/
│               └── route.ts       # DELETE (remove character)
├── dialogues/
│   ├── route.ts                   # GET (by panelId), POST
│   └── [id]/
│       └── route.ts               # GET, PUT, DELETE
├── characters/
│   ├── route.ts                   # GET (by projectId), POST
│   ├── all/
│   │   └── route.ts               # GET all characters
│   └── [id]/
│       └── route.ts               # GET, PUT, DELETE
└── templates/
    ├── outfits/
    │   ├── route.ts               # GET (with filters), POST
    │   └── [id]/
    │       └── route.ts           # GET, PUT, DELETE
    └── locations/
        ├── route.ts               # GET (with filters), POST
        └── [id]/
            └── route.ts           # GET, PUT, DELETE
```

### 2. API Data Service Client

The `APIDataService` class provides a clean interface for client-side code:

```typescript
import { apiDataService } from "@/services/api-data.service";

// All methods now use API endpoints
const projects = await apiDataService.getAllProjects();
const project = await apiDataService.getProject(id);
const newProject = await apiDataService.createProject(data);
```

### 3. Configuration System

The `DATA_SERVICE_CONFIG` allows switching between API and direct database access:

```typescript
import { getDataServiceConfig, shouldUseAPI } from "@/lib/data-service-config";

// Automatically uses API for client-side, configurable for server-side
const useAPI = shouldUseAPI();
```

## API Response Format

All API endpoints follow a consistent response format:

### Success Response

```typescript
{
  success: true,
  data: T, // The actual data
  timestamp: string // ISO timestamp
}
```

### Error Response

```typescript
{
  success: false,
  error: string, // Error message
  timestamp?: string // ISO timestamp
}
```

## Security Improvements

1. **Centralized Access Control**: All database access goes through API endpoints
2. **Request Validation**: Server-side validation of all requests
3. **Error Handling**: Consistent error responses without exposing internal details
4. **Audit Trail**: All API calls can be logged and monitored

## Migration Changes

### Files Created

1. **API Endpoints**:

   - `/src/app/api/data/projects/route.ts`
   - `/src/app/api/data/projects/[id]/route.ts`
   - `/src/app/api/data/projects/[id]/with-relations/route.ts`
   - `/src/app/api/data/chapters/route.ts`
   - `/src/app/api/data/chapters/[id]/route.ts`
   - `/src/app/api/data/scenes/route.ts`
   - `/src/app/api/data/scenes/[id]/route.ts`
   - `/src/app/api/data/panels/route.ts`
   - `/src/app/api/data/panels/[id]/route.ts`
   - (And more for dialogues, characters, templates...)

2. **Services**:

   - `/src/services/api-data.service.ts` - Client-side API service
   - `/src/lib/data-service-config.ts` - Configuration management

3. **Updated**:
   - `/src/services/data-service.ts` - Now uses API service instead of direct DB

### Code Changes

#### Before (Direct Database):

```typescript
import { supabaseDataService } from "./supabase.service";

await supabaseDataService.initialize();
const projects = await supabaseDataService.getAllProjects();
```

#### After (API-First):

```typescript
import { apiDataService } from "./api-data.service";

const projects = await apiDataService.getAllProjects();
```

## Benefits

1. **🔒 Security**: Database access is centralized and controlled
2. **📈 Scalability**: API endpoints can be cached, rate-limited, and load-balanced
3. **🛡️ Validation**: Server-side validation ensures data integrity
4. **📊 Monitoring**: All data access can be logged and monitored
5. **🔧 Flexibility**: Easy to switch between different data sources
6. **🌐 API-First**: Can be consumed by external applications
7. **⚡ Performance**: Potential for caching and optimization

## Configuration Options

### Force API Mode (Recommended)

```typescript
// In data-service-config.ts
export const DATA_SERVICE_CONFIG = {
  mode: "api" as const,
  // ...
};
```

### Development Mode with Logging

```typescript
// In data-service-config.ts
export const DATA_SERVICE_CONFIG = {
  development: {
    logRequests: true,
    logResponses: true,
    validateResponses: true,
  },
};
```

## API Usage Examples

### Projects

```typescript
// Get all projects
const projects = await apiDataService.getAllProjects();

// Get project with relations
const project = await apiDataService.getProjectWithRelations(id);

// Create project
const newProject = await apiDataService.createProject({
  title: "My Manga",
  concept: "Epic adventure",
  // ...
});

// Update project
await apiDataService.updateProject(id, {
  title: "Updated Title",
});

// Delete project (cascades to chapters, scenes, panels, dialogues)
await apiDataService.deleteProject(id);
```

### Chapters

```typescript
// List chapters for a project
const chapters = await apiDataService.listChapters(projectId);

// Create chapter
const chapter = await apiDataService.createChapter({
  projectId,
  title: "Chapter 1",
  chapterNumber: 1,
});
```

### Characters

```typescript
// List characters for a project
const characters = await apiDataService.listCharacters(projectId);

// Create character
const character = await apiDataService.createCharacter({
  projectId,
  name: "Hero",
  description: "The main protagonist",
});

// Assign character to panel
await apiDataService.assignCharacterToPanel(panelId, characterId);
```

## Error Handling

The API service includes comprehensive error handling:

```typescript
try {
  const project = await apiDataService.getProject(id);
  if (!project) {
    console.log("Project not found");
    return;
  }
  // Use project...
} catch (error) {
  console.error("Failed to get project:", error.message);
  // Handle error appropriately
}
```

## Testing

To test the migration:

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Test API endpoints directly**:

   ```bash
   # Get all projects
   curl http://localhost:9002/api/data/projects

   # Create a project
   curl -X POST http://localhost:9002/api/data/projects \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Project","concept":"Test concept"}'
   ```

3. **Test through the application**:
   - Create a new manga project
   - Edit project details
   - Create chapters, scenes, panels
   - Verify all CRUD operations work

## Monitoring and Debugging

### API Request Logging

```typescript
// Enable in development
DATA_SERVICE_CONFIG.development.logRequests = true;
```

### Network Tab

Check the browser's Network tab to see API requests and responses.

### Server Logs

Check the Next.js console for server-side API logs.

## Rollback Plan

If issues occur, you can rollback by:

1. **Restore the old data service**:

   ```bash
   mv src/services/data-service-old.ts src/services/data-service.ts
   ```

2. **Update configuration**:

   ```typescript
   // In data-service-config.ts
   export const DATA_SERVICE_CONFIG = {
     mode: "direct" as const,
   };
   ```

3. **Comment out API endpoints** if needed

## Future Enhancements

1. **Caching**: Implement Redis caching for frequently accessed data
2. **Rate Limiting**: Add rate limiting to prevent API abuse
3. **Pagination**: Add pagination support for large datasets
4. **Batch Operations**: Support batch create/update/delete operations
5. **Real-time Updates**: WebSocket support for real-time data updates
6. **API Versioning**: Support multiple API versions
7. **Authentication**: Add user authentication and authorization
8. **External API**: Expose public APIs for third-party integrations

## Troubleshooting

### Common Issues

1. **404 Errors**: Check if API endpoints are properly created
2. **CORS Issues**: Ensure API routes are in the correct Next.js structure
3. **Network Errors**: Check if the development server is running
4. **Data Not Loading**: Check browser console and network tab for errors

### Debugging Tips

1. Enable request logging in development
2. Use browser DevTools Network tab
3. Check server console for API errors
4. Use API testing tools like Postman or curl
5. Verify database connectivity in API endpoints

The migration provides a robust, scalable, and secure foundation for the MangaAI application's data layer.
