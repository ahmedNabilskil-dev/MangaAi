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

  const createShape = (type: ShapeConfig['type'], props?: any) => {
    const newShape: ShapeConfig = {
      id: uuidv4(), // Generate unique ID
      type: type,
      x: 100 + Math.random() * 100, // Random initial position
      y: 100 + Math.random() * 100,
      width: type === 'bubble' || type === 'text' ? 150 : 200,
      height: type === 'bubble' || type === 'text' ? 80 : 150,
      rotation: 0,
      draggable: true,
      props: props || {},
    };

    // Add specific default props based on type
     switch (type) {
        case 'panel':
             newShape.props = {
                fill: 'rgba(220, 220, 220, 0.5)',
                stroke: 'black',
                strokeWidth: 1,
                cornerRadius: 0,
             } as PanelProps;
             break;
         case 'bubble':
             newShape.props = {
                 text: 'New Bubble',
                 bubbleType: 'speech',
                 tailDirection: 'bottom',
                 fill: 'white',
                 stroke: 'black',
                 strokeWidth: 1,
                 fontSize: 14,
             } as BubbleProps;
             break;
         case 'image':
              newShape.width = 150; // Default image size
              newShape.height = 100;
              newShape.props = {
                 src: 'https://picsum.photos/seed/placeholder/150/100', // Default placeholder
                 // Add other image-specific props if needed
              } as Omit<ImageShapeConfig, 'id' | 'type' | 'x' | 'y' | 'width' | 'height' | 'rotation' | 'draggable'>['props'];
              break;
         case 'text':
             newShape.width = 120;
             newShape.height = 40;
             newShape.props = {
                 text: 'New Text',
                 fontSize: 20,
                 fill: 'black',
             } as TextShapeConfig['props'];
             break;
         default:
             break;
     }


    addShape(newShape);
  };

  // --- Drag and Drop (Example - requires react-dnd or similar) ---
   // const [{ isDragging }, drag] = useDrag(() => ({
   //     type: 'shape',
   //     item: { type: 'panel' }, // Pass shape type or config
   //     collect: (monitor) => ({
   //         isDragging: !!monitor.isDragging(),
   //     }),
   // }));
   // Attach `ref={drag}` to the draggable buttons

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
            // ref={drag} // Example for drag and drop
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

          {/* Add buttons for Text, uploaded Images, etc. */}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default LibraryPanel;
