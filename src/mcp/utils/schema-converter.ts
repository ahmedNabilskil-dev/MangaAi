import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Converts a Zod schema to JSON Schema format suitable for MCP tools
 */
export function zodSchemaToMcpSchema(
  zodSchema: z.ZodSchema,
  name?: string
): any {
  const jsonSchema = zodToJsonSchema(zodSchema, name);

  // Remove $schema property as MCP doesn't need it
  if (jsonSchema.$schema) {
    delete jsonSchema.$schema;
  }

  return jsonSchema;
}

/**
 * Helper to create MCP tool input schema from Zod schema
 */
export function createMcpInputSchema(zodSchema: z.ZodSchema, name?: string) {
  return zodSchemaToMcpSchema(zodSchema, name);
}

/**
 * Helper to create MCP tool output schema from Zod schema
 */
export function createMcpOutputSchema(zodSchema: z.ZodSchema, name?: string) {
  return zodSchemaToMcpSchema(zodSchema, name);
}
