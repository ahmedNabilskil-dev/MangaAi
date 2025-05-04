// src/components/editor/canvas/fabric-canvas.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '@/store/editor-store';
import type { ShapeConfig } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid'; // For potential temporary IDs if needed

const FabricCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
      pages,
      currentPageId,
      selectedShapeId,
      setSelectedShapeId,
      updateShape,
      // addShape // Not used directly here, triggered by library panel
      setCurrentPageId // Needed to initialize if not set
  } = useEditorStore();
  const currentShapes = React.useMemo(() => {
    if (!currentPageId) return [];
    const currentPage = pages.find(p => p.id === currentPageId);
    return currentPage ? currentPage.shapes : [];
  }, [pages, currentPageId]);

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1100 }); // A4-like default

    // Initialize currentPageId if it's null and pages exist
    useEffect(() => {
        if (!currentPageId && pages.length > 0) {
            setCurrentPageId(pages[0].id);
        }
    }, [currentPageId, pages, setCurrentPageId]);

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

   // Memoized debounced update function
   const debouncedUpdateShape = useCallback(debounce(updateShape, 150), [updateShape]);


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

            const finalWidth = Math.max(200, newWidth);
            const finalHeight = Math.max(200 / aspectRatio, newHeight);

            setCanvasSize({ width: finalWidth, height: finalHeight });
             if (fabricCanvasRef.current) {
                 fabricCanvasRef.current.setWidth(finalWidth);
                 fabricCanvasRef.current.setHeight(finalHeight);
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
             debouncedUpdateShape(id, {
               left: obj.left,
               top: obj.top,
               width: obj.getScaledWidth(),
               height: obj.getScaledHeight(),
               angle: obj.angle,
               scaleX: obj.scaleX,
               scaleY: obj.scaleY,
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
         // window.removeEventListener('resize', updateSize); // Not needed with ResizeObserver
      };
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount


    // Function to create Fabric objects from ShapeConfig
    const createFabricObject = (shape: ShapeConfig): Promise<fabric.Object | null> => {
        return new Promise((resolve) => {
            const commonProps = {
                id: shape.id, // Assign store ID to fabric object
                left: shape.left,
                top: shape.top,
                // Fabric width/height are unscaled, use scaleX/Y for dimensions
                // width: shape.width / (shape.scaleX ?? 1),
                // height: shape.height / (shape.scaleY ?? 1),
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
                         width: shape.width / commonProps.scaleX, // Use base width
                         height: shape.height / commonProps.scaleY, // Use base height
                        // ...(shape.props as fabric.IRectOptions), // Spread other rect options
                        fill: shape.fill ?? 'rgba(200, 200, 200, 0.3)', // Panel default fill
                        stroke: shape.stroke ?? 'black',
                        strokeWidth: shape.strokeWidth ?? 2,
                    });
                    resolve(panelRect);
                    break;

                 case 'text':
                      const textObj = new fabric.Textbox(shape.props?.text || 'New Text', { // Use Textbox for wrapping
                          ...commonProps,
                          width: shape.width / commonProps.scaleX, // Use base width for Textbox
                          height: shape.height / commonProps.scaleY, // Use base height for Textbox
                          fontSize: shape.props?.fontSize || 20,
                          fontFamily: shape.props?.fontFamily || 'Arial, sans-serif', // Apply font family
                          fill: shape.fill || 'black', // Text color is fill in Fabric
                          textAlign: shape.props?.textAlign || 'left', // Default textAlign
                          fontWeight: shape.props?.fontWeight || 'normal', // Default fontWeight
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
                                    // Let scaleX/Y handle the dimensions based on original image size
                                   // Width and height remain the image's natural dimensions
                                    // scaleX: shape.width / (img.width ?? 1), // Already set in commonProps
                                   // scaleY: shape.height / (img.height ?? 1), // Already set in commonProps
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
                             width: shape.width / commonProps.scaleX, // Use base width
                             height: shape.height / commonProps.scaleY, // Use base height
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
                      const bubbleWidth = shape.width / commonProps.scaleX;
                      const bubbleHeight = shape.height / commonProps.scaleY;
                      const padding = 5 * commonProps.scaleX; // Scale padding? Maybe not needed if text scales

                      const textInBubble = new fabric.Textbox(shape.props?.text || 'Bubble', {
                          // Position relative to group origin (top-left)
                          left: padding,
                          top: padding,
                          width: bubbleWidth - 2 * padding,
                          // height: bubbleHeight - 2 * padding, // Textbox height adjusts
                          fontSize: shape.props?.fontSize || 14,
                          fontFamily: shape.props?.fontFamily || 'Arial, sans-serif',
                          fill: shape.props?.textColor || 'black',
                          originX: 'left',
                          originY: 'top',
                          textAlign: 'center', // Center text in bubble
                      });

                      const bubbleRect = new fabric.Rect({
                            // Position relative to group origin (top-left)
                            left: 0,
                            top: 0,
                            width: bubbleWidth,
                            height: bubbleHeight,
                           fill: shape.fill ?? 'white',
                           stroke: shape.stroke ?? 'black',
                           strokeWidth: shape.strokeWidth ?? 1.5,
                           rx: shape.props?.bubbleType === 'speech' ? 10 : bubbleWidth / 2, // Basic corner radius
                           ry: shape.props?.bubbleType === 'speech' ? 10 : bubbleHeight / 2,
                           originX: 'left',
                           originY: 'top',
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
                          // subTargetCheck: true, // Enable if interactions with text/rect needed
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

       console.log("Syncing canvas with page:", currentPageId);

        // Temporarily disable events during sync
        canvas.selection = false;
        canvas.skipTargetFind = true;


       // Get current object IDs on canvas
       const canvasObjectIds = new Set(canvas.getObjects().map(obj => (obj as any).id));

       // Remove objects from canvas that are not in the current page's store anymore
       canvas.getObjects().forEach(obj => {
           const objId = (obj as any).id;
           if (objId && !currentShapes.some(s => s.id === objId)) {
               console.log("Removing object:", objId);
               canvas.remove(obj);
           }
       });

       // Add/Update objects on canvas based on store
       const promises = currentShapes.map(shape => {
           const existingObj = canvas.getObjects().find(obj => (obj as any).id === shape.id);
           if (existingObj) {
               // --- Update existing object properties ---
                // Only update if values have actually changed
                const updates: any = {};
                if (existingObj.left !== shape.left) updates.left = shape.left;
                if (existingObj.top !== shape.top) updates.top = shape.top;
                if (existingObj.angle !== shape.angle) updates.angle = shape.angle;
                if (existingObj.fill !== shape.fill) updates.fill = shape.fill;
                if (existingObj.stroke !== shape.stroke) updates.stroke = shape.stroke;
                if (existingObj.strokeWidth !== shape.strokeWidth) updates.strokeWidth = shape.strokeWidth;
                if (existingObj.opacity !== shape.opacity) updates.opacity = shape.opacity;
                if (existingObj.visible !== shape.visible) updates.visible = shape.visible;

                 // Adjust width/height/scale carefully
                 if (existingObj.type === 'rect' || existingObj.type === 'textbox') {
                    const baseWidth = shape.width / (shape.scaleX ?? 1);
                    const baseHeight = shape.height / (shape.scaleY ?? 1);
                    if (existingObj.width !== baseWidth) updates.width = baseWidth;
                    if (existingObj.height !== baseHeight) updates.height = baseHeight;
                    if (existingObj.scaleX !== (shape.scaleX ?? 1)) updates.scaleX = shape.scaleX ?? 1;
                    if (existingObj.scaleY !== (shape.scaleY ?? 1)) updates.scaleY = shape.scaleY ?? 1;
                 } else if (existingObj.type === 'image') {
                    const newScaleX = shape.width / (existingObj.width ?? 1);
                    const newScaleY = shape.height / (existingObj.height ?? 1);
                    if (existingObj.scaleX !== newScaleX) updates.scaleX = newScaleX;
                    if (existingObj.scaleY !== newScaleY) updates.scaleY = newScaleY;
                 } else if (existingObj.type === 'group') { // Bubble
                     const group = existingObj as fabric.Group;
                     const currentScaledWidth = group.width * group.scaleX;
                     const currentScaledHeight = group.height * group.scaleY;

                     if (currentScaledWidth !== shape.width || currentScaledHeight !== shape.height) {
                        // Adjust scale to match target width/height
                        if (group.width && group.height) {
                            updates.scaleX = shape.width / group.width;
                            updates.scaleY = shape.height / group.height;
                        }
                     }
                 }


                // Handle Textbox specific updates
                if (shape.type === 'text' && existingObj.type === 'textbox') {
                    const textbox = existingObj as fabric.Textbox;
                    if (textbox.text !== shape.props?.text) updates.text = shape.props?.text || '';
                    if (textbox.fontSize !== shape.props?.fontSize) updates.fontSize = shape.props?.fontSize;
                    if (textbox.fontFamily !== shape.props?.fontFamily) updates.fontFamily = shape.props?.fontFamily;
                    if (textbox.fontWeight !== (shape.props?.fontWeight || 'normal')) updates.fontWeight = shape.props?.fontWeight || 'normal';
                    if (textbox.textAlign !== (shape.props?.textAlign || 'left')) updates.textAlign = shape.props?.textAlign || 'left';
                }
                 // Handle Bubble (Group) specific updates - update text inside
                 if (shape.type === 'bubble' && existingObj.type === 'group') {
                    const group = existingObj as fabric.Group;
                    const textObj = group.getObjects('textbox')[0] as fabric.Textbox;
                    const rectObj = group.getObjects('rect')[0] as fabric.Rect;
                    let groupNeedsUpdate = false;

                    if (textObj) {
                        const textUpdates: any = {};
                         if (textObj.text !== shape.props?.text) textUpdates.text = shape.props?.text || '';
                         if (textObj.fontSize !== shape.props?.fontSize) textUpdates.fontSize = shape.props?.fontSize;
                         if (textObj.fontFamily !== shape.props?.fontFamily) textUpdates.fontFamily = shape.props?.fontFamily;
                         if (textObj.fill !== (shape.props?.textColor || 'black')) textUpdates.fill = shape.props?.textColor || 'black';
                         if (Object.keys(textUpdates).length > 0) {
                            textObj.set(textUpdates);
                            groupNeedsUpdate = true;
                         }
                    }
                    if (rectObj) {
                        const rectUpdates: any = {};
                        if (rectObj.fill !== shape.fill) rectUpdates.fill = shape.fill;
                        if (rectObj.stroke !== shape.stroke) rectUpdates.stroke = shape.stroke;
                        if (rectObj.strokeWidth !== shape.strokeWidth) rectUpdates.strokeWidth = shape.strokeWidth;
                        // Update corner radius based on type if needed
                         if (Object.keys(rectUpdates).length > 0) {
                            rectObj.set(rectUpdates);
                            groupNeedsUpdate = true;
                         }
                    }

                    // Recalculate group layout if children changed
                    if(groupNeedsUpdate) {
                        group.addWithUpdate();
                    }
                 }

               // Handle image src update (recreate object)
               if (shape.type === 'image' && shape.src && (existingObj as fabric.Image).getSrc() !== shape.src) {
                    console.log("Replacing image object for:", shape.id);
                    canvas.remove(existingObj); // Remove old one
                    return createFabricObject(shape).then(newObj => { // Create and add new one
                        if (newObj) {
                            canvas.add(newObj);
                        }
                    });
               }

               // Apply collected updates if any
               if (Object.keys(updates).length > 0) {
                    existingObj.set(updates);
                    // If dimensions changed, trigger re-render and control updates
                    if(updates.width || updates.height || updates.scaleX || updates.scaleY) {
                        existingObj.setCoords(); // Recalculate controls
                    }
               }
               return Promise.resolve(); // Resolve immediately for updates
           } else {
               // Add new object
                console.log("Adding new object:", shape.id);
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
            // Re-enable events
            canvas.selection = true;
            canvas.skipTargetFind = false;
             console.log("Canvas sync complete for page:", currentPageId);
       });

   }, [currentShapes, currentPageId, updateShape]); // Rerun when shapes or page changes


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
```