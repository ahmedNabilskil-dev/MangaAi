'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text as KonvaText } from 'react-konva'; // Renamed Text to avoid conflict
import Konva from 'konva';
import { useEditorStore } from '@/store/editor-store';
import PanelShape from './panel-shape';
import BubbleShape from './bubble-shape';
import ImageShape from './image-shape';
import TextShape from './text-shape'; // Import TextShape
import TransformerComponent from './transformer'; // Import TransformerComponent
import type { ShapeConfig } from '@/types/editor';

const KonvaCanvas: React.FC = () => {
  const { shapes, selectedShapeId, setSelectedShapeId, updateShape } = useEditorStore();
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null); // Ref for the Transformer instance

  const [stageSize, setStageSize] = useState({ width: 800, height: 1100 }); // Default page size (adjust as needed)
  const containerRef = useRef<HTMLDivElement>(null);

  // Update stage size based on container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        // Calculate available space, considering padding or other elements
        const availableWidth = containerRef.current.offsetWidth - 40; // Example padding adjustment
        const availableHeight = containerRef.current.offsetHeight - 40;
        // Maintain aspect ratio (e.g., A4ish 8 / 11)
        const aspectRatio = 8 / 11;
        let newWidth = availableWidth;
        let newHeight = newWidth / aspectRatio;

        if (newHeight > availableHeight) {
            newHeight = availableHeight;
            newWidth = newHeight * aspectRatio;
        }

        setStageSize({
          width: Math.max(200, newWidth), // Ensure minimum size
          height: Math.max(200 / aspectRatio, newHeight),
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);


  // Handle clicking on the stage to deselect shapes
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // If click is on the stage background, deselect
    if (e.target === e.target.getStage()) {
      setSelectedShapeId(null);
      transformerRef.current?.nodes([]); // Clear transformer nodes
      return;
    }

    // Find clicked shape node's group or shape itself
    const shapeNode = e.target?.closest('.konva-shape') || e.target; // Try finding closest shape container if grouped

     // If click is on transformer, do nothing
     if (transformerRef.current && transformerRef.current === e.target.getParent()) {
       return;
     }

    if (shapeNode && shapeNode.id()) {
        const shapeId = shapeNode.id();
        const exists = shapes.some(s => s.id === shapeId);
        if (exists) {
            setSelectedShapeId(shapeId);
            // Attach transformer to the selected shape
            transformerRef.current?.nodes([shapeNode]);
            transformerRef.current?.getLayer()?.batchDraw(); // Ensure transformer updates visually
        } else {
            // Clicked on something not in our shapes array (e.g., transformer anchor)
            // Do nothing or deselect based on desired behavior
             setSelectedShapeId(null);
             transformerRef.current?.nodes([]);
             transformerRef.current?.getLayer()?.batchDraw();
        }

    } else {
         // Clicked somewhere else (likely empty space), deselect
         setSelectedShapeId(null);
         transformerRef.current?.nodes([]); // Clear transformer nodes
         transformerRef.current?.getLayer()?.batchDraw();
    }
  };

  // Handle drag end for updating shape positions in the store
   const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
       const node = e.target;
       updateShape(id, {
           x: node.x(),
           y: node.y(),
       });
   };

   // Handle transform end for updating shape properties in the store
    const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, id: string) => {
        const node = e.target;
        // Update scale and rotation
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const rotation = node.rotation();

        // Important: Reset scale to 1 after applying transformation to dimensions
        node.scaleX(1);
        node.scaleY(1);

        // Update shape based on type
         const shape = shapes.find(s => s.id === id);
         if (!shape) return;

         let updates: Partial<ShapeConfig> & { props?: any } = {
             x: node.x(),
             y: node.y(),
             width: Math.max(5, node.width() * scaleX), // Use Math.max to avoid zero/negative sizes
             height: Math.max(5, node.height() * scaleY),
             rotation: rotation,
         };

         // Handle text-specific prop update (fontSize)
         if (shape.type === 'text') {
            const currentFontSize = shape.props?.fontSize || 20;
            const newFontSize = Math.max(6, currentFontSize * ((scaleX + scaleY) / 2));
            updates.props = { ...(shape.props || {}), fontSize: newFontSize };
         }

         updateShape(id, updates);

    };

  return (
    <div ref={containerRef} className="w-full h-full overflow-auto flex justify-center items-center p-4 bg-muted">
      <div className="shadow-lg border border-border">
         <Stage
            width={stageSize.width} // Use dynamic stage size
            height={stageSize.height}
            ref={stageRef}
            onClick={handleStageClick}
            onTap={handleStageClick} // For touch devices
            className="bg-card" // Use card background for the canvas page
         >
            <Layer ref={layerRef}>
            {/* Render background grid or page guides if needed */}
            {/* <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="white" stroke="grey" strokeWidth={1} /> */}

            {shapes.map((shape) => {
                const commonProps = {
                    key: shape.id,
                    id: shape.id, // Ensure ID is passed for selection
                    x: shape.x,
                    y: shape.y,
                    width: shape.width,
                    height: shape.height,
                    rotation: shape.rotation,
                    draggable: true,
                    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(e, shape.id),
                    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e, shape.id),
                };

                switch (shape.type) {
                    case 'panel':
                        return <PanelShape {...commonProps} {...shape.props} />;
                    case 'bubble':
                        return <BubbleShape {...commonProps} {...shape.props} />;
                    case 'image':
                        // ImageShape takes the full config
                        return <ImageShape shapeConfig={shape} />;
                    case 'text': // Use TextShape component
                         // Pass common transform props and specific text props
                         return (
                             <TextShape
                                 {...commonProps} // Pass common props like id, x, y, etc.
                                 props={shape.props} // Pass the props object containing text, fontSize, fill
                             />
                         );
                    default:
                        // Default fallback rectangle for unknown types
                        return (
                            <Rect
                            {...commonProps}
                            fill={shape.props?.fill || 'lightgrey'}
                            stroke="black"
                            strokeWidth={1}
                            />
                        );
                }
            })}

             {/* Add Transformer */}
              <TransformerComponent
                selectedShapeId={selectedShapeId}
                shapes={shapes}
                onTransformerRef={(node) => {
                    transformerRef.current = node; // Store the Konva Transformer instance
                }}
              />

            </Layer>
         </Stage>
      </div>
    </div>
  );
};

export default KonvaCanvas;
