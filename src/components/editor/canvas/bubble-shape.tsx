'use client';

import React from 'react';
import { Group, Rect, Text, Line, Shape } from 'react-konva';
import Konva from 'konva';
import type { BubbleProps } from '@/types/editor'; // Assuming BubbleProps are defined

interface BubbleShapeProps extends BubbleProps {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  draggable?: boolean;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
}

// Function to draw a simple tail (can be expanded)
const drawTail = (
    context: Konva.Context,
    x: number,
    y: number,
    width: number,
    height: number,
    tailDirection: 'left' | 'right' | 'top' | 'bottom' = 'bottom',
    tailWidth = 20,
    tailHeight = 30
    ) => {
        context.beginPath();
        let startX, startY, controlX, controlY, endX, endY;

        switch (tailDirection) {
            case 'top':
                startX = x + width / 2 - tailWidth / 2;
                startY = y;
                controlX = x + width / 2;
                controlY = y - tailHeight; // Pointing upwards
                endX = x + width / 2 + tailWidth / 2;
                endY = y;
                break;
            case 'left':
                startX = x;
                startY = y + height / 2 - tailWidth / 2;
                controlX = x - tailHeight; // Pointing left
                controlY = y + height / 2;
                endX = x;
                endY = y + height / 2 + tailWidth / 2;
                break;
             case 'right':
                 startX = x + width;
                 startY = y + height / 2 - tailWidth / 2;
                 controlX = x + width + tailHeight; // Pointing right
                 controlY = y + height / 2;
                 endX = x + width;
                 endY = y + height / 2 + tailWidth / 2;
                 break;
            case 'bottom':
            default:
                startX = x + width / 2 - tailWidth / 2;
                startY = y + height;
                controlX = x + width / 2;
                controlY = y + height + tailHeight; // Pointing downwards
                endX = x + width / 2 + tailWidth / 2;
                endY = y + height;
                break;
        }

        context.moveTo(startX, startY);
        context.quadraticCurveTo(controlX, controlY, endX, endY);
        // context.lineTo(startX, startY); // Close the tail shape if needed, or let fill handle it
        context.closePath(); // Needed for fill and stroke to work correctly
        context.fillStrokeShape(context.getShape()); // Apply fill and stroke defined on the Shape component
};


const BubbleShape: React.FC<BubbleShapeProps> = ({
  id,
  x,
  y,
  width = 180,
  height = 80,
  rotation,
  text = 'Sample Text',
  bubbleType = 'speech', // speech, thought, scream, narration
  tailDirection = 'bottom',
  fontFamily = 'Arial',
  fontSize = 14,
  fill = 'white',
  stroke = 'black',
  strokeWidth = 1.5,
  draggable,
  onDragEnd,
  onTransformEnd,
  ...props
}) => {

  const isThought = bubbleType === 'thought';
  const isScream = bubbleType === 'scream';

  // Calculate text padding
  const padding = 10;
  const textWidth = width - padding * 2;
  const textHeight = height - padding * 2;

  return (
    <Group
      id={id}
      x={x}
      y={y}
      width={width}
      height={height} // Group height might need adjustment based on tail
      rotation={rotation}
      draggable={draggable}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
       {...props}
    >
      {/* Bubble Body (adjust shape based on type) */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        cornerRadius={bubbleType === 'speech' || bubbleType === 'narration' ? 10 : width / 2} // Ellipse for thought/scream
        dash={isScream ? [10, 5] : undefined} // Dashed for scream
        shadowBlur={isThought ? 5 : 0}
        shadowColor={isThought ? 'rgba(0,0,0,0.2)' : undefined}
      />

      {/* Bubble Tail (only for speech/scream) */}
       {!isThought && bubbleType !== 'narration' && (
          <Shape
             sceneFunc={(context) => drawTail(context, 0, 0, width, height, tailDirection)}
             fill={fill}
             stroke={stroke}
             strokeWidth={strokeWidth}
             dash={isScream ? [10, 5] : undefined} // Match scream style
          />
       )}


      {/* Text Content */}
      <Text
        x={padding}
        y={padding}
        width={textWidth}
        height={textHeight}
        text={text}
        fontFamily={fontFamily}
        fontSize={fontSize}
        fill={stroke} // Use stroke color for text for contrast
        align="center"
        verticalAlign="middle"
        wrap="word"
      />
    </Group>
  );
};

export default BubbleShape;
