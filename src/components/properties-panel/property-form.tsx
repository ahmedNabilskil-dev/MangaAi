
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
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
} from "@/components/ui/accordion"; // Import Accordion components

interface PropertyFormProps {
    nodeType: NodeType;
    initialValues?: Record<string, any>;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
}

export default function PropertyForm({ nodeType, initialValues = {}, onSubmit, isLoading }: PropertyFormProps) {
    const config = nodeFormConfig[nodeType];
    if (!config) {
        return <p className="text-destructive">Form configuration not found for node type: {nodeType}</p>;
    }
    const currentSchema = config.schema;
    type CurrentSchemaType = z.infer<typeof currentSchema>;

    // Pre-process initialValues based on field type
    const processedInitialValues = React.useMemo(() => {
        const values = { ...initialValues };
        config.fields.forEach(field => {
            const fieldName = field.name;
            const value = values[fieldName];
            if (field.type === 'multi-select' && value === undefined) {
                values[fieldName] = []; // Ensure multi-select defaults to empty array
            } else if (field.type === 'checkbox' && typeof value === 'undefined') {
                values[fieldName] = false;
            } else if (field.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
                 // Default to empty string or 0 based on schema/preference
                 values[fieldName] = field.numberConfig?.defaultValue ?? '';
            } else if (field.type !== 'checkbox' && field.type !== 'multi-select' && field.type !== 'number' && typeof value === 'undefined') {
                values[fieldName] = ''; // Default empty strings for others
            }
        });
        return values;
    }, [initialValues, config.fields]);

    const form = useForm<CurrentSchemaType>({
        resolver: zodResolver(currentSchema),
        defaultValues: processedInitialValues, // Use processed values
    });

    // Reset form when initialValues change
    React.useEffect(() => {
        form.reset(processedInitialValues);
    }, [form, processedInitialValues]);

    // Post-process form data before submitting
    const handleFormSubmit = async (data: CurrentSchemaType) => {
        const processedData = { ...data };
        const fileFields = config.fields.filter(f => f.type === 'file');
        for (const field of fileFields) {
            const file = processedData[field.name as keyof CurrentSchemaType];
            if (file instanceof File) {
                 console.log(`Uploading file for field ${field.name}: ${file.name}`);
                 processedData[field.name as keyof CurrentSchemaType] = file.name as any; // Example: store filename
            } else if (typeof file === 'string' && file.startsWith('data:image')) {
                 // Handle potential Data URL if needed, or just keep the string
                 processedData[field.name as keyof CurrentSchemaType] = file;
            } else if (typeof file !== 'string') { // If it's not a file or data url string, nullify
                processedData[field.name as keyof CurrentSchemaType] = null as any;
            }
        }
        onSubmit(processedData);
    };

    // --- Group fields by section ---
    const fieldsBySection: Record<string, FormFieldConfig[]> = {};
    config.fields.forEach(field => {
        const section = field.section || 'General'; // Default section
        if (!fieldsBySection[section]) {
            fieldsBySection[section] = [];
        }
        fieldsBySection[section].push(field);
    });
    const sections = Object.keys(fieldsBySection);
    // Determine default open sections (e.g., the first one or 'Basic Info')
    const defaultOpenSection = sections.includes('Basic Info') ? 'Basic Info' : sections[0];


    // Function to render a single form field
    const renderFormField = (fieldConfig: FormFieldConfig) => {
        const { name, label, type, description, placeholder, options, fileConfig, comboboxConfig, numberConfig, multiselectConfig } = fieldConfig;
        const fieldSchema = (currentSchema.shape as any)[name]; // Access shape properties

        return (
            <FormField
                key={name}
                control={form.control}
                name={name as any} // Type assertion needed due to dynamic nature
                render={({ field }) => (
                    <FormItem className="mb-4"> {/* Add some margin between fields */}
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
                                    />
                                </FormControl>
                                 <Label
                                    htmlFor={name}
                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {placeholder || label} {/* Use placeholder as inline label */}
                                </Label>
                            </div>
                         ) : (
                            <FormControl>
                                <>
                                {type === 'text' && (
                                    <Input placeholder={placeholder} {...field} value={field.value ?? ''} disabled={isLoading} className="h-8" />
                                )}
                                {type === 'textarea' && (
                                    <Textarea placeholder={placeholder} {...field} value={field.value ?? ''} rows={3} disabled={isLoading}/>
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
                                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                        disabled={isLoading}
                                        className="h-8"
                                    />
                                )}
                                {type === 'select' && options && (
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value ?? ''} disabled={isLoading}>
                                        <SelectTrigger className="h-8">
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
                                    />
                                )}
                                {type === 'multi-select' && options && (
                                    <MultiSelect
                                        options={options}
                                        selected={field.value || []}
                                        onChange={field.onChange}
                                        placeholder={placeholder}
                                        disabled={isLoading}
                                        // className="h-auto min-h-8" // Let MultiSelect control its height
                                    />
                                )}
                                {type === 'file' && (
                                    <FileUpload
                                        onFileChange={(file) => field.onChange(file)}
                                        accept={fileConfig?.accept}
                                        disabled={isLoading}
                                        // currentFile={field.value} // Pass current value if needed for display
                                    />
                                )}
                                </>
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
                id="property-form" // ID for external submit button
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-0" // Remove base spacing, handle inside accordion/fields
            >
                <Accordion type="single" collapsible defaultValue={defaultOpenSection} className="w-full">
                    {sections.map((section) => (
                        <AccordionItem value={section} key={section}>
                            <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                                {section}
                            </AccordionTrigger>
                            <AccordionContent>
                                {/* Add space within the content area */}
                                <div className="space-y-4 pt-2">
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
