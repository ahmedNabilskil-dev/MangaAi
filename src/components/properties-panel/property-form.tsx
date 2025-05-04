'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from "@/components/ui/textarea';
import { type NodeType } from '@/types/nodes';

// Define base schema - can be extended or chosen based on nodeType
const baseSchema = z.object({});

// Define schemas for different node types
const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
});

const chapterSchema = z.object({
  title: z.string().min(1, "Chapter title is required"),
  summary: z.string().optional(),
});

const sceneSchema = z.object({
  title: z.string().min(1, "Scene title is required"),
  setting: z.string().optional(),
  notes: z.string().optional(),
});

const panelSchema = z.object({
    description: z.string().min(1, "Panel description is required"),
    imageUrl: z.string().url("Must be a valid URL").optional(),
});

const dialogSchema = z.object({
    character: z.string().min(1, "Character name is required"),
    text: z.string().min(1, "Dialog text is required"),
});

const characterSchema = z.object({
    name: z.string().min(1, "Character name is required"),
    description: z.string().optional(),
    imageUrl: z.string().url("Must be a valid URL").optional(),
});


// Map node types to their schemas
const nodeSchemaMap: Record<NodeType, z.ZodObject<any, any>> = {
  project: projectSchema,
  chapter: chapterSchema,
  scene: sceneSchema,
  panel: panelSchema,
  dialog: dialogSchema,
  character: characterSchema,
};

interface PropertyFormProps {
    nodeType: NodeType;
    initialValues?: Record<string, any>;
    onSubmit: (data: any) => void;
}

export default function PropertyForm({ nodeType, initialValues = {}, onSubmit }: PropertyFormProps) {
    const currentSchema = nodeSchemaMap[nodeType] || baseSchema;
    type CurrentSchemaType = z.infer<typeof currentSchema>;

    const form = useForm<CurrentSchemaType>({
        resolver: zodResolver(currentSchema),
        defaultValues: initialValues,
    });

    // Function to render form fields based on schema
    const renderFormField = (fieldName: string, fieldSchema: z.ZodType<any, any>) => {
        const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1'); // Basic label generation

        let control: React.ReactNode;

        // Determine control type based on schema or conventions
        if (fieldSchema instanceof z.ZodString) {
             if (fieldName.toLowerCase().includes('description') || fieldName.toLowerCase().includes('notes') || fieldName.toLowerCase().includes('summary') || fieldName.toLowerCase().includes('text')) {
                control = <Textarea placeholder={`Enter ${label.toLowerCase()}...`} {...form.register(fieldName as any)} />;
            } else if (fieldName.toLowerCase().includes('imageurl')) {
                control = <Input type="url" placeholder={`Enter ${label.toLowerCase()}...`} {...form.register(fieldName as any)} />;
            }
            else {
                control = <Input placeholder={`Enter ${label.toLowerCase()}...`} {...form.register(fieldName as any)} />;
            }
        } else {
            // Add more type handlers (number, boolean, select, etc.) as needed
            control = <Input placeholder={`Enter ${label.toLowerCase()}...`} {...form.register(fieldName as any)} />;
        }


        return (
            <FormField
                key={fieldName}
                control={form.control}
                name={fieldName as any} // Type assertion needed due to dynamic nature
                render={({ field }) => ( // Use render prop for custom controls or pass directly
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            {React.cloneElement(control as React.ReactElement, { ...field })}
                        </FormControl>
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
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
                {Object.keys(currentSchema.shape).map((fieldName) =>
                    renderFormField(fieldName, currentSchema.shape[fieldName])
                )}
                {/* Hidden submit button for internal form submission, if needed */}
                {/* <Button type="submit" className="hidden">Save</Button> */}
            </form>
        </Form>
    );
}
