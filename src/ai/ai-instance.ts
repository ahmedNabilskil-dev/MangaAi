import { ChatAdapterFactory } from "@/ai/adapters/adapter.factory";
import {
  ChatAdapter,
  Message,
  TextGenerationParams,
  Tool,
} from "@/ai/adapters/type";
import { Content } from "@google/genai";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Type definitions for the GenKit clone
 */
type Schema = z.ZodType<any, any, any>;

// Tool definitions
interface ToolDefinition<TInput extends Schema, TOutput extends Schema> {
  name: string;
  description: string;
  inputSchema: TInput;
  outputSchema?: TOutput;
}

interface ToolImplementation<TInput, TOutput> {
  (input: TInput, context?: Record<string, any>): Promise<TOutput>;
}

// Prompt definitions
interface PromptDefinition<TInput extends Schema, TOutput extends Schema> {
  name: string;
  tools?: Tool[];
  input: { schema: TInput };
  output?: { schema: TOutput };
  toolCall?: boolean;
  prompt: string;
}

// Flow definitions
interface FlowDefinition<TInput extends Schema, TOutput extends Schema> {
  name: string;
  inputSchema: TInput;
  outputSchema?: TOutput;
}

interface FlowImplementation<TInput, TOutput> {
  (input: TInput, context?: Record<string, any>): Promise<TOutput>;
}

// Context store for maintaining shared context
class ContextStore {
  private static instance: ContextStore;
  private contextData: Record<string, any> = {};

  private constructor() {}

  public static getInstance(): ContextStore {
    if (!ContextStore.instance) {
      ContextStore.instance = new ContextStore();
    }
    return ContextStore.instance;
  }

  public set(key: string, value: any): void {
    this.contextData[key] = value;
  }

  public get(key: string): any {
    return this.contextData[key];
  }

  public getAll(): Record<string, any> {
    return { ...this.contextData };
  }

  public merge(data: Record<string, any>): void {
    this.contextData = { ...this.contextData, ...data };
  }

  public clear(): void {
    this.contextData = {};
  }
}

export class ChatEngine {
  private adapter: ChatAdapter | null;
  private model?: string;
  private contextStore: ContextStore;

  constructor(config: { provider: string; model?: string; apiKey: string }) {
    this.adapter = ChatAdapterFactory.getAdapter(
      config.provider,
      config.apiKey
    );
    this.model = config.model;
    this.contextStore = ContextStore.getInstance();

    if (!this.adapter) {
      throw new Error(
        `Failed to load adapter for provider: ${config.provider}`
      );
    }
  }

  /**
   * Set global context data that will be available to all flows and prompts
   */
  setContext(data: Record<string, any>): void {
    this.contextStore.merge(data);
  }

  /**
   * Clear all global context data
   */
  clearContext(): void {
    this.contextStore.clear();
  }

  defineTool<TInput extends Schema, TOutput extends Schema>(
    definition: ToolDefinition<TInput, TOutput>,
    implementation: ToolImplementation<z.infer<TInput>, z.infer<TOutput>>
  ) {
    // Validate the tool definition
    if (!definition.name) {
      throw new Error("Tool must have a name");
    }
    if (!definition.description) {
      throw new Error("Tool must have a description");
    }
    if (!definition.inputSchema) {
      throw new Error("Tool must have an input schema");
    }

    const jsonInputSchema = zodToJsonSchema(definition.inputSchema, {
      $refStrategy: "none",
      target: "openApi3",
      rejectedAdditionalProperties: undefined,
    });

    const execute = async (
      input: z.infer<TInput>,
      context?: Record<string, any>
    ): Promise<z.infer<TOutput>> => {
      // Validate input using zod
      const validatedInput = definition.inputSchema.parse(input);

      try {
        // Merge global context with provided context
        const mergedContext = {
          ...this.contextStore.getAll(),
          ...(context || {}),
        };

        // Execute the implementation with merged context
        const result = await implementation(validatedInput, mergedContext);

        // Validate output using zod
        const validatedOutput = definition.outputSchema
          ? definition.outputSchema.parse(result)
          : result;
        return validatedOutput;
      } catch (error: any) {
        return `Error in tool ${definition.name}: ${error.message}`;
      }
    };

    const inputSchema = removeProperty(jsonInputSchema, "additionalProperties");
    const inputTool: Tool = {
      name: definition.name,
      description: definition.description,
      parameters: inputSchema,
      execute,
    };

    return inputTool;
  }

