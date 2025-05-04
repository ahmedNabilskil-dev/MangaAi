'use client';

import React from 'react';
import { Text, Group } from 'react-konva';
import Konva from 'konva';
import type { TextProps } from '@/types/editor'; // Define specific props type if needed
import { useEditorStore } from '@/store/editor-store'; // Import store for updates

interface TextShapeComponentProps {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number; // Height might be auto-calculated by Konva based on text content and width
  rotation?: number;
  draggable?: boolean;
  props?: TextProps; // Contains text, fontSize, fill etc.
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
}

const TextShape: React.FC<TextShapeComponentProps> = ({
  id,
  x,
  y,
  width = 150, // Default width
  height, // Height is often determined by text content, but can be set for bounding box
  rotation,
  draggable,
  props, // Use props from shapeConfig
  onDragEnd,
  onTransformEnd,
  ...konvaProps // Pass other Konva props like onClick, etc.
}) => {
   const { updateShape } = useEditorStore();

   // Extract text properties from the props object or use defaults
    const {
        text = 'Editable Text',
        fontFamily = 'Arial',
        fontSize = 20,
        fill = 'black',
        align = 'left',
        verticalAlign = 'top',
        ...otherProps // Any other custom props stored
    } = props || {};


   // Inline handlers to update store - or pass from KonvaCanvas if preferred
   const handleLocalDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
       const node = e.target;
       updateShape(id, {
           x: node.x(),
           y: node.y(),
       });
       onDragEnd?.(e); // Call parent handler if provided
   };

   const handleLocalTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
       const node = e.target as Konva.Text;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const rotationVal = node.rotation();

        // For text, transforming scale might adjust fontSize implicitly or require explicit update
        // Reset scale and update dimensions/fontSize based on transform
        node.scaleX(1);
        node.scaleY(1);

        // Update width and height based on scale. Font size might need separate handling.
        const newWidth = Math.max(5, node.width() * scaleX);
        const newHeight = Math.max(5, node.height() * scaleY);
        // Consider updating fontSize based on average scale, or allow separate fontSize control
        // Get current fontSize from props or default
        const currentFontSize = props?.fontSize || 20;
        const newFontSize = Math.max(6, currentFontSize * ((scaleX + scaleY) / 2));

        updateShape(id, {
            x: node.x(),
            y: node.y(),
            width: newWidth,
            // Height might be optional if dynamically calculated by Konva
            // height: newHeight,
            rotation: rotationVal,
             props: { // Update props specific to text
                 ...(props || {}), // Keep existing props
                 fontSize: newFontSize,
             }
        });
        onTransformEnd?.(e); // Call parent handler if provided
   };


  return (
    <Text
        id={id}
        x={x}
        y={y}
        width={width}
        height={height} // Konva might auto-adjust height if not provided
        rotation={rotation}
        text={text}
        fontFamily={fontFamily}
        fontSize={fontSize}
        fill={fill}
        align={align}
        verticalAlign={verticalAlign}
        draggable={draggable}
        onDragEnd={handleLocalDragEnd}
        onTransformEnd={handleLocalTransformEnd}
        // Add more Konva Text properties as needed from props
        {...otherProps} // Pass remaining specific props
        {...konvaProps} // Pass other Konva event handlers etc.
    />
  );
};

export default TextShape;
