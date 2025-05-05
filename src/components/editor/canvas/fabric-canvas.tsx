// src/components/editor/canvas/fabric-canvas.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '@/store/editor-store';
import type { ShapeConfig, ImageFilterConfig } from '@/types/editor';
import { debounce } from 'lodash-es';

// Constants
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_SENSITIVITY = 0.001; // Adjust sensitivity for wheel zoom

// Helper to calculate dimensions in pixels based on unit and DPI
function convertToPixels(value: number, unit: 'px' | 'mm' | 'in', dpi: number): number {
    switch (unit) {
        case 'mm':
            return (value / 25.4) * dpi;
        case 'in':
            return value * dpi;
        case 'px':
        default:
            return value;
    }
}

// Helper function to apply image filters from config
function applyFabricFilters(fabricImage: fabric.Image, filterConfig?: ImageFilterConfig) {
    fabricImage.filters = []; // Clear existing filters
    if (filterConfig) {
        if (filterConfig.grayscale) {
            fabricImage.filters.push(new fabric.Image.filters.Grayscale());
        }
        if (filterConfig.sepia) {
            fabricImage.filters.push(new fabric.Image.filters.Sepia());
        }
         if (filterConfig.brightness !== undefined && filterConfig.brightness !== 0) { // Fabric brightness is -1 to 1
            fabricImage.filters.push(new fabric.Image.filters.Brightness({ brightness: filterConfig.brightness }));
         }
         if (filterConfig.contrast !== undefined && filterConfig.contrast !== 0) { // Fabric contrast is -1 to 1
            fabricImage.filters.push(new fabric.Image.filters.Contrast({ contrast: filterConfig.contrast }));
         }
        // Add more filters here based on ImageFilterConfig
    }
    fabricImage.applyFilters();
}

