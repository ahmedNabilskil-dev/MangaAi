
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'; // Import Combobox
import { MultiSelect, type SelectOption } from '@/components/ui/multi-select'; // Import MultiSelect
import { FileUpload } from '@/components/ui/file-upload'; // Import FileUpload
import { type NodeType } from '@/types/nodes';
import nodeFormConfig, { type FormFieldConfig } from '@/config/node-form-config'; // Import config

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

    // Pre-process initialValues based on field type (e.g., comma-separated for multi-select)
    const processedInitialValues = React.useMemo(() => {
        const values = { ...initialValues };
        config.fields.forEach(field => {
            const fieldName = field.name;
            const value = values[fieldName];
            if (field.type === 'multi-select' && Array.isArray(value)) {
                values[fieldName] = value; // Keep as array for MultiSelect component
            } else if (field.type === 'file' && value) {
                // Handle potential initial file value (e.g., a URL or just indicator)
                // For this example, we assume initialValues won't contain actual File objects.
                // We might store a URL or filename. The FileUpload component handles display.
                values[fieldName] = value; // Keep existing string value (e.g., URL)
            }
             // Ensure booleans are handled correctly
            else if (field.type === 'checkbox' && typeof value === 'undefined') {
                 values[fieldName] = false; // Default to false if undefined
            }
             // Default numbers if undefined/NaN
             else if (field.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
                 values[fieldName] = field.numberConfig?.defaultValue ?? 0;
             }
             // Default strings if undefined
             else if (field.type === 'text' || field.type === 'textarea' || field.type === 'select' || field.type === 'combobox') {
                 values[fieldName] = value ?? '';
             }

        });
         // Apply schema defaults for any missing fields AFTER processing initial values
         try {
             const parsedWithDefaults = currentSchema.parse({});
             for (const key in parsedWithDefaults) {
                 if (values[key] === undefined) {
                     values[key] = parsedWithDefaults[key];
                 }
             }
         } catch (e) {
             console.warn("Error parsing schema defaults:", e);
         }


        return values;
    }, [initialValues, config.fields, currentSchema]);


    const form = useForm<CurrentSchemaType>({
        resolver: zodResolver(currentSchema),
        defaultValues: processedInitialValues,
    });

     // Reset form when initialValues change (i.e., a different node is selected)
     React.useEffect(() => {
         form.reset(processedInitialValues);
     }, [form, processedInitialValues]);


    // Post-process form data before submitting (e.g., handle file uploads)
    const handleFormSubmit = async (data: CurrentSchemaType) => {
        const processedData = { ...data };

        // Example: Handle file uploads (replace file object with URL/storage path)
        // This requires async handling and integration with your storage solution
        const fileFields = config.fields.filter(f => f.type === 'file');
        for (const field of fileFields) {
            const file = processedData[field.name as keyof CurrentSchemaType];
            if (file instanceof File) {
                 console.log(`Uploading file for field ${field.name}: ${file.name}`);
                 // Replace with your actual upload logic
                 // const uploadResult = await uploadFileToStorage(file);
                 // processedData[field.name as keyof CurrentSchemaType] = uploadResult.url; // Store URL
                 // For demo, we'll just store the filename
                 processedData[field.name as keyof CurrentSchemaType] = file.name as any;
            } else if (typeof file === 'string') {
                 // Assume it's already a URL or identifier, keep it
                 processedData[field.name as keyof CurrentSchemaType] = file;
            } else {
                // No file selected or cleared
                processedData[field.name as keyof CurrentSchemaType] = null as any;
            }
        }


        onSubmit(processedData);
    };

    // Function to render form fields based on configuration
    const renderFormField = (fieldConfig: FormFieldConfig) => {
        const { name, label, type, description, placeholder, options, fileConfig, comboboxConfig, numberConfig, multiselectConfig } = fieldConfig;

        return (
            <FormField
                key={name}
                control={form.control}
                name={name as any} // Type assertion needed due to dynamic nature
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            {/* Render appropriate input based on type */}
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
                                    // Ensure value sent to RHF is a number or undefined
                                     onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                    disabled={isLoading}
                                 />
                            )}
                            {type === 'checkbox' && (
                                <div className="flex items-center space-x-2 pt-2">
                                     <Checkbox
                                        id={name}
                                        checked={!!field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading}
                                    />
                                     <label
                                        htmlFor={name}
                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        {placeholder || label} {/* Use placeholder as label if provided */}
                                      </label>
                                </div>

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
                                     selected={field.value || []} // Ensure value is an array
                                     onChange={field.onChange}
                                     placeholder={placeholder}
                                     disabled={isLoading}
                                 />
                            )}
                             {type === 'file' && (
                                 <FileUpload
                                     // We manage the File object state within the component,
                                     // RHF stores the File object or null/undefined
                                     onFileChange={(file) => field.onChange(file)}
                                     label={label} // Pass label down if needed, or remove from here
                                     accept={fileConfig?.accept}
                                     disabled={isLoading}
                                     // You might need to handle display of existing file (e.g., URL)
                                     // based on initialValues, potentially passing it as a prop
                                 />
                             )}
                        </FormControl>
                        {description && <FormDescription>{description}</FormDescription>}
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
                className="space-y-4" // Reduced spacing
            >
                {config.fields.map((fieldConfig) => renderFormField(fieldConfig))}
                {/* Submit button is now in the parent PropertiesPanel */}
            </form>
        </Form>
    );
}
