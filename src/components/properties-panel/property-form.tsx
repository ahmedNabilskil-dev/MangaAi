"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { type ComboboxOption } from "@/components/ui/combobox";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect, type SelectOption } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// --- Field Configuration Types ---
type BaseFieldConfig = {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  section?: string; // Grouping property
};

type TextFieldConfig = BaseFieldConfig & { type: "text" };
type TextAreaFieldConfig = BaseFieldConfig & { type: "textarea" };
type NumberFieldConfig = BaseFieldConfig & {
  type: "number";
  numberConfig?: {
    step?: number | string;
    min?: number;
    max?: number;
    defaultValue?: number;
  };
};
type CheckboxFieldConfig = BaseFieldConfig & { type: "checkbox" };
type SelectFieldConfig = BaseFieldConfig & {
  type: "select";
  options: SelectOption[];
};
type ComboboxFieldConfig = BaseFieldConfig & {
  type: "combobox";
  options: ComboboxOption[];
  comboboxConfig?: {
    searchPlaceholder?: string;
    emptyText?: string;
    allowCustomValue?: boolean;
  };
};
type MultiSelectFieldConfig = BaseFieldConfig & {
  type: "multi-select";
  options: SelectOption[];
};
type FileFieldConfig = BaseFieldConfig & {
  type: "file";
  fileConfig?: { accept?: string };
};
type SliderFieldConfig = BaseFieldConfig & {
  type: "slider";
  sliderConfig: {
    min: number;
    max: number;
    step: number;
    defaultValue?: number;
  };
};
type ColorFieldConfig = BaseFieldConfig & { type: "color" };

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

// Form Configuration Type
export type FormConfigType = {
  icon: React.ElementType;
  schema: z.ZodObject<any, any>;
  fields: FormFieldConfig[];
};

export type FormConfigMap = Record<string, FormConfigType>;

interface PropertyFormProps {
  nodeType: string;
  initialValues?: Record<string, any>;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  formId: string;
  config: FormConfigMap;
}

