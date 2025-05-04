
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'; // Ensure Zod is imported
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription, // Corrected import name
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea'; // Ensure this path is correct and file exists
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { MultiSelect, type SelectOption } from '@/components/ui/multi-select';
import { FileUpload } from '@/components/ui/file-upload';
import { type NodeType } from '@/types/nodes';
import nodeFormConfig, { type FormFieldConfig } from '@/config/node-form-config'; // Import config
import { Label } from '@/components/ui/label'; // Import Label

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
            if (field.type === 'multi-select' && Array.isArray(value)) {
                values[fieldName] = value;
            } else if (field.type === 'file' && value) {
                values[fieldName] = value;
            } else if (field.type === 'checkbox' && typeof value === 'undefined') {
                values[fieldName] = false;
            } else if (field.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
                values[fieldName] = field.numberConfig?.defaultValue ?? ''; // Use empty string for uncontrolled number inputs if needed, or 0
            } else if ((field.type === 'text' || field.type === 'textarea' || field.type === 'select' || field.type === 'combobox') && typeof value === 'undefined') {
                 values[fieldName] = ''; // Default empty strings
             }
             // Ensure array type for multi-select if undefined
             else if (field.type === 'multi-select' && typeof value === 'undefined') {
                 values[fieldName] = [];
             }

        });

        // Apply schema defaults AFTER processing initial values, only for undefined fields
        let schemaDefaults = {};
        try {
             // Attempt to parse an empty object to get defaults defined in the schema
             schemaDefaults = currentSchema.parse ? currentSchema.parse({}) : {};
        } catch (e) {
             // Ignore parsing errors if schema requires fields not present in empty object
             // console.warn("Could not determine all schema defaults:", e);
        }

        // Merge defaults for keys not present in processed values
        for (const key in schemaDefaults) {
           if (values[key] === undefined && schemaDefaults[key as keyof typeof schemaDefaults] !== undefined) {
               values[key] = schemaDefaults[key as keyof typeof schemaDefaults];
           }
        }

        return values;
    }, [initialValues, config.fields, currentSchema]);


    const form = useForm<CurrentSchemaType>({
        resolver: zodResolver(currentSchema),
        // Use processed values, ensuring defaults from schema are applied if not present
        defaultValues: processedInitialValues,
    });

     // Reset form when initialValues change (i.e., a different node is selected)
     React.useEffect(() => {
         form.reset(processedInitialValues);
     }, [form, processedInitialValues]);


    // Post-process form data before submitting (e.g., handle file uploads)
    const handleFormSubmit = async (data: CurrentSchemaType) => {
        const processedData = { ...data };

        // Example: Handle file uploads
        const fileFields = config.fields.filter(f => f.type === 'file');
        for (const field of fileFields) {
            const file = processedData[field.name as keyof CurrentSchemaType];
            if (file instanceof File) {
                 console.log(`Uploading file for field ${field.name}: ${file.name}`);
                 // Replace with your actual upload logic
                 // For demo, store the filename
                 processedData[field.name as keyof CurrentSchemaType] = file.name as any;
            } else if (typeof file === 'string') {
                 processedData[field.name as keyof CurrentSchemaType] = file;
            } else {
                processedData[field.name as keyof CurrentSchemaType] = null as any;
            }
        }


        onSubmit(processedData);
    };

    // Function to render form fields based on configuration
    const renderFormField = (fieldConfig: FormFieldConfig) => {
        const { name, label, type, description, placeholder, options, fileConfig, comboboxConfig, numberConfig, multiselectConfig } = fieldConfig;
         const fieldSchema = currentSchema.shape[name];

        return (
            <FormField
                key={name}
                control={form.control}
                name={name as any} // Type assertion needed due to dynamic nature
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        {/* Render appropriate input based on type */}
                         {type === 'checkbox' ? (
                             // Special handling for Checkbox: Label is separate, FormControl wraps the input
                            <div className="flex items-center space-x-2 pt-2">
                                <FormControl>
                                    <Checkbox
                                        id={name} // Use name as ID for label association
                                        checked={!!field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading}
                                        aria-describedby={description ? `${field.name}-description` : undefined}
                                    />
                                </FormControl>
                                 <Label
                                    htmlFor={name}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {placeholder || label} {/* Use placeholder as inline label text */}
                                </Label>
                            </div>
                         ) : (
                            // For other types, FormControl wraps the input directly
                            <FormControl>
                                <>
                                {type === 'text' && (
                                    <Input placeholder={placeholder} {...field} value={field.value ?? ''} disabled={isLoading} />
                                )}
                                {type === 'textarea' && (
                                    <Textarea placeholder={placeholder} {...field} value={field.value ?? ''} rows={5} disabled={isLoading}/>
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
                                    />
                                )}
                                {type === 'select' && options && (
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value ?? ''} disabled={isLoading}>
                                        <SelectTrigger>
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
                                        onFileChange={(file) => field.onChange(file)}
                                        accept={fileConfig?.accept}
                                        disabled={isLoading}
                                    />
                                )}
                                </>
                            </FormControl>
                        )}
                        {description && <FormDescription id={`${field.name}-description`}>{description}</FormDescription>}
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
                className="space-y-4"
            >
                {config.fields.map((fieldConfig) => renderFormField(fieldConfig))}
                {/* Submit button is now in the parent PropertiesPanel */}
            </form>
        </Form>
    );
}
