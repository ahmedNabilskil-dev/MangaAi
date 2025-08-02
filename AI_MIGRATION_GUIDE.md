# AI Model Migration to Server-Side

This document outlines the migration of the MangaAI application's AI model from client-side to server-side architecture.

## Overview

The AI functionality has been moved from client-side execution to server-side API endpoints to improve security, performance, and maintainability.

## Architecture Changes

### Before (Client-Side)

```
Client → AI Adapters (Gemini) → AI Provider API
```

### After (Server-Side)

```
Client → AI Service → API Routes → AI Adapters (Gemini) → AI Provider API
```

## New Components

### 1. Server-Side API Endpoints

#### `/api/ai/chat` - Chat Completion

- **Method**: POST
- **Purpose**: Handle text generation and tool calling
- **Request Body**:
  ```typescript
  {
    messages: Message[];
    tools?: Tool[];
    params?: TextGenerationParams;
    callTool?: boolean;
    apiKey: string;
    provider?: string; // default: "gemini"
  }
  ```
- **Response**:
  ```typescript
  {
    success: boolean;
    messages: Message[];
    timestamp: string;
  }
  ```

#### `/api/ai/generate-image` - Image Generation

- **Method**: POST
- **Purpose**: Generate images using AI
- **Request Body**:
  ```typescript
  {
    prompt: string;
    history?: Content[];
    apiKey: string;
    provider?: string; // default: "gemini"
  }
  ```
- **Response**:
  ```typescript
  {
    success: boolean;
    text: string;
    image46: string;
    timestamp: string;
  }
  ```

### 2. Client-Side AI Service

The `AIService` class provides a clean interface for client-side code to interact with the server-side AI endpoints.

```typescript
import { aiService } from "@/services/ai.service";

// Configure
aiService.setApiKey("your-api-key");
aiService.setProvider("gemini");

// Use
const messages = await aiService.sendChatMessage(messages, tools, params);
const image = await aiService.generateImage(prompt, history);
const projectId = await aiService.createProject(idea, tools, systemPrompt);
```

### 3. Server Configuration

The `ServerAIConfig` class handles server-side security, validation, and monitoring:

- API key validation
- Rate limiting
- Input sanitization
- Error handling
- Usage logging

## Security Improvements

1. **API Key Protection**: API keys are no longer exposed to client-side code
2. **Input Sanitization**: All user inputs are sanitized on the server
3. **Rate Limiting**: Basic rate limiting to prevent abuse
4. **Request Validation**: Comprehensive validation of all API requests

## Migration Changes

### Files Modified

1. **Created**:

   - `/src/app/api/ai/chat/route.ts`
   - `/src/app/api/ai/generate-image/route.ts`
   - `/src/services/ai.service.ts`
   - `/src/lib/server-ai-config.ts`

2. **Updated**:
   - `/src/app/page.tsx` - Uses AIService instead of direct adapters
   - `/src/app/projects/page.tsx` - Uses AIService instead of direct adapters
   - `/src/components/chat-interface/new-manga-chat-layout.tsx` - Uses AIService
   - `/src/lib/image-generation-tool.ts` - Uses AIService for image generation

### Code Changes

#### Before (Client-Side):

```typescript
const { ChatAdapterFactory } = await import("@/ai/adapters/factory");
const apiKey = localStorage.getItem("api-key") || "";
const geminiAdapter = ChatAdapterFactory.getAdapter("gemini", apiKey);
const response = await geminiAdapter.send(messages, tools, params, true);
```

#### After (Server-Side):

```typescript
const { aiService } = await import("@/services/ai.service");
const apiKey = localStorage.getItem("api-key") || "";
aiService.setApiKey(apiKey);
aiService.setProvider("gemini");
const response = await aiService.sendChatMessage(messages, tools, params, true);
```

## Benefits

1. **Security**: API keys are handled server-side
2. **Performance**: Reduced client-side bundle size
3. **Scalability**: Centralized AI request handling
4. **Monitoring**: Server-side logging and analytics
5. **Rate Limiting**: Built-in protection against abuse
6. **Consistency**: Standardized error handling and responses

## Environment Variables

For production deployment, consider setting up environment variables for:

```env
# Optional: Server-side API keys (if you want to avoid client-side keys entirely)
GEMINI_API_KEY=your_gemini_api_key

# Optional: Rate limiting configuration
AI_RATE_LIMIT_WINDOW_MS=60000
AI_RATE_LIMIT_MAX_REQUESTS=100

# Optional: Logging configuration
AI_LOG_LEVEL=info
AI_LOG_ENDPOINT=your_logging_service_url
```

## Future Enhancements

1. **Redis Rate Limiting**: Implement proper distributed rate limiting
2. **Request Caching**: Cache common requests to reduce API costs
3. **Usage Analytics**: Detailed usage tracking and billing
4. **Multiple Providers**: Easy switching between AI providers
5. **Streaming Responses**: Support for streaming AI responses
6. **Request Queuing**: Handle high-volume requests efficiently

## Testing

To test the migration:

1. Start the development server
2. Test project creation functionality
3. Test image generation
4. Test chat interface
5. Verify API key handling works correctly
6. Check that all previous functionality remains intact

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Ensure localStorage has the API key set
2. **CORS Issues**: Check if API routes are properly configured
3. **Rate Limiting**: Check if requests are being rate limited
4. **Invalid API Key**: Verify API key format validation

### Debugging

Check server logs for detailed error information:

```bash
npm run dev
# Check console for "AI API Usage" logs
```

## Rollback Plan

If issues occur, you can temporarily rollback by:

1. Reverting the client-side components to use direct adapters
2. Commenting out the new API routes
3. Using the original client-side architecture

The original AI adapter code remains intact for this purpose.
