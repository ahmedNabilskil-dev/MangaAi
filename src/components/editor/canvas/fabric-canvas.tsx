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
        selectedShapeId, // Get single ID for properties panel
        selectedShapeIds, // Get multiple IDs for canvas interaction
        setSelectedShapeId, // Action for single selection
        setSelectedShapeIds, // Action for multi-selection
        updateShape,
        updateShapes, // Use the correct action name
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
    // Correct the variable name passed to debounce
    const debouncedUpdateShapes = useCallback(debounce(updateShapes, 150), [updateShapes]);


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
                        if (e.target instanceof fabric.ActiveSelection && e.target.getObjects) {
                             const groupObjects = e.target.getObjects();
                             const updates = groupObjects.map(groupObj => {
                                 const groupObjId = (groupObj as any).id;
                                 if (!groupObjId) return null;
                                 // Calculate position relative to group origin? Fabric usually handles this internally.
                                 // We might only need to update scale/angle if group is scaled/rotated as a whole.
                                 // Check Fabric docs on ActiveSelection modification events.
                                 // For now, assume individual object updates cover it.
                                 // Let's just update the position based on its final state in the canvas
                                  return {
                                     id: groupObjId,
                                     updates: {
                                         left: groupObj.left,
                                         top: groupObj.top,
                                         angle: groupObj.angle,
                                         scaleX: groupObj.scaleX,
                                         scaleY: groupObj.scaleY,
                                     }
                                 };
                             }).filter(Boolean);

                             // Use debouncedUpdateShapes if needed for bulk update efficiency
                             // For now, individual updates might suffice.
                             updates.forEach(update => {
                                 if (update) {
                                     debouncedUpdateShape(update.id, update.updates);
                                 }
                             });

                             console.log("Group modified");
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
                } else if (opt.target) {
                    // If clicking on an object, update selection state
                     const targetId = (opt.target as any).id;
                     if (targetId) {
                        // Handle multi-select with shift key
                        if (evt.shiftKey) {
                           const currentSelection = useEditorStore.getState().selectedShapeIds;
                           if (currentSelection.includes(targetId)) {
                               // Remove if already selected
                               setSelectedShapeIds(currentSelection.filter(id => id !== targetId));
                           } else {
                               // Add to selection
                               setSelectedShapeIds([...currentSelection, targetId]);
                           }
                        } else {
                           // Single select
                           setSelectedShapeIds([targetId]);
                        }
                     } else {
                          // Clicked on part of a group or unidentifiable object? Clear selection?
                          // setSelectedShapeIds([]); // Optional: Clear if clicking non-ID'd target
                     }
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
                     if (id) { // Ensure ID exists before layering
                         if (event.key === 'ArrowUp' && event.shiftKey) {
                             bringToFront(id); // Use store action
                             event.preventDefault();
                         } else if (event.key === 'ArrowDown' && event.shiftKey) {
                             sendToBack(id); // Use store action
                             event.preventDefault();
                         } else if (event.key === 'ArrowUp') {
                             bringForward(id); // Use store action
                             event.preventDefault();
                         } else if (event.key === 'ArrowDown') {
                             sendBackward(id); // Use store action
                             event.preventDefault();
                         }
                     }
                 }
                  // Nudging (Arrow Keys)
                  if (activeSelection.length > 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
                    const moveAmount = 1 / canvas.getZoom(); // Move 1 logical pixel
                    let changed = false;
                    activeSelection.forEach(obj => {
                      if (event.key === 'ArrowUp') { obj.top = (obj.top ?? 0) - moveAmount; changed = true; }
                      else if (event.key === 'ArrowDown') { obj.top = (obj.top ?? 0) + moveAmount; changed = true; }
                      else if (event.key === 'ArrowLeft') { obj.left = (obj.left ?? 0) - moveAmount; changed = true; }
                      else if (event.key === 'ArrowRight') { obj.left = (obj.left ?? 0) + moveAmount; changed = true; }
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
    }, [bringForward, bringToFront, debouncedUpdateShape, sendBackward, sendToBack, setZoom, setSelectedShapeIds]); // Added layering dependencies


    // --- Update Canvas Size based on Page Dimensions and Container ---
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        const container = containerRef.current;
        if (canvas && container && currentPageDimensions) {
            // Calculate target canvas size in pixels based on store dimensions
            const targetWidth = convertToPixels(currentPageDimensions.width, currentPageDimensions.unit, currentPageDimensions.dpi);
            const targetHeight = convertToPixels(currentPageDimensions.height, currentPageDimensions.unit, currentPageDimensions.dpi);

            // Get container size
            const containerWidth = container.offsetWidth; // Use full container width
            const containerHeight = container.offsetHeight; // Use full container height

            // --- Fit Canvas Logic ---
            // Calculate scale to fit the logical canvas within the container
            const scaleX = containerWidth / targetWidth;
            const scaleY = containerHeight / targetHeight;
            const newZoom = Math.min(scaleX, scaleY); // Zoom level to fit

            // Clamp zoom based on defined limits
            const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

            // Set canvas physical dimensions to match container
            canvas.setWidth(containerWidth);
            canvas.setHeight(containerHeight);

            // Set logical canvas size (doesn't change physical size, but affects coordinates)
            // This seems unnecessary with viewport transforms
            // canvas.setDimensions({ width: targetWidth, height: targetHeight }, { backstoreOnly: true });

            // Set viewport zoom and center the logical canvas within the physical canvas
            canvas.setZoom(clampedZoom);
            setZoom(clampedZoom); // Update store

            const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]; // Default transform if null
            const scaledWidth = targetWidth * clampedZoom;
            const scaledHeight = targetHeight * clampedZoom;

            // Center the logical canvas within the container
            vpt[4] = (containerWidth - scaledWidth) / 2;
            vpt[5] = (containerHeight - scaledHeight) / 2;
            canvas.setViewportTransform(vpt);


            // --- Background/Page Representation ---
            // Remove previous page representation if exists
            const pageRect = canvas.getObjects().find(obj => (obj as any).isPageRect);
            if (pageRect) canvas.remove(pageRect);

            // Add a rectangle representing the page bounds at the logical origin (0,0)
            const pageRepresentation = new fabric.Rect({
                 left: 0,
                 top: 0,
                 width: targetWidth,
                 height: targetHeight,
                 fill: 'white', // Page background color
                 stroke: '#ccc', // Light border for visibility
                 strokeWidth: 1 / clampedZoom, // Adjust border width based on zoom
                 selectable: false,
                 evented: false,
                 isPageRect: true, // Custom flag
                 // Ensure it's behind everything else
                 // This will be handled better by sending grid/page to back after sync
            });
            canvas.add(pageRepresentation);
            canvas.sendToBack(pageRepresentation); // Send page rect behind shapes

            console.log(`Canvas container: ${containerWidth}x${containerHeight}, Target: ${targetWidth}x${targetHeight}, Zoom: ${clampedZoom}`);
            canvas.requestRenderAll();
        }
    }, [currentPageDimensions, setZoom]); // Rerun when dimensions change or container ref updates


    // --- Draw Grid ---
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || !currentPageDimensions) return; // Need dimensions for grid bounds

        // Remove previous grid lines
        canvas.getObjects('line').filter(obj => (obj as any).isGridLine).forEach(line => canvas.remove(line));

        if (gridSettings.visible) {
             const pageRect = canvas.getObjects().find(obj => (obj as any).isPageRect);
             if (pageRect) canvas.sendToBack(pageRect); // Ensure page is behind grid too

            const targetWidth = convertToPixels(currentPageDimensions.width, currentPageDimensions.unit, currentPageDimensions.dpi);
            const targetHeight = convertToPixels(currentPageDimensions.height, currentPageDimensions.unit, currentPageDimensions.dpi);
            const gridSpacing = gridSettings.spacing; // Spacing is in logical units
            const gridColor = gridSettings.color;
            const strokeWidth = 1 / canvas.getZoom(); // Make lines thinner when zoomed out

            // Draw vertical lines within page bounds
            for (let i = gridSpacing; i < targetWidth; i += gridSpacing) {
                canvas.add(new fabric.Line([i, 0, i, targetHeight], {
                    stroke: gridColor,
                    strokeWidth: strokeWidth,
                    selectable: false,
                    evented: false,
                    isGridLine: true,
                }));
            }

            // Draw horizontal lines within page bounds
            for (let i = gridSpacing; i < targetHeight; i += gridSpacing) {
                canvas.add(new fabric.Line([0, i, targetWidth, i], {
                    stroke: gridColor,
                    strokeWidth: strokeWidth,
                    selectable: false,
                    evented: false,
                    isGridLine: true,
                }));
            }

            // Send grid lines behind shapes but above the page rect
            const gridLines = canvas.getObjects('line').filter(obj => (obj as any).isGridLine);
            gridLines.forEach(line => canvas.sendToBack(line));
            if (pageRect) canvas.sendToBack(pageRect); // Ensure page is still at the very back

            canvas.requestRenderAll();
        }
    }, [gridSettings, zoom, currentPageDimensions]); // Redraw grid when settings, zoom, or page dimensions change


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
                         width: shape.width / (commonProps.scaleX ?? 1), // Use base width/height
                         height: shape.height / (commonProps.scaleY ?? 1),
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
                        width: shape.width / (commonProps.scaleX ?? 1),
                        // Height might adjust based on text, or set fixed
                        // height: shape.height / (commonProps.scaleY ?? 1), // Use specified height for Textbox bounding box
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
                                    width: img.width, // Use original image width for correct scaling
                                    height: img.height,
                                    scaleX: (shape.width && img.width) ? shape.width / img.width : 1, // Calculate scale based on desired width
                                    scaleY: (shape.height && img.height) ? shape.height / img.height : 1, // Calculate scale based on desired height
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
                             width: shape.width / (commonProps.scaleX ?? 1),
                             height: shape.height / (commonProps.scaleY ?? 1),
                             fill: '#e0e0e0', stroke: '#a0a0a0', strokeDashArray: [5, 5]
                         });
                          (placeholder as any).id = shape.id;
                         resolve(placeholder);
                    }
                    break;

                 case 'bubble':
                      const bubbleWidth = shape.width / (commonProps.scaleX ?? 1);
                      const bubbleHeight = shape.height / (commonProps.scaleY ?? 1);
                      const padding = 10; // Increased padding

                      const textInBubble = new fabric.Textbox(shape.props?.text || 'Bubble', {
                          left: padding, top: padding,
                          width: bubbleWidth - 2 * padding, // Adjust width based on padding
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

                     // TODO: Add logic for speech bubble tail (e.g., using fabric.Path or Triangle)

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
                           // Ensure sub-targets (text, rect) are not individually selectable within the group
                           subTargetCheck: true,
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
       const canvasObjectMap = new Map(canvas.getObjects().map(obj => [(obj as any).id, obj]));
       let objectsToAdd: ShapeConfig[] = [];
       let objectsToRemove: fabric.Object[] = [];
       let objectsToUpdate: { obj: fabric.Object, shape: ShapeConfig }[] = [];

        // Identify objects to add, remove, or update
        currentShapes.forEach(shape => {
             const existingObj = canvasObjectMap.get(shape.id);
             if (!existingObj) {
                 objectsToAdd.push(shape);
             } else {
                 objectsToUpdate.push({ obj: existingObj, shape });
             }
        });
        canvasObjectMap.forEach((obj, id) => {
            if (id && !currentStoreIds.has(id) && !(obj as any).isGridLine && !(obj as any).isPageRect) {
                 objectsToRemove.push(obj);
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
            if (obj.angle !== (shape.angle ?? 0)) updates.angle = shape.angle ?? 0;
            if (obj.fill !== shape.fill) updates.fill = shape.fill;
            if (obj.stroke !== shape.stroke) updates.stroke = shape.stroke;
            if (obj.strokeWidth !== shape.strokeWidth) updates.strokeWidth = shape.strokeWidth;
            if (obj.opacity !== (shape.opacity ?? 1)) updates.opacity = shape.opacity ?? 1;
            if (obj.visible !== (shape.visible ?? true)) updates.visible = shape.visible ?? true;

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
              const newLockMovementX = shape.fabricProps?.lockMovementX ?? shape.locked;
              const newLockMovementY = shape.fabricProps?.lockMovementY ?? shape.locked;
              const newLockRotation = shape.fabricProps?.lockRotation ?? shape.locked;
              const newLockScalingX = shape.fabricProps?.lockScalingX ?? shape.locked;
              const newLockScalingY = shape.fabricProps?.lockScalingY ?? shape.locked;
              const newLockUniScaling = shape.fabricProps?.lockUniScaling ?? shape.locked;

              if (obj.lockMovementX !== newLockMovementX) updates.lockMovementX = newLockMovementX;
              if (obj.lockMovementY !== newLockMovementY) updates.lockMovementY = newLockMovementY;
              if (obj.lockRotation !== newLockRotation) updates.lockRotation = newLockRotation;
              if (obj.lockScalingX !== newLockScalingX) updates.lockScalingX = newLockScalingX;
              if (obj.lockScalingY !== newLockScalingY) updates.lockScalingY = newLockScalingY;
              if (obj.lockUniScaling !== newLockUniScaling) updates.lockUniScaling = newLockUniScaling;


            // Adjust width/height/scale - IMPORTANT: Fabric handles width/height via scale
            const currentScaleX = obj.scaleX ?? 1;
            const currentScaleY = obj.scaleY ?? 1;
            let targetScaleX = shape.scaleX ?? 1;
            let targetScaleY = shape.scaleY ?? 1;

            // Recalculate scale based on width/height for non-group objects if necessary
            if (obj.type !== 'group' && obj.width && obj.height) {
                 targetScaleX = shape.width / obj.width;
                 targetScaleY = shape.height / obj.height;
             } else if (obj.type === 'group' && obj.width && obj.height) {
                 // For groups, width/height are calculated. Apply scale directly if provided.
                 targetScaleX = shape.scaleX ?? 1;
                 targetScaleY = shape.scaleY ?? 1;
                  // If width/height changed for a group, we might need to recalculate scale based on its members
                  // This can get complex, often easier to manage group scale directly.
             }


            if (currentScaleX !== targetScaleX) updates.scaleX = targetScaleX;
            if (currentScaleY !== targetScaleY) updates.scaleY = targetScaleY;

             // Image-specific updates
             if (shape.type === 'image' && obj.type === 'image') {
                 const imgObj = obj as fabric.Image;
                 // Check if src needs update (simple check, might reload unnecessarily)
                 const currentSrc = (imgObj as any)._element?.src || (imgObj as any).getSrc?.(); // Get current source
                 if (shape.src && currentSrc !== shape.src) {
                     imgObj.setSrc(shape.src, () => {
                         // Recalculate scale after image loads if needed
                         const newWidth = imgObj.width ?? 1;
                         const newHeight = imgObj.height ?? 1;
                         imgObj.set({
                             scaleX: shape.width / newWidth,
                             scaleY: shape.height / newHeight,
                         });
                         applyFabricFilters(imgObj, shape.props?.filters); // Reapply filters after src change
                         canvas.requestRenderAll();
                     }, { crossOrigin: shape.props?.crossOrigin || 'anonymous' });
                     updateRequiresRender = true; // Rendering handled by setSrc callback
                 } else {
                     // Check if filters need update
                      const currentFilters = imgObj.filters ?? [];
                      // Basic check: just reapply if filter config exists. More robust check needed for performance.
                      if (shape.props?.filters && (currentFilters.length > 0 || JSON.stringify(currentFilters) === '[]')) { // Check if filters exist or config mandates them now
                           applyFabricFilters(imgObj, shape.props.filters);
                           updateRequiresRender = true; // applyFilters requires render
                      } else if (!shape.props?.filters && currentFilters.length > 0) {
                           applyFabricFilters(imgObj, undefined); // Clear filters
                           updateRequiresRender = true;
                      }
                 }
             }


             // Textbox specific updates
             if (shape.type === 'text' && obj.type === 'textbox') {
                 const textbox = obj as fabric.Textbox;
                 if (textbox.text !== shape.props?.text) updates.text = shape.props?.text || '';
                 if (textbox.fontSize !== shape.props?.fontSize) updates.fontSize = shape.props?.fontSize;
                 if (textbox.fontFamily !== shape.props?.fontFamily) updates.fontFamily = shape.props?.fontFamily;
                 if (textbox.fontWeight !== (shape.props?.fontWeight || 'normal')) updates.fontWeight = shape.props?.fontWeight || 'normal';
                 const newTextAlign = shape.props?.textAlign || 'left';
                 if (textbox.textAlign !== newTextAlign) updates.textAlign = newTextAlign;
                 // Important: If width changed, apply it to the Textbox for wrapping
                 const newBaseWidth = shape.width / targetScaleX;
                 if (textbox.width !== newBaseWidth) updates.width = newBaseWidth;
             }

             // Bubble (Group) specific updates
             if (shape.type === 'bubble' && obj.type === 'group') {
                 const group = obj as fabric.Group;
                 const rect = group.getObjects('rect')[0] as fabric.Rect;
                 const text = group.getObjects('textbox')[0] as fabric.Textbox;
                 let changed = false; // Initialize changed flag here for this specific update block

                 if (rect && text) {
                     const bubbleUpdates: any = {};
                     const textUpdates: any = {};
                     const groupUpdates: any = {}; // For group-level props like opacity, visibility

                     // Update group scale first if changed
                     if (obj.scaleX !== targetScaleX) groupUpdates.scaleX = targetScaleX;
                     if (obj.scaleY !== targetScaleY) groupUpdates.scaleY = targetScaleY;

                     // Update rect properties (fill, stroke, rx/ry based on bubbleType)
                      const newFill = shape.fill ?? 'white';
                      const newStroke = shape.stroke ?? 'black';
                      const newStrokeWidth = shape.strokeWidth ?? 1.5;
                      const newRx = shape.props?.bubbleType === 'speech' ? 10 : (rect.width ?? 1) / 2;
                      const newRy = shape.props?.bubbleType === 'speech' ? 10 : (rect.height ?? 1) / 2;
                      if (rect.fill !== newFill) bubbleUpdates.fill = newFill;
                      if (rect.stroke !== newStroke) bubbleUpdates.stroke = newStroke;
                      if (rect.strokeWidth !== newStrokeWidth) bubbleUpdates.strokeWidth = newStrokeWidth;
                      if (rect.rx !== newRx) bubbleUpdates.rx = newRx;
                      if (rect.ry !== newRy) bubbleUpdates.ry = newRy;


                     // Update text properties
                     const newText = shape.props?.text || '';
                     const newFontSize = shape.props?.fontSize || 14;
                     const newFontFamily = shape.props?.fontFamily || 'Arial, sans-serif';
                     const newTextColor = shape.props?.textColor || 'black';
                     if (text.text !== newText) textUpdates.text = newText;
                     if (text.fontSize !== newFontSize) textUpdates.fontSize = newFontSize;
                     if (text.fontFamily !== newFontFamily) textUpdates.fontFamily = newFontFamily;
                     if (text.fill !== newTextColor) textUpdates.fill = newTextColor;
                     // Update text width based on padding
                     const padding = 10;
                     const newTextWidth = (shape.width / targetScaleX) - 2 * padding;
                     if (text.width !== newTextWidth) textUpdates.width = newTextWidth;


                     if (Object.keys(bubbleUpdates).length > 0) {
                         rect.set(bubbleUpdates);
                         changed = true;
                     }
                     if (Object.keys(textUpdates).length > 0) {
                         text.set(textUpdates);
                         changed = true;
                     }
                     if (Object.keys(groupUpdates).length > 0) {
                        updates.group = groupUpdates; // Apply updates to the group itself later
                     }

                     // Recalculate group dimensions if text changed? Might not be necessary if width is fixed.
                     if (changed) {
                        group.addWithUpdate(); // This might be needed if text content affects group size
                        updateRequiresRender = true;
                     }
                 }
             }


            // Apply updates if any changes were detected
            if (Object.keys(updates).length > 0 || (updates.group && Object.keys(updates.group).length > 0) ) {
                 const { group: groupUpdates, ...otherUpdates } = updates;
                 if(Object.keys(otherUpdates).length > 0) {
                     obj.set(otherUpdates);
                 }
                  if(groupUpdates && Object.keys(groupUpdates).length > 0) {
                     obj.set(groupUpdates); // Apply group-specific updates
                 }
                 if(updates.width || updates.height || updates.scaleX || updates.scaleY || updates.angle) {
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
                     if (fabricObj && !(fabricObj as any).isGridLine && !(fabricObj as any).isPageRect) {
                          canvas.moveTo(fabricObj, index); // Move shape to its correct index
                     }
                 });
                 // Send grid and page to back again after adding shapes
                 const pageRect = canvas.getObjects().find(obj => (obj as any).isPageRect);
                 const gridLines = canvas.getObjects('line').filter(obj => (obj as any).isGridLine);
                 gridLines.forEach(line => canvas.sendToBack(line));
                 if (pageRect) canvas.sendToBack(pageRect);

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

        const currentActiveObjects = canvas.getActiveObjects();
        const currentActiveIds = new Set(currentActiveObjects.map(obj => (obj as any).id).filter(Boolean));
        const storeSelectionIds = new Set(selectedShapeIds);

        // Check if selections differ
        if (storeSelectionIds.size !== currentActiveIds.size ||
            !Array.from(storeSelectionIds).every(id => currentActiveIds.has(id)))
        {
            canvas.discardActiveObject(); // Clear previous canvas selection

            if (selectedShapeIds.length > 0) {
                 const objectsToSelect = canvas.getObjects().filter(obj => {
                    const objId = (obj as any).id;
                    return objId && selectedShapeIds.includes(objId);
                 });

                if (objectsToSelect.length > 0) {
                    if (objectsToSelect.length === 1) {
                        canvas.setActiveObject(objectsToSelect[0]);
                    } else {
                        // Create an ActiveSelection for multi-select
                        const sel = new fabric.ActiveSelection(objectsToSelect, { canvas: canvas });
                        canvas.setActiveObject(sel);
                    }
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
             if (fabricObj && !(fabricObj as any).isGridLine && !(fabricObj as any).isPageRect) {
                 canvas.moveTo(fabricObj, index); // Move shape to its correct index
             }
         });
         // Ensure page and grid are at the back after potential reordering
         const pageRect = canvas.getObjects().find(obj => (obj as any).isPageRect);
         const gridLines = canvas.getObjects('line').filter(obj => (obj as any).isGridLine);
         gridLines.forEach(line => canvas.sendToBack(line));
         if (pageRect) canvas.sendToBack(pageRect);

         canvas.requestRenderAll();
     }, [currentShapes]); // Rerun whenever the shapes array order changes


  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden flex justify-center items-center p-0 bg-muted relative">
        {/* Canvas Container - Takes full space */}
       <div className="absolute inset-0">
         <canvas ref={canvasRef} />
       </div>
        {/* Add Zoom/Pan Controls here if needed */}
        {/* <CanvasControls /> */}
    </div>
  );
};

export default FabricCanvas;
