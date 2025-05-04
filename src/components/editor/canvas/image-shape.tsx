'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Image as KonvaImage, Group } from 'react-konva';
import Konva from 'konva';
import type { ImageShapeConfig } from '@/types/editor'; // Define specific props type

interface ImageShapeComponentProps {
  shapeConfig: ImageShapeConfig;
}

const ImageShape: React.FC<ImageShapeComponentProps> = ({ shapeConfig }) => {
  const { id, x, y, width, height, rotation, src, draggable = true, props } = shapeConfig;
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


  // Use store actions for drag/transform if needed
   const { updateShape } = useEditorStore();

   const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
       const node = e.target;
       updateShape(id, {
           x: node.x(),
           y: node.y(),
       });
   };

   const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
       const node = e.target as Konva.Image; // Cast to Konva.Image
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const rotationVal = node.rotation();

        // Reset scale after applying transformation
        node.scaleX(1);
        node.scaleY(1);

        updateShape(id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: rotationVal,
        });
   };

  return (
    <Group
      id={id}
      x={x}
      y={y}
      // Group dimensions might not directly correspond to image if scaled/rotated within
      draggable={draggable}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      rotation={rotation ?? 0} // Ensure rotation is applied to the group if needed
      // Use Group's width/height for transformer bounding box,KonvaImage itself uses image dimensions
      width={width}
      height={height}
    >
        <KonvaImage
            ref={imageRef}
            // Position relative to group
            x={0}
            y={0}
            width={width}
            height={height}
            image={imageElement} // Set the loaded image element
            stroke={error ? 'red' : props?.stroke} // Indicate error with red border
            strokeWidth={error ? 2 : props?.strokeWidth}
            dash={error ? [5, 5] : undefined}
            // KonvaImage doesn't need draggable if Group handles it
            // Pass other specific Konva Image props if necessary
            {...props} // Pass through other stored props (like fill, stroke etc. though less common for images)
            // Do NOT pass rotation here if the Group handles it
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
