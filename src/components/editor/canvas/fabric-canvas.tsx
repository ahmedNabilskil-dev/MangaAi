
// src/components/editor/canvas/fabric-canvas.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '@/store/editor-store';
import type { ShapeConfig } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid'; // For potential temporary IDs if needed

const FabricCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { shapes, selectedShapeId, setSelectedShapeId, updateShape, addShape } = useEditorStore();
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1100 }); // A4-like default

   // Debounce function
   const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
     let timeout: ReturnType<typeof setTimeout> | null = null;
     return (...args: Parameters<F>): Promise<ReturnType<F>> =>
       new Promise(resolve => {
         if (timeout) {
           clearTimeout(timeout);
         }
         timeout = setTimeout(() => resolve(func(...args)), waitFor);
       });
   };

  // Initialize Fabric Canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current && containerRef.current) {
        const updateSize = () => {
          if (containerRef.current) {
            const availableWidth = containerRef.current.offsetWidth - 40; // Example padding
            const availableHeight = containerRef.current.offsetHeight - 40;
            const aspectRatio = 8.5 / 11; // Standard paper aspect ratio
            let newWidth = Math.min(availableWidth, availableHeight * aspectRatio);
            let newHeight = newWidth / aspectRatio;

            if (newHeight > availableHeight) {
                newHeight = availableHeight;
                newWidth = newHeight * aspectRatio;
            }

            setCanvasSize({ width: Math.max(200, newWidth), height: Math.max(200 / aspectRatio, newHeight) });
             if (fabricCanvasRef.current) {
                 fabricCanvasRef.current.setWidth(Math.max(200, newWidth));
                 fabricCanvasRef.current.setHeight(Math.max(200 / aspectRatio, newHeight));
                 fabricCanvasRef.current.requestRenderAll();
             }
          }
        };

        updateSize(); // Initial size calculation

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: '#ffffff', // White background for the page
        selection: true, // Allow selecting objects
        // Add other canvas options if needed
      });
      fabricCanvasRef.current = canvas;

      // --- Event Listeners ---
      canvas.on('object:modified', (e) => {
        if (e.target) {
          const obj = e.target;
          const id = (obj as any).id; // Assume objects have an 'id' property
          if (id) {
             // Use debounce to avoid excessive updates during rapid transforms
             const debouncedUpdate = debounce(updateShape, 100); // 100ms debounce
             debouncedUpdate(id, {
               left: obj.left,
               top: obj.top,
               width: obj.getScaledWidth(),
               height: obj.getScaledHeight(),
               angle: obj.angle,
               scaleX: obj.scaleX,
               scaleY: obj.scaleY,
               // Update other relevant props based on object type if needed
             });
          }
        }
      });

      canvas.on('selection:created', (e) => {
        if (e.selected && e.selected.length === 1) {
          const id = (e.selected[0] as any).id;
          setSelectedShapeId(id);
        } else {
           setSelectedShapeId(null); // Deselect if multiple or none selected
        }
      });
      canvas.on('selection:updated', (e) => {
         if (e.selected && e.selected.length === 1) {
           const id = (e.selected[0] as any).id;
           setSelectedShapeId(id);
         } else {
            setSelectedShapeId(null);
         }
       });

      canvas.on('selection:cleared', () => {
        setSelectedShapeId(null);
      });

      // Handle stage click to deselect
       canvas.on('mouse:down', function(options) {
         if (!options.target) {
           setSelectedShapeId(null);
           canvas.discardActiveObject();
           canvas.requestRenderAll();
         }
       });

       // Resize observer
       const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
          resizeObserver.observe(containerRef.current);
        }


      return () => {
        canvas.dispose(); // Clean up Fabric canvas instance
        fabricCanvasRef.current = null;
         if (containerRef.current) {
             resizeObserver.unobserve(containerRef.current);
         }
         window.removeEventListener('resize', updateSize);
      };
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Use [] to run only once, size changes handled by resize observer


    // Function to create Fabric objects from ShapeConfig
    const createFabricObject = (shape: ShapeConfig): Promise<fabric.Object | null> => {
        return new Promise((resolve) => {
            const commonProps = {
                id: shape.id, // Assign store ID to fabric object
                left: shape.left,
                top: shape.top,
                width: shape.width,
                height: shape.height,
                angle: shape.angle ?? 0,
                scaleX: shape.scaleX ?? 1,
                scaleY: shape.scaleY ?? 1,
                fill: shape.fill ?? 'transparent', // Default fill
                stroke: shape.stroke ?? 'black', // Default stroke
                strokeWidth: shape.strokeWidth ?? 1, // Default stroke width
                opacity: shape.opacity ?? 1,
                visible: shape.visible ?? true,
                originX: 'left',
                originY: 'top',
                // Add common fabric object options here
            };

            switch (shape.type) {
                case 'panel':
                    const panelRect = new fabric.Rect({
                        ...commonProps,
                        // Specific panel props from shape.props if needed
                        // cornerRadius: shape.props?.cornerRadius, // Need custom implementation
                        ...(shape.props as fabric.IRectOptions), // Spread other rect options
                        fill: shape.fill ?? 'rgba(200, 200, 200, 0.3)', // Panel default fill
                        stroke: shape.stroke ?? 'black',
                        strokeWidth: shape.strokeWidth ?? 2,
                    });
                    resolve(panelRect);
                    break;

                 case 'text':
                      const textObj = new fabric.Textbox(shape.props?.text || 'New Text', { // Use Textbox for wrapping
                          ...commonProps,
                          fontSize: shape.props?.fontSize || 20,
                          fontFamily: shape.props?.fontFamily || 'Arial, sans-serif', // Apply font family
                          fill: shape.fill || 'black', // Text color is fill in Fabric
                          textAlign: shape.props?.textAlign || 'left', // Default textAlign
                          fontWeight: shape.props?.fontWeight || 'normal', // Default fontWeight
                          // Important: width needs to be set for textbox wrapping
                           width: shape.width,
                          ...(shape.props as fabric.ITextboxOptions), // Spread other Textbox options
                          strokeWidth: 0, // Usually no stroke on text itself
                      });
                      resolve(textObj);
                      break;

                case 'image':
                    if (shape.src) {
                        fabric.Image.fromURL(shape.src, (img) => {
                           if (img) {
                               img.set({
                                   ...commonProps,
                                   // Adjust scale to fit width/height from store
                                   scaleX: shape.width / (img.width ?? 1),
                                   scaleY: shape.height / (img.height ?? 1),
                                   // Reset width/height to original image dimensions after scaling
                                   width: img.width,
                                   height: img.height,
                                   crossOrigin: shape.props?.crossOrigin || 'anonymous',
                                   stroke: shape.stroke, // Apply border if specified
                                   strokeWidth: shape.strokeWidth,
                                   // ...(shape.props as fabric.IImageOptions), // Apply other image options
                               });
                                (img as any).id = shape.id; // Ensure ID is set
                                resolve(img);
                           } else {
                                console.error("Failed to load image:", shape.src);
                                resolve(null); // Resolve with null if image fails to load
                           }
                        }, { crossOrigin: shape.props?.crossOrigin || 'anonymous' });
                    } else {
                         // Create a placeholder rect if no src
                         const placeholder = new fabric.Rect({
                             ...commonProps,
                             fill: '#e0e0e0',
                             stroke: '#a0a0a0',
                             strokeDashArray: [5, 5]
                         });
                          (placeholder as any).id = shape.id; // Ensure ID is set
                         resolve(placeholder);
                    }
                    break;

                 case 'bubble':
                      // Simplified: Create a rect with text inside (Placeholder)
                      // Proper implementation needs custom shape or group
                      const textInBubble = new fabric.Textbox(shape.props?.text || 'Bubble', {
                          left: commonProps.left + 5, // Padding
                          top: commonProps.top + 5,
                          width: commonProps.width - 10,
                          // height: commonProps.height - 10, // Textbox height adjusts
                          fontSize: shape.props?.fontSize || 14,
                          fontFamily: shape.props?.fontFamily || 'Arial, sans-serif',
                          fill: shape.props?.textColor || 'black',
                          originX: 'left',
                          originY: 'top',
                          textAlign: 'center', // Center text in bubble
                      });

                      const bubbleRect = new fabric.Rect({
                           ...commonProps,
                           fill: shape.fill ?? 'white',
                           stroke: shape.stroke ?? 'black',
                           strokeWidth: shape.strokeWidth ?? 1.5,
                           rx: shape.props?.bubbleType === 'speech' ? 10 : shape.width / 2, // Basic corner radius
                           ry: shape.props?.bubbleType === 'speech' ? 10 : shape.height / 2,
                      });

                     const group = new fabric.Group([bubbleRect, textInBubble], {
                          id: shape.id,
                          left: commonProps.left,
                          top: commonProps.top,
                          angle: commonProps.angle,
                          scaleX: commonProps.scaleX,
                          scaleY: commonProps.scaleY,
                          opacity: commonProps.opacity,
                          visible: commonProps.visible,
                          originX: 'left',
                          originY: 'top',
                          // Sub-targets might need disabling for simpler group interaction
                          // subTargetCheck: true,
                      });
                      resolve(group);
                      break;

                default:
                    console.warn("Unsupported shape type for Fabric:", shape.type);
                    resolve(null);
            }
        });
    };

   // Sync Zustand store with Fabric canvas
   useEffect(() => {
       const canvas = fabricCanvasRef.current;
       if (!canvas) return;

       // Get current object IDs on canvas
       const canvasObjectIds = new Set(canvas.getObjects().map(obj => (obj as any).id));

       // Remove objects from canvas that are not in the store anymore
       canvas.getObjects().forEach(obj => {
           const objId = (obj as any).id;
           if (objId && !shapes.some(s => s.id === objId)) {
               canvas.remove(obj);
           }
       });

       // Add/Update objects on canvas based on store
       const promises = shapes.map(shape => {
           const existingObj = canvas.getObjects().find(obj => (obj as any).id === shape.id);
           if (existingObj) {
               // --- Update existing object properties ---
               existingObj.set({
                   left: shape.left,
                   top: shape.top,
                   angle: shape.angle,
                   fill: shape.fill,
                   stroke: shape.stroke,
                   strokeWidth: shape.strokeWidth,
                   opacity: shape.opacity,
                   visible: shape.visible,
                   // Note: width/height/scale update needs care based on type
               });

                // Adjust width/height/scale - This differs between objects
                if (existingObj.type === 'rect' || existingObj.type === 'textbox' || existingObj.type === 'group') {
                    existingObj.set({
                        width: shape.width / (existingObj.scaleX ?? 1), // Adjust base width by current scale
                        height: shape.height / (existingObj.scaleY ?? 1), // Adjust base height by current scale
                        scaleX: existingObj.scaleX ?? 1,
                        scaleY: existingObj.scaleY ?? 1,
                    });
                } else if (existingObj.type === 'image') {
                    // For images, scale affects rendered size, width/height are original image dims
                    existingObj.set({
                        scaleX: shape.width / (existingObj.width ?? 1),
                        scaleY: shape.height / (existingObj.height ?? 1),
                    });
                }

                // Handle Textbox specific updates
                if (shape.type === 'text' && existingObj.type === 'textbox') {
                    const textbox = existingObj as fabric.Textbox;
                    textbox.set('text', shape.props?.text || '');
                    textbox.set('fontSize', shape.props?.fontSize);
                    textbox.set('fontFamily', shape.props?.fontFamily); // Update font family
                    // Provide default value if undefined
                    textbox.set('fontWeight', shape.props?.fontWeight || 'normal');
                    // Provide default value if undefined
                    textbox.set('textAlign', shape.props?.textAlign || 'left');
                    // Trigger recalculation if width changed, crucial for wrapping
                    if (existingObj.width !== shape.width / (existingObj.scaleX ?? 1)) {
                         textbox.set('width', shape.width / (existingObj.scaleX ?? 1));
                    }
                }
                 // Handle Bubble (Group) specific updates - update text inside
                 if (shape.type === 'bubble' && existingObj.type === 'group') {
                    const group = existingObj as fabric.Group;
                    const textObj = group.getObjects('textbox')[0] as fabric.Textbox;
                    if (textObj) {
                        textObj.set('text', shape.props?.text || '');
                        textObj.set('fontSize', shape.props?.fontSize);
                        textObj.set('fontFamily', shape.props?.fontFamily);
                        textObj.set('fill', shape.props?.textColor || 'black');
                        // Potentially update bubble shape/rect too based on props.bubbleType etc.
                    }
                    // Update group dimensions/scale if needed
                    group.set({
                         // Group scale is different, width/height are based on contents
                         // Direct width/height setting might not work as expected
                         // Use scaleX/scaleY on the group instead if resizing is needed
                         scaleX: shape.width / group.getScaledWidth() * group.scaleX,
                         scaleY: shape.height / group.getScaledHeight() * group.scaleY,
                    });
                 }

               // Handle image src update (more complex, might require replacing object)
               if (shape.type === 'image' && shape.src && (existingObj as fabric.Image).getSrc() !== shape.src) {
                    // Need to remove old and add new image object
                    console.warn("Image source update requires object replacement (implementation needed).");
                    // For now, just log it. Replace logic would involve removing existingObj
                    // and asynchronously adding the new one via createFabricObject.
                    return Promise.resolve(); // Indicate handled (though not fully)
               }
               return Promise.resolve(); // Resolve immediately for updates
           } else {
               // Add new object
               return createFabricObject(shape).then(newObj => {
                   if (newObj) {
                       canvas.add(newObj);
                   }
               });
           }
       });

       // Wait for all potentially async creations (like images) to complete
       Promise.all(promises).then(() => {
           canvas.requestRenderAll(); // Render after all updates/additions
       });

   }, [shapes, updateShape]); // Include updateShape in dependencies


   // Update active object based on selectedShapeId from store
   useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const activeObject = canvas.getActiveObject();

        if (selectedShapeId) {
            if (!activeObject || (activeObject as any).id !== selectedShapeId) {
                const objectToSelect = canvas.getObjects().find(obj => (obj as any).id === selectedShapeId);
                if (objectToSelect) {
                    canvas.setActiveObject(objectToSelect);
                    canvas.requestRenderAll();
                } else {
                     // If selectedShapeId exists but object not found, discard selection
                     canvas.discardActiveObject();
                     canvas.requestRenderAll();
                }
            }
        } else {
            if (activeObject) {
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            }
        }
    }, [selectedShapeId]);


  return (
    <div ref={containerRef} className="w-full h-full overflow-auto flex justify-center items-center p-4 bg-muted">
       <div className="shadow-lg border border-border">
         <canvas ref={canvasRef} />
       </div>
    </div>
  );
};

export default FabricCanvas;
