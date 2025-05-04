
'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEditorStore } from '@/store/editor-store';
import type { ShapeConfig } from '@/types/editor'; // Removed ShapePropertiesFormValues as it's not directly used

// Define available fonts
const availableFonts = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
    { value: 'Impact, charcoal, sans-serif', label: 'Impact' },
    // Add more fonts as needed (consider loading web fonts if using non-standard ones)
    // Example Google Font (would need loading in layout.tsx or globals.css):
    // { value: "'Roboto', sans-serif", label: "Roboto" },
    // { value: "'Noto Sans JP', sans-serif", label: "Noto Sans JP (Japanese)" }
];


const PropertiesPanel: React.FC<{ selectedShape: ShapeConfig | undefined }> = ({ selectedShape }) => {
  const { updateShape } = useEditorStore();

  // --- Generic Input Change Handler ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    propertyName: keyof ShapeConfig | string // Allow nested props like 'props.text'
  ) => {
    if (!selectedShape) return;

    const { value, type } = e.target;
    let processedValue: any = value;

    // Process value based on input type
    if (type === 'number') {
      processedValue = parseFloat(value) || 0; // Default to 0 if parsing fails
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }
    // Add specific processing for color, etc. if needed

    // Split propertyName for nested updates (e.g., 'props.text')
    const nameParts = propertyName.split('.');
    let updatePayload: Partial<ShapeConfig> | { props: Record<string, any> } = {};

    if (nameParts.length === 1) {
      // Update top-level property (left, top, fill, src, etc.)
      updatePayload = { [propertyName]: processedValue };
    } else if (nameParts.length === 2 && nameParts[0] === 'props') {
      // Update nested property within 'props'
       updatePayload = {
           props: {
             [nameParts[1]]: processedValue,
           },
       };
    } else {
      console.warn("Unsupported property path:", propertyName);
      return; // Don't update if path is not supported
    }

    updateShape(selectedShape.id, updatePayload);
  };

  // --- Specific Handler for Select Components ---
  // Shadcn Select's onValueChange provides the value directly
  const handleSelectChange = (value: string, propertyName: keyof ShapeConfig | string) => {
       if (!selectedShape) return;

       const nameParts = propertyName.split('.');
       let updatePayload: Partial<ShapeConfig> | { props: Record<string, any> } = {};

       if (nameParts.length === 1) {
         updatePayload = { [propertyName]: value };
       } else if (nameParts.length === 2 && nameParts[0] === 'props') {
         updatePayload = {
           props: {
             [nameParts[1]]: value,
           },
         };
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
         // Update the 'src' property directly at the top level
         updateShape(selectedShape.id, {
           src: reader.result as string,
         });
       };
       reader.readAsDataURL(file);
     }
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

  const renderInput = (
        key: string,
        label: string,
        type: 'number' | 'text' | 'color' | 'textarea' | 'select' | 'file',
        options?: { value: string; label: string }[],
        // Add specific config for font select styling
        fieldSpecificConfig?: { isFontSelect?: boolean }
    ) => {
        const path = key.split('.');
        // Check if selectedShape exists before accessing properties
        if (!selectedShape) return null;

        let value: any;
        if (path.length === 1) {
            value = (selectedShape as any)[path[0]];
        } else if (path.length === 2 && path[0] === 'props') {
            value = (selectedShape.props as any)?.[path[1]] ?? '';
        } else {
            value = ''; // Default for unsupported paths
        }


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
        } else if (type === 'select' && options) {
             return (
                 <div key={key}>
                    <Label htmlFor={key} className="text-xs">{label}</Label>
                    <Select
                         name={key}
                         value={String(value ?? '')} // Ensure value is string
                         onValueChange={(selectValue) => handleSelectChange(selectValue, key)}
                    >
                        <SelectTrigger className="h-8 mt-1 w-full">
                            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map(opt => (
                                <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                     // Apply font style for preview if it's the font select
                                    style={fieldSpecificConfig?.isFontSelect ? { fontFamily: opt.value } : {}}
                                >
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
             );
        } else if (type === 'file') {
             // Special handling for image src - use top-level 'src' for display/update trigger
             const displayValue = key === 'src' ? selectedShape.src : ''; // Or derive from props if stored differently
             return (
               <div key={key}>
                   <Label htmlFor={key} className="text-xs">{label}</Label>
                   <Input
                       id={`${key}-url`} // Different ID for URL input
                       name={key}
                       type="text"
                       value={displayValue || ''}
                       onChange={(e) => handleInputChange(e, key)} // Update top-level src
                       className="h-8 mt-1 mb-2"
                       placeholder="Enter image URL..."
                   />
                   <Input
                       id={key} // ID for file input
                       type="file"
                       accept="image/*" // Accept images
                       onChange={handleFileChange} // Specific handler
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
                    min={type === 'number' ? 0 : undefined} // Basic min for numbers
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
          {/* Common Fabric Properties */}
          {renderInput('left', 'Left (X)', 'number')}
          {renderInput('top', 'Top (Y)', 'number')}
          {renderInput('width', 'Width', 'number')}
          {renderInput('height', 'Height', 'number')}
          {renderInput('angle', 'Rotation (°)', 'number')}
          {renderInput('opacity', 'Opacity', 'number')}
           {renderInput('fill', 'Fill Color', 'color')}
           {renderInput('stroke', 'Stroke Color', 'color')}
           {renderInput('strokeWidth', 'Stroke Width', 'number')}


          {/* Type-Specific Properties */}
          {selectedShape.type === 'panel' && (
             <>
                 {/* Add panel-specific fields if any, e.g., cornerRadius if implemented */}
                 {/* renderInput('props.cornerRadius', 'Corner Radius', 'number') */}
             </>
           )}

          {selectedShape.type === 'bubble' && (
             <>
               {renderInput('props.text', 'Text', 'textarea')}
               {renderInput('props.bubbleType', 'Bubble Type', 'select', [
                  { value: 'speech', label: 'Speech' },
                  { value: 'thought', label: 'Thought' },
                  { value: 'scream', label: 'Scream' },
                  { value: 'narration', label: 'Narration' },
               ])}
                {/* Only show tail direction for relevant types */}
               {(selectedShape.props?.bubbleType === 'speech' || selectedShape.props?.bubbleType === 'scream') &&
                  renderInput('props.tailDirection', 'Tail Direction', 'select', [
                     { value: 'top', label: 'Top' },
                     { value: 'bottom', label: 'Bottom' },
                     { value: 'left', label: 'Left' },
                     { value: 'right', label: 'Right' },
                  ])
               }
               {renderInput('props.fontSize', 'Font Size', 'number')}
               {renderInput('props.fontFamily', 'Font Family', 'select', availableFonts, { isFontSelect: true })}
               {renderInput('props.textColor', 'Text Color', 'color')}
             </>
           )}

          {selectedShape.type === 'image' && (
             <>
                 {renderInput('src', 'Image Source', 'file')}
                 {/* Add controls for props like filters if needed */}
             </>
           )}

          {selectedShape.type === 'text' && (
              <>
                {renderInput('props.text', 'Text Content', 'textarea')}
                {renderInput('props.fontSize', 'Font Size', 'number')}
                 {/* Pass font options and flag for styling */}
                 {renderInput('props.fontFamily', 'Font Family', 'select', availableFonts, { isFontSelect: true })}
                {renderInput('fill', 'Text Color', 'color')} {/* Text color is fill */}
                 {renderInput('props.fontWeight', 'Font Weight', 'select', [
                    { value: 'normal', label: 'Normal' },
                    { value: 'bold', label: 'Bold' },
                    { value: '100', label: '100' },
                    { value: '200', label: '200' },
                    { value: '300', label: '300' },
                    { value: '400', label: '400 (Normal)' },
                    { value: '500', label: '500 (Medium)' },
                    { value: '600', label: '600 (Semi-Bold)' },
                    { value: '700', label: '700 (Bold)' },
                    { value: '800', label: '800 (Extra-Bold)' },
                    { value: '900', label: '900 (Black)' },
                 ])}
                 {renderInput('props.textAlign', 'Text Align', 'select', [
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                    { value: 'justify', label: 'Justify' },
                 ])}
                 {/* Add line height, background color etc. */}
              </>
            )}

        </div>
      </ScrollArea>
    </aside>
  );
};

export default PropertiesPanel;
    