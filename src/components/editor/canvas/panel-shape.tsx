'use client';

import React from 'react';
import { Rect, Group } from 'react-konva';
import Konva from 'konva';
import type { PanelProps } from '@/types/editor'; // Define specific props type if needed

interface PanelShapeProps extends PanelProps {
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

const PanelShape: React.FC<PanelShapeProps> = ({
  id,
  x,
  y,
  width = 150,
  height = 100,
  rotation,
  fill = 'rgba(200, 200, 200, 0.3)', // Semi-transparent grey
  stroke = 'black',
  strokeWidth = 2,
  cornerRadius = 0,
  draggable,
  onDragEnd,
  onTransformEnd,
  ...props // Pass other Konva props
}) => {
  return (
    // Using Group allows easier transformations if needed later
    <Group
        id={id}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable={draggable}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
        // Pass other Konva props to the Group
         {...props}
    >
        <Rect
            // Position relative to the group (starts at 0,0)
            x={0}
            y={0}
            width={width}
            height={height}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            cornerRadius={cornerRadius}
            // No need for draggable/event handlers here if handled by Group
        />
        {/* Add other elements inside the panel if needed */}
    </Group>
  );
};

export default PanelShape;
