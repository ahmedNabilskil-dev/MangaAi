
// src/components/editor/sidebars/properties-panel.tsx
'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { Slider } from '@/components/ui/slider'; // Import Slider
import { useEditorStore } from '@/store/editor-store';
import type { ShapeConfig, ImageFilterConfig } from '@/types/editor';

// Define available fonts
const availableFonts = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
    { value: 'Impact, charcoal, sans-serif', label: 'Impact' },
    { value: "'Roboto', sans-serif", label: "Roboto" },
    { value: "'Noto Sans JP', sans-serif", label: "Noto Sans JP (Japanese)" }
];


// This component is now specific to Fabric shape properties
const PropertiesPanel: React.FC<{ selectedShape: ShapeConfig | undefined }> = ({ selectedShape }) => {
  const { updateShape } = useEditorStore();

  // --- Generic Input Change Handler ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    propertyName: string // Allow nested props like 'props.text' or 'props.filters.brightness'
  ) => {
    if (!selectedShape) return;

    const { value, type } = e.target;
    let processedValue: any = value;

    // Process value based on input type
    if (type === 'number' || type === 'range') { // Handle range for slider
      processedValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }

    // Split propertyName for nested updates
    const nameParts = propertyName.split('.');
    let updatePayload: Partial<ShapeConfig> | { props: Record<string, any> } | { fabricProps: Record<string, any> } = {};

    if (nameParts.length === 1) {
      // Top-level property (left, top, fill, locked, visible etc.)
      updatePayload = { [propertyName]: processedValue };
    } else if (nameParts.length === 2 && nameParts[0] === 'props') {
      updatePayload = { props: { [nameParts[1]]: processedValue } };
    } else if (nameParts.length === 3 && nameParts[0] === 'props' && nameParts[1] === 'filters') {
      // Nested property within 'props.filters'
      updatePayload = {
          props: {
              filters: {
                  ...(selectedShape.props?.filters ?? {}), // Keep existing filters
                  [nameParts[2]]: processedValue
              }
          }
       };
    } else if (nameParts.length === 2 && nameParts[0] === 'fabricProps') {
        // Update fabricProps specifically
         updatePayload = { fabricProps: { [nameParts[1]]: processedValue } };
    } else {
      console.warn("Unsupported property path:", propertyName);
      return;
    }
    // Use the single updateShape action from the store
    updateShape(selectedShape.id, updatePayload);
  };


  // --- Specific Handler for Select Components ---
  const handleSelectChange = (value: string, propertyName: string) => {
       if (!selectedShape) return;
       const nameParts = propertyName.split('.');
       let updatePayload: Partial<ShapeConfig> | { props: Record<string, any> } | { fabricProps: Record<string, any> } = {};

       if (nameParts.length === 1) {
         updatePayload = { [propertyName]: value };
       } else if (nameParts.length === 2 && nameParts[0] === 'props') {
         updatePayload = { props: { [nameParts[1]]: value } };
       } else if (nameParts.length === 2 && nameParts[0] === 'fabricProps') {
           updatePayload = { fabricProps: { [nameParts[1]]: value } };
       } else {
         console.warn("Unsupported property path:", propertyName);
         return;
       }
       updateShape(selectedShape.id, updatePayload);
   };

    // --- Specific Handler for Checkbox Components ---
    const handleCheckboxChange = (checked: boolean | 'indeterminate', propertyName: string) => {
        if (!selectedShape || typeof checked === 'indeterminate') return;
        const nameParts = propertyName.split('.');
        let updatePayload: Partial<ShapeConfig> | { props: Record<string, any> } | { fabricProps: Record<string, any> } = {};

        if (nameParts.length === 1) {
            updatePayload = { [propertyName]: checked };
        } else if (nameParts.length === 2 && nameParts[0] === 'props') {
            updatePayload = { props: { [nameParts[1]]: checked } };
        } else if (nameParts.length === 3 && nameParts[0] === 'props' && nameParts[1] === 'filters') {
            updatePayload = { props: { filters: { ...(selectedShape.props?.filters ?? {}), [nameParts[2]]: checked } } };
        } else if (nameParts.length === 2 && nameParts[0] === 'fabricProps') {
            updatePayload = { fabricProps: { [nameParts[1]]: checked } };
        } else {
            console.warn("Unsupported property path:", propertyName);
            return;
        }
        updateShape(selectedShape.id, updatePayload);
    };

    // --- Specific Handler for Slider Components ---
    const handleSliderChange = (value: number[], propertyName: string) => {
        if (!selectedShape) return;
        const processedValue = value[0]; // Slider value is an array
        const nameParts = propertyName.split('.');
        let updatePayload: Partial<ShapeConfig> | { props: Record<string, any> } | { fabricProps: Record<string, any> } = {};

         if (nameParts.length === 1) {
            updatePayload = { [propertyName]: processedValue };
        } else if (nameParts.length === 2 && nameParts[0] === 'props') {
            updatePayload = { props: { [nameParts[1]]: processedValue } };
        } else if (nameParts.length === 3 && nameParts[0] === 'props' && nameParts[1] === 'filters') {
            updatePayload = { props: { filters: { ...(selectedShape.props?.filters ?? {}), [nameParts[2]]: processedValue } } };
        } else {
            console.warn("Unsupported property path:", propertyName);
            return;
        }
        updateShape(selectedShape.id, updatePayload);
    };


   // --- Specific Handler for File Uploads ---
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (!selectedShape || selectedShape.type !== 'image') return;
     const file = e.target.files?.[0];
     if (file) {
       const reader = new FileReader();
       reader.onloadend = () => {
         updateShape(selectedShape.id, {
           src: reader.result as string,
         });
       };
       reader.readAsDataURL(file);
     }
   };

    // Helper to get nested property value safely
    const getNestedValue = (obj: any, path: string): any => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };


  // --- Render Logic ---
  if (!selectedShape) {
    return (
      <aside className="w-72 h-full bg-card border-l border-border flex flex-col p-4">
        <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Properties</h3>
        <div className="flex-1 flex items-center justify-center text-center text-sm text-muted-foreground">
          <p>Select an element on the canvas to edit its properties.</p>
        </div>
      </aside>
    );
  }

    // --- Field Rendering Function ---
    const renderField = (
        key: string,
        label: string,
        type: 'number' | 'text' | 'color' | 'textarea' | 'select' | 'file' | 'checkbox' | 'slider',
        config?: {
            options?: { value: string; label: string }[];
            fieldSpecificConfig?: { isFontSelect?: boolean };
            fileConfig?: { accept?: string };
            sliderConfig?: { min?: number; max?: number; step?: number };
        }
    ) => {
        // Use helper to get potentially nested value
        const value = getNestedValue(selectedShape, key);

        if (type === 'textarea') {
            return (
                <div key={key}>
                    <Label htmlFor={key} className="text-xs">{label}</Label>
                    <Textarea
                        id={key}
                        name={key}
                        value={value || ''}
                        onChange={(e) => handleInputChange(e, key)}
                        className="mt-1"
                        rows={3}
                    />
                </div>
            );
        } else if (type === 'select' && config?.options) {
             return (
                 <div key={key}>
                    <Label htmlFor={key} className="text-xs">{label}</Label>
                    <Select
                         name={key}
                         value={String(value ?? '')}
                         onValueChange={(selectValue) => handleSelectChange(selectValue, key)}
                    >
                        <SelectTrigger className="h-8 mt-1 w-full">
                            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {config.options.map(opt => (
                                <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                    style={config.fieldSpecificConfig?.isFontSelect ? { fontFamily: opt.value } : {}}
                                >
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
             );
        } else if (type === 'checkbox') {
             return (
                 <div key={key} className="flex items-center space-x-2 pt-1">
                     <Checkbox
                         id={key}
                         checked={!!value}
                         onCheckedChange={(checked) => handleCheckboxChange(checked, key)}
                     />
                     <Label htmlFor={key} className="text-xs font-normal">{label}</Label>
                 </div>
             );
        } else if (type === 'slider' && config?.sliderConfig) {
            return (
                <div key={key}>
                    <Label htmlFor={key} className="text-xs">{label} ({Number(value ?? 0).toFixed(2)})</Label>
                    <Slider
                        id={key}
                        name={key}
                        min={config.sliderConfig.min ?? 0}
                        max={config.sliderConfig.max ?? 1}
                        step={config.sliderConfig.step ?? 0.01}
                        value={[Number(value ?? 0)]} // Slider expects array value
                        onValueChange={(val) => handleSliderChange(val, key)}
                        className="mt-2"
                    />
                </div>
            );
        } else if (type === 'file') {
             const displayValue = key === 'src' ? selectedShape.src : '';
             return (
               <div key={key}>
                   <Label htmlFor={key} className="text-xs">{label}</Label>
                   <Input
                       id={`${key}-url`}
                       name={key}
                       type="text"
                       value={displayValue || ''}
                       onChange={(e) => handleInputChange(e, key)}
                       className="h-8 mt-1 mb-2"
                       placeholder="Enter image URL..."
                   />
                   <Input
                       id={key}
                       type="file"
                       accept={config?.fileConfig?.accept ?? 'image/*'}
                       onChange={handleFileChange}
                       className="h-8 text-xs"
                   />
               </div>
             )
        }

        // Default Input (text, number, color)
        return (
             <div key={key}>
                 <Label htmlFor={key} className="text-xs">{label}</Label>
                 <Input
                    id={key}
                    name={key}
                    type={type}
                    value={value ?? (type === 'number' ? 0 : '')}
                    onChange={(e) => handleInputChange(e, key)}
                    className="h-8 mt-1"
                    min={type === 'number' ? 0 : undefined}
                    step={type === 'number' ? 0.1 : undefined}
                 />
             </div>
        );
    };


  // --- Dynamically Render Fields Based on Shape Type ---
  return (
    <aside className="w-72 h-full bg-card border-l border-border flex flex-col">
      <h3 className="text-sm font-semibold p-4 border-b border-border text-muted-foreground">
        {selectedShape.type.charAt(0).toUpperCase() + selectedShape.type.slice(1)} Properties
      </h3>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* --- General Properties --- */}
          <h4 className="text-xs font-medium text-muted-foreground mb-2">General</h4>
           {renderField('left', 'Left (X)', 'number')}
           {renderField('top', 'Top (Y)', 'number')}
           {renderField('width', 'Width', 'number')}
           {renderField('height', 'Height', 'number')}
           {renderField('angle', 'Rotation (°)', 'number')}
           {renderField('opacity', 'Opacity', 'slider', { sliderConfig: { min: 0, max: 1, step: 0.01 }})}

          {/* --- Appearance Properties --- */}
           <h4 className="text-xs font-medium text-muted-foreground mt-4 mb-2">Appearance</h4>
           {renderField('fill', 'Fill Color', 'color')}
           {renderField('stroke', 'Stroke Color', 'color')}
           {renderField('strokeWidth', 'Stroke Width', 'number')}
           {renderField('visible', 'Visible', 'checkbox')}

           {/* --- Interaction Properties --- */}
           <h4 className="text-xs font-medium text-muted-foreground mt-4 mb-2">Interaction</h4>
           {renderField('locked', 'Locked', 'checkbox')}
           {/* Optionally expose more fabric-specific lock controls */}
           {/* {renderField('fabricProps.lockMovementX', 'Lock Horizontal Movement', 'checkbox')} */}
           {/* {renderField('fabricProps.lockMovementY', 'Lock Vertical Movement', 'checkbox')} */}
           {/* {renderField('fabricProps.lockRotation', 'Lock Rotation', 'checkbox')} */}
           {/* {renderField('fabricProps.lockScalingX', 'Lock Horizontal Scaling', 'checkbox')} */}
           {/* {renderField('fabricProps.lockScalingY', 'Lock Vertical Scaling', 'checkbox')} */}
           {/* {renderField('fabricProps.hasControls', 'Show Controls', 'checkbox')} */}


          {/* --- Type-Specific Properties --- */}
          {selectedShape.type === 'panel' && (
             <>
                <h4 className="text-xs font-medium text-muted-foreground mt-4 mb-2">Panel Specific</h4>
                 {/* {renderField('props.cornerRadius', 'Corner Radius', 'number')} */}
             </>
           )}

          {selectedShape.type === 'bubble' && (
             <>
                <h4 className="text-xs font-medium text-muted-foreground mt-4 mb-2">Bubble Specific</h4>
                {renderField('props.text', 'Text', 'textarea')}
                {renderField('props.bubbleType', 'Bubble Type', 'select', { options: [
                  { value: 'speech', label: 'Speech' }, { value: 'thought', label: 'Thought' },
                  { value: 'scream', label: 'Scream' }, { value: 'narration', label: 'Narration' },
                ]})}
               {(selectedShape.props?.bubbleType === 'speech' || selectedShape.props?.bubbleType === 'scream') &&
                  renderField('props.tailDirection', 'Tail Direction', 'select', { options: [
                     { value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' },
                     { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' },
                  ]})
               }
               {renderField('props.fontSize', 'Font Size', 'number')}
               {renderField('props.fontFamily', 'Font Family', 'select', { options: availableFonts, fieldSpecificConfig: { isFontSelect: true } })}
               {renderField('props.textColor', 'Text Color', 'color')}
             </>
           )}

          {selectedShape.type === 'image' && (
             <>
                 <h4 className="text-xs font-medium text-muted-foreground mt-4 mb-2">Image Specific</h4>
                 {renderField('src', 'Image Source', 'file')}
                 {/* --- Filters --- */}
                 <h5 className="text-xs font-medium text-muted-foreground mt-3 mb-1">Filters</h5>
                 {renderField('props.filters.grayscale', 'Grayscale', 'checkbox')}
                 {renderField('props.filters.sepia', 'Sepia', 'checkbox')}
                 {renderField('props.filters.brightness', 'Brightness', 'slider', { sliderConfig: { min: -1, max: 1, step: 0.01 }})}
                 {renderField('props.filters.contrast', 'Contrast', 'slider', { sliderConfig: { min: -1, max: 1, step: 0.01 }})}
                 {/* Add more filter controls */}
             </>
           )}

          {selectedShape.type === 'text' && (
              <>
                <h4 className="text-xs font-medium text-muted-foreground mt-4 mb-2">Text Specific</h4>
                {renderField('props.text', 'Text Content', 'textarea')}
                {renderField('props.fontSize', 'Font Size', 'number')}
                {renderField('props.fontFamily', 'Font Family', 'select', { options: availableFonts, fieldSpecificConfig: { isFontSelect: true } })}
                {renderField('fill', 'Text Color', 'color')} {/* Text color is fill */}
                {renderField('props.fontWeight', 'Font Weight', 'select', { options: [
                    { value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Bold' },
                    { value: '100', label: '100' }, { value: '200', label: '200' }, { value: '300', label: '300' },
                    { value: '400', label: '400 (Normal)' }, { value: '500', label: '500 (Medium)' }, { value: '600', label: '600 (Semi-Bold)' },
                    { value: '700', label: '700 (Bold)' }, { value: '800', label: '800 (Extra-Bold)' }, { value: '900', label: '900 (Black)' },
                ]})}
                 {renderField('props.textAlign', 'Text Align', 'select', { options: [
                    { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' }, { value: 'justify', label: 'Justify' },
                 ]})}
                 {/* {renderField('props.lineHeight', 'Line Height', 'number', { sliderConfig: { min: 0.5, max: 3, step: 0.1 }})} */}
                 {/* {renderField('props.textBackgroundColor', 'Background Color', 'color')} */}
              </>
            )}

        </div>
      </ScrollArea>
    </aside>
  );
};

// export default PropertiesPanel; // Removed default export as it's now part of the unified panel
