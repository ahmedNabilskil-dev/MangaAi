'use client';

import React, { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import type { ShapeConfig } from '@/types/editor';

interface TransformerComponentProps {
  selectedShapeId: string | null;
  shapes: ShapeConfig[]; // Needed to find the node instance
  onTransformerRef: (node: Konva.Transformer | null) => void; // Callback to pass ref up
}

const TransformerComponent: React.FC<TransformerComponentProps> = ({
  selectedShapeId,
  shapes,
  onTransformerRef,
}) => {
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    onTransformerRef(transformerRef.current); // Pass ref up on mount/update
  }, [onTransformerRef]);

  useEffect(() => {
    if (selectedShapeId && transformerRef.current) {
      const stage = transformerRef.current.getStage();
      if (!stage) return;

      const selectedNode = stage.findOne(`#${selectedShapeId}`); // Find node by ID

      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      } else {
        transformerRef.current.nodes([]); // Deselect if node not found
      }
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      transformerRef.current?.nodes([]); // Deselect if no ID
      transformerRef.current?.getLayer()?.batchDraw();
    }
  }, [selectedShapeId, shapes]); // Rerun when selection or shapes change


  return (
    <Transformer
      ref={transformerRef}
      // Configuration for the transformer appearance and behavior
      borderEnabled={true}
      borderStroke="hsl(var(--primary))"
      borderStrokeWidth={1.5}
      anchorFill="hsl(var(--primary))"
      anchorStroke="hsl(var(--background))"
      anchorSize={8}
      rotateEnabled={true}
      keepRatio={false} // Allow free transform by default, adjust as needed
      flipEnabled={false}
      // Consider adding resize event handlers if needed for live updates
    />
  );
};

export default TransformerComponent;