// --- FabricCanvas Component ---
const FabricCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isPanning = useRef(false); // Ref to track panning state
    const lastPanPoint = useRef<{ x: number; y: number } | null>(null); // Ref for last pan position


    const {
        pages,
        currentPageId,
        selectedShapeIds,
        setSelectedShapeIds,
        updateShape,
        updateShapes, // For multi-update (alignment, etc.)
        setCurrentPageId,
        zoom,
        setZoom,
        gridSettings,
        bringToFront,
        sendToBack,
        bringForward,
        sendBackward,
    } = useEditorStore();

    // Memoize current page and shapes
    const currentPage = React.useMemo(() => pages.find(p => p.id === currentPageId), [pages, currentPageId]);
    const currentShapes = React.useMemo(() => currentPage?.shapes ?? [], [currentPage]);
    const currentPageDimensions = React.useMemo(() => currentPage?.dimensions, [currentPage]);

    // Debounced update function
    const debouncedUpdateShape = useCallback(debounce(updateShape, 150), [updateShape]);
    const debouncedUpdateShapes = useCallback(debounce(updatesShapes, 150), [updateShapes]);


    // --- Initialize Fabric Canvas ---
    useEffect(() => {
        if (canvasRef.current && !fabricCanvasRef.current) {
            const canvas = new fabric.Canvas(canvasRef.current, {
                // Initial dimensions set later by effect
                backgroundColor: '#ffffff',
                selection: true, // Enable default box selection
                fireRightClick: true, // Enable right-click events
                stopContextMenu: true, // Prevent browser context menu
                // Enable object caching for better performance, but might need disabling for complex filters/groups
                // objectCaching: true,
            });
            fabricCanvasRef.current = canvas;

            // --- Event Listeners ---
            canvas.on('object:modified', (e) => {
                 if (e.target) {
                    const obj = e.target;
                    const id = (obj as any).id;
                    if (id) {
                        // Update single shape if only one selected
                        if (selectedShapeIds.length <= 1 || selectedShapeIds.includes(id)) {
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
                        // Handle multi-object modification if needed (e.g., group move)
                        // Fabric's group selection handles this partially, but might need store sync
                        if (e.target instanceof fabric.ActiveSelection && e.target.getObjects) {
                             console.log("Group modified");
                             // Optional: Iterate through group objects and update store if needed,
                             // though individual 'object:modified' might fire per object after group transform.
                        }
                    }
                 }
            });

            // Handle multi-select with Shift key
             canvas.on('selection:created', (e) => {
                if (e.selected) {
                    const ids = e.selected.map(obj => (obj as any).id).filter(id => id);
                    setSelectedShapeIds(ids);
                } else {
                    setSelectedShapeIds([]);
                 }
             });
             canvas.on('selection:updated', (e) => {
                 if (e.selected) {
                    const ids = e.selected.map(obj => (obj as any).id).filter(id => id);
                    setSelectedShapeIds(ids);
                 } else {
                    setSelectedShapeIds([]);
                 }
             });
             canvas.on('selection:cleared', () => {
                setSelectedShapeIds([]);
             });


            // --- Panning Logic ---
            canvas.on('mouse:down', (opt) => {
                const evt = opt.e;
                // Panning starts if spacebar is pressed OR middle mouse button is clicked
                if (evt.button === 1 || (evt.altKey || evt.code === 'Space')) { // Alt key or Space for panning
                    isPanning.current = true;
                    canvas.selection = false; // Disable selection during pan
                    lastPanPoint.current = { x: evt.clientX, y: evt.clientY };
                    canvas.setCursor('grabbing');
                    opt.e.preventDefault(); // Prevent default spacebar scroll
                    opt.e.stopPropagation();
                } else if (!opt.target) {
                    // Click on empty space clears selection
                    setSelectedShapeIds([]);
                    canvas.discardActiveObject();
                    canvas.requestRenderAll();
                }
            });

            canvas.on('mouse:move', (opt) => {
                if (isPanning.current && lastPanPoint.current) {
                    const e = opt.e;
                    const vpt = canvas.viewportTransform;
                    if (vpt) {
                        vpt[4] += e.clientX - lastPanPoint.current.x;
                        vpt[5] += e.clientY - lastPanPoint.current.y;
                        canvas.requestRenderAll(); // Render the pan
                        lastPanPoint.current = { x: e.clientX, y: e.clientY };
                    }
                }
            });

            canvas.on('mouse:up', () => {
                if (isPanning.current) {
                    isPanning.current = false;
                    canvas.selection = true; // Re-enable selection
                    canvas.setCursor('default');
                    // Update store with final viewport transform? (optional)
                    // const vpt = canvas.viewportTransform;
                    // setViewport({ x: vpt[4], y: vpt[5], zoom: canvas.getZoom() });
                }
                 lastPanPoint.current = null; // Clear last pan point
            });


            // --- Zoom Logic ---
            canvas.on('mouse:wheel', (opt) => {
                const delta = opt.e.deltaY;
                let newZoom = canvas.getZoom();
                newZoom *= (1 - delta * ZOOM_SENSITIVITY); // Adjust multiplier for sensitivity

                newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)); // Clamp zoom level

                canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
                setZoom(newZoom); // Update zoom state in store

                opt.e.preventDefault();
                opt.e.stopPropagation();
            });

             // --- Keyboard Shortcuts ---
             const handleKeyDown = (event: KeyboardEvent) => {
                 const activeObject = canvas.getActiveObject();
                 const activeSelection = canvas.getActiveObjects(); // For multi-select

                 if (event.key === 'Delete' || event.key === 'Backspace') {
                     if (activeSelection.length > 0) {
                         const idsToDelete = activeSelection.map(obj => (obj as any).id).filter(Boolean);
                         useEditorStore.getState().deleteShapes(idsToDelete); // Use store action
                         canvas.discardActiveObject();
                         canvas.requestRenderAll();
                         event.preventDefault();
                     }
                 }
                 // Basic Layering (Ctrl/Cmd + Arrow Keys)
                 const step = 1; // Move one layer at a time
                 if ((event.ctrlKey || event.metaKey) && activeObject && activeSelection.length === 1) {
                     const id = (activeObject as any).id;
                     if (event.key === 'ArrowUp') {
                         bringForward(id); // Use store action
                         event.preventDefault();
                     } else if (event.key === 'ArrowDown') {
                         sendBackward(id); // Use store action
                         event.preventDefault();
                     } else if (event.key === 'ArrowUp' && event.shiftKey) {
                         bringToFront(id); // Use store action
                         event.preventDefault();
                     } else if (event.key === 'ArrowDown' && event.shiftKey) {
                         sendToBack(id); // Use store action
                         event.preventDefault();
                     }
                 }
                  // Nudging (Arrow Keys)
                  if (activeSelection.length > 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
                    const moveAmount = 1 / canvas.getZoom(); // Move 1 logical pixel
                    let changed = false;
                    activeSelection.forEach(obj => {
                      if (event.key === 'ArrowUp') { obj.top -= moveAmount; changed = true; }
                      else if (event.key === 'ArrowDown') { obj.top += moveAmount; changed = true; }
                      else if (event.key === 'ArrowLeft') { obj.left -= moveAmount; changed = true; }
                      else if (event.key === 'ArrowRight') { obj.left += moveAmount; changed = true; }
                    });
                    if (changed) {
                      canvas.requestRenderAll();
                      // Update store after nudge finishes (debounce or on keyup)
                       activeSelection.forEach(obj => {
                         const id = (obj as any).id;
                         if (id) {
                           debouncedUpdateShape(id, { left: obj.left, top: obj.top });
                         }
                       });
                      event.preventDefault();
                    }
                  }
             };

             // Attach keyboard listener to window
             window.addEventListener('keydown', handleKeyDown);

            // --- Cleanup ---
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                if (fabricCanvasRef.current) {
                     fabricCanvasRef.current.dispose();
                     fabricCanvasRef.current = null;
                }
            };
        }
    }, []); // Run only once on mount


    // --- Update Canvas Size based on Page Dimensions and Container ---
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        const container = containerRef.current;
        if (canvas && container && currentPageDimensions) {
            // Calculate target canvas size in pixels based on store dimensions
            const targetWidth = convertToPixels(currentPageDimensions.width, currentPageDimensions.unit, currentPageDimensions.dpi);
            const targetHeight = convertToPixels(currentPageDimensions.height, currentPageDimensions.unit, currentPageDimensions.dpi);

            // Get container size
            const containerWidth = container.offsetWidth - 40; // Example padding
            const containerHeight = container.offsetHeight - 40;

            // Calculate scale to fit canvas within container
            const scaleX = containerWidth / targetWidth;
            const scaleY = containerHeight / targetHeight;
            const scale = Math.min(scaleX, scaleY, 1); // Fit within container, max scale 1 initially

            // Set canvas element size (doesn't affect logical coords)
            canvas.setWidth(targetWidth * scale);
            canvas.setHeight(targetHeight * scale);

            // Set logical viewport zoom and center
            // canvas.setZoom(scale); // Set initial zoom to fit
            // Center the canvas (this needs adjustment based on zoom behavior)
            // const vpt = canvas.viewportTransform;
            // if (vpt) {
            //     vpt[4] = (containerWidth - targetWidth * scale) / 2;
            //     vpt[5] = (containerHeight - targetHeight * scale) / 2;
            //     canvas.setViewportTransform(vpt);
            // }

            canvas.requestRenderAll();
             console.log(`Canvas size updated: ${targetWidth * scale}x${targetHeight * scale}, Target: ${targetWidth}x${targetHeight}, Scale: ${scale}`);
        }
    }, [currentPageDimensions, containerRef.current]); // Rerun when dimensions or container ref changes


    // --- Draw Grid ---
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Remove previous grid lines
        canvas.getObjects('line').filter(obj => (obj as any).isGridLine).forEach(line => canvas.remove(line));

        if (gridSettings.visible) {
            const width = canvas.getWidth() / canvas.getZoom(); // Use logical canvas width/height
            const height = canvas.getHeight() / canvas.getZoom();
             const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0];
             const scaledSpacing = gridSettings.spacing; // Spacing is in logical units

             // Calculate visible bounds in logical coordinates
             const left = -vpt[4] / vpt[0];
             const top = -vpt[5] / vpt[3];
             const right = left + canvas.getWidth() / vpt[0];
             const bottom = top + canvas.getHeight() / vpt[3];

            // Draw vertical lines
            const firstVertical = Math.ceil(left / scaledSpacing) * scaledSpacing;
            for (let i = firstVertical; i < right; i += scaledSpacing) {
                canvas.add(new fabric.Line([i, top, i, bottom], {
                    stroke: gridSettings.color,
                    strokeWidth: 1 / canvas.getZoom(), // Adjust stroke width based on zoom
                    selectable: false,
                    evented: false,
                    isGridLine: true, // Custom flag
                }));
            }

            // Draw horizontal lines
            const firstHorizontal = Math.ceil(top / scaledSpacing) * scaledSpacing;
            for (let i = firstHorizontal; i < bottom; i += scaledSpacing) {
                canvas.add(new fabric.Line([left, i, right, i], {
                    stroke: gridSettings.color,
                    strokeWidth: 1 / canvas.getZoom(),
                    selectable: false,
                    evented: false,
                    isGridLine: true,
                }));
            }
            canvas.sendToBack(canvas.getObjects('line').filter(obj => (obj as any).isGridLine)); // Send grid lines to back
            canvas.requestRenderAll();
        }
    }, [gridSettings, zoom]); // Redraw grid when settings or zoom change


    // --- Function to create Fabric objects from ShapeConfig ---
    const createFabricObject = useCallback((shape: ShapeConfig): Promise<fabric.Object | null> => {
        return new Promise((resolve) => {
            const commonProps: Partial<fabric.Object> & { id: string } = {
                id: shape.id,
                left: shape.left,
                top: shape.top,
                angle: shape.angle ?? 0,
                scaleX: shape.scaleX ?? 1,
                scaleY: shape.scaleY ?? 1,
                fill: shape.fill ?? 'transparent',
                stroke: shape.stroke ?? 'black',
                strokeWidth: shape.strokeWidth ?? 1,
                opacity: shape.opacity ?? 1,
                visible: shape.visible ?? true,
                // Apply locking/interaction props from store
                lockMovementX: shape.fabricProps?.lockMovementX ?? shape.locked,
                lockMovementY: shape.fabricProps?.lockMovementY ?? shape.locked,
                lockRotation: shape.fabricProps?.lockRotation ?? shape.locked,
                lockScalingX: shape.fabricProps?.lockScalingX ?? shape.locked,
                lockScalingY: shape.fabricProps?.lockScalingY ?? shape.locked,
                lockUniScaling: shape.fabricProps?.lockUniScaling ?? shape.locked,
                hasControls: shape.fabricProps?.hasControls ?? !shape.locked,
                hasBorders: shape.fabricProps?.hasBorders ?? !shape.locked,
                selectable: shape.fabricProps?.selectable ?? !shape.locked,
                evented: shape.fabricProps?.evented ?? !shape.locked,
                originX: 'left',
                originY: 'top',
                // Add other common fabric object options here
            };

            switch (shape.type) {
                case 'panel':
                    const panelRect = new fabric.Rect({
                        ...commonProps,
                         width: shape.width / commonProps.scaleX,
                         height: shape.height / commonProps.scaleY,
                        fill: shape.fill ?? 'rgba(200, 200, 200, 0.3)',
                        stroke: shape.stroke ?? 'black',
                        strokeWidth: shape.strokeWidth ?? 2,
                        ...(shape.props as fabric.IRectOptions),
                    });
                    resolve(panelRect);
                    break;

                case 'text':
                    const textObj = new fabric.Textbox(shape.props?.text || 'New Text', {
                        ...commonProps,
                        width: shape.width / commonProps.scaleX,
                        height: shape.height / commonProps.scaleY, // Use specified height for Textbox bounding box
                        fontSize: shape.props?.fontSize || 20,
                        fontFamily: shape.props?.fontFamily || 'Arial, sans-serif',
                        fill: shape.fill || 'black',
                        textAlign: shape.props?.textAlign || 'left',
                        fontWeight: shape.props?.fontWeight || 'normal',
                        ...(shape.props as fabric.ITextboxOptions),
                        strokeWidth: 0, // Text typically doesn't have a stroke itself
                    });
                    resolve(textObj);
                    break;

                case 'image':
                    if (shape.src) {
                        fabric.Image.fromURL(shape.src, (img) => {
                           if (img) {
                                img.set({
                                    ...commonProps,
                                    crossOrigin: shape.props?.crossOrigin || 'anonymous',
                                    stroke: shape.stroke, // Apply border if specified
                                    strokeWidth: shape.strokeWidth,
                                    ...(shape.props as fabric.IImageOptions),
                                });
                                // Apply filters
                                applyFabricFilters(img, shape.props?.filters);
                                (img as any).id = shape.id;
                                resolve(img);
                           } else {
                                console.error("Failed to load image:", shape.src);
                                resolve(null);
                           }
                        }, { crossOrigin: shape.props?.crossOrigin || 'anonymous' });
                    } else {
                         const placeholder = new fabric.Rect({
                             ...commonProps,
                             width: shape.width / commonProps.scaleX,
                             height: shape.height / commonProps.scaleY,
                             fill: '#e0e0e0', stroke: '#a0a0a0', strokeDashArray: [5, 5]
                         });
                          (placeholder as any).id = shape.id;
                         resolve(placeholder);
                    }
                    break;

                 case 'bubble':
                      const bubbleWidth = shape.width / commonProps.scaleX;
                      const bubbleHeight = shape.height / commonProps.scaleY;
                      const padding = 5; // Consider scaling padding?

                      const textInBubble = new fabric.Textbox(shape.props?.text || 'Bubble', {
                          left: padding, top: padding,
                          width: bubbleWidth - 2 * padding,
                          fontSize: shape.props?.fontSize || 14,
                          fontFamily: shape.props?.fontFamily || 'Arial, sans-serif',
                          fill: shape.props?.textColor || 'black',
                          originX: 'left', originY: 'top', textAlign: 'center',
                      });

                      const bubbleRect = new fabric.Rect({
                            left: 0, top: 0,
                            width: bubbleWidth, height: bubbleHeight,
                           fill: shape.fill ?? 'white',
                           stroke: shape.stroke ?? 'black',
                           strokeWidth: shape.strokeWidth ?? 1.5,
                           rx: shape.props?.bubbleType === 'speech' ? 10 : bubbleWidth / 2,
                           ry: shape.props?.bubbleType === 'speech' ? 10 : bubbleHeight / 2,
                           originX: 'left', originY: 'top',
                      });

                     const group = new fabric.Group([bubbleRect, textInBubble], {
                          id: shape.id,
                          left: commonProps.left, top: commonProps.top,
                          angle: commonProps.angle, scaleX: commonProps.scaleX, scaleY: commonProps.scaleY,
                          opacity: commonProps.opacity, visible: commonProps.visible,
                          originX: 'left', originY: 'top',
                           // Apply locking props to the group
                           lockMovementX: commonProps.lockMovementX, lockMovementY: commonProps.lockMovementY,
                           lockRotation: commonProps.lockRotation, lockScalingX: commonProps.lockScalingX,
                           lockScalingY: commonProps.lockScalingY, lockUniScaling: commonProps.lockUniScaling,
                           hasControls: commonProps.hasControls, hasBorders: commonProps.hasBorders,
                           selectable: commonProps.selectable, evented: commonProps.evented,
                      });
                      resolve(group);
                      break;

                default:
                    console.warn("Unsupported shape type for Fabric:", shape.type);
                    resolve(null);
            }
        });
    }, []); // Dependencies? maybe update if shape structure changes drastically

   // --- Sync Zustand store with Fabric canvas ---
   useEffect(() => {
       const canvas = fabricCanvasRef.current;
       if (!canvas) return;

       console.log("Syncing canvas with page:", currentPageId);
       canvas.selection = false; // Disable selection during sync
       canvas.skipTargetFind = true;

       const currentStoreIds = new Set(currentShapes.map(s => s.id));
       const canvasObjectIds = new Set(canvas.getObjects().map(obj => (obj as any).id).filter(Boolean));
       let objectsToAdd: ShapeConfig[] = [];
       let objectsToRemove: fabric.Object[] = [];
       let objectsToUpdate: { obj: fabric.Object, shape: ShapeConfig }[] = [];

        // Identify objects to add, remove, or update
        currentShapes.forEach(shape => {
             if (!canvasObjectIds.has(shape.id)) {
                 objectsToAdd.push(shape);
             } else {
                 const existingObj = canvas.getObjects().find(obj => (obj as any).id === shape.id);
                 if (existingObj) {
                     objectsToUpdate.push({ obj: existingObj, shape });
                 }
             }
        });
        canvas.getObjects().forEach(obj => {
            const objId = (obj as any).id;
            if (objId && !currentStoreIds.has(objId)) {
                // Don't remove grid lines
                if (!(obj as any).isGridLine) {
                    objectsToRemove.push(obj);
                }
            }
        });


        // --- Process Removals ---
         if (objectsToRemove.length > 0) {
             console.log("Removing objects:", objectsToRemove.map(o => (o as any).id));
             objectsToRemove.forEach(obj => canvas.remove(obj));
              canvas.requestRenderAll(); // Render after removals
         }


        // --- Process Updates ---
         let updateRequiresRender = false;
         objectsToUpdate.forEach(({ obj, shape }) => {
            const updates: any = {};
            // Compare and update common properties
            if (obj.left !== shape.left) updates.left = shape.left;
            if (obj.top !== shape.top) updates.top = shape.top;
            if (obj.angle !== shape.angle) updates.angle = shape.angle;
            if (obj.fill !== shape.fill) updates.fill = shape.fill;
            if (obj.stroke !== shape.stroke) updates.stroke = shape.stroke;
            if (obj.strokeWidth !== shape.strokeWidth) updates.strokeWidth = shape.strokeWidth;
            if (obj.opacity !== shape.opacity) updates.opacity = shape.opacity;
            if (obj.visible !== shape.visible) updates.visible = shape.visible;

             // Fabric Interaction Props
             const newSelectable = shape.fabricProps?.selectable ?? !shape.locked;
             const newEvented = shape.fabricProps?.evented ?? !shape.locked;
             const newHasControls = shape.fabricProps?.hasControls ?? !shape.locked;
             const newHasBorders = shape.fabricProps?.hasBorders ?? !shape.locked;
             if (obj.selectable !== newSelectable) updates.selectable = newSelectable;
             if (obj.evented !== newEvented) updates.evented = newEvented;
             if (obj.hasControls !== newHasControls) updates.hasControls = newHasControls;
             if (obj.hasBorders !== newHasBorders) updates.hasBorders = newHasBorders;
             // Lock properties
             if (obj.lockMovementX !== (shape.fabricProps?.lockMovementX ?? shape.locked)) updates.lockMovementX = (shape.fabricProps?.lockMovementX ?? shape.locked);
             if (obj.lockMovementY !== (shape.fabricProps?.lockMovementY ?? shape.locked)) updates.lockMovementY = (shape.fabricProps?.lockMovementY ?? shape.locked);
             if (obj.lockRotation !== (shape.fabricProps?.lockRotation ?? shape.locked)) updates.lockRotation = (shape.fabricProps?.lockRotation ?? shape.locked);
             if (obj.lockScalingX !== (shape.fabricProps?.lockScalingX ?? shape.locked)) updates.lockScalingX = (shape.fabricProps?.lockScalingX ?? shape.locked);
             if (obj.lockScalingY !== (shape.fabricProps?.lockScalingY ?? shape.locked)) updates.lockScalingY = (shape.fabricProps?.lockScalingY ?? shape.locked);
             if (obj.lockUniScaling !== (shape.fabricProps?.lockUniScaling ?? shape.locked)) updates.lockUniScaling = (shape.fabricProps?.lockUniScaling ?? shape.locked);

            // Adjust width/height/scale
            if (obj.type === 'rect' || obj.type === 'textbox') {
                const baseWidth = shape.width / (shape.scaleX ?? 1);
                const baseHeight = shape.height / (shape.scaleY ?? 1);
                if (obj.width !== baseWidth) updates.width = baseWidth;
                if (obj.height !== baseHeight) updates.height = baseHeight;
                if (obj.scaleX !== (shape.scaleX ?? 1)) updates.scaleX = shape.scaleX ?? 1;
                if (obj.scaleY !== (shape.scaleY ?? 1)) updates.scaleY = shape.scaleY ?? 1;
            } else if (obj.type === 'image') {
                const imgWidth = (obj as fabric.Image).width ?? 1;
                const imgHeight = (obj as fabric.Image).height ?? 1;
                const newScaleX = shape.width / imgWidth;
                const newScaleY = shape.height / imgHeight;
                if (obj.scaleX !== newScaleX) updates.scaleX = newScaleX;
                if (obj.scaleY !== newScaleY) updates.scaleY = newScaleY;
                // Check if filters need update
                 const currentFilters = (obj as fabric.Image).filters ?? [];
                 // Basic check: just reapply if filter config exists. More robust check needed for performance.
                 if (shape.props?.filters && currentFilters.length > 0) { // Simplistic check
                     applyFabricFilters(obj as fabric.Image, shape.props.filters);
                     updateRequiresRender = true; // applyFilters requires render
                 } else if (shape.props?.filters && currentFilters.length === 0) {
                      applyFabricFilters(obj as fabric.Image, shape.props.filters);
                      updateRequiresRender = true;
                 } else if (!shape.props?.filters && currentFilters.length > 0) {
                      applyFabricFilters(obj as fabric.Image, undefined); // Clear filters
                      updateRequiresRender = true;
                 }

            } else if (obj.type === 'group') { // Bubble
                 const group = obj as fabric.Group;
                 const currentScaledWidth = (group.width ?? 1) * (group.scaleX ?? 1);
                 const currentScaledHeight = (group.height ?? 1) * (group.scaleY ?? 1);
                  if (currentScaledWidth !== shape.width || currentScaledHeight !== shape.height) {
                    if (group.width && group.height) {
                        updates.scaleX = shape.width / group.width;
                        updates.scaleY = shape.height / group.height;
                    }
                 }
                 // Update text inside bubble if needed
                 const textObj = group.getObjects('textbox')[0] as fabric.Textbox;
                 if (textObj && textObj.text !== shape.props?.text) {
                     textObj.set('text', shape.props?.text || '');
                     group.addWithUpdate(); // Recalculate group dimensions
                     updateRequiresRender = true;
                 }
                 // Add other bubble specific updates (rect color, etc.)
            }


            // Handle Textbox specific updates
            if (shape.type === 'text' && obj.type === 'textbox') {
                const textbox = obj as fabric.Textbox;
                if (textbox.text !== shape.props?.text) updates.text = shape.props?.text || '';
                if (textbox.fontSize !== shape.props?.fontSize) updates.fontSize = shape.props?.fontSize;
                if (textbox.fontFamily !== shape.props?.fontFamily) updates.fontFamily = shape.props?.fontFamily;
                if (textbox.fontWeight !== (shape.props?.fontWeight || 'normal')) updates.fontWeight = shape.props?.fontWeight || 'normal';
                const newTextAlign = shape.props?.textAlign || 'left';
                 if (textbox.textAlign !== newTextAlign) updates.textAlign = newTextAlign;
            }

            // Apply updates if any changes were detected
            if (Object.keys(updates).length > 0) {
                 obj.set(updates);
                 if(updates.width || updates.height || updates.scaleX || updates.scaleY) {
                     obj.setCoords(); // Recalculate controls for transforms
                 }
                 updateRequiresRender = true;
            }
         });


        // --- Process Additions ---
         const creationPromises = objectsToAdd.map(shape => createFabricObject(shape));
         Promise.all(creationPromises).then(newlyCreatedObjects => {
             const validNewObjects = newlyCreatedObjects.filter((obj): obj is fabric.Object => obj !== null);
             if (validNewObjects.length > 0) {
                console.log("Adding new objects:", validNewObjects.map(o => (o as any).id));
                canvas.add(...validNewObjects);
                 // Ensure correct layering after adding
                 currentShapes.forEach((shape, index) => {
                     const fabricObj = canvas.getObjects().find(o => (o as any).id === shape.id);
                     if (fabricObj) {
                         canvas.moveTo(fabricObj, index);
                     }
                 });
                updateRequiresRender = true;
             }

             // Final render after all additions and updates
              if (updateRequiresRender) {
                 canvas.requestRenderAll();
              }
              canvas.selection = true;
              canvas.skipTargetFind = false;
              console.log("Canvas sync complete for page:", currentPageId);
         });

   }, [currentShapes, currentPageId, createFabricObject]); // Sync when shapes or page changes


   // Update active object based on selectedShapeIds from store
   useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const currentActiveSelection = canvas.getActiveObjects();
        const currentActiveIds = new Set(currentActiveSelection.map(obj => (obj as any).id));

        // Simple check: If sets of IDs differ, update selection
        if (selectedShapeIds.length !== currentActiveIds.size ||
            !selectedShapeIds.every(id => currentActiveIds.has(id)))
        {
            canvas.discardActiveObject(); // Clear previous selection first

            if (selectedShapeIds.length > 0) {
                 const objectsToSelect = canvas.getObjects().filter(obj => {
                    const objId = (obj as any).id;
                    return objId && selectedShapeIds.includes(objId);
                 });

                if (objectsToSelect.length > 0) {
                    // Create an ActiveSelection for multi-select
                    const sel = new fabric.ActiveSelection(objectsToSelect, { canvas: canvas });
                    canvas.setActiveObject(sel);
                 }
            }
            canvas.requestRenderAll();
        }
    }, [selectedShapeIds]);

    // --- Layering Effects ---
     // This effect listens for changes in the shape order within the store
     // and applies it to the Fabric canvas.
     useEffect(() => {
         const canvas = fabricCanvasRef.current;
         if (!canvas || currentShapes.length === 0) return;

         console.log("Applying layering based on store order");
         currentShapes.forEach((shape, index) => {
             const fabricObj = canvas.getObjects().find(o => (o as any).id === shape.id);
             if (fabricObj) {
                 canvas.moveTo(fabricObj, index);
             }
         });
         canvas.requestRenderAll();
     }, [currentShapes]); // Rerun whenever the shapes array order changes


  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden flex justify-center items-center p-4 bg-muted relative">
        {/* Canvas Container */}
       <div className="shadow-lg border border-border relative overflow-hidden" style={{ width: '100%', height: '100%' }}>
         <canvas ref={canvasRef} />
       </div>
        {/* Add Zoom/Pan Controls here if needed */}
        {/* <CanvasControls /> */}
    </div>
  );
};

export default FabricCanvas;