  /**
   * Define a prompt with schema validation and template
   */
  definePrompt<TInput extends Schema, TOutput extends Schema>(
    definition: PromptDefinition<TInput, TOutput>,
    config: {
      context?: Record<string, any>;
      params?: TextGenerationParams;
    } = {}
  ) {
    // Validate the prompt definition
    if (!definition.name) {
      throw new Error("Prompt must have a name");
    }
    if (!definition.input || !definition.input.schema) {
      throw new Error("Prompt must have an input schema");
    }
    if (definition.output && !definition.output.schema) {
      throw new Error("Prompt must have an output schema");
    }
    if (!definition.prompt) {
      throw new Error("Prompt must have a template string");
    }

    // Return a function that processes inputs through the prompt
    return async (
      input: z.infer<TInput>,
      flowContext?: Record<string, any>
    ): Promise<{ output: z.infer<TOutput> | null }> => {
      try {
        // Validate input using zod
        const validatedInput = definition.input.schema.parse(input);

        const outputSchema = definition.output
          ? zodToJsonSchema(definition.output?.schema, {
              $refStrategy: "none",
              target: "openApi3",
              rejectedAdditionalProperties: undefined,
            })
          : undefined;

        // Merge contexts with priority: flowContext > config.context > global context
        const promptContext = {
          ...this.contextStore.getAll(),
          ...config.context,
          ...flowContext,
          outputSchema: outputSchema
            ? removeProperty(outputSchema, "additionalProperties")
            : undefined,
        };

        const prompt = renderTemplate(definition.prompt, {
          ...validatedInput,
          context: promptContext,
        });

        const output = await this.sendMessage(
          [
            ...(flowContext?.messages || []),
            ...[{ role: "user", content: prompt }],
          ],
          definition.tools || [],
          {
            ...config.params,
            model: config.params?.model || this.model,
            context: promptContext,
          },
          !!definition.toolCall
        );

        const result = output.at(-1)?.content;

        return { output: outputSchema ? JSON.parse(result) : result };
      } catch (error: any) {
        console.error(`Error in prompt ${definition.name}:`, error);
        return { output: null };
      }
    };
  }

  /**
   * Define a flow with schema validation and implementation
   */
  defineFlow<TInput extends Schema, TOutput extends Schema>(
    definition: FlowDefinition<TInput, TOutput>,
    implementation: FlowImplementation<z.infer<TInput>, z.infer<TOutput>>
  ) {
    // Validate the flow definition
    if (!definition.name) {
      throw new Error("Flow must have a name");
    }
    if (!definition.inputSchema) {
      throw new Error("Flow must have an input schema");
    }

    // Return a wrapped version of the implementation that includes validation
    return async (
      input: z.infer<TInput>,
      context?: Record<string, any>
    ): Promise<z.infer<TOutput>> => {
      try {
        // Validate input using zod
        const validatedInput = definition.inputSchema.parse(input);

        // Merge global context with provided context
        const mergedContext = {
          ...this.contextStore.getAll(),
          ...(context || {}),
        };

        // Execute the implementation with merged context
        const result = await implementation(validatedInput, mergedContext);
        // Validate output using zod
        const validatedOutput = definition.outputSchema
          ? definition.outputSchema.parse(result)
          : result;
        return validatedOutput;
      } catch (error: any) {
        throw new Error(`Error in flow ${definition.name}: ${error.message}`);
      }
    };
  }

  async sendMessage(
    messages: Message[],
    tools: Tool[],
    params: TextGenerationParams,
    toolCall: boolean
  ): Promise<Message[]> {
    return (await this.adapter?.send(messages, tools, params, toolCall)) || [];
  }

  async generateImage({
    prompt,
    history,
  }: {
    prompt: string;
    history: Content[];
  }) {
    return await this.adapter?.generateImage({ prompt, history });
  }
}

/**
 * Renders a template string by replacing placeholders with values from the provided data object.
 * Supports both simple {{variable}} placeholders and conditional blocks like {{#if condition}}...{{/if}}
 *
 * @param template The template string with placeholders
 * @param data The data object containing values to insert into the template
 * @returns The rendered template with placeholders replaced by actual values
 */
