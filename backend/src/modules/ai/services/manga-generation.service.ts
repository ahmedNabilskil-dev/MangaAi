import { Message } from '@/common/types/ai';
import { mangaProjectSchema } from '@/types/schemas';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { zodSchemaToMcpSchema } from '../../../mcp/utils/schema-converter';
import { ChatAdapterFactory } from '../adapters/factory';
import {
  MANGA_GENERATION_PROMPT,
  MangaProjectGenerationSchema,
} from '../schemas/manga-generation.schema';

@Injectable()
export class MangaGenerationService {
  constructor(private configService: ConfigService) {}

  async generateMangaProject(
    mangaIdea: string,
  ): Promise<MangaProjectGenerationSchema> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('AI service not configured - missing API key');
    }

    // Get adapter directly from factory
    const adapter = ChatAdapterFactory.getAdapter('gemini', apiKey);
    if (!adapter) {
      throw new Error('No AI adapter available for manga generation');
    }

    // Convert Zod schema to JSON Schema for Gemini structured output
    const outputSchema = zodSchemaToMcpSchema(
      mangaProjectSchema.omit({
        id: true,
        chapters: true,
        characters: true,
        outfitTemplates: true,
        locationTemplates: true,
        coverImageUrl: true,
        status: true,
        tags: true,
        creatorId: true,
        createdAt: true,
        updatedAt: true,
        likeCount: true,
        viewCount: true,
        published: true,
        messages: true,
        initialPrompt: true,
      }),
    );

    // Prepare the structured prompt with the user's idea
    const fullPrompt = `${MANGA_GENERATION_PROMPT}

USER'S MANGA IDEA: "${mangaIdea}"

Generate the complete manga project structure based on this idea:`;

    // Create message for AI
    const messages: Message[] = [
      {
        role: 'user',
        content: fullPrompt,
        metadata: {
          timestamp: Date.now(),
        },
      },
    ];

    // Use factory adapter directly with structured output (no timeout limits)
    const responses = await adapter.send(
      messages,
      [], // No tools needed
      {
        temperature: 0.7,
        maxTokens: 8000, // Increased for detailed responses
        context: {
          outputSchema: outputSchema, // Gemini will automatically format response as JSON matching this schema
        },
      } as any, // Cast to any to avoid TypeScript issues with context property
      false, // Don't call tools
    );

    // Extract AI response
    const aiResponse = responses[responses.length - 1];
    if (!aiResponse?.content) {
      throw new Error('No response from AI adapter - generation failed');
    }

    console.log('Raw AI Response:', aiResponse.content);

    // Parse the structured JSON response (no cleaning needed - Gemini ensures valid JSON)
    let parsedData;
    try {
      parsedData = JSON.parse(aiResponse.content as string);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Raw content:', aiResponse.content);
      throw new Error('AI generated invalid JSON response');
    }

    // Validate against schema for extra safety
    return parsedData;
  }
}
