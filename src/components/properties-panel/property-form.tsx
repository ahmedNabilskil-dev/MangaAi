
'use client';

import React, { useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'; // Keep Zod import
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
import { Slider } from '@/components/ui/slider'; // Import Slider
import type { NodeType } from '@/types/nodes';
import type { ShapeConfig } from '@/types/editor';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEditorStore } from '@/store/editor-store';
import { debounce } from 'lodash-es'; // Using lodash for debouncing

// --- Field Configuration Types (Common Definition) ---
type BaseFieldConfig = {
    name: string;
    label: string;
    description?: string;
    placeholder?: string;
    section?: string; // Grouping property
};

type TextFieldConfig = BaseFieldConfig & { type: 'text' };
type TextAreaFieldConfig = BaseFieldConfig & { type: 'textarea' };
type NumberFieldConfig = BaseFieldConfig & { type: 'number'; numberConfig?: { step?: number | string; min?: number; max?: number, defaultValue?: number } };
type CheckboxFieldConfig = BaseFieldConfig & { type: 'checkbox' };
type SelectFieldConfig = BaseFieldConfig & { type: 'select'; options: SelectOption[] };
type ComboboxFieldConfig = BaseFieldConfig & { type: 'combobox'; options: ComboboxOption[]; comboboxConfig?: { searchPlaceholder?: string; emptyText?: string, allowCustomValue?: boolean } };
type MultiSelectFieldConfig = BaseFieldConfig & { type: 'multi-select'; options: SelectOption[]; multiselectConfig?: {} };
type FileFieldConfig = BaseFieldConfig & { type: 'file'; fileConfig?: { accept?: string } };
type SliderFieldConfig = BaseFieldConfig & { type: 'slider'; sliderConfig: { min: number; max: number; step: number; defaultValue?: number } };
type ColorFieldConfig = BaseFieldConfig & { type: 'color' };

export type FormFieldConfig =
    | TextFieldConfig
    | TextAreaFieldConfig
    | NumberFieldConfig
    | CheckboxFieldConfig
    | SelectFieldConfig
    | ComboboxFieldConfig
    | MultiSelectFieldConfig
    | FileFieldConfig
    | SliderFieldConfig
    | ColorFieldConfig;

// Generic Type for the config map (can hold either Node or Shape configs)
type FormConfigType = {
    icon: React.ElementType;
    schema: z.ZodObject<any, any>;
    fields: FormFieldConfig[];
};

type FormConfigMap = Record<string, FormConfigType>; // Index signature for Node or Shape types

interface PropertyFormProps {
    nodeType: string; // Use string to accept either NodeType or ShapeConfig['type']
    initialValues?: Record<string, any>;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    formId: string;
    selectedShapeId: string | null; // Keep for Fabric updates
    config: FormConfigMap; // Accept the appropriate config map (node or shape)
}

// Debounced update function for Fabric shapes
const debouncedUpdateShape = debounce((id: string, updates: Partial<ShapeConfig> | { props: Record<string, any> }) => {
    useEditorStore.getState().updateShape(id, updates);
}, 300);

