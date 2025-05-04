'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Image as KonvaImage, Group, Text } from 'react-konva'; // Import Text
import Konva from 'konva';
import type { ImageShapeConfig } from '@/types/editor'; // Define specific props type
import { useEditorStore } from '@/store/editor-store'; // Import store

interface ImageShapeComponentProps extends React.ComponentProps<typeof Group> { // Inherit Group props
  shapeConfig: ImageShapeConfig;
}

const ImageShape: React.FC<ImageShapeComponentProps> = ({
  shapeConfig,
  id, // Receive common props
  x,
  y,
  width,
  height,
  rotation,
  draggable,
  onDragEnd,
  onTransformEnd,
  className,
  ...groupProps // Collect remaining Group props
 }) => {
  const { src, props } = shapeConfig; // Destructure specific props from shapeConfig
  const imageRef = useRef<Konva.Image>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load image from src
  useEffect(() => {
    if (!src) {
        setImageElement(null); // Clear image if src is removed
        setError(null);
        return;
    }

    console.log(`Loading image for shape ${id}: ${src}`);
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      console.log(`Image loaded successfully for shape ${id}`);
      setImageElement(img);
      setError(null);
    };
    img.onerror = (err) => {
      console.error(`Error loading image for shape ${id}: ${src}`, err);
      setError(`Failed to load image: ${src}`);
      setImageElement(null); // Ensure no broken image is rendered
    };
  }, [src, id]);

  // Update Konva image when the HTML image element loads or changes
   useEffect(() => {
       if (imageElement && imageRef.current) {
           imageRef.current.image(imageElement);
           // Optional: Adjust size based on loaded image aspect ratio if needed
           // This example keeps the dimensions set by the user/store
       }
   }, [imageElement]);


  // Use store actions for drag/transform if needed (handled by parent KonvaCanvas via props)
   // const { updateShape } = useEditorStore(); // No need for direct store access here if props are passed

   /* Remove local handlers - use props passed from KonvaCanvas
   const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => { ... };
   const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => { ... };
   */

  return (
    <Group
      id={id} // Use passed id
      x={x} // Use passed x
      y={y} // Use passed y
      width={width} // Use passed width for transformer bounding box
      height={height} // Use passed height for transformer bounding box
      draggable={draggable} // Use passed draggable
      onDragEnd={onDragEnd} // Use passed onDragEnd
      onTransformEnd={onTransformEnd} // Use passed onTransformEnd
      rotation={rotation ?? 0} // Use passed rotation
      className={className} // Pass className
      {...groupProps} // Pass other Group props
    >
        <KonvaImage
            ref={imageRef}
            // Position relative to group
            x={0}
            y={0}
            width={width} // KonvaImage uses its own width/height
            height={height}
            image={imageElement} // Set the loaded image element
            stroke={error ? 'red' : props?.stroke} // Indicate error with red border
            strokeWidth={error ? 2 : props?.strokeWidth}
            dash={error ? [5, 5] : undefined}
            // Pass other specific Konva Image props if necessary
            {...props} // Pass through other stored props (like fill, opacity etc.)
            // Do NOT pass transformational props here if Group handles them
        />
        {error && (
            <Text
                 text={`Error: ${error}`}
                 x={5}
                 y={5}
                 fill="red"
                 fontSize={10}
                 width={width - 10}
                 wrap="char"
            />
        )}
    </Group>
  );
};

export default ImageShape;
