
'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Square, MessageCircle, Image as ImageIcon, Type } from 'lucide-react'; // Icons for elements
import { useEditorStore } from '@/store/editor-store';
import type { ShapeConfig, PanelProps, BubbleProps, ImageShapeConfig, TextShapeConfig } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const LibraryPanel: React.FC = () => {
  const addShape = useEditorStore((state) => state.addShape);

  const createShape = (type: ShapeConfig['type']) => {
    // Base properties for Fabric.js
    const baseProps: Omit<ShapeConfig, 'id' | 'type' | 'props'> = {
      left: 50 + Math.random() * 150, // Initial position using left/top
      top: 50 + Math.random() * 150,
      width: type === 'bubble' || type === 'text' ? 150 : 200, // Initial dimensions
      height: type === 'bubble' || type === 'text' ? 80 : 150,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      fill: 'transparent', // Default fill
      stroke: 'black',     // Default stroke
      strokeWidth: 1,      // Default stroke width
      opacity: 1,
      visible: true,
    };

    let specificProps: ShapeConfig['props'] = {};
    let specificConfig: Partial<ShapeConfig> = {};


    // Add specific default props and config based on type
     switch (type) {
        case 'panel':
             specificConfig = {
                 fill: 'rgba(220, 220, 220, 0.5)',
                 stroke: 'black',
                 strokeWidth: 1,
                 // Fabric Rect doesn't have cornerRadius directly
             };
             specificProps = {
                // cornerRadius: 0, // Store in props if needed for custom rendering later
             } as PanelProps;
             break;
         case 'bubble':
             // Bubbles are complex, start with basic props
              specificConfig = {
                 fill: 'white',
                 stroke: 'black',
                 strokeWidth: 1,
                 width: 150, // Smaller default for bubbles
                 height: 80,
              };
             specificProps = {
                 text: 'New Bubble',
                 bubbleType: 'speech',
                 tailDirection: 'bottom', // Need custom logic to draw tail
                 fontSize: 14,
                 textColor: 'black',
             } as BubbleProps;
             break;
         case 'image':
              specificConfig = {
                 width: 150, // Default image size
                 height: 100,
                 strokeWidth: 0, // No border by default
                 fill: '#f0f0f0', // Placeholder fill
                 stroke: '#cccccc', // Placeholder border
              };
              specificProps = {
                 // Store src in top-level config, not props
                 // Add other image-specific props if needed (e.g., filters)
              } as ImageShapeConfig['props'];
               // Add src directly to specificConfig for Image type
              specificConfig.src = 'https://picsum.photos/seed/placeholderimg/150/100'; // Default placeholder
              break;
         case 'text':
             specificConfig = {
                 width: 120, // Initial width for Textbox wrapping
                 height: 40, // Adjust based on content later
                 strokeWidth: 0, // No border for text
                 fill: 'black', // Text color is fill in Fabric
             };
             specificProps = {
                 text: 'New Text',
                 fontSize: 20,
                 // Add other Fabric Textbox props like fontFamily, fontWeight, textAlign etc.
             } as TextShapeConfig['props'];
             break;
         default:
             break;
     }

    // Create the final shape configuration object
    const newShape: ShapeConfig = {
        id: uuidv4(),
        type: type,
        ...baseProps, // Spread base properties
        ...specificConfig, // Spread type-specific config (like src, fill)
        props: specificProps, // Assign specific props object
    };


    addShape(newShape);
  };


  return (
    <aside className="w-64 h-full bg-card border-r border-border flex flex-col p-2">
      <h3 className="text-sm font-semibold mb-3 px-2 text-muted-foreground">Library</h3>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-2 p-2">
          {/* Panel Button */}
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => createShape('panel')}
          >
            <Square size={24} />
            <span className="text-xs">Panel</span>
          </Button>

          {/* Bubble Button */}
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => createShape('bubble')}
          >
            <MessageCircle size={24} />
            <span className="text-xs">Bubble</span>
          </Button>

          {/* Image Button */}
           <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => createShape('image')} // Add default image shape
           >
              <ImageIcon size={24} />
              <span className="text-xs">Image</span>
           </Button>

           {/* Text Button */}
           <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => createShape('text')} // Add text shape
           >
              <Type size={24} />
              <span className="text-xs">Text</span>
           </Button>

          {/* Add buttons for uploaded Images, etc. */}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default LibraryPanel;
