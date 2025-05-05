
'use client';

import React, { useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { MultiSelect, type SelectOption } from '@/components/ui/multi-select';
import { FileUpload } from '@/components/ui/file-upload';
import { type NodeType } from '@/types/nodes';
import nodeFormConfig, { type FormFieldConfig } from '@/config/node-form-config';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEditorStore } from '@/store/editor-store';
import { type ShapeConfig } from '@/types/editor';
import { debounce } from 'lodash-es'; // Using lodash for debouncing

interface PropertyFormProps {
    nodeType: NodeType;
    initialValues?: Record<string, any>;
    onSubmit: (data: any) => void; // Keep onSubmit for explicit save action
    isLoading?: boolean;
    formId: string;
    selectedShapeId: string | null; // Pass selected shape ID for updates
}

// Debounced update function
const debouncedUpdateShape = debounce((id: string, updates: Partial<ShapeConfig> | { props: Record<string, any> }) => {
    useEditorStore.getState().updateShape(id, updates);
}, 300); // Debounce updates by 300ms


export default function PropertyForm({
    nodeType,
    initialValues = {},
    onSubmit,
    isLoading,
    formId,
    selectedShapeId
}: PropertyFormProps) {
    const config = nodeFormConfig[nodeType];
    if (!config) {
        return <p className="text-destructive">Form configuration not found for node type: {nodeType}</p>;
    }
    const currentSchema = config.schema;
    type CurrentSchemaType = z.infer<typeof currentSchema>;

    const processedInitialValues = React.useMemo(() => {
         const values = { ...initialValues };
         // Attempt to get defaults from the schema by parsing an empty object
         const parseResult = currentSchema.safeParse({});
         const schemaDefaults = parseResult.success ? parseResult.data : {};

         const mergedValues = { ...schemaDefaults, ...initialValues };

         config.fields.forEach(field => {
             const fieldName = field.name as keyof typeof mergedValues;
             const value = mergedValues[fieldName];

             // Ensure correct default types if undefined *after* merging schema defaults and initial values
             if (field.type === 'multi-select' && !Array.isArray(value)) {
                 mergedValues[fieldName] = [];
             } else if (field.type === 'checkbox' && typeof value !== 'boolean') {
                 mergedValues[fieldName] = false;
             } else if (field.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
                 mergedValues[fieldName] = field.numberConfig?.defaultValue ?? null;
             } else if (field.type !== 'checkbox' && field.type !== 'multi-select' && field.type !== 'number' && typeof value === 'undefined') {
                 mergedValues[fieldName] = '';
             }
             // Handle file type - initial value might be string URL or File object, keep as is
             else if (field.type === 'file' && value instanceof File) {
                 // Keep File object if present
                 mergedValues[fieldName] = value;
             } else if (field.type === 'file' && typeof value !== 'string' && !(value instanceof File)) {
                 mergedValues[fieldName] = null; // Default to null if not string or File
             }

         });
         return mergedValues as CurrentSchemaType;
     }, [initialValues, config.fields, currentSchema]);

    const form = useForm<CurrentSchemaType>({
        resolver: zodResolver(currentSchema),
        defaultValues: processedInitialValues,
        mode: 'onChange', // Enable validation on change
    });

    // Reset form when initialValues change (e.g., selecting a different node)
    useEffect(() => {
        form.reset(processedInitialValues);
    }, [form, processedInitialValues]);

    // Watch form values and trigger debounced update
    useEffect(() => {
        if (!selectedShapeId) return;

        const subscription = form.watch((value, { name, type }) => {
            if (type === 'change' && name) {
                 console.log(`Value changed for ${name}:`, value[name as keyof typeof value]);
                const fieldName = name as keyof ShapeConfig | string;
                const fieldValue = value[name as keyof typeof value];
                let updatePayload: Partial<ShapeConfig> | { props: Record<string, any> } = {};

                const nameParts = fieldName.split('.');
                 if (nameParts.length === 1) {
                     updatePayload = { [fieldName as keyof ShapeConfig]: fieldValue };
                 } else if (nameParts.length === 2 && nameParts[0] === 'props') {
                     updatePayload = { props: { [nameParts[1]]: fieldValue } };
                 } else {
                      console.warn("Unsupported property path for real-time update:", fieldName);
                      return; // Skip update for unsupported paths
                 }

                debouncedUpdateShape(selectedShapeId, updatePayload);
            }
        });
        return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.watch, selectedShapeId]);


    // Function to handle the explicit save button click
    const handleFormSubmit = async (data: CurrentSchemaType) => {
         // Cancel any pending debounced updates before explicit save
         debouncedUpdateShape.cancel();
         console.log("Explicit save triggered with data:", data);

        // Optional: Process file data before submitting if needed
        const processedData = { ...data };
        const fileFields = config.fields.filter(f => f.type === 'file');
        for (const field of fileFields) {
            const fileKey = field.name as keyof CurrentSchemaType;
            const file = processedData[fileKey];
            if (file instanceof File) {
                 // Handle file upload logic here if necessary (e.g., upload to storage)
                 // For now, just pass the File object or maybe its name/URL after upload
                 console.log(`File field ${field.name}:`, file.name);
                 // Example: processedData[fileKey] = await uploadFile(file);
                 // Keep as File for now, assuming updateShape/store handles it
                 processedData[fileKey] = file;
            } else if (typeof file === 'string') {
                 // Assume it's a URL, keep it
                  processedData[fileKey] = file;
            } else {
                 processedData[fileKey] = null as any; // Clear if not file or string
            }
        }
        onSubmit(processedData); // Call the original onSubmit passed from parent
    };

    // --- Group fields by section ---
    const fieldsBySection: Record<string, FormFieldConfig[]> = {};
    config.fields.forEach(field => {
        const section = field.section || 'General';
        if (!fieldsBySection[section]) {
            fieldsBySection[section] = [];
        }
        fieldsBySection[section].push(field);
    });
    const sections = Object.keys(fieldsBySection);
    const defaultOpenSection = sections.includes('Basic Info') ? 'Basic Info' : sections[0];

    // Function to render a single form field
    const renderFormField = (fieldConfig: FormFieldConfig) => {
        const { name, label, type, description, placeholder, options, fileConfig, comboboxConfig, numberConfig, multiselectConfig } = fieldConfig;

        return (
            <FormField
                key={name}
                control={form.control}
                name={name as any}
                render={({ field, fieldState }) => ( // Access fieldState for error status
                    <FormItem className="mb-4">
                        <FormLabel>{label}</FormLabel>
                         {type === 'checkbox' ? (
                            <div className="flex items-center space-x-2 pt-1">
                                <FormControl>
                                    <Checkbox
                                        id={name}
                                        checked={!!field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading}
                                        aria-describedby={description ? `${field.name}-description` : undefined}
                                        aria-invalid={fieldState.invalid} // Indicate invalid state
                                    />
                                </FormControl>
                                 <Label
                                    htmlFor={name}
                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {placeholder || label}
                                </Label>
                            </div>
                         ) : (
                            <FormControl>
                                <div> {/* Ensure FormControl wraps a single element */}
                                    {type === 'text' && (
                                        <Input placeholder={placeholder} {...field} value={field.value ?? ''} disabled={isLoading} className="h-8" aria-invalid={fieldState.invalid}/>
                                    )}
                                    {type === 'textarea' && (
                                        <Textarea placeholder={placeholder} {...field} value={field.value ?? ''} rows={3} disabled={isLoading} aria-invalid={fieldState.invalid}/>
                                    )}
                                    {type === 'number' && (
                                        <Input
                                            type="number"
                                            placeholder={placeholder}
                                            step={numberConfig?.step ?? 'any'}
                                            min={numberConfig?.min}
                                            max={numberConfig?.max}
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                field.onChange(val === '' ? null : parseFloat(val)); // Use null for empty numeric input if schema allows
                                            }}
                                            disabled={isLoading}
                                            className="h-8"
                                            aria-invalid={fieldState.invalid}
                                        />
                                    )}
                                    {type === 'select' && options && (
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value ?? ''} disabled={isLoading}>
                                            <SelectTrigger className="h-8" aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {options.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {type === 'combobox' && options && (
                                        <Combobox
                                            options={options}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder={placeholder}
                                            searchPlaceholder={comboboxConfig?.searchPlaceholder}
                                            emptyText={comboboxConfig?.emptyText}
                                            allowCustomValue={comboboxConfig?.allowCustomValue}
                                            disabled={isLoading}
                                            className="h-8"
                                            // Add aria-invalid or visual indicator based on fieldState.invalid
                                        />
                                    )}
                                    {type === 'multi-select' && options && (
                                        <MultiSelect
                                            options={options}
                                            selected={field.value || []}
                                            onChange={field.onChange}
                                            placeholder={placeholder}
                                            disabled={isLoading}
                                             // Add aria-invalid or visual indicator based on fieldState.invalid
                                        />
                                    )}
                                    {type === 'file' && (
                                        <FileUpload
                                            onFileChange={(fileOrUrl) => field.onChange(fileOrUrl)}
                                            accept={fileConfig?.accept}
                                            disabled={isLoading}
                                            currentFile={field.value}
                                            // Add aria-invalid or visual indicator based on fieldState.invalid
                                        />
                                    )}
                                </div>
                            </FormControl>
                        )}
                        {description && <FormDescription id={`${field.name}-description`} className="text-xs">{description}</FormDescription>}
                        <FormMessage /> {/* Displays validation errors */}
                    </FormItem>
                )}
            />
        );
    };


    return (
        <Form {...form}>
             {/* Pass the ID for external submission trigger */}
            <form
                id={formId}
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-0"
            >
                <Accordion type="multiple" defaultValue={sections} className="w-full"> {/* Default open all sections */}
                    {sections.map((section) => (
                        <AccordionItem value={section} key={section} className="border-b-0">
                            <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline border-b">
                                {section}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pt-3">
                                    {fieldsBySection[section].map((fieldConfig) => renderFormField(fieldConfig))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                {/* Submit button moved outside, triggered by form ID */}
            </form>
        </Form>
    );
}
