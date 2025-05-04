'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useEditorStore } from '@/store/editor-store';
import type { ShapeConfig } from '@/types/editor';

interface PropertiesPanelProps {
  selectedShape: ShapeConfig | undefined;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedShape }) => {
  const { updateShape } = useEditorStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedShape) return;
    const { name, value, type } = e.target;
    const isNumeric = type === 'number';
    const isCheckbox = type === 'checkbox';

    const newValue = isCheckbox
        ? (e.target as HTMLInputElement).checked
        : isNumeric
        ? parseFloat(value) || 0 // Handle potential NaN
        : value;


    // Separate updates for transform props (x, y, width, height, rotation) vs other props
     // Handle 'src' update specifically for images at the top level
     if (selectedShape.type === 'image' && name === 'src') {
        updateShape(selectedShape.id, { [name]: newValue });
     } else if (['x', 'y', 'width', 'height', 'rotation'].includes(name)) {
         updateShape(selectedShape.id, { [name]: newValue });
    } else {
        updateShape(selectedShape.id, {
           props: {
             ...selectedShape.props,
             [name]: newValue,
           },
        });
    }
  };

   const handleSelectChange = (value: string, name: string) => {
       if (!selectedShape) return;
       updateShape(selectedShape.id, {
           props: {
               ...selectedShape.props,
               [name]: value,
           },
       });
   };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (!selectedShape || selectedShape.type !== 'image') return;
     const file = e.target.files?.[0];
     if (file) {
       const reader = new FileReader();
       reader.onloadend = () => {
         updateShape(selectedShape.id, {
           src: reader.result as string, // Update the src property directly
         });
       };
       reader.readAsDataURL(file);
     }
   };

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

  // Dynamically render fields based on selectedShape.type and its props
  return (
    <aside className="w-72 h-full bg-card border-l border-border flex flex-col">
      <h3 className="text-sm font-semibold p-4 border-b border-border text-muted-foreground">
        {selectedShape.type.charAt(0).toUpperCase() + selectedShape.type.slice(1)} Properties
      </h3>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Common Properties */}
          <div>
            <Label htmlFor="pos-x" className="text-xs">X Position</Label>
            <Input
              id="pos-x"
              name="x"
              type="number"
              value={selectedShape.x ?? 0}
              onChange={handleInputChange}
              className="h-8 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="pos-y" className="text-xs">Y Position</Label>
            <Input
              id="pos-y"
              name="y"
              type="number"
              value={selectedShape.y ?? 0}
              onChange={handleInputChange}
              className="h-8 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="width" className="text-xs">Width</Label>
            <Input
              id="width"
              name="width"
              type="number"
              value={selectedShape.width ?? 100}
              onChange={handleInputChange}
              className="h-8 mt-1"
              min={1}
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-xs">Height</Label>
            <Input
              id="height"
              name="height"
              type="number"
              value={selectedShape.height ?? 100}
              onChange={handleInputChange}
              className="h-8 mt-1"
              min={1}
            />
          </div>
          <div>
            <Label htmlFor="rotation" className="text-xs">Rotation (°)</Label>
            <Input
              id="rotation"
              name="rotation"
              type="number"
              value={selectedShape.rotation ?? 0}
              onChange={handleInputChange}
              className="h-8 mt-1"
            />
          </div>

          {/* Type-Specific Properties */}
          {selectedShape.type === 'panel' && (
            <>
              <div>
                <Label htmlFor="panel-fill" className="text-xs">Fill Color</Label>
                <Input
                  id="panel-fill"
                  name="fill"
                  type="text" // Use text for color values (e.g., rgba(r,g,b,a), #hex)
                  value={selectedShape.props?.fill || ''}
                  onChange={handleInputChange}
                  className="h-8 mt-1"
                  placeholder="e.g., #ffffff, rgba(0,0,0,0.5)"
                />
              </div>
              <div>
                <Label htmlFor="panel-stroke" className="text-xs">Stroke Color</Label>
                <Input
                  id="panel-stroke"
                  name="stroke"
                  type="text"
                  value={selectedShape.props?.stroke || ''}
                  onChange={handleInputChange}
                  className="h-8 mt-1"
                  placeholder="e.g., black, #000000"
                />
              </div>
              <div>
                <Label htmlFor="panel-strokeWidth" className="text-xs">Stroke Width</Label>
                <Input
                  id="panel-strokeWidth"
                  name="strokeWidth"
                  type="number"
                  value={selectedShape.props?.strokeWidth ?? 1}
                  onChange={handleInputChange}
                  className="h-8 mt-1"
                  step={0.5}
                  min={0}
                />
              </div>
               <div>
                  <Label htmlFor="panel-cornerRadius" className="text-xs">Corner Radius</Label>
                  <Input
                      id="panel-cornerRadius"
                      name="cornerRadius"
                      type="number"
                      value={selectedShape.props?.cornerRadius ?? 0}
                      onChange={handleInputChange}
                      className="h-8 mt-1"
                      min={0}
                  />
                </div>
            </>
          )}

          {selectedShape.type === 'bubble' && (
            <>
              <div>
                <Label htmlFor="bubble-text" className="text-xs">Text</Label>
                <Textarea
                  id="bubble-text"
                  name="text"
                  value={selectedShape.props?.text || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={3}
                />
              </div>
               <div>
                  <Label htmlFor="bubble-type" className="text-xs">Bubble Type</Label>
                  <Select
                     name="bubbleType"
                     value={selectedShape.props?.bubbleType || 'speech'}
                     onValueChange={(value) => handleSelectChange(value, 'bubbleType')}
                  >
                     <SelectTrigger className="h-8 mt-1">
                        <SelectValue placeholder="Select type" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="speech">Speech</SelectItem>
                        <SelectItem value="thought">Thought</SelectItem>
                        <SelectItem value="scream">Scream</SelectItem>
                        <SelectItem value="narration">Narration</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                 {selectedShape.props?.bubbleType !== 'thought' && selectedShape.props?.bubbleType !== 'narration' && (
                 <div>
                      <Label htmlFor="bubble-tailDirection" className="text-xs">Tail Direction</Label>
                      <Select
                         name="tailDirection"
                         value={selectedShape.props?.tailDirection || 'bottom'}
                         onValueChange={(value) => handleSelectChange(value, 'tailDirection')}
                      >
                         <SelectTrigger className="h-8 mt-1">
                            <SelectValue placeholder="Select direction" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="top">Top</SelectItem>
                            <SelectItem value="bottom">Bottom</SelectItem>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                         </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                     <Label htmlFor="bubble-fontSize" className="text-xs">Font Size</Label>
                     <Input
                        id="bubble-fontSize"
                        name="fontSize"
                        type="number"
                        value={selectedShape.props?.fontSize ?? 14}
                        onChange={handleInputChange}
                        className="h-8 mt-1"
                        min={6}
                     />
                    </div>
                    {/* Add more bubble props: fill, stroke, etc. */}
            </>
          )}

           {selectedShape.type === 'image' && (
              <>
                  <div>
                      <Label htmlFor="image-src" className="text-xs">Image Source (URL or Upload)</Label>
                       <Input
                           id="image-src-url"
                           name="src" // Target the 'src' property directly
                           type="text"
                           value={selectedShape.src || ''} // Read 'src' from top level
                           onChange={handleInputChange}
                           className="h-8 mt-1 mb-2"
                           placeholder="Enter image URL..."
                       />
                       <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="h-8 text-xs"
                        />
                  </div>
                   {/* Add other image props like opacity, border, etc. if needed */}
              </>
           )}

            {selectedShape.type === 'text' && (
                 <>
                   <div>
                     <Label htmlFor="text-content" className="text-xs">Text Content</Label>
                     <Textarea
                       id="text-content"
                       name="text" // Update 'text' in props
                       value={selectedShape.props?.text || ''}
                       onChange={handleInputChange}
                       className="mt-1"
                       rows={2}
                     />
                   </div>
                   <div>
                     <Label htmlFor="text-fontSize" className="text-xs">Font Size</Label>
                     <Input
                       id="text-fontSize"
                       name="fontSize" // Update 'fontSize' in props
                       type="number"
                       value={selectedShape.props?.fontSize ?? 20}
                       onChange={handleInputChange}
                       className="h-8 mt-1"
                       min={6}
                     />
                   </div>
                   <div>
                     <Label htmlFor="text-fill" className="text-xs">Fill Color</Label>
                     <Input
                       id="text-fill"
                       name="fill" // Update 'fill' in props
                       type="text"
                       value={selectedShape.props?.fill || 'black'}
                       onChange={handleInputChange}
                       className="h-8 mt-1"
                       placeholder="e.g., black, #000000"
                     />
                   </div>
                    {/* Add fontFamily, etc. */}
                 </>
             )}

        </div>
      </ScrollArea>
    </aside>
  );
};

export default PropertiesPanel;