export function renderTemplate(
  template: string,
  data: Record<string, any>
): string {
  // First, handle each blocks (loops)
  let processedTemplate = processEachBlocks(template, data);

  // Then, handle conditional blocks
  processedTemplate = processConditionalBlocks(processedTemplate, data);

  // Finally, handle simple variable substitutions
  processedTemplate = processSimpleVariables(processedTemplate, data);

  return processedTemplate;
}

/**
 * Process each blocks in the format {{#each array}}...{{/each}}
 * Supports accessing array item properties and provides @index
 */
function processEachBlocks(
  template: string,
  data: Record<string, any>
): string {
  const eachRegex = /\{\{#each\s+([^\s}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

  return template.replace(eachRegex, (match, arrayPath, content) => {
    const arrayValue = getNestedProperty(data, arrayPath.trim());

    // If not an array or empty, return empty string
    if (!Array.isArray(arrayValue) || arrayValue.length === 0) {
      return "";
    }

    // Process each item in the array
    return arrayValue
      .map((item, index) => {
        let itemContent = content;

        // Create context data for this iteration
        const itemContext = {
          ...data, // Include parent context
          ...item, // Include current item properties (for objects)
          "@index": index, // Special @index variable
          "@first": index === 0, // Special @first variable
          "@last": index === arrayValue.length - 1, // Special @last variable
        };

        // If item is not an object, make it available as 'this'
        if (typeof item !== "object" || item === null) {
          itemContext["this"] = item;
        }

        // Process any nested each blocks first
        itemContent = processEachBlocks(itemContent, itemContext);

        // Process conditionals within this iteration
        itemContent = processConditionalBlocks(itemContent, itemContext);

        // Process variables within this iteration
        itemContent = processSimpleVariables(itemContent, itemContext);

        return itemContent;
      })
      .join("");
  });
}

/**
 * Process conditional blocks in the format {{#if condition}}...{{/if}}
 * Also supports {{#if (eq variable "value")}}...{{/if}} style expressions
 */
function processConditionalBlocks(
  template: string,
  data: Record<string, any>
): string {
  // Match patterns like {{#if condition}}...{{/if}} or {{#if (eq var "value")}}...{{/if}}
  const ifRegex =
    /\{\{#if\s+(?:\(eq\s+([^\s]+)\s+"?([^"]+)"?\)|([^\s]+))\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;

  return template.replace(
    ifRegex,
    (match, eqVar, eqValue, simpleVar, ifContent, elseContent = "") => {
      let condition = false;

      // Check if it's an equality check
      if (eqVar && eqValue !== undefined) {
        // Handle equality condition: {{#if (eq var "value")}}
        const varValue = getNestedProperty(data, eqVar);
        condition = varValue === eqValue;
      } else if (simpleVar) {
        // Handle simple condition: {{#if var}}
        const varValue = getNestedProperty(data, simpleVar);
        condition = Boolean(varValue);
      }

      return condition ? ifContent : elseContent;
    }
  );
}

/**
 * Process simple variable placeholders in the format {{variable}}
 */
function processSimpleVariables(
  template: string,
  data: Record<string, any>
): string {
  const varRegex = /\{\{([^#\/][^}]*?)\}\}/g;

  return template.replace(varRegex, (match, path) => {
    const value = getNestedProperty(data, path.trim());

    // Handle undefined values
    if (value === undefined || value === null) {
      return "";
    }

    // Convert arrays and objects to string representation
    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  });
}

/**
 * Get a value from a nested property path like "user.profile.name"
 */
function getNestedProperty(obj: Record<string, any>, path: string): any {
  // Handle paths with dot notation
  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}
export const ai = new ChatEngine({
  provider: "gemini",
  model: "gemini-2.0-flash",
  apiKey: localStorage?.getItem("api-key") || "",
});

function removeProperty<T>(obj: T, propertyToRemove: string): any {
  // Handle null or non-object values
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => removeProperty(item, propertyToRemove));
  }

  // Create a new object to store the filtered properties
  const newObj: Record<string, any> = {};

  // Iterate through each property in the object
  for (const key in obj) {
    // Skip if it's the property we want to remove
    if (key === propertyToRemove) {
      continue;
    }

    // Recursively process nested objects and arrays
    newObj[key] = removeProperty(
      (obj as Record<string, any>)[key],
      propertyToRemove
    );
  }

  return newObj;
}