export default function PropertyForm({
  nodeType,
  initialValues = {},
  onSubmit,
  isLoading = false,
  formId,
  config,
}: PropertyFormProps) {
  // Get the configuration for this node type
  const typeConfig = config[nodeType];

  // Handle missing configuration
  if (!typeConfig) {
    return (
      <p className="text-destructive">
        Form configuration not found for type: {nodeType}
      </p>
    );
  }

  const currentSchema = typeConfig.schema;
  type FormData = z.infer<typeof currentSchema>;

  // Process initial values with schema defaults
  const processedInitialValues = React.useMemo(() => {
    // Get defaults from schema
    const parseResult = currentSchema.safeParse({});
    const schemaDefaults = parseResult.success ? parseResult.data : {};

    // Merge with provided initial values
    const mergedValues = { ...schemaDefaults, ...initialValues };

    // Ensure correct types for specific fields
    typeConfig.fields.forEach((field) => {
      const fieldName = field.name as keyof typeof mergedValues;
      const value = mergedValues[fieldName];

      if (field.type === "multi-select" && !Array.isArray(value)) {
        mergedValues[fieldName] = [];
      } else if (field.type === "checkbox" && typeof value !== "boolean") {
        mergedValues[fieldName] = false;
      } else if (
        field.type === "number" &&
        (typeof value !== "number" || isNaN(value))
      ) {
        mergedValues[fieldName] = field.numberConfig?.defaultValue ?? null;
      } else if (field.type === "file") {
        if (!(value instanceof File) && typeof value !== "string") {
          mergedValues[fieldName] = null;
        }
      }
    });

    return mergedValues as FormData;
  }, [initialValues, typeConfig.fields, currentSchema]);

  // Initialize form with React Hook Form
  const form = useForm<FormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: processedInitialValues,
    mode: "onChange",
  });

  // Reset form when initialValues change
  useEffect(() => {
    form.reset(processedInitialValues);
  }, [form, processedInitialValues]);

  // Handle form submission
  const handleFormSubmit = (data: FormData) => {
    const processedData = { ...data };

    // Process file fields
    const fileFields = typeConfig.fields.filter((f) => f.type === "file");
    for (const field of fileFields) {
      const fileKey = field.name as any;
      const file = processedData[fileKey];

      if (file instanceof File) {
        processedData[fileKey] = file;
      } else if (typeof file === "string") {
        processedData[fileKey] = file;
      } else {
        processedData[fileKey] = null as any;
      }
    }

    onSubmit(processedData);
  };

  // Group fields by section
  const fieldsBySection: Record<string, FormFieldConfig[]> = {};
  typeConfig.fields.forEach((field) => {
    const section = field.section || "General";
    if (!fieldsBySection[section]) {
      fieldsBySection[section] = [];
    }
    fieldsBySection[section].push(field);
  });
  const sections = Object.keys(fieldsBySection);

  // Function to render a single form field
  const renderFormField = (fieldConfig: FormFieldConfig) => {
    const { name, label, type, description, placeholder } = fieldConfig;

    return (
      <FormField
        key={name}
        control={form.control}
        name={name as any}
        render={({ field, fieldState }) => (
          <FormItem className="mb-4">
            <FormLabel>{label}</FormLabel>
            {type === "checkbox" ? (
              <div className="flex items-center space-x-2 pt-1">
                <FormControl>
                  <Checkbox
                    id={name}
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    aria-describedby={
                      description ? `${field.name}-description` : undefined
                    }
                    aria-invalid={fieldState.invalid}
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
                <>
                  {type === "text" && (
                    <Input
                      placeholder={placeholder}
                      {...field}
                      value={field.value ?? ""}
                      disabled={isLoading}
                      className="h-8"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                  {type === "textarea" && (
                    <Textarea
                      placeholder={placeholder}
                      {...field}
                      value={field.value ?? ""}
                      rows={3}
                      disabled={isLoading}
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                  {type === "number" && (
                    <Input
                      type="number"
                      placeholder={placeholder}
                      step={fieldConfig.numberConfig?.step ?? "any"}
                      min={fieldConfig.numberConfig?.min}
                      max={fieldConfig.numberConfig?.max}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? null : parseFloat(val));
                      }}
                      disabled={isLoading}
                      className="h-8"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                  {type === "select" && fieldConfig.options && (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value ?? ""}
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        className="h-8"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue
                          placeholder={
                            placeholder || `Select ${label.toLowerCase()}`
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldConfig.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {type === "combobox" && fieldConfig.options && (
                    <div>
                      <input
                        list={`datalist-${field.name}`}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder={
                          placeholder || `Select or type ${label.toLowerCase()}`
                        }
                        disabled={isLoading}
                        className="h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-invalid={fieldState.invalid}
                      />
                      <datalist id={`datalist-${field.name}`}>
                        {fieldConfig.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </datalist>
                    </div>
                  )}
                  {type === "multi-select" && fieldConfig.options && (
                    <MultiSelect
                      options={fieldConfig.options}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder={placeholder}
                      disabled={isLoading}
                    />
                  )}
                  {type === "file" && (
                    <FileUpload
                      onFileChange={(fileOrUrl) => field.onChange(fileOrUrl)}
                      accept={fieldConfig.fileConfig?.accept}
                      disabled={isLoading}
                      currentFile={field.value}
                    />
                  )}
                  {type === "slider" && fieldConfig.sliderConfig && (
                    <Slider
                      id={name}
                      name={name}
                      min={fieldConfig.sliderConfig.min}
                      max={fieldConfig.sliderConfig.max}
                      step={fieldConfig.sliderConfig.step}
                      value={[
                        Number(
                          field.value ??
                            fieldConfig.sliderConfig.defaultValue ??
                            fieldConfig.sliderConfig.min
                        ),
                      ]}
                      onValueChange={(val) => field.onChange(val[0])}
                      disabled={isLoading}
                      className="mt-2"
                    />
                  )}
                  {type === "color" && (
                    <Input
                      type="color"
                      {...field}
                      value={field.value ?? "#000000"}
                      disabled={isLoading}
                      className="h-8 p-1"
                    />
                  )}
                </>
              </FormControl>
            )}
            {description && (
              <FormDescription
                id={`${field.name}-description`}
                className="text-xs"
              >
                {description}
              </FormDescription>
            )}
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
                  {fieldsBySection[section].map((fieldConfig) =>
                    renderFormField(fieldConfig)
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </form>
    </Form>
  );
}
