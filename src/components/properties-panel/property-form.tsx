
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod'; // Import z from zod
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select
import { type NodeType } from '@/types/nodes';
import {
    mangaProjectSchema,
    chapterSchema,
    characterSchema,
    sceneSchema,
    panelSchema,
    panelDialogueSchema
} from '@/types/schemas'; // Import the new schemas
import { MangaStatus } from '@/types/enums'; // Import enum

// Map node types to their schemas
const nodeSchemaMap = {
  project: mangaProjectSchema,
  chapter: chapterSchema,
  scene: sceneSchema,
  panel: panelSchema,
  dialogue: panelDialogueSchema,
  character: characterSchema,
};

interface PropertyFormProps {
    nodeType: NodeType;
    initialValues?: Record<string, any>;
    onSubmit: (data: any) => void;
}

export default function PropertyForm({ nodeType, initialValues = {}, onSubmit }: PropertyFormProps) {
    const currentSchema = nodeSchemaMap[nodeType];
    type CurrentSchemaType = z.infer<typeof currentSchema>;

    // Pre-process initialValues for array/JSON fields
    const processedInitialValues = React.useMemo(() => {
        const values = { ...initialValues };
        const shape = currentSchema.shape as Record<string, z.ZodTypeAny>;
        for (const fieldName in shape) {
            const fieldSchema = shape[fieldName];
            // Ensure fieldSchema exists before accessing description
            if (!fieldSchema) continue;
            const description = fieldSchema.description;

             // Handle simple-array / comma-separated string fields
             if (description?.startsWith("Comma-separated")) {
                 if (Array.isArray(values[fieldName])) {
                     values[fieldName] = values[fieldName].join(', ');
                 } else if (values[fieldName] === null || typeof values[fieldName] === 'undefined') {
                     values[fieldName] = ''; // Default to empty string if null/undefined
                 }
             }
             // Handle JSON string fields
             else if (description?.startsWith("JSON string")) {
                 if (typeof values[fieldName] === 'object' && values[fieldName] !== null) {
                    try {
                       values[fieldName] = JSON.stringify(values[fieldName], null, 2); // Pretty print JSON
                    } catch (e) {
                        console.error(`Error stringifying ${fieldName}:`, e);
                        values[fieldName] = '{}'; // Default to empty object string on error
                    }
                 } else if (typeof values[fieldName] === 'undefined' || values[fieldName] === null) {
                     values[fieldName] = ''; // Use empty string for undefined/null JSON fields
                 }
             }
        }
        // Ensure required fields like 'title' or 'name' have at least an empty string if missing
        // This prevents the ZodError during initialization if initialValues completely lacks a required field.
        if (nodeType === 'project' || nodeType === 'chapter' || nodeType === 'scene') {
            values.title = values.title ?? '';
        }
        if (nodeType === 'character') {
            values.name = values.name ?? '';
        }
        if (nodeType === 'dialogue') {
             values.content = values.content ?? '';
        }
        // Ensure number fields have a default if missing and required, or if initial value is not a number
        if (nodeType === 'chapter' && (typeof values.chapterNumber !== 'number' || isNaN(values.chapterNumber))) {
             values.chapterNumber = 1; // Default or consider making it optional/nullable in schema if appropriate
        }
         if ((nodeType === 'scene' || nodeType === 'panel' || nodeType === 'dialogue') && (typeof values.order !== 'number' || isNaN(values.order))) {
             values.order = 0;
         }


        return values;
    }, [initialValues, currentSchema, nodeType]);


    const form = useForm<CurrentSchemaType>({
        resolver: zodResolver(currentSchema),
        // Use processedInitialValues directly. Zod default values will be applied
        // by the resolver if fields are missing.
        defaultValues: processedInitialValues,
    });

    // Post-process form data before submitting
    const handleFormSubmit = (data: CurrentSchemaType) => {
        const processedData = { ...data };
        const shape = currentSchema.shape as Record<string, z.ZodTypeAny>;

        for (const fieldName in shape) {
             const fieldSchema = shape[fieldName];
              // Ensure fieldSchema exists before accessing description
             if (!fieldSchema) continue;
             const description = fieldSchema.description;
             const value = processedData[fieldName as keyof CurrentSchemaType];

            // Convert comma-separated strings back to arrays
            if (description?.startsWith("Comma-separated") && typeof value === 'string') {
                 processedData[fieldName as keyof CurrentSchemaType] = value.split(',').map(s => s.trim()).filter(Boolean);
            }
            // Parse JSON strings back to objects/arrays
            else if (description?.startsWith("JSON string") && typeof value === 'string' && value.trim()) {
                try {
                    processedData[fieldName as keyof CurrentSchemaType] = JSON.parse(value);
                } catch (e) {
                    console.error(`Error parsing JSON for ${fieldName}:`, e);
                     // Optionally set an error state or keep the invalid string
                     form.setError(fieldName as any, { type: 'manual', message: 'Invalid JSON format' });
                     // Or maybe revert to original or empty object
                     // processedData[fieldName as keyof CurrentSchemaType] = initialValues[fieldName] || {};
                     return; // Prevent submission if JSON is invalid
                }
            } else if (description?.startsWith("JSON string") && (typeof value !== 'string' || !value.trim())) {
                 // Handle empty or non-string JSON fields (e.g., set to null or default object)
                 processedData[fieldName as keyof CurrentSchemaType] = null; // Or maybe {} or initialValues[fieldName]
            }
         }
        onSubmit(processedData);
    };


    // Function to render form fields based on schema
    const renderFormField = (fieldName: string, fieldSchema: z.ZodType<any, any>) => {
        const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1'); // Basic label generation
        const description = fieldSchema.description; // Get description from Zod schema
        let control: React.ReactNode;

        // Determine control type based on schema and description
        if (fieldSchema instanceof z.ZodBoolean) {
             control = (
                 // Checkbox needs special handling with FormField render prop
                 <FormField
                     key={fieldName}
                     control={form.control}
                     name={fieldName as any}
                     render={({ field }) => (
                         <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                             <FormControl>
                                <Checkbox
                                   // Ensure value is boolean or provide default
                                   checked={!!field.value}
                                   onCheckedChange={field.onChange}
                                />
                             </FormControl>
                              <div className="space-y-1 leading-none">
                                  <FormLabel>{label}</FormLabel>
                                  {description && <FormMessage>{description}</FormMessage>}
                              </div>
                         </FormItem>
                    )}
                 />
             );
             return control; // Return early as Checkbox handles its own FormField
        } else if (fieldSchema instanceof z.ZodNativeEnum || (fieldSchema instanceof z.ZodOptional && fieldSchema.unwrap() instanceof z.ZodNativeEnum)) {
           const enumValues = Object.values((fieldSchema instanceof z.ZodOptional ? fieldSchema.unwrap() : fieldSchema).enum);
           control = (
             <Select onValueChange={form.setValue.bind(form, fieldName as any)} defaultValue={form.getValues(fieldName as any)}>
               <FormControl>
                 <SelectTrigger>
                   <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                 </SelectTrigger>
               </FormControl>
               <SelectContent>
                 {enumValues.map((enumValue: any) => (
                   <SelectItem key={enumValue} value={enumValue}>
                     {String(enumValue).charAt(0).toUpperCase() + String(enumValue).slice(1)}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           );
       } else if (fieldSchema instanceof z.ZodEnum || (fieldSchema instanceof z.ZodOptional && fieldSchema.unwrap() instanceof z.ZodEnum)) {
            const enumValues = (fieldSchema instanceof z.ZodOptional ? fieldSchema.unwrap() : fieldSchema).options;
            control = (
              <Select onValueChange={form.setValue.bind(form, fieldName as any)} defaultValue={form.getValues(fieldName as any)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {enumValues.map((enumValue: any) => (
                    <SelectItem key={enumValue} value={enumValue}>
                     {String(enumValue).charAt(0).toUpperCase() + String(enumValue).slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
       } else if (fieldSchema instanceof z.ZodString || (fieldSchema instanceof z.ZodOptional && fieldSchema.unwrap() instanceof z.ZodString)) {
            if (description?.includes("URL")) {
                 control = <Input type="url" placeholder={`Enter ${label.toLowerCase()} URL...`} />;
            } else if ( description?.startsWith("JSON string") || description?.startsWith("Comma-separated") || ['description', 'summary', 'notes', 'text', 'content', 'personality', 'abilities', 'backstory', 'concept', 'prompt', 'purpose', 'tone'].some(keyword => fieldName.toLowerCase().includes(keyword)) ) {
                 control = <Textarea placeholder={`Enter ${label.toLowerCase()}...`} rows={description?.startsWith("JSON string") ? 6 : 3} />;
            } else {
                 control = <Input placeholder={`Enter ${label.toLowerCase()}...`} />;
            }
        } else if (fieldSchema instanceof z.ZodNumber || (fieldSchema instanceof z.ZodOptional && fieldSchema.unwrap() instanceof z.ZodNumber)) {
            control = <Input type="number" placeholder={`Enter ${label.toLowerCase()}...`} step={fieldSchema.isInt ? 1 : 'any'} />;
        }
        else {
             // Default input for unknown types
             control = <Input placeholder={`Enter ${label.toLowerCase()}...`} />;
        }


        return (
            <FormField
                key={fieldName}
                control={form.control}
                name={fieldName as any} // Type assertion needed due to dynamic nature
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            {React.cloneElement(control as React.ReactElement, { ...field, value: field.value ?? '' })}
                        </FormControl>
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    return (
        <Form {...form}>
            <form
                id="property-form" // ID for external submit button
                onSubmit={form.handleSubmit(handleFormSubmit)} // Use the wrapper
                className="space-y-6"
            >
                {Object.keys(currentSchema.shape).map((fieldName) => {
                     // Exclude the 'id' field from being rendered in the form
                     if (fieldName === 'id') return null;
                     const fieldSchema = (currentSchema.shape as Record<string, z.ZodTypeAny>)[fieldName];
                     // Ensure fieldSchema is valid before rendering
                     if (!fieldSchema) return null;
                     return renderFormField(fieldName, fieldSchema);
                 })}
                {/* The actual submit button is in the parent PropertiesPanel */}
            </form>
        </Form>
    );
}