export default function PropertyForm({
    nodeType,
    initialValues = {},
    onSubmit,
    isLoading,
    formId,
    selectedShapeId,
    config // Use the passed config map
}: PropertyFormProps) {
    const typeConfig = config[nodeType]; // Get config for the specific type
    if (!typeConfig) {
        return <p className="text-destructive">Form configuration not found for type: {nodeType}</p>;
    }
    const currentSchema = typeConfig.schema;
    type CurrentSchemaType = z.infer<typeof currentSchema>;

     const processedInitialValues = React.useMemo(() => {
         // Get defaults from schema by parsing an empty object
         const parseResult = currentSchema.safeParse({});
         const schemaDefaults = parseResult.success ? parseResult.data : {};

         // Merge schema defaults with provided initial values
         const mergedValues = { ...schemaDefaults, ...initialValues };

         // Ensure correct default types for specific fields if they remain undefined
         typeConfig.fields.forEach(field => {
             const fieldName = field.name as keyof typeof mergedValues;
             const value = mergedValues[fieldName];

             if (field.type === 'multi-select' && !Array.isArray(value)) {
                 mergedValues[fieldName] = [];
             } else if (field.type === 'checkbox' && typeof value !== 'boolean') {
                 mergedValues[fieldName] = false;
             } else if (field.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
                 // Use explicit defaultValue from numberConfig if provided, otherwise null/undefined might be better
                 mergedValues[fieldName] = field.numberConfig?.defaultValue ?? null;
             } else if (field.type === 'file') {
                 // Keep File or string, default to null otherwise
                 if (!(value instanceof File) && typeof value !== 'string') {
                     mergedValues[fieldName] = null;
                 }
             }
             // For other types, if still undefined after merging, schema default (or Zod default) takes precedence
             // If no Zod default, RHF defaultValues handles it initially.
         });

         return mergedValues as CurrentSchemaType;
     }, [initialValues, typeConfig.fields, currentSchema]);

    const form = useForm<CurrentSchemaType>({
        resolver: zodResolver(currentSchema),
        defaultValues: processedInitialValues,
        mode: 'onChange',
    });

    // Reset form when initialValues change
    useEffect(() => {
        form.reset(processedInitialValues);
    }, [form, processedInitialValues]);

    // Watch form values and trigger debounced update for Fabric shapes
    useEffect(() => {
        // Only apply debounced updates if it's a Fabric shape being edited
        if (!selectedShapeId || !['panel', 'bubble', 'image', 'text'].includes(nodeType)) return;

        const subscription = form.watch((value, { name, type }) => {
            if (type === 'change' && name) {
                const fieldName = name as keyof ShapeConfig | string;
                const fieldValue = value[name as keyof typeof value];
                let updatePayload: Partial<ShapeConfig> | { props: Record<string, any> } = {};

                const nameParts = fieldName.split('.');
                 if (nameParts.length === 1) {
                     updatePayload = { [fieldName as keyof ShapeConfig]: fieldValue };
                 } else if (nameParts.length === 2 && nameParts[0] === 'props') {
                     // Ensure nested props are updated correctly
                      const existingProps = useEditorStore.getState().pages
                         .flatMap(p => p.shapes)
                         .find(s => s.id === selectedShapeId)?.props ?? {};
                     updatePayload = { props: { ...existingProps, [nameParts[1]]: fieldValue } };
                 } else if (nameParts.length === 3 && nameParts[0] === 'props' && nameParts[1] === 'filters') {
                      // Handle filters specifically
                     const existingProps = useEditorStore.getState().pages
                         .flatMap(p => p.shapes)
                         .find(s => s.id === selectedShapeId)?.props ?? {};
                      const existingFilters = existingProps.filters ?? {};
                     updatePayload = { props: { filters: { ...existingFilters, [nameParts[2]]: fieldValue } } };
                 }
                 else {
                      console.warn("Unsupported property path for real-time update:", fieldName);
                      return;
                 }

                debouncedUpdateShape(selectedShapeId, updatePayload);
            }
        });
        return () => subscription.unsubscribe();
    }, [form.watch, selectedShapeId, nodeType]); // Rerun if shape ID or type changes


    // Function to handle the explicit save button click
    const handleFormSubmit = async (data: CurrentSchemaType) => {
        // Cancel any pending debounced updates before explicit save
        if (selectedShapeId) {
             debouncedUpdateShape.cancel();
        }
        console.log("Explicit save triggered with data:", data);

        // Process file data if needed
        const processedData = { ...data };
        const fileFields = typeConfig.fields.filter(f => f.type === 'file');
        for (const field of fileFields) {
            const fileKey = field.name as keyof CurrentSchemaType;
            const file = processedData[fileKey];
            if (file instanceof File) {
                 console.log(`File field ${field.name}:`, file.name);
                 // Pass File object for now
                 processedData[fileKey] = file;
            } else if (typeof file === 'string') {
                 processedData[fileKey] = file;
            } else {
                 processedData[fileKey] = null as any;
            }
        }
        onSubmit(processedData);
    };

    // --- Group fields by section ---
    const fieldsBySection: Record<string, FormFieldConfig[]> = {};
    typeConfig.fields.forEach(field => {
        const section = field.section || 'General';
        if (!fieldsBySection[section]) {
            fieldsBySection[section] = [];
        }
        fieldsBySection[section].push(field);
    });
    const sections = Object.keys(fieldsBySection);

    // Function to render a single form field
    const renderFormField = (fieldConfig: FormFieldConfig) => {
        const { name, label, type, description, placeholder, options, fileConfig, comboboxConfig, numberConfig, sliderConfig, multiselectConfig } = fieldConfig;

        return (
            <FormField
                key={name}
                control={form.control}
                name={name as any}
                render={({ field, fieldState }) => (
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
                                        aria-invalid={fieldState.invalid}
                                    />
                                </FormControl>
                                 <Label
                                    htmlFor={name}
                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {placeholder || label} {/* Use placeholder as label text if provided */}
                                </Label>
                            </div>
                         ) : (
                             <FormControl>
                                <React.Fragment> {/* Use Fragment to wrap multiple potential controls */}
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
                                                // Convert to number or null if empty
                                                field.onChange(val === '' ? null : parseFloat(val));
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
                                                    <SelectItem key={option.value} value={option.value} style={fieldConfig.fieldSpecificConfig?.isFontSelect ? { fontFamily: option.value } : {}}>
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
                                        />
                                    )}
                                    {type === 'multi-select' && options && (
                                        <MultiSelect
                                            options={options}
                                            selected={field.value || []}
                                            onChange={field.onChange}
                                            placeholder={placeholder}
                                            disabled={isLoading}
                                        />
                                    )}
                                    {type === 'file' && (
                                        <FileUpload
                                            onFileChange={(fileOrUrl) => field.onChange(fileOrUrl)}
                                            accept={fileConfig?.accept}
                                            disabled={isLoading}
                                            currentFile={field.value} // Display current value (URL or File name)
                                        />
                                    )}
                                     {type === 'slider' && sliderConfig && (
                                        <Slider
                                            id={name}
                                            name={name}
                                            min={sliderConfig.min}
                                            max={sliderConfig.max}
                                            step={sliderConfig.step}
                                            value={[Number(field.value ?? sliderConfig.defaultValue ?? sliderConfig.min)]} // Handle potential null/undefined
                                            onValueChange={(val) => field.onChange(val[0])} // Update with the single value
                                            disabled={isLoading}
                                            className="mt-2"
                                        />
                                    )}
                                     {type === 'color' && (
                                        <Input
                                            type="color"
                                            {...field}
                                            value={field.value ?? '#000000'} // Default to black if no value
                                            disabled={isLoading}
                                            className="h-8 p-1" // Adjust padding for color input
                                        />
                                    )}
                                </React.Fragment>
                            </FormControl>
                        )}
                        {description && <FormDescription id={`${field.name}-description`} className="text-xs">{description}</FormDescription>}
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };


    return (
        <Form {...form}>
            <form
                id={formId}
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-0"
            >
                <Accordion type="multiple" defaultValue={sections} className="w-full">
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
            </form>
        </Form>
    );
}
